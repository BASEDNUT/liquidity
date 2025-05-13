import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.error('Upstash Redis environment variables are missing.');
      return res.status(500).json({
          error: 'Server configuration error',
          message: 'Redis not configured properly',
      });
    }

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
      // Save the initial state back to Redis if it was just created
      await redis.set('warmachine_gameState', gameState); 
    }

    res.status(200).json(gameState);

  } catch (error) {
    console.error('Error fetching warmachine state:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
