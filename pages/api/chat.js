import { validateEnv } from '../../utils/validateEnv';
import modelCatalog from '../../utils/modelCatalog';

export default async function handler(req, res) {
    try {
        validateEnv(); // Ensure VENICE_API_KEY is set

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

    const { model, messages, venice_parameters, ...otherParams } = req.body;

        if (!model || !messages) {
            return res.status(400).json({ error: 'Missing required fields: model or messages' });
        }

        const payload = {
            model: modelCatalog.getValidChatModel(model),
            messages,
            venice_parameters: {
                enable_web_search: "auto", // Disable web search
                include_venice_system_prompt: false, // Disable system prompts
                character_slug: "peanutoshi-nutkamoto", // Updated character slug
            },
            ...otherParams,
        };

        console.log('Payload being sent to Venice API:', payload);

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

            console.log('Venice API response status:', response.status);

            if (!response.ok) {
                const errData = await response.json();
                console.error('Error from Venice API:', errData);
                return res.status(response.status).json({
                    error: 'Error from Venice API',
                    details: errData,
                });
            }

            const data = await response.json();
            console.log('Parsed response from Venice API:', data);

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
