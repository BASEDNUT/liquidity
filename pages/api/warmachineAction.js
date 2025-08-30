import { validateEnv } from '../../utils/validateEnv';
import { Redis } from '@upstash/redis';
import modelCatalog from '../../utils/modelCatalog';

console.log('[warmachineAction] Initializing Redis client...');
console.log('[warmachineAction] UPSTASH_REDIS_REST_URL configured:', Boolean(process.env.UPSTASH_REDIS_REST_URL));

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// In-memory fallback when Upstash is unreachable
const mem = new Map();
async function safeGet(key) {
    try { return await redis.get(key); } catch { return mem.get(key) || null; }
}
async function safeSet(key, value) {
    try { await redis.set(key, value); } catch { mem.set(key, value); }
}

const COOLDOWN_PERIOD_SECONDS = 3600; // 1 hour

// MODIFIED: Expanded factions list for initial state consistency
const initialFactions = [
  "Peanuts", "Almonds", "Walnuts", "Cashews", "Pistachios", 
  "Hazelnuts", "Coconuts", "Macadamias", "Pecans", "Chestnuts"
];

// Helper to strip internal reasoning or XML-like tags to reduce parser noise
function stripMeta(text) {
    if (!text) return '';
    // Remove <think>...</think> or similar XML-ish blocks
    let cleaned = text.replace(/<([a-zA-Z]+)[^>]*>[\s\S]*?<\/\1>/g, ' ');
    // Remove markdown code fences
    cleaned = cleaned.replace(/```[\s\S]*?```/g, ' ');
    return cleaned;
}

