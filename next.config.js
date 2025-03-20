/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['basescan.org', 'opensea.io'],
    },
    env: {
        VENICE_API_KEY: process.env.VENICE_API_KEY
    },
    serverRuntimeConfig: {
        VENICE_API_KEY: process.env.VENICE_API_KEY,
    },
    publicRuntimeConfig: {
        apiBaseUrl: process.env.NODE_ENV === 'production' 
            ? 'https://your-production-url.vercel.app' 
            : 'http://localhost:3000',
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
                ]
            }
        ];
    }
};

module.exports = nextConfig;
