/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  // ✅ Performance optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security
  // ✅ Reduce bundle size (swcMinify is default in Next.js 15, removed)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  // ✅ Production optimizations
  output: 'standalone', // For better VPS deployment
  reactStrictMode: true,
  // ✅ instrumentationHook removed - no longer needed in Next.js 15
};

export default nextConfig;
