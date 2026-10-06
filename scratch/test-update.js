const fs = require('fs');
const path = require('path');

// Load .env.local
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

// Since db files are in TypeScript, let's use the D1 REST API directly or ts-node / Next.js
console.log('CLOUDFLARE_API_TOKEN length:', (process.env.CLOUDFLARE_API_TOKEN || '').length);
console.log('CLOUDFLARE_ACCOUNT_ID:', process.env.CLOUDFLARE_ACCOUNT_ID);
console.log('CLOUDFLARE_D1_DATABASE_ID:', process.env.CLOUDFLARE_D1_DATABASE_ID);

async function runDirectQuery() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_D1_DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql: 'SELECT * FROM profiles WHERE id = ?',
      params: [14],
    }),
  });
  const data = await res.json();
  console.log('Profile 14 data:', JSON.stringify(data.result[0].results[0], null, 2));
}

runDirectQuery().catch(console.error);
