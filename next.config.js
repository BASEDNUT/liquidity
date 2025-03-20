/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: [] // Add allowed image domains here if needed
    },
    env: {
        VENICE_API_KEY: process.env.VENICE_API_KEY
    },
    compress: true,
    poweredByHeader: false,
    generateEtags: true
};

module.exports = nextConfig;
