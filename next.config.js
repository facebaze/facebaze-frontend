const fs = require('fs')
const path = require('path')

// ── Build ID: unique per deployment ───────────────────────────────────────────
// Vercel sets VERCEL_GIT_COMMIT_SHA; fallback to timestamp for local builds
const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA
  ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 8)
  : Date.now().toString(36)

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
  env: {
    // Expose build ID to client code
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
  },
  // ESLint config moved to eslint.config.mjs in Next.js 15+
}

module.exports = nextConfig
