import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeGate from '@/components/AgeGate';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'Uganda Sexy Babes | Dating & Hookup Directory Uganda',
  description: 'Browse Uganda Sexy Babes — the top dating and companionship site for meeting beautiful, verified babes in Kampala, Entebbe, Jinja and across Uganda.',
  keywords: 'Uganda dating, Kampala babes, Ugandan girls, hookup Uganda, escort directory Uganda, Entebbe companions',
  openGraph: {
    title: 'Uganda Sexy Babes | Premier Dating Network',
    description: 'Connect with verified babes across Kampala, Entebbe, Jinja and all major towns in Uganda.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US" className={inter.className}>
      <body className="home dark-theme">
        <Header />
        {children}
        <Footer />
        <AgeGate />
      </body>
    </html>
  );
}
