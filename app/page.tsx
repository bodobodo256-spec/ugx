import { Suspense } from 'react';
import { getProfiles } from '@/app/actions/profiles';
import HomeContent from '@/components/HomeContent';

export const dynamic = 'force-dynamic'; // always fetch fresh data

export default async function Home() {
  const profiles = await getProfiles();

  return (
    <Suspense fallback={<div style={{ minHeight: '50vh', padding: '2rem', textAlign: 'center', color: '#FFD600' }}>Loading Uganda Sexy Babes…</div>}>
      <HomeContent profiles={profiles} />
    </Suspense>
  );
}
