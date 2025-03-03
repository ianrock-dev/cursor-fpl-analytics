/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['resources.premierleague.com', 'fbref.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/fpl/:path*',
        destination: 'https://fantasy.premierleague.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 