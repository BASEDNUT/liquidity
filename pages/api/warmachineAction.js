import { validateEnv } from '../../utils/validateEnv';

// Helper function to parse Peanutoshi's structured response
function parsePeanutoshiResponse(responseText) {
    const response = {
        narrative: "Peanutoshi is unusually quiet... perhaps plotting?",
        effects: "No noticeable effects... yet.",
        imagePrompt: "A contemplative peanut overlooking a field of static."
    };

    const narrativeMatch = responseText.match(/NARRATIVE:([\s\S]*?)EFFECTS:/i);
    if (narrativeMatch && narrativeMatch[1]) {
        response.narrative = narrativeMatch[1].trim();
    }

    const effectsMatch = responseText.match(/EFFECTS:([\s\S]*?)IMAGE_PROMPT:/i);
    if (effectsMatch && effectsMatch[1]) {
        response.effects = effectsMatch[1].trim();
    }

    const imagePromptMatch = responseText.match(/IMAGE_PROMPT:([\s\S]*)/i);
    if (imagePromptMatch && imagePromptMatch[1]) {
        response.imagePrompt = imagePromptMatch[1].trim().slice(0, 256); // Max 256 chars for image prompt
    } else {
        // Fallback if IMAGE_PROMPT is not found but NARRATIVE is
        if (response.narrative !== "Peanutoshi is unusually quiet... perhaps plotting?"){
            response.imagePrompt = `A visual representation of: ${response.narrative.substring(0,100)}`;
        }
    }
    return response;
}

export default async function handler(req, res) {
    try {
        // Check if VENICE_API_KEY exists without throwing an error
        if (!process.env.VENICE_API_KEY || process.env.VENICE_API_KEY === 'undefined') {
            console.error('VENICE_API_KEY is missing or invalid');
            return res.status(500).json({
                error: 'Server configuration error',
                message: 'API key not configured properly',
                narrative: "Peanutoshi is having trouble connecting to the neural nutwork.",
                effects: "Server Configuration Error: API key missing",
                imageUrl: '/img/peanutoshi.png'
            });
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { faction, action, history } = req.body;

        if (!faction || !action) {
            return res.status(400).json({ error: 'Faction and action are required' });
        }

        let historyString = "No previous actions logged.";
        if (history && history.length > 0) {
            historyString = history.map((h, i) => `${i+1}. ${h}`).join('\n');
        }

        const systemPrompt = `You are Peanutoshi Nutkamoto, the chaotic and witty dungeon master for NUT WAR: PEANUTOSHI FRONT.

--- PREVIOUS HISTORY (LAST ${history ? history.length : 0} ACTIONS) ---
${historyString}

--- CURRENT ACTION ---
Faction: ${faction}
Action: ${action}

Generate the following, ensuring each section is clearly delineated:
NARRATIVE: [1-4 sentences of memey, nut-related war narration. Be creative, humorous, and slightly unhinged. The fate of the Nutverse hangs in the balance!]
EFFECTS: [Clearly state 1-2 simple game effects. e.g., Peanut Morale +2, Almonds lose 1 strategic crumb!, or A new flavor of chaos is unlocked! Keep it concise and impactful.]
IMAGE_PROMPT: [A concise, vivid visual prompt (max 150 characters) for an image generator that captures the essence of your NARRATIVE. e.g., A giant peanut warrior surfing a tidal wave of butter, brandishing a pretzel sword against a waffle fortress.]`;

        const chatPayload = {
            model: "dolphin-2.9.2-qwen2-72b", // Updated model
            messages: [{ role: "user", content: systemPrompt }],
            venice_parameters: {
                character_slug: "peanutoshi-nutkamoto", // Ensured character slug
                enable_web_search: "auto",
                include_venice_system_prompt: false,
            },
            temperature: 0.85, // Slightly higher for more creative/chaotic responses
            top_p: 0.9,
        };

        console.log("Attempting to fetch from Venice Chat API..."); // Added log
        const chatResponse = await fetch('https://api.venice.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chatPayload),
        });

        let chatData;
        if (chatResponse.ok) {
            chatData = await chatResponse.json();
            console.log("Successfully fetched and parsed response from Venice Chat API."); // Added log
        } else {
            let errorText = 'Failed to read error response from Venice Chat API.';
            try {
                errorText = await chatResponse.text();
            } catch (e) {
                console.error("Could not read text from Venice Chat API error response:", e);
            }
            console.error('Error from Venice Chat API:', chatResponse.status, errorText);
            throw new Error(`Venice Chat API request failed with status ${chatResponse.status}: ${errorText}`);
        }

        const peanutoshiRawResponse = chatData.reply || (chatData.choices && chatData.choices[0]?.message?.content);

        if (!peanutoshiRawResponse) {
            console.error("No valid response content (reply or choices) from Peanutoshi (Chat API). Full response:", chatData);
            throw new Error('No valid response content from Peanutoshi (Chat API).');
        }
        console.log("Raw Peanutoshi response:", peanutoshiRawResponse); // Added log

        const { narrative, effects, imagePrompt } = parsePeanutoshiResponse(peanutoshiRawResponse);
        console.log("Parsed Peanutoshi response - Narrative:", narrative, "Effects:", effects, "Image Prompt:", imagePrompt); // Added log

        // 2. Generate Image using Venice Image API (Optional - can be skipped or have a fallback)
        let imageUrl = '/img/peanutoshi.png'; // Default fallback image
        try {
            const imagePayload = {
                model: "flux-dev", // Or your preferred image model
                prompt: imagePrompt, // Use the prompt from Peanutoshi
                safe_mode: true,
                width: 512,
                height: 512,
                steps: 30,
                hide_watermark: true,
                cfg_scale: 7,
                return_binary: true,
                format: "webp",
                negative_prompt: "low-quality, blurry, watermark, text, signature, human"
            };

            console.log('Attempting to generate image with prompt:', imagePrompt); // Log before image generation
            
            const imageController = new AbortController();
            const imageTimeout = setTimeout(() => imageController.abort(), 30000); // 30 seconds timeout
            
            try {
                const imageGenResponse = await fetch('https://api.venice.ai/api/v1/image/generate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/octet-stream',
                    },
                    body: JSON.stringify(imagePayload),
                    signal: imageController.signal
                });
                
                clearTimeout(imageTimeout);
                
                if (imageGenResponse.ok) {
                    const imageArrayBuffer = await imageGenResponse.arrayBuffer();
                    const base64Image = Buffer.from(imageArrayBuffer).toString('base64');
                    imageUrl = `data:image/webp;base64,${base64Image}`;
                    console.log('Image generated successfully.'); // Added log
                } else {
                    let imageErrorText = 'Failed to read error response from Venice Image API.';
                    try {
                        imageErrorText = await imageGenResponse.text();
                    } catch (e) {
                        console.error("Could not read text from Venice Image API error response:", e);
                    }
                    console.warn(`Image generation failed: ${imageGenResponse.status}`, imageErrorText);
                    // Proceed with fallback image
                }
            } catch (abortError) {
                console.warn("Image generation timed out:", abortError);
                // Proceed with fallback image
            }
            
        } catch (imgError) {
            console.warn("Error during image generation process:", imgError);
            // Proceed with fallback image
        }

        res.status(200).json({
            narrative,
            effects,
            imageUrl,
            // For debugging:
            // rawPeanutoshiResponse: peanutoshiRawResponse,
            // finalImagePrompt: imagePrompt
        });

    } catch (error) {
        console.error('Error in warmachineAction handler:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
}
