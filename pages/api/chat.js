import { validateEnv } from '../../utils/validateEnv';

export default async function handler(req, res) {
    try {
        validateEnv();

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { model, messages, venice_parameters, ...otherParams } = req.body;

        if (!model || !messages) {
            return res.status(400).json({ error: 'Missing required fields: model or messages' });
        }

        const payload = {
            model,
            messages,
            venice_parameters,
            ...otherParams,
        };

        const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errData = await response.json();
            return res.status(response.status).json({ error: 'Error from Venice API', details: errData });
        }

        const data = await response.json();
        const reply = data.reply || (data.choices && data.choices[0]?.message?.content) || 'No reply available';

        res.status(200).json({ reply });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}
