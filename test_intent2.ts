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

parseIntent('Find remote jobs that match my resume profile \\n\\n--- RESUME/CV CONTEXT ---\\n ')
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(err => console.error(err));
