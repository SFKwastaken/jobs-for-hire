import { runJobDiscoveryPipeline } from './src/utils/job-engine/pipeline';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We need to patch fetch to go to localhost since we are not in browser
// Actually, our pipeline uses relative paths like `/api/search`, so from Node it will fail.
// I should just import the functions from server/api.ts directly or pass the absolute URL if running from Node.
// But wait, the pipeline calls `fetch('/api/search')`. In Node, fetch requires absolute URLs.

// Let's create a proxy script that patches fetch globally just for this test
const originalFetch = global.fetch;
global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let urlStr = input.toString();
  if (urlStr.startsWith('/api')) {
    urlStr = `http://localhost:3001${urlStr}`;
  }
  return originalFetch(urlStr, init);
};

import apiApp from './server/api';
const server = apiApp.listen(3001, async () => {
  const query = process.argv[2] || "Find remote frontend jobs paying $10-$15/hr that accept applicants from Nigeria";
  console.log(`\n\n--- TESTING CYCLE: ${query} ---\n`);
  
  try {
    const results = await runJobDiscoveryPipeline(query, (msg) => {
      console.log(`[PROGRESS] ${msg}`);
    });
    
    console.log(`\n\n--- RESULTS FOUND: ${results.length} ---`);
    for (const res of results.slice(0, 3)) {
      console.log(`\nJob: ${res.raw.title} at ${res.raw.company}`);
      console.log(`URL: ${res.raw.sourceUrl}`);
      console.log(`Salary:`, res.raw.salary);
      console.log(`Remote: ${res.raw.remote} (${res.raw.remoteType})`);
      console.log(`Match Score: ${res.analysis.matchScore}%`);
      console.log(`Why: ${res.analysis.whyItMatches}`);
    }
    
  } catch (e) {
    console.error("Test failed", e);
  } finally {
    server.close();
    process.exit(0);
  }
});