// Helper function to parse Peanutoshi's structured response
function parsePeanutoshiResponse(responseText) {
    const safeText = stripMeta(responseText);
    const response = {
        narrative: "Peanutoshi is unusually quiet... perhaps plotting?",
        effects: "No noticeable effects... yet.",
        imagePrompt: "A contemplative peanut overlooking a field of static."
    };

    const narrativeMatch = safeText.match(/NARRATIVE:([\s\S]*?)EFFECTS:/i);
    if (narrativeMatch && narrativeMatch[1]) {
        response.narrative = narrativeMatch[1].trim();
    }

    const effectsMatch = safeText.match(/EFFECTS:([\s\S]*?)IMAGE_PROMPT:/i);
    if (effectsMatch && effectsMatch[1]) {
        response.effects = effectsMatch[1].trim();
    }

    const imagePromptMatch = safeText.match(/IMAGE_PROMPT:([\s\S]*)/i);
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
    console.log('[warmachineAction] Handler invoked.');
    try {
        const aiEnabled = process.env.FEATURE_AI_ENABLED !== 'false';
        const imageEnabled = process.env.FEATURE_IMAGE_GEN_ENABLED !== 'false';
        const warmachineEnabled = process.env.FEATURE_WARMACHINE_ENABLED !== 'false';

        if (!warmachineEnabled) {
            return res.status(503).json({
                error: 'Feature disabled',
                message: 'Warmachine feature is disabled via FEATURE_WARMACHINE_ENABLED',
            });
        }
        // Enhanced logging for env vars inside handler
        console.log('[warmachineAction] Inside handler - VENICE_API_KEY set:', Boolean(process.env.VENICE_API_KEY));
        console.log('[warmachineAction] Inside handler - UPSTASH_REDIS_REST_URL set:', Boolean(process.env.UPSTASH_REDIS_REST_URL));

        // Check if VENICE_API_KEY exists when AI is enabled
        if (aiEnabled && (!process.env.VENICE_API_KEY || process.env.VENICE_API_KEY === 'undefined')) {
            console.error('[warmachineAction] VENICE_API_KEY is confirmed missing or invalid inside handler');
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
            console.error('[warmachineAction] Upstash Redis environment variables are confirmed missing inside handler.');
            return res.status(500).json({
                error: 'Server configuration error',
                message: 'Redis not configured properly (checked in handler)',
                narrative: "The ancient scrolls of data storage are missing!",
                effects: "Server Configuration Error: Redis connection failed",
                imageUrl: '/img/peanutoshi.png'
            });
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        console.log('[warmachineAction] Attempting Redis GET for warmachine_lastActionTimestamp...');
    const lastActionTimestamp = await safeGet('warmachine_lastActionTimestamp');
        console.log('[warmachineAction] Successfully fetched lastActionTimestamp.');
        if (lastActionTimestamp) {
            const now = Math.floor(Date.now() / 1000);
            const timeSinceLastAction = now - Number(lastActionTimestamp);
            if (timeSinceLastAction < COOLDOWN_PERIOD_SECONDS) {
                const timeLeft = COOLDOWN_PERIOD_SECONDS - timeSinceLastAction;
                return res.status(429).json({
                    error: 'Cooldown active',
                    message: `Please wait ${Math.ceil(timeLeft / 60)} minutes before the next action.`,
                    timeLeft: timeLeft,
                    cooldownPeriod: COOLDOWN_PERIOD_SECONDS
                });
            }
        }

        const { faction, action } = req.body; // History will be fetched from Redis

        if (!faction || !action) {
            return res.status(400).json({ error: 'Faction and action are required' });
        }

        console.log('[warmachineAction] Attempting Redis GET for warmachine_gameState...');
    let gameState = await safeGet('warmachine_gameState');
        console.log('[warmachineAction] Successfully fetched gameState (or null if not found).');
        
        // MODIFIED: Initialize game state with all 10 factions if it doesn't exist or is incomplete
        if (!gameState || !gameState.factionStats || Object.keys(gameState.factionStats).length < initialFactions.length) {
            const baseStats = initialFactions.reduce((acc, factionName) => {
              acc[factionName] = {
                morale: 10,
                territories: 1,
                specialAbility: "New Contender!"
              };
              return acc;
            }, {});

            // If gameState exists but factionStats is incomplete, merge existing stats
            const mergedFactionStats = gameState?.factionStats 
                ? { ...baseStats, ...gameState.factionStats } 
                : baseStats;
            
            // Ensure all initialFactions are present in the merged stats, adding defaults if necessary
            initialFactions.forEach(fName => {
                if (!mergedFactionStats[fName]) {
                    mergedFactionStats[fName] = { morale: 10, territories: 1, specialAbility: "Late Entry!" };
                }
            });

            gameState = {
                outcomes: gameState?.outcomes || [], // Preserve existing outcomes
                factionStats: mergedFactionStats
            };
            // No need to save here, as getWarmachineState would have/should handle primary initialization.
            // This is more of a fallback for this specific action handler if state is unexpectedly missing/incomplete.
            console.log('[warmachineAction] Initialized/merged gameState as it was missing or incomplete.');
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

        let peanutoshiRawResponse = null;
        if (aiEnabled) {
            const chatPayload = {
                model: modelCatalog.getValidChatModel(modelCatalog.chatModel),
                messages: [{ role: "user", content: systemPrompt }],
                venice_parameters: {
                    character_slug: "peanutoshi-nutkamoto",
                    enable_web_search: "auto",
                    include_venice_system_prompt: false,
                },
                temperature: 0.85,
                top_p: 0.9,
            };

            console.log("Attempting to fetch from Venice Chat API...");
            const controller = new AbortController();
            const timeoutMs = parseInt(process.env.REQUEST_TIMEOUT_MS || '120000', 10);
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            const chatResponse = await fetch('https://api.venice.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chatPayload),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            let chatData;
            if (chatResponse.ok) {
                chatData = await chatResponse.json();
                console.log("Successfully fetched and parsed response from Venice Chat API.");
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

            peanutoshiRawResponse = chatData.reply || (chatData.choices && chatData.choices[0]?.message?.content);
        } else {
            peanutoshiRawResponse = `NARRATIVE: The war drums fall silent as the council debates.\nEFFECTS: Peanuts Morale +0\nIMAGE_PROMPT: A quiet battlefield at dusk with banners fluttering, the armies standing by.`;
        }

        if (!peanutoshiRawResponse) {
            // Avoid referencing possibly out-of-scope chatData in error log
            console.error("No valid response content (reply or choices) from Peanutoshi (Chat API)." );
            throw new Error('No valid response content from Peanutoshi (Chat API).');
        }
        console.log("Raw Peanutoshi response:", peanutoshiRawResponse); // Added log

        const { narrative, effects, imagePrompt } = parsePeanutoshiResponse(peanutoshiRawResponse);
        console.log("Parsed Peanutoshi response - Narrative:", narrative, "Effects:", effects, "Image Prompt:", imagePrompt); // Added log

        // Update faction stats based on effects
        const updatedFactionStats = JSON.parse(JSON.stringify(gameState.factionStats)); // Deep copy
        const effectParts = effects.split(',').map(e => e.trim());
        effectParts.forEach(part => {
            // Regex to capture: FactionName Stat +/-Value (e.g., Peanuts Morale +1, Almonds Territories -1)
            // Allows for multi-word faction names if AI uses them exactly as in gameState.factionStats keys
            const factionNamesRegexPart = Object.keys(updatedFactionStats).join('|');
            const match = part.match(new RegExp(`(${factionNamesRegexPart})\\s+(morale|territories)\\s*([+-])\\s*(\\d+)`, 'i'));
            if (match) {
                const [, factionName, stat, operator, valueStr] = match;
                const value = parseInt(valueStr, 10);
                // Ensure factionName from regex match exists in our stats object to prevent errors
                if (updatedFactionStats[factionName] && updatedFactionStats[factionName][stat.toLowerCase()] !== undefined) {
                    if (operator === '+') {
                        updatedFactionStats[factionName][stat.toLowerCase()] += value;
                    } else {
                        updatedFactionStats[factionName][stat.toLowerCase()] -= value;
                    }
                    if (updatedFactionStats[factionName][stat.toLowerCase()] < 0) {
                        updatedFactionStats[factionName][stat.toLowerCase()] = 0;
                    }
                } else {
                    console.warn(`Effect parser: Faction \"${factionName}\" or stat \"${stat}\" not found in current stats. Effect: \"${part}\".`);
                }
            } else {
                 console.log(`Effect parser: No match for effect part \"${part}\".`);
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
            if (!imageEnabled) {
                newOutcome.imageUrl = imageUrl;
                throw new Error('Image generation disabled by FEATURE_IMAGE_GEN_ENABLED');
            }
            // Pick a valid image model from ENV-provided list; default already validated in catalog
            const selectedImageModel = modelCatalog.image.getValidImageModel(modelCatalog.image.defaultModel);
            const imagePayload = {
                model: selectedImageModel,
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
            const imageTimeoutMs = parseInt(process.env.REQUEST_TIMEOUT_MS || '120000', 10);
            const imageTimeout = setTimeout(() => imageController.abort(), imageTimeoutMs);
            
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
        console.log('[warmachineAction] Attempting Redis SET for warmachine_gameState...');
    await safeSet('warmachine_gameState', newGameState);
        console.log('[warmachineAction] Successfully SET warmachine_gameState.');
        console.log('[warmachineAction] Attempting Redis SET for warmachine_lastActionTimestamp...');
    await safeSet('warmachine_lastActionTimestamp', Math.floor(Date.now() / 1000));
        console.log('[warmachineAction] Successfully SET warmachine_lastActionTimestamp.');
        

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
        console.error('[warmachineAction] Error in handler:', error);
        console.error('[warmachineAction] Error message:', error.message);
        console.error('[warmachineAction] Error stack:', error.stack);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            errorMessage: error.message, 
        });
    }
}
