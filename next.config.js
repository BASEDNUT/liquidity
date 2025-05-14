const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const { validateEnv } = require('./utils/validateEnv');

validateEnv(); // Validate environment variables once at startup

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  console.log('VENICE_API_KEY during build:', process.env.VENICE_API_KEY?.trim()); // Debugging: Log the API key during build

  return {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['basescan.org', 'opensea.io'],
    },
    env: {
        VENICE_API_KEY: process.env.VENICE_API_KEY,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    serverRuntimeConfig: {
        VENICE_API_KEY: process.env.VENICE_API_KEY,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
    publicRuntimeConfig: isDev
      ? { 
          VENICE_API_KEY: process.env.VENICE_API_KEY,
          UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL, // Also add here for dev consistency if needed
          UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
        }
      : {
        apiBaseUrl: process.env.NODE_ENV === 'production' 
            ? 'https://your-production-url.vercel.app' 
            : 'http://localhost:3000',
        VENICE_API_KEY: process.env.VENICE_API_KEY, // Ensure availability in production
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
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
  };
};
