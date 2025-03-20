export function validateEnv() {
    const requiredEnvVars = ['VENICE_API_KEY'];
    
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}\n` +
            'Please check your .env file and Vercel environment variables configuration.'
        );
    }
    
    return true;
}
