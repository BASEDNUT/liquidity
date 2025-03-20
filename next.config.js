const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

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
    },
    serverRuntimeConfig: {
        VENICE_API_KEY: process.env.VENICE_API_KEY,
    },
    publicRuntimeConfig: isDev
      ? { VENICE_API_KEY: process.env.VENICE_API_KEY }
      : {
        apiBaseUrl: process.env.NODE_ENV === 'production' 
            ? 'https://your-production-url.vercel.app' 
            : 'http://localhost:3000',
        VENICE_API_KEY: process.env.VENICE_API_KEY, // Ensure availability in production
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
