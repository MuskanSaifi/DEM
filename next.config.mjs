/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Ignore ESLint errors during build (warnings won't stop build)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Security headers to prevent redirects and injections
  async headers() {
    return [
      {
        // Allow embedding certificate PDF in same-origin iframes (verification page)
        source: "/api/certificates/pdf/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
