import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { loadEnv } from 'vite';

const env = loadEnv('', process.cwd(), '');
const router = Router();

const getAiClient = () => {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null; // Return null if missing, to fallback to mock data
  return new GoogleGenAI({ apiKey });
};

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    personal: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        professionalTitle: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        portfolio: { type: Type.STRING },
      },
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      description: "MUST contain a list of all distinct work experiences mentioned by the user.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          company: { type: Type.STRING },
          jobTitle: { type: Type.STRING },
          location: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          current: { type: Type.BOOLEAN },
          description: { type: Type.STRING },
          achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      description: "MUST contain a list of all distinct educational backgrounds mentioned by the user.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          field: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      description: "List of relevant skills.",
      items: { type: Type.STRING },
    },
    projects: {
      type: Type.ARRAY,
      description: "MUST contain a list of all relevant projects mentioned by the user.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
          url: { type: Type.STRING },
        },
      },
    },
    certifications: {
      type: Type.ARRAY,
      description: "List of certifications. Omit if none.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          date: { type: Type.STRING },
        },
      },
    },
    languages: {
      type: Type.ARRAY,
      description: "List of languages. Omit if none.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          level: { type: Type.STRING },
        },
      },
    },
  },
};

const SYSTEM_INSTRUCTION = `You are an expert professional resume writer and career-document specialist.
Your task is to transform raw user information into a highly professional, ATS-friendly resume.
CRITICAL RULES:
1. Use ONLY information supplied by the user, their JobsForHire profile, and the supplied job description.
2. NEVER fabricate facts, companies, job titles, degrees, dates, certifications, skills, or achievements.
3. You may improve wording, structure, clarity, and relevance.
4. Keep bullet points concise and start with strong action verbs.
5. Prioritize relevant experience based on the target job (if provided).
6. CRITICAL: DO NOT dump all information into the "summary" field. You MUST properly categorize the user's input.
7. CRITICAL: Identify all distinct jobs and place them individually in the "experience" array.
8. CRITICAL: Identify all distinct projects and place them individually in the "projects" array.
9. CRITICAL: Identify all distinct educational backgrounds and place them in the "education" array.
10. Return the data as structured JSON.`;

router.post('/generate', async (req, res) => {
  try {
    const { userProfile, additionalInfo, jobDescription, contactInfo } = req.body;

    let prompt = `You are tasked with breaking down the user's information and STRICTLY categorizing it into the required JSON fields.
DO NOT summarize all the information into the "summary" field. You MUST use the "experience", "projects", "education", and "skills" arrays to store their respective data.

Here is the user's base profile information:
${JSON.stringify(userProfile, null, 2)}

Here is explicitly provided contact information (USE THIS EXACTLY for the personal section, DO NOT hallucinate locations from experience as their contact location):
${JSON.stringify(contactInfo || {}, null, 2)}

Here is the unstructured additional information provided by the user. You MUST parse this text and extract every single job, project, and educational background into their respective arrays:
${additionalInfo || 'None'}

You MUST return your output as a raw JSON object exactly matching this structure (fill in all fields, do not omit arrays):
{
  "personal": {
    "fullName": "string",
    "professionalTitle": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string"
  },
  "summary": "string (A strong professional summary)",
  "experience": [
    {
      "company": "string",
      "jobTitle": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string",
      "achievements": ["string", "string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string"
    }
  ],
  "skills": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string"
    }
  ],
  "certifications": [],
  "languages": []
}`;

    if (jobDescription) {
      prompt += `\n\nHere is the target job description to tailor the resume for (DO NOT claim skills from this job unless the user possesses them):
${jobDescription}`;
    }

    const ai = getAiClient();
    if (!ai) {
      console.warn("Missing GEMINI_API_KEY. Returning mock data.");
      return res.json({
        personal: {
          fullName: userProfile?.username || "John Doe",
          professionalTitle: jobDescription || "Software Engineer",
          email: "john@example.com",
          phone: "+234 123 456 7890",
          location: "Lagos, Nigeria",
          linkedin: "https://linkedin.com/in/johndoe",
          portfolio: "https://johndoe.com"
        },
        summary: `Experienced ${jobDescription || "professional"} with a strong background in delivering high-quality results. Proficient in modern tools and methodologies. Dedicated to continuous learning and contributing to dynamic teams.`,
        experience: [
          {
            id: "exp1",
            company: "Tech Solutions Inc.",
            jobTitle: jobDescription || "Developer",
            location: "Remote",
            startDate: "Jan 2021",
            endDate: "Present",
            current: true,
            description: additionalInfo || "Worked on various client projects.",
            achievements: [
              "Led the development of a flagship product, increasing user engagement by 40%.",
              "Optimized application performance, reducing load times by 2.5 seconds.",
              "Collaborated with cross-functional teams to deliver features ahead of schedule."
            ]
          }
        ],
        education: [
          {
            id: "edu1",
            institution: "University of Technology",
            degree: "Bachelor of Science",
            field: "Computer Science",
            startDate: "2016",
            endDate: "2020",
            description: "Graduated with honors."
          }
        ],
        skills: userProfile?.skills || ["React", "JavaScript", "TypeScript", "Node.js", "CSS"],
        projects: [],
        certifications: [],
        languages: []
      });
    }

    console.log(`\n[Resume API] Starting resume generation for user: ${userProfile?.username || 'Unknown'}...`);
    console.log(`[Resume API] Additional Info length: ${additionalInfo?.length || 0} characters.`);
    console.log(`[Resume API] Model: ${env.GEMINI_RESUME_MODEL || 'gemini-2.5-flash'}`);
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: env.GEMINI_RESUME_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.2, // Keep it grounded
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Resume API] Generation completed in ${elapsed} seconds.`);

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini");
    
    const resumeData = JSON.parse(jsonText);
    res.json(resumeData);
  } catch (error: any) {
    console.error("Resume Generation Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to generate resume" });
  }
});

router.post('/improve', async (req, res) => {
  try {
    const { text, instruction } = req.body;

    const prompt = `Original text:
"${text}"

Improve this text according to the following instruction: "${instruction}".
CRITICAL: Do not invent any new metrics, facts, or tools. Only improve the phrasing and impact of the existing information. Return ONLY the improved text, nothing else.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: env.GEMINI_RESUME_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional resume writer.",
        temperature: 0.3,
      },
    });

    res.json({ improvedText: response.text?.trim() });
  } catch (error: any) {
    console.error("Resume Improvement Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to improve text" });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { resumeData } = req.body;

    const prompt = `Analyze this resume and provide a strict JSON response.
Do NOT use markdown. Return raw JSON matching this structure:
{
  "score": 0-100,
  "strengths": ["string"],
  "improvements": ["string"],
  "missingKeywords": ["string"],
  "warnings": ["string"]
}

Resume Data:
${JSON.stringify(resumeData)}`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: env.GEMINI_RESUME_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an ATS analysis system.",
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Resume Analysis Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to analyze resume" });
  }
});

export default router;
