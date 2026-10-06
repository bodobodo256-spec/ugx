import fs from 'fs';

// Load .env.local
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

async function run() {
  const { adminUpdateProfile } = await import('../app/actions/profiles');

  const formData = new FormData();
  formData.set('id', '14');
  formData.set('name', 'Shila');
  formData.set('age', '23');
  formData.set('city', 'Kampala');
  formData.set('location', 'Kololo, Kampala');
  formData.set('tier', 'VIP');
  formData.set('phone', '+256700000001');
  formData.set('whatsapp', '256700000001');
  formData.set('about', 'I am a sweet, beautiful Ugandan lady who loves good conversations, private dates and romantic evenings. Discreet and classy.');
  formData.set('status', 'recent');
  formData.set('picsCount', '1');
  formData.set('isApproved', 'true');
  formData.set('isVerified', 'false');
  formData.set('isPremium', 'false');
  formData.set('isNew', 'true');
  formData.set('isArchived', 'false');
  formData.set('paymentStatus', 'verified');
  formData.set('paymentAmount', '25000');
  formData.set('paymentRef', '76655444332');
  formData.set('galleryUrls', '[]');
  formData.set('videoUrls', '[]');

  console.log('Calling adminUpdateProfile...');
  const res = await adminUpdateProfile(formData);
  console.log('Result:', res);
}

run().catch(err => {
  console.error('CRASHED IN ADMIN UPDATE:', err);
});
