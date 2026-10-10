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
        url: '/logo.png',
        width: 800,
        height: 800,
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
    images: ['/logo.png'],
  },
  icons: {
    icon: [
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/logo.png',
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
    alternateName: [
      'Uganda Sexy Babes',
      'UgandaBabes',
      'Sexy Babes Uganda',
      'Uganda Babes',
      'ugandasexybabes.afrozex.com',
    ],
    url: baseUrl,
    image: `${baseUrl}/logo.png`,
    publisher: {
      '@type': 'Organization',
      name: 'Uganda Sexy Babes',
      logo: `${baseUrl}/logo.png`,
    },
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
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${baseUrl}/logo.png`,
    description: 'Uganda\'s #1 adult hookup, companionship, Uganda babes and escort directory across Uganda.',
  };

  return (
    <html lang="en-US" className={inter.className}>
      <head>
        <meta
          name="google-site-verification"
          content="DnvygG6G-4p43JBIRk4YBzoUjvi5QfxkZjPaDSV_LO8"
        />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
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
