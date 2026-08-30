import type { SearchResult } from './types';

export async function executeSearch(query: string, depth = "basic"): Promise<SearchResult[]> {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:5173';
    const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}&depth=${depth}`);
    if (res.status === 429) {
      throw new Error('Monthly search limit reached. Please try again later.');
    }
    if (res.status === 401) {
      throw new Error('Search API Key is invalid or missing. Please check your configuration.');
    }
    if (!res.ok) throw new Error('Search API failed');
    const data = await res.json();
    
    if (data.web && data.web.results) {
      return data.web.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        description: r.description || r.snippet,
        source: 'Tavily Search'
      }));
    }
    
    return [];
  } catch (error: any) {
    if (error.message.includes('Monthly search limit reached') || error.message.includes('Search API Key is invalid')) {
      throw error;
    }
    console.error("Search execution failed for query:", query, error);
    return [];
  }
}

export async function executeBulkSearch(queries: string[]): Promise<SearchResult[]> {
  const promises = queries.map(q => executeSearch(q));
  const resultsArray = await Promise.all(promises);
  
  const allResults = resultsArray.flat();
  // Basic deduplication by URL
  const unique = new Map<string, SearchResult>();
  for (const r of allResults) {
    if (r.url && !unique.has(r.url)) {
      unique.set(r.url, r);
    }
  }
  return Array.from(unique.values()).slice(0, 100); // max 100 results total
}
