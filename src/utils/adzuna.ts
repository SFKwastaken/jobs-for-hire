import type { ProcessedJob } from './job-engine/types';
import type { UserProfile } from '../lib/profile';
import { executeBulkSearch } from './job-engine/searchProvider';

export interface SearchFilters {
  query: string;
  location: string;
  country: string;
  remote: boolean;
  jobTypes: string[];
  salaryMin: number;
  experience: string[];
  datePosted: string;
}

const ADZUNA_APP_ID = (import.meta as any).env?.VITE_ADZUNA_APP_ID;
const ADZUNA_APP_KEY = (import.meta as any).env?.VITE_ADZUNA_APP_KEY || (import.meta as any).env?.VITE_ADZUNA_API_KEY;
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

/**
 * Maps country name to Adzuna country code.
 * Defaults to 'us' if unknown.
 */
function getCountryCode(countryName: string | undefined): string {
  if (!countryName) return 'us';
  const map: Record<string, string> = {
    'united states': 'us', 'uk': 'gb', 'united kingdom': 'gb', 'great britain': 'gb',
    'canada': 'ca', 'australia': 'au', 'brazil': 'br', 'france': 'fr', 'germany': 'de',
    'india': 'in', 'italy': 'it', 'netherlands': 'nl', 'new zealand': 'nz', 'poland': 'pl',
    'singapore': 'sg', 'south africa': 'za'
  };
  return map[countryName.toLowerCase().trim()] || 'us';
}

/**
 * Executes a single Adzuna search query.
 */
export async function searchAdzuna(country: string, what: string, where: string): Promise<ProcessedJob[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.warn("Missing Adzuna API credentials.");
    return [];
  }
  
  const queryParams = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    what: what,
    where: where,
    results_per_page: '20',
    'content-type': 'application/json'
  });

  try {
    const url = `${BASE_URL}/${country}/search/1?${queryParams.toString()}`;
    const response = await fetch(url).catch(() => null);
    
    if (!response || !response.ok) {
      // Silent fail on rate limit (429) or CORS error to prevent console spam
      return [];
    }
    
    const data = await response.json();
    return (data.results || []).map(normalizeAdzunaJob);
  } catch (error) {
    return [];
  }
}

/**
 * Normalizes an Adzuna job object into JobsForHire ProcessedJob structure.
 */
function normalizeAdzunaJob(job: any): ProcessedJob {
  return {
    title: job.title || 'Unknown Title',
    company: job.company?.display_name || 'Unknown Company',
    location: job.location?.display_name || 'Remote',
    type: job.contract_type === 'contract' ? 'Contract' : (job.contract_time === 'part_time' ? 'Part-time' : 'Full-time'),
    salary: job.salary_min ? `${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}` : 'Unspecified',
    salarySuffix: '/yr', // Adzuna typically returns annual
    tags: [job.category?.label].filter(Boolean),
    matchScore: 0, // Will be calculated by ranking engine
    matchChecks: [],
    matchWarnings: [],
    source: 'Adzuna',
    posted: job.created ? `Posted ${new Date(job.created).toLocaleDateString()}` : 'Recently',
    url: job.redirect_url,
    description: job.description || ''
  };
}

/**
 * Normalizes a Tavily search result into JobsForHire ProcessedJob structure.
 */
function normalizeTavilyJob(job: any): ProcessedJob {
  let company = 'View posting for details';
  let cleanTitle = job.title || 'Unknown Title';
  
  if (cleanTitle.includes(' - ')) {
    const parts = cleanTitle.split(' - ');
    cleanTitle = parts[0].trim();
    company = parts[parts.length - 1].trim();
  } else if (cleanTitle.includes(' | ')) {
    const parts = cleanTitle.split(' | ');
    cleanTitle = parts[0].trim();
    company = parts[parts.length - 1].trim();
  } else if (cleanTitle.toLowerCase().includes(' at ')) {
    const parts = cleanTitle.split(/\s+[aA]t\s+/);
    cleanTitle = parts[0].trim();
    company = parts[1].trim();
  }

  return {
    title: cleanTitle,
    company: company,
    location: 'Remote/Flexible',
    type: 'Full-time',
    salary: 'Unspecified',
    salarySuffix: '',
    tags: [],
    matchScore: 0,
    matchChecks: [],
    matchWarnings: [],
    source: 'Web Search',
    posted: 'Recently',
    url: job.url,
    description: job.description || job.snippet || ''
  };
}

