/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'spcdn.shortpixel.ai' },
      { protocol: 'https', hostname: 'ugandaescorts.net' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ],
  },
};

export default nextConfig;
