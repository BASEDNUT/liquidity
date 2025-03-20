export function validateEnv() {
    const requiredEnvVars = [
        { key: 'VENICE_API_KEY', description: 'Venice AI API Key' },
    ];

    const missingVars = requiredEnvVars.filter(({ key }) => {
        const value = process.env[key];
        return !value || value === 'undefined' || value.startsWith('<');
    });

    if (missingVars.length > 0) {
        const errorMessage = missingVars
            .map(({ key, description }) => `${key} (${description})`)
            .join(', ');

        console.error(`Missing required environment variables: ${errorMessage}`);

        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                'Critical environment variables are missing. Please check Vercel environment configuration.'
            );
        }
    }

    return true;
}