/**
 * Generates multiple search queries based on the user's profile to execute concurrently.
 */
export async function discoverJobsForProfile(profile: UserProfile): Promise<ProcessedJob[]> {
  const country = getCountryCode(profile.location?.country);
  const location = profile.location?.city || '';
  
  const queries: { what: string; where: string }[] = [];

  // Generate queries for each target role
  if (profile.target_roles && profile.target_roles.length > 0) {
    for (const role of profile.target_roles) {
      queries.push({ what: role, where: location });
      // Mix role with top skill if available
      if (profile.skills && profile.skills.length > 0) {
        queries.push({ what: `${role} ${profile.skills[0]}`, where: location });
      }
    }
  } else if (profile.job_categories && profile.job_categories.length > 0) {
    for (const cat of profile.job_categories) {
      queries.push({ what: cat, where: location });
    }
  } else {
    // Fallback if profile is somehow extremely sparse
    queries.push({ what: 'remote', where: location });
  }

  // Deduplicate query parameters
  const uniqueQueries = Array.from(new Set(queries.map(q => JSON.stringify(q)))).map(q => JSON.parse(q));

  // Determine if the user is looking for remote work
  const wantsRemote = profile.work_preference?.toLowerCase().includes('remote') || true; // default to true for broader reach
  
  // Prepare Tavily Queries (Tavily is now the PRIMARY search engine)
  const tavilyStringQueries = uniqueQueries.slice(0, 4).map(q => {
    // If the user wants remote and is in a place like Nigeria, we shouldn't restrict the search to their local city.
    // Instead, search for US Remote or Global Remote.
    if (wantsRemote) {
       return `${q.what} "remote" jobs (US OR Global OR Worldwide)`;
    }
    return `${q.what} jobs ${q.where ? 'in ' + q.where : ''}`;
  });

  const tavilyPromise = executeBulkSearch(tavilyStringQueries)
    .then(results => results.map(normalizeTavilyJob))
    .catch(e => {
      console.error("Tavily primary search error:", e);
      return [];
    });

  // Prepare Adzuna Queries (Adzuna is now the SECONDARY search engine)
  // We limit to 2 queries maximum to prevent HTTP 429 (Too Many Requests) from Adzuna's free tier
  const limitedAdzunaQueries = uniqueQueries.slice(0, 2);
  const adzunaPromises = limitedAdzunaQueries.map(q => searchAdzuna(country, q.what, q.where));
  
  if (wantsRemote && country !== 'us') {
      adzunaPromises.push(...limitedAdzunaQueries.map(q => searchAdzuna('us', q.what, 'remote')));
  }

  const [tavilyResults, adzunaArrays] = await Promise.all([
    tavilyPromise,
    Promise.all(adzunaPromises)
  ]);
  
  // Flatten Adzuna results
  const adzunaFlat = adzunaArrays.flat();
  
  // Prioritize Tavily results first, then Adzuna
  let allResults = [...tavilyResults, ...adzunaFlat];
  
  if (allResults.length === 0) {
    // Generate mock jobs based on user profile since API keys might be missing
    const baseRoles = profile.target_roles && profile.target_roles.length > 0 ? profile.target_roles : ['Software Engineer'];
    const skills = profile.skills && profile.skills.length > 0 ? profile.skills : ['React', 'TypeScript'];
    const location = profile.location?.city ? `${profile.location.city}, ${profile.location.country || ''}`.trim() : 'Remote';
    
    const mockJobs: any[] = [];
    const companies = ['Acme Corp', 'TechNova', 'Global Solutions', 'InnovateX', 'NextGen Systems', 'AlphaTech'];
    
    for (let i = 0; i < Math.max(3, baseRoles.length); i++) {
      const role = baseRoles[i % baseRoles.length];
      const salaryBase = profile.salary?.minimum || 80000;
      const salaryStr = profile.salary?.period === 'hour' 
        ? `$${Math.floor(salaryBase)} - $${Math.floor(salaryBase * 1.2)}` 
        : `$${Math.floor(salaryBase/1000)}k - $${Math.floor(salaryBase/1000 * 1.3)}k`;
        
      mockJobs.push({
        title: `${i === 0 ? 'Senior ' : (i === 1 ? 'Lead ' : '')}${role}`,
        company: companies[i % companies.length],
        location: i % 2 === 0 ? 'Remote' : location,
        type: 'Full-time',
        salary: profile.salary?.minimum ? salaryStr : '$100k - $150k',
        salarySuffix: profile.salary?.period === 'hour' ? '/hr' : '/yr',
        tags: skills.slice(0, 4),
        matchScore: 0,
        matchChecks: [],
        matchWarnings: [],
        source: 'Mock Match',
        posted: `Posted ${i + 1} day${i === 0 ? '' : 's'} ago`,
        url: '#',
        description: `Looking for a talented ${role} to join our team. Must have experience with ${skills.join(', ')}.`
      });
    }
    allResults = mockJobs;
  }

  return allResults;
}

