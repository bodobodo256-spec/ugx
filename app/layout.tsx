import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBaseUrl, SITE_CONFIG } from '@/lib/site';

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
    default: 'Uganda Sexy Babes | Hookups, Escorts & Adult Encounters Uganda',
    template: '%s | Uganda Sexy Babes',
  },
  description:
    'Uganda Sexy Babes — Uganda\'s #1 adult platform for hookups, casual encounters & verified escort companions in Kampala, Entebbe, Jinja & Mbarara. Real girls, direct WhatsApp. Discreet, 18+.',
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: 'Uganda Sexy Babes', url: baseUrl }],
  creator: 'Uganda Sexy Babes',
  publisher: 'Uganda Sexy Babes',
  applicationName: 'Uganda Sexy Babes',
  alternates: {
    canonical: './',
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
    title: 'Uganda Sexy Babes | Hookups, Escorts & Adult Encounters Uganda',
    description:
      'Find verified escorts, hookup girls, and adult companions in Kampala, Entebbe, Jinja & across Uganda. Direct WhatsApp & phone contacts. Discreet, 18+.',
    url: baseUrl,
    siteName: 'Uganda Sexy Babes',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Uganda Sexy Babes',
      },
    ],
    locale: 'en_UG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uganda Sexy Babes | Hookups & Escorts Uganda',
    description:
      'Verified escorts and hookup girls in Kampala, Entebbe, Jinja & across Uganda. Direct WhatsApp contact. 18+ adults only.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Uganda Sexy Babes',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Uganda Sexy Babes',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Premier adult hookup, companionship and escort directory across Uganda.',
  };

  return (
    <html lang="en-US" className={inter.className}>
      <head>
        <meta
          name="google-site-verification"
          content="DnvygG6G-4p43JBIRk4YBzoUjvi5QfxkZjPaDSV_LO8"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="home dark-theme">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
