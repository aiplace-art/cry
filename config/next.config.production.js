/** @type {import('next').NextConfig} */

const nextConfig = {
  // React strict mode for better error detection
  reactStrictMode: true,

  // Enable SWC minification for faster builds
  swcMinify: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'bscscan.com',
      'assets.coingecko.com',
      // Add your CDN domains here
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },

  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for security

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent XSS attacks
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com *.google-analytics.com *.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' blob: data: https: *.bscscan.com *.coingecko.com",
              "font-src 'self' data: fonts.gstatic.com",
              "connect-src 'self' *.binance.org *.bscscan.com *.coingecko.com wss: *.walletconnect.com *.walletconnect.org *.google-analytics.com *.vercel-insights.com",
              "frame-src 'self' *.walletconnect.com *.walletconnect.org",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      // Proxy API requests to avoid CORS issues
      {
        source: '/api/bsc/:path*',
        destination: 'https://bsc-dataseed1.binance.org/:path*',
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      // Redirect root to presale page
      {
        source: '/',
        destination: '/presale',
        permanent: false,
      },
    ]
  },

  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Tree shaking optimization
      config.optimization.usedExports = true

      // Bundle analyzer (uncomment to analyze bundle size)
      // const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      // config.plugins.push(
      //   new BundleAnalyzerPlugin({
      //     analyzerMode: 'static',
      //     openAnalyzer: false,
      //   })
      // )
    }

    // Handle .svg files as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'framer-motion'],

    // Server actions (if using)
    serverActions: true,
  },

  // Output configuration
  output: 'standalone', // For Docker/container deployments

  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_VERSION: require('./package.json').version || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // TypeScript configuration
  typescript: {
    // Fail build on type errors
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Fail build on lint errors
    ignoreDuringBuilds: false,
  },

  // Trailing slash
  trailingSlash: false,

  // PoweredByHeader
  poweredByHeader: false,

  // Generate ETags
  generateEtags: true,

  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

module.exports = nextConfig
