import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Profile | Uganda Sexy Babes',
  description:
    'Create your escort and hookup companion profile on Uganda Sexy Babes. Fast verification, high visibility, and direct contact.',
  alternates: {
    canonical: '/create-profile',
  },
};

export default function CreateProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
