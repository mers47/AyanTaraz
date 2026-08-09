/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Lean, self-contained production server image (no full node_modules at runtime).
  output: 'standalone',

  // Compress served assets at the Next.js level too (helps behind Nginx).
  compress: true,

  // Security: hide "X-Powered-By: Next.js" header (info leak).
  poweredByHeader: false,

  // Security/perf: do not ship browser source maps in production.
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  async headers() {
    return [
      {
        // Immutable long-cache for hashed static assets (Next.js content-hashes
        // _next/static, so these are safe to cache for a full year).
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

};

module.exports = nextConfig;
