import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProfiles } from '@/app/actions/profiles';
import ProfileCard from '@/components/ProfileCard';
import { LOCATIONS } from '@/data/locations';
import { getBaseUrl } from '@/lib/site';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return LOCATIONS.map((loc) => ({
    slug: loc.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = LOCATIONS.find((l) => l.slug.toLowerCase() === slug.toLowerCase());

  if (!location) {
    return {
      title: 'Location Not Found | Uganda Sexy Babes',
    };
  }

  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/location/${location.slug}`;
  const title = `${location.name} Escorts, Hookup Girls & Babes | Uganda Sexy Babes`;
  const description = `Find verified escorts, hookup girls, and adult companions in ${location.name}, Uganda. Browse real photos, get direct WhatsApp & phone numbers. Book a hookup or escort companion in ${location.name} today. Discreet, 18+.`;

  return {
    title,
    description,
    keywords: [
      `${location.name} escorts`,
      `${location.name} hookup`,
      `${location.name} babes`,
      `${location.name} adult companions`,
      `hookup girls in ${location.name}`,
      `casual encounters ${location.name}`,
      `call girls ${location.name}`,
      `sexy girls ${location.name}`,
      `verified escorts ${location.name}`,
      `${location.name} adult companions`,
      `${location.name} Uganda escorts`,
      `meet and fuck ${location.name}`,
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      siteName: 'Uganda Sexy Babes',
      images: [
        {
          url: `${baseUrl}/logo.png`,
          width: 800,
          height: 800,
          alt: `${location.name} Babes on Uganda Sexy Babes`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const location = LOCATIONS.find((l) => l.slug.toLowerCase() === slug.toLowerCase());

  if (!location) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/location/${location.slug}`;

  const allProfiles = await getProfiles();
  const cityProfiles = allProfiles.filter(
    (p) =>
      p.city.toLowerCase() === location.name.toLowerCase() ||
      p.location.toLowerCase().includes(location.name.toLowerCase())
  );

  const vipProfiles = cityProfiles.filter(
    (p) => p.tier.startsWith('VIP') || p.isPremium || p.tier === 'Premium'
  );
  const standardProfiles = cityProfiles.filter(
    (p) => !p.tier.startsWith('VIP') && !p.isPremium && p.tier !== 'Premium'
  );

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Uganda',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${location.name} Babes`,
        item: pageUrl,
      },
    ],
  };

  // Collection schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${location.name} Babes & Escort Companions`,
    description: `Verified profiles and escort companions in ${location.name}, Uganda.`,
    url: pageUrl,
    numberOfItems: cityProfiles.length,
  };

  return (
    <div className="page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            fontSize: '0.85rem',
            color: 'var(--gray-4, #a0a0a0)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Link href="/" style={{ color: '#FFD600', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: '#FFF' }}>{location.name}</span>
        </nav>

        {/* Hero Header */}
        <header
          style={{
            background: 'linear-gradient(180deg, rgba(255,214,0,0.08) 0%, rgba(20,20,20,0.6) 100%)',
            border: '1px solid rgba(255, 214, 0, 0.2)',
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
            }}
          >
            Verified Escorts &amp; Hookup Girls in{' '}
            <span style={{ color: '#FFD600' }}>{location.name}</span>, Uganda
          </h1>
          <p
            style={{
              maxWidth: '750px',
              margin: '0 auto',
              color: 'var(--gray-4, #b5b5b5)',
              lineHeight: 1.6,
              fontSize: '0.95rem',
            }}
          >
            Looking for a <strong>hookup, escort companion, sensual massage, or adult entertainment</strong> in {location.name}?
            Browse verified profiles with real photos and connect directly via WhatsApp or phone. Fast, discreet, 18+ only.
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: '1rem',
              marginTop: '1.25rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                color: '#FFD600',
                background: 'rgba(255,214,0,0.1)',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                border: '1px solid rgba(255,214,0,0.3)',
              }}
            >
              📍 {cityProfiles.length} Babes in {location.name}
            </span>
            <Link
              href="/register"
              style={{
                fontSize: '0.85rem',
                color: '#000',
                background: '#FFD600',
                padding: '0.3rem 0.9rem',
                borderRadius: '20px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              + Join as a Babe in {location.name}
            </Link>
          </div>
        </header>

        {/* Profiles Section */}
        <main>
          {vipProfiles.length > 0 && (
            <section style={{ marginBottom: '2.5rem' }}>
              <div className="tier-heading tier-heading--vip">
                <span className="tier-count">{vipProfiles.length}</span>
                <span className="tier-label">⭐ VIP Babes in {location.name}</span>
              </div>
              <div className="card-grid card-grid--vip" style={{ marginTop: '1rem' }}>
                {vipProfiles.map((p, idx) => (
                  <ProfileCard key={p.id} profile={p} priority={idx === 0} />
                ))}
              </div>
            </section>
          )}

          {standardProfiles.length > 0 && (
            <section style={{ marginBottom: '2.5rem' }}>
              <div className="tier-heading tier-heading--standard">
                <span className="tier-count">{standardProfiles.length}</span>
                <span className="tier-label">All Babes in {location.name}</span>
              </div>
              <div className="card-grid card-grid--standard" style={{ marginTop: '1rem' }}>
                {standardProfiles.map((p) => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
              </div>
            </section>
          )}

          {cityProfiles.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                background: 'var(--black-2, #141414)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '2.5rem',
              }}
            >
              <h2 style={{ color: '#FFD600', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                No babes currently listed in {location.name}
              </h2>
              <p style={{ color: 'var(--gray-4, #999)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Are you a model or companion based in {location.name}? Be the first to register and get prominent visibility!
              </p>
              <Link
                href="/register"
                className="btn-register"
                style={{
                  display: 'inline-block',
                  background: '#FFD600',
                  color: '#000',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '25px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Register Your Profile
              </Link>
            </div>
          )}
        </main>

        {/* Other Cities Section for internal linking & crawler discovery */}
        <section
          style={{
            background: 'var(--black-2, #141414)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginTop: '2rem',
            marginBottom: '3rem',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', color: '#FFF', marginBottom: '1rem', fontWeight: 700 }}>
            Find Babes in Other Cities Across Uganda
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {LOCATIONS.filter((l) => l.slug !== location.slug).map((loc) => (
              <Link
                key={loc.slug}
                href={`/location/${loc.slug}`}
                style={{
                  display: 'inline-block',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFD600',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                }}
              >
                {loc.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