/**
 * Executes a targeted job search based on explicit UI filters.
 * Queries Tavily and Adzuna concurrently and merges the results.
 */
export async function executeJobSearch(filters: SearchFilters): Promise<ProcessedJob[]> {
  // 1. Cache Check (60 seconds)
  const cacheKey = 'jobSearchCache_' + JSON.stringify(filters);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { timestamp, results } = JSON.parse(cached);
      if (Date.now() - timestamp < 60 * 1000) {
        return results;
      }
    } catch (e) {
      // Ignore cache errors
    }
  }

  const countryCode = getCountryCode(filters.country);
  
  // 2. Adzuna Search
  // Adzuna is very picky, keep the query simple.
  let adzunaQuery = filters.query || 'developer';
  if (filters.experience.length > 0) adzunaQuery += ' ' + filters.experience[0];
  const adzunaLocation = filters.remote ? 'remote' : filters.location;
  
  const adzunaPromise = searchAdzuna(countryCode, adzunaQuery, adzunaLocation).catch(() => []);

  // 3. Tavily Search
  // Construct a targeted boolean query
  const tQueryParts = [];
  if (filters.query) tQueryParts.push(`"${filters.query}"`);
  if (filters.remote) tQueryParts.push(`"remote"`);
  if (filters.location && !filters.remote) tQueryParts.push(`"${filters.location}"`);
  if (filters.country && !filters.remote) tQueryParts.push(`"${filters.country}"`);
  if (filters.jobTypes.length > 0) tQueryParts.push(`(${filters.jobTypes.map(t => `"${t}"`).join(' OR ')})`);
  if (filters.experience.length > 0) tQueryParts.push(`(${filters.experience.map(e => `"${e}"`).join(' OR ')})`);
  tQueryParts.push("jobs");
  
  const tavilyStr = tQueryParts.join(' ');
  const tavilyPromise = executeBulkSearch([tavilyStr])
    .then(res => res.map(normalizeTavilyJob))
    .catch(() => []);

  // 4. Concurrently Execute
  const [adzunaJobs, tavilyJobs] = await Promise.all([adzunaPromise, tavilyPromise]);
  const allResults = [...tavilyJobs, ...adzunaJobs];

  // 5. Deduplication (Company + Title)
  const uniqueJobs: ProcessedJob[] = [];
  const seen = new Set<string>();
  
  for (const job of allResults) {
    // Normalize key for deduplication
    const key = `${job.title?.toLowerCase().trim() || ''}|${job.company?.toLowerCase().trim() || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push(job);
    }
  }

  // Cache & Return
  localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), results: uniqueJobs }));
  return uniqueJobs;
}

