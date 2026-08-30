import { parseIntentToProfile } from './src/utils/parser';
import { fetchJobs } from './src/utils/fetcher';
import { evaluateJobMatches } from './src/utils/matcher';

async function runTests() {
  const query = "find me remote jobs in nigeria, graphic designer";
  
  console.log("Parsing intent once...");
  const profile = await parseIntentToProfile(query, process.env.VITE_GROQ_API_KEY!);
  console.log("Profile:", profile);

  let successCount = 0;
  let failCount = 0;

  for (let i = 1; i <= 10; i++) {
    console.log(`\n--- Iteration ${i} ---`);
    try {
      const jobs = await fetchJobs(profile);
      console.log(`Fetched ${jobs.length} jobs.`);
      
      // Look for a job with a location that is NOT Nigeria or Worldwide
      // so we can test the AI's rejection.
      let testJobs = jobs.slice(0, 3);
      const strictRegionJob = jobs.find(j => j.location.toLowerCase().includes('europe') || j.location.toLowerCase().includes('us'));
      if (strictRegionJob) {
        testJobs = [strictRegionJob, ...jobs.filter(j => j.id !== strictRegionJob.id).slice(0, 2)];
      }

      if (testJobs.length === 0) {
        console.log("No jobs fetched to match.");
        continue;
      }

      console.log(`Evaluating ${testJobs.length} jobs...`);
      const matched = await evaluateJobMatches(profile, testJobs, process.env.VITE_GROQ_API_KEY!);
      
      let iterationPassed = true;
      for (let j = 0; j < matched.length; j++) {
        const job = testJobs[j];
        const match = matched[j];
        const loc = job.location.toLowerCase();
        
        // If job is strictly for Europe/US and user is in Nigeria
        if ((loc.includes('europe') || loc === 'us' || loc === 'usa' || loc === 'united states') && !loc.includes('worldwide') && !loc.includes('anywhere')) {
          if (match.matchScore > 0 || match.eligibility !== 'Location mismatch') {
            console.error(`❌ FAILED! Job in ${job.location} given score ${match.matchScore} with eligibility '${match.eligibility}'`);
            iterationPassed = false;
          } else {
            console.log(`✅ PASSED! Job in ${job.location} correctly rejected with score 0.`);
          }
        } else {
            console.log(`Job in ${job.location} got score ${match.matchScore}.`);
        }
      }

      if (iterationPassed) successCount++;
      else failCount++;

    } catch (e) {
      console.error(`Error in iteration ${i}:`, e);
      failCount++;
    }
  }

  console.log(`\n\n--- TEST RESULTS ---`);
  console.log(`Total Iterations: 10`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

runTests().catch(console.error);
