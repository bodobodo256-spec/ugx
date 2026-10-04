export const SITE_CONFIG = {
  name: 'Uganda Sexy Babes',
  tagline: "Uganda's #1 Dating & Companionship Directory",
  description:
    'Browse Uganda Sexy Babes — the top dating and companionship site for meeting beautiful, verified babes in Kampala, Entebbe, Jinja and across Uganda. Direct WhatsApp and phone contact.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ugandasexybabes.afrozex.com',
  keywords: [
    'Uganda dating',
    'Kampala babes',
    'Ugandan girls',
    'hookup Uganda',
    'escort directory Uganda',
    'Kampala escorts',
    'Entebbe companions',
    'Jinja babes',
    'Mbarara dating',
    'verified Ugandan babes',
    'Uganda casual dating',
    'Kampala hookups',
  ],
  defaultOgImage: '/logo.png',
};

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  return 'https://ugandasexybabes.afrozex.com';
}
