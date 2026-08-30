import { discoverJobsForProfile } from './src/utils/adzuna';

async function run() {
  const p1 = {
    userId: '1',
    onboarding_completed: true,
    target_roles: ['Video Editor'],
    alternative_roles: [],
    job_categories: [],
    skills: ['Premiere Pro'],
    experience_level: 'mid',
    experience_years: '3',
    location: { country: 'Nigeria', state: '', city: 'Lagos' },
    work_preference: 'remote',
    preferred_locations: [],
    salary: { minimum: 10, desired: 80, currency: 'USD', period: 'hour' },
    job_types: ['Full-time'],
    industries: [],
    company_preferences: [],
    education: { level: 'Bachelors', field: 'CS' },
    certifications: [],
    portfolio: [],
    professional_links: [],
    career_priorities: [],
    availability: 'now'
  };

  console.log("Running Iteration 1 (Video Editor, Nigeria, Remote)...");
  const res1 = await discoverJobsForProfile(p1 as any);
  console.log(`Found ${res1.length} jobs.`);
  console.log(res1.slice(0,2));
}

run().catch(console.error);
