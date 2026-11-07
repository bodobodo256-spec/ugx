import React from 'react';
import type { Metadata } from 'next';
import CreateProfileForm from '@/components/CreateProfileForm';
import '@/app/admin/admin.css';
import '@/app/admin/edit.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Add New Profile | Admin Control Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminCreateProfilePage() {
  return <CreateProfileForm />;
}
