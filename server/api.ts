import express from 'express';
import cors from 'cors';
import { loadEnv } from 'vite';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';
import 'dotenv/config';
import resumeApi from './resumeApi';

// Simple In-Memory Cache to save API credits (TTL: 2 hours)
const searchCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 2 * 60 * 60 * 1000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// We load env variables manually since this is running inside Vite's node process
const env = loadEnv('', process.cwd(), '');

// --- RESUME ENDPOINTS ---
app.use('/api/resume', resumeApi);

// --- GROQ AI ENDPOINT ---
app.post('/api/ai', async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens, response_format } = req.body;
    
    if (!env.VITE_GROQ_API_KEY && !env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Missing Groq API Key" });
    }
    
    const groq = new Groq({ apiKey: env.VITE_GROQ_API_KEY || env.GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
      messages,
      model: model || "openai/gpt-oss-20b",
      temperature: temperature || 0,
      max_tokens: max_tokens || 2500
    });
    
    res.json(completion);
  } catch (error: any) {
    console.error("AI Proxy Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- SEARCH ENDPOINT (Tavily Search) ---
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const depth = (req.query.depth as string) || "basic";
    
    if (!query) return res.status(400).json({ error: "Missing query parameter" });
    
    // 1. Check Cache
    const cacheKey = `${query}_${depth}_v2`;
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`[CACHE HIT] Returning cached results for: ${query}`);
      return res.json(cached.data);
    }

    // 2. Verify API Key
    const apiKey = env.TAVILY_API_KEY || env.VITE_TAVILY_API_KEY || process.env.TAVILY_API_KEY;
    if (!apiKey) {
      console.warn("No Tavily Search API Key provided. Returning mock data.");
      return res.json({
        web: {
          results: [
            {
              title: "Senior Frontend Engineer (Remote Nigeria)",
              url: "https://example.com/job/1",
              description: "Looking for a React developer to join our team. Remote OK. $15/hr."
            },
            {
              title: "Frontend Web Developer",
              url: "https://example.com/job/2",
              description: "Join us to build amazing web applications. Nigeria remote accepted."
            }
          ]
        }
      });
    }
    
    // 3. Call Tavily
    console.log(`[TAVILY] Fetching (${depth}) search for: ${query}`);
    const response = await fetch(`https://api.tavily.com/search`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: depth,
        include_answer: false,
        include_images: false,
        include_raw_content: true,
        max_results: 20,
      })
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        console.error("Tavily Rate Limit Reached.");
        return res.status(429).json({ error: "Monthly search limit reached. Please try again later." });
      }
      if (response.status === 401 || response.status === 403) {
        console.error("Tavily API Key Invalid.");
        return res.status(401).json({ error: "Search API Key is invalid or missing." });
      }
      const text = await response.text();
      console.error("Tavily Search Error:", text);
      return res.status(response.status).json({ error: "Search failed" });
    }
    
    const data = await response.json();
    
    // Transform Tavily results into the expected schema (similar to what Brave returned for compatibility)
    const formattedData = {
      web: {
        results: data.results.map((r: any) => ({
          title: r.title,
          url: r.url,
          description: r.content,
          raw_content: r.raw_content
        }))
      }
    };

    // 4. Update Cache
    searchCache.set(cacheKey, { data: formattedData, timestamp: Date.now() });

    res.json(formattedData);
  } catch (error: any) {
    console.error("Search Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- PAGE FETCH ENDPOINT ---
app.get('/api/fetch-page', async (req, res) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: "Missing url parameter" });
    
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
       return res.status(400).json({ error: "Invalid URL" });
    }

    if (url.includes('example.com')) {
      return res.json({ text: "Looking for a React developer to join our team. Remote OK. $15/hr. Must be from Nigeria. Apply at example.com/apply." });
    }
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      signal: AbortSignal.timeout(8000)
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch page: ${response.statusText}` });
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('script, style, noscript, iframe, img, svg, video, audio, nav, footer, header').remove();
    const title = $('title').text().trim();
    let text = $('body').text().replace(/\s+/g, ' ').trim();
    text = text.substring(0, 20000);
    
    res.json({ title, text, url: response.url });
  } catch (error: any) {
    console.error("Fetch Page Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default app;
