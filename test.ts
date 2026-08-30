import { parseIntentToProfile } from './src/utils/parser';
import { fetchJobs } from './src/utils/fetcher';
import { evaluateJobMatches } from './src/utils/matcher';

async function run() {
  const query = "Find jobs that are in US and are fully remote, frontend developer with 20-30$ per hour of pay.";
  
  console.log("Parsing...");
  const profile = await parseIntentToProfile(query, process.env.VITE_GROQ_API_KEY!);
  console.log(profile);
  
  console.log("Fetching...");
  const jobs = await fetchJobs(profile);
  console.log(`Fetched ${jobs.length} jobs`);
  
  if (jobs.length > 0) {
    console.log("Sources of jobs:", jobs.map(j => j.source).slice(0, 10));
    const adzunaJobs = jobs.filter(j => j.source === "Adzuna");
    console.log(`Found ${adzunaJobs.length} Adzuna jobs`);
    if (adzunaJobs.length > 0) {
      console.log("First Adzuna job title:", adzunaJobs[0].title);
      console.log("First Adzuna job description (excerpt):", adzunaJobs[0].description.substring(0, 100));
    }
    
    console.log("Matching first 3 jobs...");
    const matched = await evaluateJobMatches(profile, jobs.slice(0, 3), process.env.VITE_GROQ_API_KEY!);
    console.log(matched);
  }
}

run().catch(console.error);
