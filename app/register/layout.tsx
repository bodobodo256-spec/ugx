import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register Your Profile | Uganda Sexy Babes',
  description:
    'Join Uganda Sexy Babes directory. Register as a model or companion, get verified, and connect with admirers in Kampala, Entebbe, Jinja and across Uganda.',
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
