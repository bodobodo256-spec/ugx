import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site';
import { PHProvider } from './providers';
import PostHogPageView from './PostHogPageView';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Uganda Sexy Babes — #1 Uganda Babes, Escorts & Hookups Directory',
    template: '%s | Uganda Sexy Babes',
  },
  description:
    'Uganda Sexy Babes — Uganda\'s #1 adult platform for Uganda babes, sexy babes Uganda, hookups & verified escort companions in Kampala, Entebbe, Jinja & Mbarara. Real girls, direct WhatsApp. Discreet, 18+.',
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: 'Uganda Sexy Babes', url: baseUrl }],
  creator: 'Uganda Sexy Babes',
  publisher: 'Uganda Sexy Babes',
  applicationName: 'Uganda Sexy Babes',
  alternates: {
    canonical: baseUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Uganda Sexy Babes | Uganda Babes, Escorts & Hookups',
    description:
      'Find verified Uganda babes, sexy babes Uganda, escorts, and hookup companions in Kampala, Entebbe, Jinja & across Uganda. Direct WhatsApp contacts. Discreet, 18+.',
    url: baseUrl,
    siteName: 'Uganda Sexy Babes',
    images: [
      {
        url: `${baseUrl}/logo.png`,
        width: 1018,
        height: 1018,
        alt: 'Uganda Sexy Babes Logo',
      },
    ],
    locale: 'en_UG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uganda Sexy Babes | Uganda Babes & Escorts',
    description:
      'Verified Uganda babes, sexy babes Uganda, and hookup companions in Kampala, Entebbe, Jinja & across Uganda. Direct WhatsApp contact. 18+ adults only.',
    images: [`${baseUrl}/logo.png`],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo.png', sizes: '1018x1018', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/logo.png' },
    ],
  },
  verification: {
    google: 'DnvygG6G-4p43JBIRk4YBzoUjvi5QfxkZjPaDSV_LO8',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Google Search Central official WebSite structured data (Site Name signal)
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Uganda Sexy Babes',
    alternateName: [
      'UgandaSexyBabes',
      'Uganda Babes',
      'Sexy Babes Uganda',
      'ugandasexybabes.afrozex.com',
    ],
    url: `${baseUrl}/`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 2. Organization structured data with logo (Google Brand & Logo signal)
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Uganda Sexy Babes',
    legalName: 'Uganda Sexy Babes',
    url: `${baseUrl}/`,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/logo.png`,
    description: "Uganda's #1 adult hookup, companionship, Uganda babes and escort directory across Uganda.",
    sameAs: [`${baseUrl}/`],
  };

  return (
    <html lang="en-US" className={inter.className}>
      <head>
        <meta
          name="google-site-verification"
          content="DnvygG6G-4p43JBIRk4YBzoUjvi5QfxkZjPaDSV_LO8"
        />
        <meta name="application-name" content="Uganda Sexy Babes" />
        <meta name="apple-mobile-web-app-title" content="Uganda Sexy Babes" />
        <meta property="og:site_name" content="Uganda Sexy Babes" />

        {/* Google Favicon Crawler Requirements (48x48 multiple + /favicon.ico) */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Primary WebSite Schema for Google Site Names */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
        {/* Organization Schema for Logo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
      </head>
      <body className="home dark-theme">
        <PHProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <Header />
          {children}
          <Footer />
        </PHProvider>
      </body>
    </html>
  );
}
