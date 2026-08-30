import type { Job } from './types';

export function deduplicateJobs(jobs: Job[]): Job[] {
  const uniqueJobs: Job[] = [];
  const urlSet = new Set<string>();
  const titleCompanySet = new Set<string>();

  for (const job of jobs) {
    // 1. Exact URL deduplication
    const cleanUrl = job.sourceUrl.split('?')[0].toLowerCase();
    if (urlSet.has(cleanUrl)) continue;
    
    // 2. Title + Company deduplication
    const titleCompanyKey = `${job.title.toLowerCase().replace(/[^a-z0-9]/g, '')}-${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (titleCompanySet.has(titleCompanyKey)) continue;

    urlSet.add(cleanUrl);
    titleCompanySet.add(titleCompanyKey);
    uniqueJobs.push(job);
  }

  return uniqueJobs;
}
