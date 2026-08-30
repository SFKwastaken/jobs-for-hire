import fetch from 'node-fetch';

(async () => {
  const url = 'https://jobs.ashbyhq.com/percona/9c80f47a-b6cd-42c7-bb83-ff1191535bfd';
  try {
    const res = await fetch(url);
    const html = await res.text();
    const text = html.replace(/<[^>]+>/g, ' ');
    const dollarMatch = text.match(/\$[\d,]+/g);
    console.log('Dollar matches:', dollarMatch);
  } catch (e) {
    console.error(e);
  }
})();
