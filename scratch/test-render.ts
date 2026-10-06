import fs from 'fs';
import path from 'path';

// Load .env.local
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

async function run() {
  const { getProfiles, getAdminProfiles, getProfileById, getProfileByIdOrSlug } = await import('../app/actions/profiles');

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

  // Check all profiles for dangerous properties
  for (const p of adminProfiles) {
    console.log(`Checking profile ${p.id} (${p.name}):`);
    console.log(`  tier: ${p.tier} (${typeof p.tier})`);
    console.log(`  city: ${p.city} (${typeof p.city})`);
    console.log(`  location: ${p.location} (${typeof p.location})`);
    console.log(`  galleryUrls: ${p.galleryUrls}`);
    console.log(`  videoUrls: ${p.videoUrls}`);
    console.log(`  picsCount: ${p.picsCount}`);
    console.log(`  vidsCount: ${p.vidsCount}`);
  }
}

run().catch(err => {
  console.error('CRASHED WITH ERROR:', err);
});
