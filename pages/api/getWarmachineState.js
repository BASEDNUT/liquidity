import { Redis } from '@upstash/redis';
import { rateLimit } from '../../src/utils/rateLimit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Simple in-memory fallback if Upstash is unreachable
const mem = new Map();
async function safeGet(key) {
  try { return await redis.get(key); } catch { return mem.get(key) || null; }
}
async function safeSet(key, value) {
  try { await redis.set(key, value); } catch { mem.set(key, value); }
}

const COOLDOWN_PERIOD_SECONDS = 3600; // 1 hour, consistent with warmachineAction.js

// MODIFIED: Expanded factions list for initial state
const initialFactions = [
  "Peanuts", "Almonds", "Walnuts", "Cashews", "Pistachios", 
  "Hazelnuts", "Coconuts", "Macadamias", "Pecans", "Chestnuts"
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rl = rateLimit(req, { windowMs: 60 * 1000, max: 30, keyPrefix: 'warmachine-state' });
  res.setHeader('X-RateLimit-Limit', String(rl.limit));
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
  res.setHeader('X-RateLimit-Reset', String(rl.reset));
  if (!rl.ok) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  try {
    const warmachineEnabled = process.env.FEATURE_WARMACHINE_ENABLED !== 'false';
    if (!warmachineEnabled) {
      return res.status(503).json({ error: 'Feature disabled', message: 'Warmachine feature is disabled via FEATURE_WARMACHINE_ENABLED' });
    }
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.error('[getWarmachineState] Upstash Redis environment variables are confirmed missing inside handler.');
      return res.status(500).json({
          error: 'Server configuration error',
          message: 'Redis not configured properly (checked in handler)',
      });
    }

  let gameState = await safeGet('warmachine_gameState');

    if (!gameState || !gameState.factionStats || Object.keys(gameState.factionStats).length < initialFactions.length) {
      // Initialize or update game state if it doesn't exist or has fewer factions than current list
      const initialFactionStats = initialFactions.reduce((acc, factionName) => {
        acc[factionName] = {
          morale: 10,
          territories: 1, // Start with 1 territory for some initial presence
          specialAbility: "New Contender!"
        };
        return acc;
      }, {});

      gameState = {
        outcomes: gameState?.outcomes || [], // Preserve existing outcomes if any
        factionStats: initialFactionStats
      };
      // Save the initial/updated state back to Redis
  await safeSet('warmachine_gameState', gameState);
    }

  const lastActionTimestamp = await safeGet('warmachine_lastActionTimestamp');
    const now = Math.floor(Date.now() / 1000);
    let timeLeft = 0;
    if (lastActionTimestamp) {
        const timeSinceLastAction = now - Number(lastActionTimestamp);
        if (timeSinceLastAction < COOLDOWN_PERIOD_SECONDS) {
            timeLeft = COOLDOWN_PERIOD_SECONDS - timeSinceLastAction;
        }
    }

    res.status(200).json({
        ...gameState,
        lastActionTimestamp: lastActionTimestamp ? Number(lastActionTimestamp) : null,
        cooldownPeriod: COOLDOWN_PERIOD_SECONDS,
        currentTime: now, // Send current server time for client-side calculation if needed
        timeLeft: timeLeft // Send calculated time left
    });

  } catch (error) {
    console.error('[getWarmachineState] Error in handler:', error);
    console.error('[getWarmachineState] Error message:', error.message);
    console.error('[getWarmachineState] Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      // Add more detailed error info if possible, but be careful with sensitive data
      errorMessage: error.message, 
    });
  }
}
