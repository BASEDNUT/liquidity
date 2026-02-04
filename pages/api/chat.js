import { validateEnv } from '../../utils/validateEnv';
import modelCatalog from '../../utils/modelCatalog';
import { rateLimit } from '../../src/utils/rateLimit';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};

export default async function handler(req, res) {
    try {
        validateEnv(); // Ensure VENICE_API_KEY is set

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const rl = rateLimit(req, { windowMs: 60 * 1000, max: 20, keyPrefix: 'chat' });
        res.setHeader('X-RateLimit-Limit', String(rl.limit));
        res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
        res.setHeader('X-RateLimit-Reset', String(rl.reset));
        if (!rl.ok) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }

    const { messages, venice_parameters, ...otherParams } = req.body;

        if (!messages) {
            return res.status(400).json({ error: 'Missing required field: messages' });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        const maxMessages = 20;
        const maxContentLength = 4000;
        if (messages.length > maxMessages) {
            return res.status(400).json({ error: 'Too many messages' });
        }

        for (const msg of messages) {
            const role = msg?.role;
            const content = msg?.content;
            if (!role || typeof role !== 'string') {
                return res.status(400).json({ error: 'Invalid message role' });
            }
            if (typeof content !== 'string' || content.length === 0) {
                return res.status(400).json({ error: 'Invalid message content' });
            }
            if (content.length > maxContentLength) {
                return res.status(400).json({ error: 'Message content too long' });
            }
        }

        const payload = {
            model: modelCatalog.getValidChatModel(modelCatalog.chatModel),
            messages,
            venice_parameters: {
                enable_web_search: "auto", // Disable web search
                include_venice_system_prompt: false, // Disable system prompts
                character_slug: "peanutoshi-nutkamoto", // Updated character slug
            },
            ...otherParams,
        };

    const controller = new AbortController();
    const timeoutMs = parseInt(process.env.REQUEST_TIMEOUT_MS || '120000', 10);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!response.ok) {
                const errData = await response.json();
                console.error('Error from Venice API:', errData);
                return res.status(response.status).json({
                    error: 'Error from Venice API',
                    details: errData,
                });
            }

            const data = await response.json();
            const reply = data.reply || (data.choices && data.choices[0]?.message?.content) || 'No reply available';
            if (!reply) {
                return res.status(500).json({ error: 'No reply available from Venice API' });
            }

            res.status(200).json({ reply });
        } catch (error) {
            clearTimeout(timeout);
            if (error.name === 'AbortError') {
                console.error('Request timed out');
                return res.status(504).json({ error: 'Request timed out' });
            }
            console.error('Error from Venice API:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error in chat handler:', error);
        return res.status(500).json({
            error: 'Environment validation error',
            message: error.message,
        });
    }
}
