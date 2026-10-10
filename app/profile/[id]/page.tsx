import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProfileByIdOrSlug, getProfiles } from '@/app/actions/profiles';
import ProfileDetailView from '@/components/ProfileDetailView';
import { getBaseUrl } from '@/lib/site';
import '@/app/profile/profile.css';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileByIdOrSlug(id);
  const baseUrl = getBaseUrl();

  if (!profile) {
    return {
      title: 'Profile Not Found | Uganda Sexy Babes',
      description: 'The requested model profile could not be found.',
    };
  }

  const title = `${profile.name} (${profile.age}) — ${profile.location}, Uganda | Uganda Sexy Babes`;
  const description = `${profile.name} is a verified ${profile.tier} adult companion in ${profile.location}, ${profile.city}. View photos, videos, and connect directly on WhatsApp & Phone.`;
  const photoUrl = profile.photoUrl || `${baseUrl}/logo.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/profile/${profile.slug}`,
      images: [
        {
          url: photoUrl,
          width: 600,
          height: 800,
          alt: `${profile.name} — ${profile.location}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [photoUrl],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const profile = await getProfileByIdOrSlug(id);

  if (!profile || !profile.isApproved || profile.isArchived) {
    notFound();
  }

  // Fetch related profiles in the same city (or fallback to latest)
  const allApproved = await getProfiles();
  const relatedProfiles = allApproved
    .filter((p) => p.id !== profile.id && p.city.toLowerCase() === profile.city.toLowerCase())
    .slice(0, 4);

  // If fewer than 4 in same city, backfill with top models
  if (relatedProfiles.length < 4) {
    const existingIds = new Set([profile.id, ...relatedProfiles.map((p) => p.id)]);
    const fillers = allApproved.filter((p) => !existingIds.has(p.id)).slice(0, 4 - relatedProfiles.length);
    relatedProfiles.push(...fillers);
  }

  const baseUrl = getBaseUrl();
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    image: profile.photoUrl || `${baseUrl}/logo.png`,
    telephone: profile.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.city,
      addressRegion: profile.location,
      addressCountry: 'UG',
    },
    description: profile.about || `${profile.name} on Uganda Sexy Babes`,
    url: `${baseUrl}/profile/${profile.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <ProfileDetailView profile={profile} relatedProfiles={relatedProfiles} />
    </>
  );
}
