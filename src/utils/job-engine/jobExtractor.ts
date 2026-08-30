import type { SearchResult, Job } from './types';

export async function extractJobData(result: SearchResult): Promise<Job | null> {
  const contentToParse = (result.description || "") + "\n" + (result.raw_content || "");
  
  if (contentToParse.trim().length < 20) return null; // Too short to be useful

  // 1. Strict Aggregator & Job Board Filter
  const lowerTitle = result.title.toLowerCase();
  const lowerUrl = result.url.toLowerCase();
  
  // Reject if it's a search page, category page, or lists multiple jobs
  if (
    lowerTitle.match(/[0-9]+,\d+\+?\s+/) || 
    lowerTitle.match(/[0-9]+\+?\s+.*jobs/) ||
    lowerTitle.includes("top remote") ||
    lowerTitle.includes("best remote") ||
    lowerTitle.includes(" jobs in ") ||
    lowerTitle.includes(" jobs at ") ||
    lowerTitle.endsWith(" jobs") ||
    lowerTitle.startsWith("remote front end developer jobs") ||
    lowerUrl.includes("/search") ||
    lowerUrl.includes("/jobs/remote-") ||
    lowerUrl.includes("/categories/") ||
    lowerUrl.includes("types-of-remote-jobs") ||
    lowerUrl.match(/\/jobs\/?\?q=/) ||
    lowerUrl.includes("dice.com/jobs") ||
    lowerUrl.includes("flexjobs.com/remote-jobs")
  ) {
    return null; // It's an aggregator, skip it
  }

  // Basic deterministic extraction
  // Try to parse "Job Title at Company" from title
  let title = result.title;
  let company = "Unknown Company";
  
  // Try splitting common delimiters
  const titleParts = title.split(/\s+[-|]\s+/);
  if (titleParts.length > 1) {
    title = titleParts[0].trim();
    company = titleParts[1].trim();
  } else {
    const atMatch = title.match(/(.+?)\s+at\s+(.+)/i);
    if (atMatch) { 
      title = atMatch[1].trim(); 
      company = atMatch[2].trim(); 
    }
  }
  
  // Clean up title and company
  if (company.length > 30) company = "Unknown Company";
  company = extractCompanyFromUrl(result.url, company);

  // Extract Salary
  const extractedSalary = extractSalaryInfo(contentToParse) || extractSalaryInfo(result.title);

  // Simple heuristic for remote
  const isRemote = contentToParse.toLowerCase().includes('remote') || title.toLowerCase().includes('remote');
  
  let finalSource = 'Web Search';
  if (lowerUrl.includes('indeed.com')) finalSource = 'Indeed';
  else if (lowerUrl.includes('jobberman.com')) finalSource = 'Jobberman';
  else if (lowerUrl.includes('linkedin.com/jobs')) finalSource = 'LinkedIn';
  
  // If it's an aggregator page from our prioritized sources, override the company name
  if (finalSource !== 'Web Search' && (company === 'Unknown Company' || company === 'Lagos' || lowerTitle.includes('jobs'))) {
    company = finalSource;
  }
  
  return {
    id: btoa(encodeURIComponent(result.url)).substring(0, 15),
    title: title,
    company: company,
    description: contentToParse,
    location: isRemote ? 'Remote' : 'Unknown',
    remote: isRemote,
    remoteType: isRemote ? 'remote' : 'unknown',
    eligibleCountries: [],
    salary: extractedSalary,
    source: finalSource,
    sourceDomain: new URL(result.url).hostname,
    sourceUrl: result.url,
    applyUrl: result.url,
    discoveredAt: new Date().toISOString(),
    verificationStatus: "partially_verified",
    skills: [],
    technologies: [],
    extractionConfidence: 0.8
  } as Job;
}

function extractCompanyFromUrl(url: string, defaultCompany: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const pathParts = u.pathname.split('/').filter(Boolean);
    
    let comp = defaultCompany;
    if (host.includes('greenhouse.io') && pathParts.length > 0) comp = pathParts[0];
    else if (host.includes('lever.co') && pathParts.length > 0) comp = pathParts[0];
    else if (host.includes('workable.com') && pathParts.length > 0) comp = pathParts[0];
    else if (host.includes('ashbyhq.com') && pathParts.length > 0) comp = pathParts[0];
    else if (host.includes('breezy.hr')) comp = host.split('.')[0];
    else if (host.includes('jobscore.com') && pathParts.length > 0) comp = pathParts[0];
    else if (host.includes('bamboohr.com')) comp = host.split('.')[0];

    // Format the slug if we extracted it from the URL
    if (comp !== defaultCompany && comp.length > 0) {
      comp = comp.replace(/-/g, ' ');
      return comp.replace(/\b\w/g, c => c.toUpperCase());
    }
  } catch(e) {}
  return defaultCompany;
}

export function extractSalaryInfo(text: string): Job['salary'] | undefined {
  // Look for standard range formats e.g. $100k - $120k, $50,000 to $60,000
  const rangeMatch = text.match(/([$£€₦])\s*([\d,]+)(?:[kK]?)\s*(?:-|to|–|and)\s*(?:[$£€₦])?\s*([\d,]+)(?:[kK]?)/);
  if (rangeMatch) {
    const sym = rangeMatch[1];
    let min = parseInt(rangeMatch[2].replace(/,/g, ''), 10);
    let max = parseInt(rangeMatch[3].replace(/,/g, ''), 10);
    
    if (rangeMatch[0].toLowerCase().includes('k')) {
      if (min < 1000) min *= 1000;
      if (max < 1000) max *= 1000;
    }
    
    return {
      min,
      max,
      currency: sym === '£' ? 'GBP' : sym === '€' ? 'EUR' : sym === '₦' ? 'NGN' : 'USD',
      period: (min < 200 && sym !== '₦') ? 'hour' : 'year',
      originalText: rangeMatch[0]
    };
  }

  // Look for single values e.g. $120k, $50/hr, $100,000
  const singleMatch = text.match(/([$£€₦])\s*([\d,]+)(k|K|\/hr|\/hour|\/mo|\/month|\/yr|\/year)?/);
  if (singleMatch) {
    const sym = singleMatch[1];
    let min = parseInt(singleMatch[2].replace(/,/g, ''), 10);
    const suffix = (singleMatch[3] || "").toLowerCase();
    
    if (suffix === 'k') min *= 1000;
    
    let period: 'year'|'month'|'hour' = 'year';
    if (suffix.includes('hr') || suffix.includes('hour') || (min < 200 && sym !== '₦')) period = 'hour';
    else if (suffix.includes('mo') || suffix.includes('month')) period = 'month';

    return {
      min,
      currency: sym === '£' ? 'GBP' : sym === '€' ? 'EUR' : sym === '₦' ? 'NGN' : 'USD',
      period,
      originalText: singleMatch[0]
    };
  }
  
  return undefined;
}

export async function processExtractions(results: SearchResult[], onProgress?: (msg: string) => void): Promise<Job[]> {
  if (onProgress) onProgress(`Extracting data for ${results.length} jobs concurrently...`);
  
  const promises = results.map(r => extractJobData(r));
  const batchResults = await Promise.all(promises);
  
  const jobs: Job[] = [];
  for (const job of batchResults) {
    if (job) jobs.push(job);
  }
  
  return jobs;
}
