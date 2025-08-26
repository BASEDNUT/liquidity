const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const { validateEnv } = require('./utils/validateEnv');

// Validate env strictly on Vercel; warn locally without blocking builds
try {
    if (process.env.VERCEL === '1') {
        validateEnv();
    } else {
        validateEnv(); // returns false and warns when missing in dev
    }
} catch (e) {
    if (process.env.VERCEL === '1') throw e;
    console.warn('Continuing without required env (local dev):', e.message);
}

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

    // Avoid logging secrets in build output

  return {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['basescan.org', 'opensea.io'],
    },
        // Do not expose secrets in env or publicRuntimeConfig
        // Server code reads process.env directly
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
                ],
            },
        ];
    },
        async redirects() {
            return [
                {
                    source: '/nutinoMemes',
                    destination: '/images',
                    permanent: false,
                },
            ];
        },
  };
};
