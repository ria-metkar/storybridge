const API_URL = process.env.API_URL || 'http://localhost:5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy /api/* to Express so the auth cookie is first-party (no cross-site cookie setup needed).
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
