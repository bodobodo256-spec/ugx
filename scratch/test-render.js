const fs = require('fs');

// Load .env.local
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

async function run() {
  const { getProfiles, getAdminProfiles, getProfileById, getProfileByIdOrSlug } = require('./app/actions/profiles');

  console.log('--- 1. Testing getProfiles() ---');
  const publicProfiles = await getProfiles();
  console.log('Public profiles count:', publicProfiles.length);

  console.log('--- 2. Testing getAdminProfiles() ---');
  const adminProfiles = await getAdminProfiles();
  console.log('Admin profiles count:', adminProfiles.length);

  console.log('--- 3. Testing getProfileById(14) ---');
  const p14 = await getProfileById(14);
  console.log('Profile 14 name:', p14?.name, 'tier:', p14?.tier);

  console.log('--- 4. Testing getProfileByIdOrSlug("14") ---');
  const p14slug = await getProfileByIdOrSlug('14');
  console.log('Profile 14 by slug:', p14slug?.name);

  // Check if any public profile has null or unexpected values
  for (const p of publicProfiles) {
    if (!p.tier) console.warn('WARNING: profile missing tier:', p.id, p.name);
    if (!p.city) console.warn('WARNING: profile missing city:', p.id, p.name);
    if (!p.location) console.warn('WARNING: profile missing location:', p.id, p.name);
    if (!p.name) console.warn('WARNING: profile missing name:', p.id);
  }
  console.log('All profiles checked.');
}

run().catch(err => {
  console.error('CRASHED WITH ERROR:', err);
});
