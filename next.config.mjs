/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    largePageDataBytes: 128 * 1024 * 1024, // 128MB
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['replicate.delivery', 'pbxt.replicate.delivery'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      }
    ],
    unoptimized: true,
  },
  // Increase body parser limits
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Limit for API routes
    },
    responseLimit: false,
  },
  // Increase webpack memory limits
  webpack: (config) => {
    config.performance = {
      ...config.performance,
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
    return config;
  },
}

export default nextConfig
