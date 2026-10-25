/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase Server Action body size limit (default is 1MB in Next.js 15).
  // Profile registrations can include a compressed photo (~500KB–2MB).
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'spcdn.shortpixel.ai' },
      { protocol: 'https', hostname: 'ugandaescorts.net' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pub-69c390381fd247b6a79b2d9ad87415e9.r2.dev' },
    ],
  },
};

export default nextConfig;
