const isProduction = process.env.NODE_ENV === 'production';

/**
 * Content Security Policy. Scripts and styles are first-party; 'unsafe-inline' covers Next's own
 * inline bootstrap and the two pre-paint scripts in app/head-script.ts. The only third party is
 * the Google Maps embed, loaded in a frame after consent.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isProduction ? '' : ' ws:'}`,
  'frame-src https://www.google.com https://maps.google.com',
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(isProduction
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Self-contained server build — required for the deploy Dockerfile.
  output: 'standalone',
  // Native modules stay outside the bundle and are traced into the standalone output.
  serverExternalPackages: ['better-sqlite3', 'sharp'],
  // The site serves its own pre-encoded AVIF/WebP from /media; this governs any next/image use.
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // The admin is never indexed, whatever a crawler finds linked.
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
