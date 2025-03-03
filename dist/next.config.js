"use strict";
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Temporarily commented out to use our custom API routes
    // async rewrites() {
    //   return [
    //     {
    //       source: '/api/fpl/:path*',
    //       destination: 'https://fantasy.premierleague.com/api/:path*',
    //     },
    //   ];
    // },
    images: {
        // We don't need remote patterns anymore since we're proxying through our own API
        remotePatterns: [],
    },
};
module.exports = nextConfig;
