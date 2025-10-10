/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001']
    }
  },
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    NEXT_PUBLIC_TOKEN_ADDRESS: process.env.TOKEN_ADDRESS || '0x...',
    NEXT_PUBLIC_REFRESH_INTERVAL: '30000', // 30 seconds
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  images: {
    domains: ['assets.coingecko.com', 'pbs.twimg.com'],
  },
};

module.exports = nextConfig;
