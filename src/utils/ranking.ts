import type { ProcessedJob } from './job-engine/types';
import type { UserProfile } from '../lib/profile';

/**
 * Removes duplicate jobs based on URL, or combination of Company + Title.
 */
export function deduplicateJobs(jobs: ProcessedJob[]): ProcessedJob[] {
  const unique = new Map<string, ProcessedJob>();
  
  for (const job of jobs) {
    // Primary key is URL
    if (job.url && !unique.has(job.url)) {
      unique.set(job.url, job);
      continue;
    }
    
    // Fallback key: Company + Title
    const fallbackKey = `${job.company?.toLowerCase() || ''}-${job.title?.toLowerCase() || ''}`;
    if (!unique.has(fallbackKey)) {
      unique.set(fallbackKey, job);
    }
  }
  
  return Array.from(unique.values());
}

/**
 * Ranks jobs based on how well they match the user's profile.
 * Mutates the jobs to add `matchScore`, `matchChecks`, and `matchWarnings`.
 */
export function rankJobsForProfile(jobs: ProcessedJob[], profile: UserProfile): ProcessedJob[] {
  return jobs.map(job => {
    let score = 50; // Base score
    const checks: string[] = [];
    const warnings: string[] = [];

    const jobTitle = job.title?.toLowerCase() || '';
    const jobDesc = job.description?.toLowerCase() || '';

    // 1. Role Match (Heavy weight)
    const matchesTargetRole = profile.target_roles?.some(r => jobTitle.includes(r.toLowerCase()));
    if (matchesTargetRole) {
      score += 25;
      checks.push("Matches target role");
    } else {
      const matchesAltRole = profile.alternative_roles?.some(r => jobTitle.includes(r.toLowerCase()));
      if (matchesAltRole) {
        score += 15;
        checks.push("Matches alternative role");
      }
    }

    // 2. Skills Match
    if (profile.skills && profile.skills.length > 0) {
      const matchedSkills = profile.skills.filter(s => jobTitle.includes(s.toLowerCase()) || jobDesc.includes(s.toLowerCase()));
      if (matchedSkills.length > 0) {
        score += Math.min(15, matchedSkills.length * 5);
        checks.push(`Matches ${matchedSkills.length} skills`);
      } else {
        warnings.push("Missing core skills");
      }
    }

    // 3. Location/Remote Preference
    const isRemote = job.location?.toLowerCase().includes('remote') || false;
    if (profile.work_preference?.toLowerCase().includes('remote')) {
      if (isRemote) {
        score += 10;
        checks.push("Remote friendly");
      } else {
        warnings.push("May require on-site");
      }
    }

    // Ensure score is between 10 and 99
    job.matchScore = Math.max(10, Math.min(99, score));
    job.matchChecks = checks;
    job.matchWarnings = warnings;

    return job;
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
