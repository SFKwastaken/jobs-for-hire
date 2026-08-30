import type { SearchProfile } from './types';

const SYSTEM_PROMPT = `You are a Search Intent Parser for a remote job engine.
The user will provide a natural language request for a job.
You must parse this request into a strict JSON object matching this interface:

{
  "rawQuery": "original user input",
  "roles": ["Array of distinct roles (e.g., frontend developer, react engineer)"],
  "alternativeRoles": ["Array of synonyms/variations (e.g., UI engineer)"],
  "skills": ["Array of skills"],
  "technologies": ["Array of tech stacks/tools"],
  "keywords": ["Important keywords"],
  "excludedKeywords": ["Keywords the user explicitly doesn't want"],
  "location": {
    "country": "Primary country mentioned",
    "city": "Primary city",
    "region": "Primary region (e.g., EMEA)"
  },
  "remote": true or false,
  "remoteType": "fully_remote" | "remote" | "hybrid" | "onsite" | "unknown",
  "countriesAllowed": ["List of countries the applicant is allowed to be from"],
  "experienceLevel": "intern" | "entry" | "junior" | "mid" | "senior" | "lead" | "unknown",
  "salaryRequirements": {
    "hourly": { "min": number, "max": number, "currency": "USD" },
    "monthly": { "min": number, "max": number, "currency": "USD" },
    "yearly": { "min": number, "max": number, "currency": "USD" }
  },
  "employmentTypes": ["Full-time", "Contract", "Freelance", etc],
  "preferredSources": ["specific job boards mentioned"],
  "semanticDescription": "A 2-sentence summary of what the candidate is looking for."
}

Rules:
1. "Nigeria" implies location.country = "Nigeria" and countriesAllowed should include "Nigeria".
2. If remote is mentioned, set remote=true.
3. Parse salaries carefully. $10-$100/hr -> hourly {min:10, max:100, currency: "USD"}. ₦200k-₦900k -> monthly {min: 200000, max: 900000, currency: "NGN"}.
4. Return ONLY valid JSON without markdown wrapping.`;

export async function parseIntent(input: string): Promise<SearchProfile> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: input }
      ],
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to parse intent');
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    content = content.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(content) as SearchProfile;
}
