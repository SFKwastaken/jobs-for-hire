import { parseIntent } from './src/utils/job-engine/intentParser.js';
import fetch from 'node-fetch';
const originalFetch = global.fetch;
global.fetch = async (input, init) => {
  let urlStr = input.toString();
  if (urlStr.startsWith('/api')) {
    urlStr = `http://localhost:5173${urlStr}`;
  }
  return originalFetch(urlStr, init);
};

parseIntent('Find me jobs for this resume: \\n\\n --- RESUME ---\\n Experienced Video Editor with 5 years in Adobe Premiere Pro and After Effects. Looking for remote work.')
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(err => console.error(err));
