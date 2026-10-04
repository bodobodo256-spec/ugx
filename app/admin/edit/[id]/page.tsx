import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProfileById } from '@/app/actions/profiles';
import EditProfileForm from '@/components/EditProfileForm';
import '@/app/admin/admin.css';
import '@/app/admin/edit.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Profile | Admin Control Panel',
  robots: {
    index: false,
    follow: false,
  },
};

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProfilePage({ params }: EditPageProps) {
  const { id } = await params;
  const profileId = parseInt(id, 10);

  if (isNaN(profileId) || profileId <= 0) {
    notFound();
  }

  const profile = await getProfileById(profileId);

  if (!profile) {
    return (
      <div
        style={{
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0d0d',
          color: '#ffffff',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Profile Not Found
        </h1>
        <p style={{ color: '#888', maxWidth: '450px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Profile ID #{id} does not exist in the database or may have been deleted.
        </p>
        <Link
          href="/admin"
          style={{
            background: '#FFD600',
            color: '#000',
            fontWeight: 700,
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  return <EditProfileForm profile={profile} />;
}
