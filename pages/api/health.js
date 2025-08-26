import { validateEnv } from '../../utils/validateEnv';

export default async function handler(req, res) {
  try {
    const ok = validateEnv();

    const features = {
      ai: process.env.FEATURE_AI_ENABLED !== 'false',
      imageGen: process.env.FEATURE_IMAGE_GEN_ENABLED !== 'false',
      warmachine: process.env.FEATURE_WARMACHINE_ENABLED !== 'false',
    };

    // Optional Redis check (no secrets leaked)
    let redisReady = false;
  if (features.warmachine && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        // lightweight HEAD request to Upstash REST API
        const ping = await fetch(process.env.UPSTASH_REDIS_REST_URL, { method: 'HEAD' });
        redisReady = ping.ok;
      } catch {
        redisReady = false;
      }
    }

    return res.status(200).json({ ok: !!ok, features, redisReady });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'health_check_failed' });
  }
}
