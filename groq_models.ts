import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });
groq.models.list().then(m => console.log(m.data.map(d => d.id).join(', '))).catch(console.error);
