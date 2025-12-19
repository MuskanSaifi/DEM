/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "randomuser.me"],
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
};

export default nextConfig;
