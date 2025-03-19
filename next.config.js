// next.config.mjs
module.exports = {
    reactStrictMode: true,
    // Ensure dynamic routes are supported
    output: undefined,
    // Add fallback for potential static exports
    trailingSlash: false
};
