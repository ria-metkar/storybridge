// Trim stray whitespace/BOM (easy to pick up when setting env vars from a shell) and any trailing slash.
const API_URL = (process.env.API_URL || 'http://localhost:5000')
  .replace(/^﻿/, '')
  .trim()
  .replace(/\/+$/, '');

if (!/^https?:\/\//.test(API_URL)) {
  throw new Error(`API_URL must start with http:// or https:// (got "${API_URL}")`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy /api/* to Express so the auth cookie is first-party (no cross-site cookie setup needed).
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
