/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Lean, self-contained production server image (no full node_modules at runtime).
  output: 'standalone',

  // Compress served assets at the Next.js level too (helps behind Nginx).
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  async headers() {
    return [
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
