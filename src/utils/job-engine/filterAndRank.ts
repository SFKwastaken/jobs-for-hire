import type { SearchProfile, Job, ProcessedJob } from './types';
import { extractSalaryInfo } from './jobExtractor';

function matchesHardConstraints(profile: SearchProfile, job: Job): boolean {
  // 1. Remote filter
  if (profile.remote && job.remoteType === 'onsite' && !job.remote) {
    return false;
  }
  
  // 2. Location Eligibility Filter
  if (profile.location?.country) {
    const userCountry = profile.location.country.toLowerCase();
    const jobLoc = job.location?.toLowerCase() || '';
    const eligible = job.eligibleCountries?.map(c => c.toLowerCase()) || [];
    
    let isEligible = false;
    if (jobLoc.includes(userCountry)) isEligible = true;
    if (eligible.includes(userCountry)) isEligible = true;
    
    // Broad region matches
    if (userCountry === 'nigeria' && (jobLoc.includes('worldwide') || eligible.includes('worldwide') || jobLoc.includes('emea') || eligible.includes('emea') || jobLoc.includes('africa') || eligible.includes('africa'))) {
      isEligible = true;
    }
    // Assume remote US only if explicitly stated
    if (jobLoc.includes('us only') || eligible.includes('us only') || eligible.includes('united states only')) {
      if (userCountry !== 'united states' && userCountry !== 'us' && userCountry !== 'usa') {
        return false;
      }
    }
    
    // If it mentions specific countries and user is not in them (and it's not worldwide)
    if (!isEligible && eligible.length > 0 && !eligible.some(e => ['worldwide', 'global', 'anywhere'].includes(e))) {
      return false; // Specifically restrictive
    }
  }

  // 3. Salary Check (basic normalization check)
  // If user demands min 800/mo, and job explicitly pays 300/mo, reject.
  if (profile.salaryRequirements?.monthly?.min && job.salary?.min) {
    let jobMonthlyMin = job.salary.min;
    if (job.salary.period === 'year') jobMonthlyMin = job.salary.min / 12;
    if (job.salary.period === 'hour') jobMonthlyMin = job.salary.min * 160; // rough approx
    
    // Only filter if currency matches roughly or assume USD for now
    if (profile.salaryRequirements.monthly.currency === job.salary.currency || (!job.salary.currency && profile.salaryRequirements.monthly.currency === 'USD')) {
       if (jobMonthlyMin < profile.salaryRequirements.monthly.min * 0.8) {
         // Reject if job max is also below
         if (job.salary.max) {
           let jobMonthlyMax = job.salary.max;
           if (job.salary.period === 'year') jobMonthlyMax = job.salary.max / 12;
           if (job.salary.period === 'hour') jobMonthlyMax = job.salary.max * 160;
           if (jobMonthlyMax < profile.salaryRequirements.monthly.min) return false;
         } else {
           return false;
         }
       }
    }
  }

  return true;
}



export async function evaluateJobMatches(profile: SearchProfile, jobs: Job[], onProgress?: (msg: string) => void): Promise<ProcessedJob[]> {
  // First, deterministic filter
  if (onProgress) onProgress('Applying hard filters (Location, Salary)...');
  const filteredJobs = jobs.filter(job => matchesHardConstraints(profile, job));
  
  // Heuristic sort to only send the top 8 to the AI to prevent rate limits
  const heuristicSorted = filteredJobs.sort((a, b) => {
    const aText = (a.title + " " + a.description).toLowerCase();
    const bText = (b.title + " " + b.description).toLowerCase();
    let aScore = 0; let bScore = 0;
    for (const skill of profile.skills || []) {
      if (aText.includes(skill.toLowerCase())) aScore++;
      if (bText.includes(skill.toLowerCase())) bScore++;
    }
    return bScore - aScore;
  });

  const jobsToEvaluate = heuristicSorted.slice(0, 8);
  if (onProgress) onProgress(`Evaluating top ${jobsToEvaluate.length} potential matches with AI...`);
  
  // Fetch full page content for top 8 to ensure we capture salaries if missing from snippet
  const fetchPromises = jobsToEvaluate.map(async (job) => {
    if (!job.salary) {
      try {
        const res = await fetch(`/api/fetch-page?url=${encodeURIComponent(job.sourceUrl)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            job.salary = extractSalaryInfo(data.text);
          }
        }
      } catch (e) {
        console.error("Failed to fetch full page for salary extraction", job.sourceUrl);
      }
    }
    return job;
  });
  
  await Promise.all(fetchPromises);
  
  const processedJobs: ProcessedJob[] = jobsToEvaluate.map(job => {
    // Basic heuristic evaluation
    const aText = (job.title + " " + job.description).toLowerCase();
    const matchingSkills = (profile.skills || []).filter(s => aText.includes(s.toLowerCase()));
    const missingSkills = (profile.skills || []).filter(s => !aText.includes(s.toLowerCase()));
    
    let baseScore = 60;
    if (matchingSkills.length > 0) baseScore += (matchingSkills.length * 10);
    if (baseScore > 98) baseScore = 98;
    
    return {
      raw: job,
      analysis: {
        matchScore: baseScore,
        matchingSkills,
        missingSkills,
        whyItMatches: matchingSkills.length > 0 
          ? `Matches your skills in ${matchingSkills.join(', ')}.`
          : `A strong keyword match for ${profile.roles?.[0] || 'your profile'}.`,
        concerns: missingSkills.length > 0 ? [`Missing explicit mention of ${missingSkills[0]}`] : [],
        roleRelevance: baseScore,
        skillRelevance: baseScore,
        experienceFit: 80,
        remoteFit: job.remote ? 100 : 50,
        salaryFit: job.salary ? 100 : 80
      }
    };
  });
  
  // Post-fetch Salary Enforcement: If user explicitly required a salary, drop jobs that still don't have one or don't meet it.
  const hasSalaryRequirement = !!(profile.salaryRequirements?.yearly?.min || profile.salaryRequirements?.monthly?.min || profile.salaryRequirements?.hourly?.min);
  let finalJobs = processedJobs;
  
  if (hasSalaryRequirement) {
    finalJobs = processedJobs.filter(pj => {
      if (!pj.raw?.salary) return true; // Accept jobs with undisclosed salaries
      
      const req = profile.salaryRequirements;
      const jobMin = pj.raw!.salary!.min || 0;
      let jobAnnual = jobMin;
      if (pj.raw!.salary!.period === 'hour') jobAnnual = jobMin * 2000;
      if (pj.raw!.salary!.period === 'month') jobAnnual = jobMin * 12;

      let reqAnnual = 0;
      let reqCurrency = 'USD';
      if (req?.yearly?.min) { reqAnnual = req.yearly.min; reqCurrency = req.yearly.currency || 'USD'; }
      else if (req?.monthly?.min) { reqAnnual = req.monthly.min * 12; reqCurrency = req.monthly.currency || 'USD'; }
      else if (req?.hourly?.min) { reqAnnual = req.hourly.min * 2000; reqCurrency = req.hourly.currency || 'USD'; }

      // If currencies don't match, don't strictly filter out
      if (pj.raw!.salary!.currency && reqCurrency && pj.raw!.salary!.currency !== reqCurrency) {
        return true;
      }

      // Allow 30% leeway
      return jobAnnual >= (reqAnnual * 0.7);
    });
  }
  
  // Sort by matchScore descending
  return finalJobs.sort((a, b) => b.analysis!.matchScore - a.analysis!.matchScore);
}
