import { config } from 'dotenv';
config({ path: '.env.local' });

// Map Vite env variables to process.env so our code works in Node.js
process.env.VITE_ADZUNA_APP_ID = process.env.VITE_ADZUNA_APP_ID;
process.env.VITE_ADZUNA_APP_KEY = process.env.VITE_ADZUNA_APP_KEY;
process.env.VITE_TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// Mock import.meta.env for Node.js execution
(global as any).import = {
  meta: {
    env: process.env
  }
};

import { discoverJobsForProfile } from './src/utils/adzuna.ts';

async function runTests() {
  const profiles = [
    {
      _name: "Iteration 1: Video Editor, Nigeria, Remote",
      userId: 'test1',
      onboarding_completed: true,
      target_roles: ['Video Editor'],
      skills: ['Premiere Pro'],
      location: { country: 'Nigeria', state: '', city: 'Lagos' },
      work_preference: 'remote'
    },
    {
      _name: "Iteration 2: Software Engineer, Nigeria, Remote",
      userId: 'test2',
      onboarding_completed: true,
      target_roles: ['Software Engineer'],
      skills: ['React'],
      location: { country: 'Nigeria', state: '', city: 'Abuja' },
      work_preference: 'remote'
    },
    {
      _name: "Iteration 3: Data Analyst, US, Remote",
      userId: 'test3',
      onboarding_completed: true,
      target_roles: ['Data Analyst'],
      skills: ['SQL'],
      location: { country: 'United States', state: '', city: 'New York' },
      work_preference: 'remote'
    },
    {
      _name: "Iteration 4: Marketing, UK, Hybrid",
      userId: 'test4',
      onboarding_completed: true,
      target_roles: ['Marketing Manager'],
      skills: ['SEO'],
      location: { country: 'UK', state: '', city: 'London' },
      work_preference: 'hybrid'
    }
  ];

  const results = [];

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    console.log(`\n========================================`);
    console.log(`Running ${profile._name}...`);
    try {
      const jobs = await discoverJobsForProfile(profile as any);
      console.log(`=> Found ${jobs.length} jobs.`);
      const sample = jobs.slice(0, 3).map(j => ({ title: j.title || j.role || 'N/A', company: j.company, source: j.source, location: j.location }));
      console.log(`=> Top matches:`, sample);
      results.push({ iteration: profile._name, count: jobs.length, sample });
    } catch (e: any) {
      console.error(`=> Error:`, e.message);
      results.push({ iteration: profile._name, error: e.message });
    }
  }
  
  console.log("\nDone!");
}

runTests().catch(console.error);
