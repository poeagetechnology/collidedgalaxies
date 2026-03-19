/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Enable compression for better performance and SEO
  compress: true,
  
  // ✅ Generate ETags for cache validation
  generateEtags: true,
  
  // ✅ Optimize image delivery for better Core Web Vitals
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
    // Optimize for different screen sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Use modern formats for better compression
    formats: ['image/webp', 'image/avif'],
  },

  // ✅ Security and SEO headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://connect.facebook.net https://va.vercel-scripts.com https://scripts.clarity.ms https://apis.google.com; style-src 'self' 'unsafe-inline' https: data:; img-src 'self' data: https: blob:; connect-src 'self' https://firestore.googleapis.com https://www.googletagmanager.com https://www.clarity.ms https://k.clarity.ms https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://mpc2-prod-24-is5qnl632q-uw.a.run.app https://demo-1.conversionsapigateway.com https://va.vercel-scripts.com https://www.facebook.com; font-src 'self' data: https:; frame-src 'self' https://www.facebook.com https://*.firebaseapp.com;",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ✅ Redirects for SEO (trailing slashes consistency)
  async redirects() {
    return [
      {
        source: '/pdtDetails/:slug/',
        destination: '/pdtDetails/:slug',
        permanent: true,
      },
      {
        source: '/products/',
        destination: '/products',
        permanent: true,
      },
      {
        source: '/about/',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/contact/',
        destination: '/contact',
        permanent: true,
      },
    ];
  },

  // ✅ Rewrites for clean URLs
  async rewrites() {
    return [];
  },

  // ✅ Enable React strict mode for development
  reactStrictMode: true,

  // ✅ Performance optimizations
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;