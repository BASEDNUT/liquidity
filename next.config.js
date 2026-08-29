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
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'basescan.org' },
            { protocol: 'https', hostname: 'opensea.io' },
        ],
    },
        async headers() {
            const allowedOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || process.env.APP_ORIGIN;
            const corsHeaders = [
                { key: 'Access-Control-Allow-Credentials', value: 'true' },
                { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
                { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
            ];
            if (allowedOrigin) {
                corsHeaders.push({ key: 'Access-Control-Allow-Origin', value: allowedOrigin });
            }

            const securityHeaders = [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
            ];
            if (process.env.NODE_ENV === 'production') {
                securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' });
            }

            return [
                {
                    source: '/(.*)',
                    headers: securityHeaders,
                },
                {
                    source: '/api/:path*',
                    headers: [...securityHeaders, ...corsHeaders],
                },
            ];
        },
        async rewrites() {
            return [
                { source: '/atlas', destination: '/atlas/index.html' },
                { source: '/atlas/data', destination: '/atlas/data.html' },
                { source: '/atlas/graph', destination: '/atlas/data.html' },
            ];
        },
        async redirects() {
            return [
                {
                    source: '/nutinoMemes',
                    destination: '/images',
                    permanent: false,
                },
                {
                    source: '/ecosystem',
                    destination: '/faq',
                    permanent: false,
                },
            ];
        },
  };
};
