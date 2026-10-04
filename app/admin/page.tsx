import { Suspense } from 'react';
import { getAdminProfiles } from '@/app/actions/profiles';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Control Panel | Uganda Sexy Babes',
  description: 'Manage profiles, approvals, archives, VIP status, and payment verification.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdminPage() {
  const profiles = await getAdminProfiles();

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', padding: '3rem', textAlign: 'center', color: '#FFD600', background: '#0a0a0a' }}>
          Loading Admin Control Panel...
        </div>
      }
    >
      <AdminDashboard initialProfiles={profiles} />
    </Suspense>
  );
}
