/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Significantly increase payload limits
  experimental: {
    // Enable large payloads
    largePageDataBytes: 128 * 1024 * 1024, // 128MB
  },
  // Configure server options for large uploads
  serverRuntimeConfig: {
    // Increase body size limit
    maxRequestSize: '500mb',
  },
  // Headers for large file uploads
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          // Increase timeout for large uploads
          {
            key: 'Keep-Alive',
            value: 'timeout=300, max=1000',
          },
        ],
      },
    ]
  },
}

export default nextConfig
