import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Ensure markdown files are included in Vercel serverless bundles
  outputFileTracingIncludes: {
    '/api/**': ['./system_design_*.md'],
  },
  // Redirect trailing-slash URLs from the old static export to clean URLs
  async redirects() {
    return [
      {
        source: '/chapter/:slug/',
        destination: '/chapter/:slug',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
