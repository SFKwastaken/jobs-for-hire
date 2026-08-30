import type { SearchProfile } from './types';

export function generateQueries(profile: SearchProfile): string[] {
  const queries: Set<string> = new Set();
  
  const allRoles = [...profile.roles, ...profile.alternativeRoles];
  
  if (allRoles.length === 0) {
    if (profile.keywords && profile.keywords.length > 0) {
      allRoles.push(profile.keywords[0]);
    } else {
      allRoles.push("remote professional"); // generic fallback instead of software developer
    }
  }
  
  const locationModifier = profile.location.country || profile.location.region || "";
  const remoteModifier = profile.remote ? "remote" : "";
  
  // Create highly semantic queries for Tavily
  
  // Add ATS domains to ensure we get single job postings and not aggregators
  const atsFilter = " (site:boards.greenhouse.io OR site:jobs.lever.co OR site:apply.workable.com OR site:jobs.ashbyhq.com OR site:breezy.hr OR site:careers.jobscore.com)";
  
  const isNigeria = locationModifier.toLowerCase().includes('nigeria') || (profile.countriesAllowed?.some(c => c.toLowerCase().includes('nigeria')));
  
  // Base query construction
  let baseQ1 = `"${allRoles[0]}"`;
  if (remoteModifier) baseQ1 += ` ${remoteModifier}`;
  if (locationModifier) baseQ1 += ` ${locationModifier}`;
  baseQ1 += " jobs";
  if (profile.salaryRequirements?.yearly?.min || profile.salaryRequirements?.monthly?.min) {
    baseQ1 += ` ("$" OR "salary")`;
  }
  
  // Query 1-3: If Nigeria, prioritize Indeed, Jobberman, and LinkedIn as separate queries to guarantee order
  if (isNigeria) {
    queries.add(baseQ1.trim() + " site:indeed.com");
    queries.add(baseQ1.trim() + " site:jobberman.com");
    queries.add(baseQ1.trim() + " site:linkedin.com/jobs");
  }
  
  // Standard ATS Filter
  queries.add(baseQ1.trim() + atsFilter);

  // Query 3: If there's an alternative role, search that. Otherwise, search the primary role with different phrasing.
  if (allRoles.length > 1) {
    let q2 = `"${allRoles[1]}"`;
    if (remoteModifier) q2 += ` ${remoteModifier}`;
    if (locationModifier) q2 += ` ${locationModifier}`;
    q2 += " jobs";
    if (profile.salaryRequirements?.yearly?.min || profile.salaryRequirements?.monthly?.min) {
      q2 += ` ("$" OR "salary")`;
    }
    if (isNigeria) {
      queries.add(q2.trim() + " site:indeed.com");
      queries.add(q2.trim() + " site:jobberman.com");
      queries.add(q2.trim() + " site:linkedin.com/jobs");
    }
    queries.add(q2.trim() + atsFilter);
  } else {
    let q2 = `hiring ${allRoles[0]}`;
    if (remoteModifier) q2 += ` ${remoteModifier}`;
    if (locationModifier) q2 += ` ${locationModifier}`;
    if (profile.salaryRequirements?.yearly?.min || profile.salaryRequirements?.monthly?.min) {
      q2 += ` ("$" OR "salary")`;
    }
    if (isNigeria) {
      queries.add(q2.trim() + " site:indeed.com");
      queries.add(q2.trim() + " site:jobberman.com");
      queries.add(q2.trim() + " site:linkedin.com/jobs");
    }
    queries.add(q2.trim() + atsFilter);
  }

  // Return up to 6 queries (or more if Nigeria is prioritized)
  return Array.from(queries).slice(0, 6);
}
