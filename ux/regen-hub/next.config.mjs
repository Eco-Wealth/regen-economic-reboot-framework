/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const rewrites = [];

    // Server-side proxy for Regen API to avoid CORS in local/staging.
    // Keep client requests pointed at `/regen-api/*`.
    if (process.env.REGEN_API_BASE_URL) {
      rewrites.push({
        source: '/regen-api/:path*',
        destination: `${process.env.REGEN_API_BASE_URL.replace(/\/$/, '')}/:path*`,
      });
    }

    return rewrites;
  },
};

export default nextConfig;
