import type { NextConfig } from 'next';

const landingDomain = process.env.LANDING_DOMAIN ?? '';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    if (!landingDomain) return [];
    return [
      {
        source: '/',
        destination: '/landing',
        has: [{ type: 'host', value: landingDomain }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
