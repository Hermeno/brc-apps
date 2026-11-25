import type { NextConfig } from 'next';
import path from 'path';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  // Pin the tracing root to this project. Next otherwise walks up, finds a
  // stray package-lock.json in the home directory and picks that as the
  // workspace root, which writes the .nft.json trace files outside .next and
  // fails the build at "Collecting build traces" — and standalone output is
  // built entirely from those traces.
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  // Lint runs before each commit (npm run lint); the server build skips it to deploy faster.
  // Type errors still stop the build.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Files in /public/images are served with max-age=0 by default, so every visit
        // asked the server again. A day of caching, then refreshed in the background.
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
  images: {
    // Next 16 will require every quality used in the app to be listed here.
    qualities: [75, 78, 80],
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.digitaloceanspaces.com' },
    ],
  },
};

export default nextConfig;
