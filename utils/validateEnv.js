function asBool(value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value === 'string') {
        const v = value.toLowerCase();
        if (v === 'true') return true;
        if (v === 'false') return false;
    }
    return !!value;
}

function validateEnv() {
    const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

    // Required always in prod when AI features are enabled
    const requiredEnvVars = [];
    const aiEnabled = asBool(process.env.FEATURE_AI_ENABLED, true);
    if (isProd && aiEnabled) {
        requiredEnvVars.push(
            { key: 'VENICE_API_KEY', description: 'Venice AI API Key' },
            { key: 'VENICE_CHAT_MODEL', description: 'Default Venice Chat Model' },
            { key: 'VENICE_IMAGE_MODEL_DEFAULT', description: 'Default Venice Image Model' },
            { key: 'VENICE_IMAGE_MODELS', description: 'CSV list of allowed image models' },
        );
    }

    // Redis required in prod if warmachine is enabled
    const warmachineEnabled = asBool(process.env.FEATURE_WARMACHINE_ENABLED, true);
    if (isProd && warmachineEnabled) {
        requiredEnvVars.push(
            { key: 'UPSTASH_REDIS_REST_URL', description: 'Upstash Redis REST URL' },
            { key: 'UPSTASH_REDIS_REST_TOKEN', description: 'Upstash Redis REST Token' },
        );
    }

    const missingVars = requiredEnvVars.filter(({ key }) => {
        const value = process.env[key];
        return !value || value === 'undefined' || (typeof value === 'string' && value.startsWith('<'));
    });

    if (missingVars.length > 0) {
        const errorMessage = missingVars
            .map(({ key, description }) => `${key} (${description})`)
            .join(', ');

        const msg = `Missing required environment variables: ${errorMessage}`;
        if (isProd) {
            console.error(msg);
            throw new Error('Critical environment variables are missing. Please check environment configuration.');
        } else {
            console.warn(msg);
            return false;
        }
    }

    // Soft validations / defaults
    process.env.VENICE_CHAT_MODEL = process.env.VENICE_CHAT_MODEL || 'default-reasoning';
    // Prefer modern defaults if not provided
    process.env.VENICE_IMAGE_MODEL_DEFAULT = process.env.VENICE_IMAGE_MODEL_DEFAULT || 'qwen-image';
    process.env.VENICE_IMAGE_MODELS = process.env.VENICE_IMAGE_MODELS || 'qwen-image,hidream-i1,stable-diffusion-3.5-large';
    process.env.REQUEST_TIMEOUT_MS = process.env.REQUEST_TIMEOUT_MS || '120000';
    process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'info';

    return true;
}

module.exports = { validateEnv };
