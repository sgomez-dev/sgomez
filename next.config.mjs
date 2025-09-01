/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
      // Removed invalid option
    },
    // SEO optimizations
    poweredByHeader: false,
    compress: true,
    generateEtags: true,
    
    // Image optimization
    images: {
      domains: ['sgomez.dev'],
      formats: ['image/webp', 'image/avif'],
    },
    
    // Headers for SEO
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
          ],
        },
      ];
    },
    
    // Redirects for SEO
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
      ];
    },
}

export default nextConfig;
