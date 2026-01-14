/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cache images in the Next.js Image Optimization cache for 1 year (in seconds)
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // ✅ allows all HTTPS domains
      },
      {
        protocol: 'http',
        hostname: '**', // ✅ allows all HTTP domains (optional, if needed)
      },
    ],
  },
  // ✅ Allow cross-origin requests from your network IP during development
  allowedDevOrigins: ['10.96.103.53:3000'],
};

module.exports = nextConfig;