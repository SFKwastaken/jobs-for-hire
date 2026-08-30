import { loadEnv } from 'vite';

const env = loadEnv('', process.cwd(), '');

async function testResume() {
  console.log("Testing Resume Generation...");
  const res = await fetch('http://localhost:5173/api/resume/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userProfile: {
        username: 'Stephen Moses-Azuoru',
        target_roles: ['Frontend Developer'],
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'],
        experience_level: 'Mid Level',
      },
      additionalInfo: `My work experince and projects include working as a Senior VFX Artist at TBC Pictures (2024–Present), where I worked on VFX, CGI, compositing and short film projects, as well as working as a Content Creator, Video Editor and Creative Director at Maison Fahrenheit Hospitality Ltd (2024–2025), where I handled video editing, content creation and creative direction. I also worked with Starlight Media (2024) producing and editing videos and helping grow a YouTube channel from 0 to 70 subscribers. I gained software testing and QA experience during my internship at ActivEdge Technologies (2025), where I worked with tools like Jira, Postman, JMeter, GitHub, TestRail, Google Sheets and Figma, and I also completed my SIWES at the Nigerian Army DADP, Bonny Cantonment (2025). I also received an offer from PodEdit Studios as a Video Editor/Motion Graphics Designer in 2025. One of my biggest projects is AURA (Adaptive User-Reality Assistant), also called Operation Phoenix (2025–2026), which is my final year Computer Science project and is a Windows based AI assistant that can understand user requests, interact through voice, use multiple AI agents, automate tasks on the computer, manage files and folders and use memory to remember previous information. I have also been building JobsForHire (2026), an AI powered job search platform that aggregates job listings and matches users with relevant jobs based on their profile, preferences, salary and location, with features like an AI resume generator using Gemini. Another project I worked on is a platform for graphic designers (2026) that allows designers to connect, find design inspiration, browse resources and create 3D mockups. I also maintain a video editing and VFX portfolio (2024–Present) showcasing short form content, motion graphics, CGI and other editing projects. Overall, I have experience across software development, AI, automation, QA testing, video editing, VFX, CGI, motion graphics and creative content production.`,
      jobDescription: ''
    })
  });

  if (!res.ok) {
    console.error("Failed:", await res.text());
    return;
  }

  const data = await res.json();
  console.log("Success! Resume Data generated:");
  console.log(JSON.stringify(data, null, 2));
}

testResume();
