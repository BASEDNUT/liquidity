import { validateEnv } from '../../utils/validateEnv';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
        // Check for Redis env variables
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            console.error('Upstash Redis environment variables are missing.');
            return res.status(500).json({
                error: 'Server configuration error',
                message: 'Redis not configured properly',
                narrative: "The ancient scrolls of data storage are missing!",
                effects: "Server Configuration Error: Redis connection failed",
                imageUrl: '/img/peanutoshi.png'
            });
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { faction, action } = req.body; // History will be fetched from Redis

        if (!faction || !action) {
            return res.status(400).json({ error: 'Faction and action are required' });
        }

        // Fetch current game state from Redis
        let gameState = await redis.get('warmachine_gameState');
        if (!gameState) {
            // Initialize game state if it doesn't exist
            gameState = {
                outcomes: [],
                factionStats: {
                    Peanuts: { morale: 10, territories: 1, specialAbility: "Nutty Resilience" },
                    Almonds: { morale: 10, territories: 1, specialAbility: "Crunchy Counter" },
                    Walnuts: { morale: 10, territories: 1, specialAbility: "Strategic Shell" },
                    Cashews: { morale: 10, territories: 1, specialAbility: "Smooth Sabotage" },
                }
            };
        }

        let historyString = "No previous actions logged.";
        if (gameState.outcomes && gameState.outcomes.length > 0) {
            historyString = gameState.outcomes.slice(-10).map((h, i) => `${i+1}. ${h.narrative} (Effects: ${h.effects})`).join('\n');
        }

        const systemPrompt = `You are Peanutoshi Nutkamoto, the chaotic and witty dungeon master for NUT WAR: PEANUTOSHI FRONT.

--- PREVIOUS HISTORY (LAST ${gameState.outcomes ? gameState.outcomes.slice(-10).length : 0} ACTIONS) ---
${historyString}

--- CURRENT FACTION STATS ---
${Object.entries(gameState.factionStats).map(([name, stats]) => `${name}: Morale ${stats.morale}, Territories ${stats.territories}`).join('\n')}

--- CURRENT ACTION ---
Faction: ${faction}
Action: ${action}

Generate the following, ensuring each section is clearly delineated:
NARRATIVE: [1-4 sentences of memey, nut-related war narration. Be creative, humorous, and slightly unhinged. The fate of the Nutverse hangs in the balance!]
EFFECTS: [Clearly state 1-2 simple game effects on factions. e.g., Peanut Morale +2, Almonds lose 1 strategic crumb!, or A new flavor of chaos is unlocked! Keep it concise and impactful. IMPORTANT: Only output effects that directly change faction stats like morale or territories. Do not invent new stats. Use the format: FactionName StatChange Value (e.g., Peanuts Morale +1, Almonds Territories -1). If multiple effects, separate by comma.]
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

        // Update faction stats based on effects
        const updatedFactionStats = JSON.parse(JSON.stringify(gameState.factionStats)); // Deep copy
        const effectParts = effects.split(',').map(e => e.trim());
        effectParts.forEach(part => {
            const match = part.match(/(\w+)\s+(morale|territories)\s*([+-])\s*(\d+)/i);
            if (match) {
                const [, factionName, stat, operator, valueStr] = match;
                const value = parseInt(valueStr, 10);
                if (updatedFactionStats[factionName] && updatedFactionStats[factionName][stat.toLowerCase()] !== undefined) {
                    if (operator === '+') {
                        updatedFactionStats[factionName][stat.toLowerCase()] += value;
                    } else {
                        updatedFactionStats[factionName][stat.toLowerCase()] -= value;
                    }
                    // Ensure stats don't go below 0
                    if (updatedFactionStats[factionName][stat.toLowerCase()] < 0) {
                        updatedFactionStats[factionName][stat.toLowerCase()] = 0;
                    }
                }
            }
        });
        
        // Add new outcome to history (limited to last 15)
        const newOutcome = { faction, action, narrative, effects, imageUrl: 'pending', timestamp: new Date().toISOString() };
        let updatedOutcomes = [newOutcome, ...gameState.outcomes];
        if (updatedOutcomes.length > 15) {
            updatedOutcomes = updatedOutcomes.slice(0, 15);
        }

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
                    // Update the imageUrl in the newOutcome AFTER it's generated
                    newOutcome.imageUrl = imageUrl;
                } else {
                    let imageErrorText = 'Failed to read error response from Venice Image API.';
                    try {
                        imageErrorText = await imageGenResponse.text();
                    } catch (e) {
                        console.error("Could not read text from Venice Image API error response:", e);
                    }
                    console.warn(`Image generation failed: ${imageGenResponse.status}`, imageErrorText);
                    // Proceed with fallback image
                    newOutcome.imageUrl = '/img/peanutoshi.png'; // Ensure fallback is set in outcome
                }
            } catch (abortError) {
                console.warn("Image generation timed out:", abortError);
                // Proceed with fallback image
                newOutcome.imageUrl = '/img/peanutoshi.png'; // Ensure fallback is set in outcome
            }
            
        } catch (imgError) {
            console.warn("Error during image generation process:", imgError);
            // Proceed with fallback image
            newOutcome.imageUrl = '/img/peanutoshi.png'; // Ensure fallback is set in outcome
        }

        // Update game state in Redis
        const newGameState = {
            outcomes: updatedOutcomes.map(o => o.imageUrl === 'pending' && o.timestamp === newOutcome.timestamp ? { ...o, imageUrl: newOutcome.imageUrl } : o), // ensure the latest outcome has the final imageUrl
            factionStats: updatedFactionStats
        };
        await redis.set('warmachine_gameState', newGameState);
        

        res.status(200).json({
            narrative,
            effects,
            imageUrl: newOutcome.imageUrl, // Send the potentially updated image URL
            updatedFactionStats, // Send back the latest stats
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
