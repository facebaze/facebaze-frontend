/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint config moved to eslint.config.mjs in Next.js 15+
}

module.exports = nextConfig
