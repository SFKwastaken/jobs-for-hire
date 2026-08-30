import { parseIntent } from './intentParser';
import { generateQueries } from './queryGenerator';
import { executeBulkSearch } from './searchProvider';
import { processExtractions } from './jobExtractor';
import { deduplicateJobs } from './deduplicator';
import { evaluateJobMatches } from './filterAndRank';
import type { ProcessedJob, SearchResult } from './types';
import { searchAdzuna } from '../adzuna';

export async function runJobDiscoveryPipeline(
  input: string, 
  onProgress: (msg: string) => void
): Promise<ProcessedJob[]> {
  try {
    onProgress('Analyzing your request...');
    const profile = await parseIntent(input);
    
    onProgress('Generating search queries...');
    const queries = generateQueries(profile);
    
    onProgress(`Searching web using ${queries.length} query variations...`);
    let searchResults = await executeBulkSearch(queries);
    
    // Fallback: Fetch additional jobs from Adzuna
    onProgress('Fetching additional jobs from Adzuna (Global Job Board)...');
    try {
      // Mapping user's country name into what Adzuna expects, defaulting to us/remote
      const countryCode = profile.location?.country?.toLowerCase().includes('nigeria') ? 'us' : 'us'; // Adzuna API may not support ng, fallback to us remote
      const adzunaJobs = await searchAdzuna(countryCode, profile.roles[0] || 'remote worker', profile.remote ? 'remote' : profile.location?.city || '');
      
      const adzunaMapped: SearchResult[] = adzunaJobs.map(job => ({
        title: job.title,
        url: job.url || '',
        description: job.description || '',
        source: 'Adzuna'
      }));
      
      searchResults = [...searchResults, ...adzunaMapped];
    } catch (e) {
      console.warn("Adzuna search failed, continuing with Tavily results only.", e);
    }
    
    if (searchResults.length === 0) {
      onProgress('No web results found. Please try a broader search.');
      return [];
    }
    
    onProgress(`Discovered ${searchResults.length} potential listings. Extracting details...`);
    const extractedJobs = await processExtractions(searchResults, onProgress);
    
    onProgress(`Removing duplicates from ${extractedJobs.length} jobs...`);
    const uniqueJobs = deduplicateJobs(extractedJobs);
    
    const finalResults = await evaluateJobMatches(profile, uniqueJobs, onProgress);
    
    onProgress('Preparing your results...');
    return finalResults;
  } catch (error: any) {
    console.error("Pipeline Error:", error);
    onProgress(`Search failed: ${error.message}`);
    return [];
  }
}
