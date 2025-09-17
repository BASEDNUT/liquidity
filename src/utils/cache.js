// Simple cache abstraction: Upstash Redis if configured, else in-memory Map.
// Provides getJSON/setJSON with TTL in seconds.

let memory = new Map();
let redis = null;
let warnedRedis = false;

const hasRedis = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (hasRedis) {
  try {
    // Lazy require to avoid bundling when not needed
    // eslint-disable-next-line global-require
    const { Redis } = require('@upstash/redis');
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (e) {
    // Fallback to memory if package missing at runtime
    redis = null;
  }
}

async function getJSON(key) {
  if (redis) {
    try {
      const val = await redis.get(key);
      return val ?? null;
    } catch (e) {
      if (!warnedRedis) {
        console.warn('Cache: Redis unavailable, falling back to memory:', e?.message || e);
        warnedRedis = true;
      }
      // Drop Redis for this process lifetime and continue with memory
      redis = null;
    }
  }
  const item = memory.get(key);
  if (!item) return null;
  const { value, expiresAt } = item;
  if (expiresAt && Date.now() > expiresAt) {
    memory.delete(key);
    return null;
  }
  return value;
}

async function setJSON(key, value, ttlSeconds) {
  if (redis) {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await redis.set(key, value, { ex: ttlSeconds });
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (e) {
      if (!warnedRedis) {
        console.warn('Cache: Redis unavailable, falling back to memory:', e?.message || e);
        warnedRedis = true;
      }
      redis = null;
    }
  }
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
  memory.set(key, { value, expiresAt });
  return true;
}

// Simple lock using Redis setnx or in-memory guard
async function withLock(lockKey, ttlSeconds, fn) {
  const startedAt = Date.now();
  const ttl = Math.max(5, ttlSeconds || 60);
  const deadline = startedAt + ttl * 1000;

  if (redis) {
    try {
      const lockVal = String(startedAt);
      const acquired = await redis.set(lockKey, lockVal, { nx: true, ex: ttl });
      if (!acquired) return null; // someone else holds the lock
      try {
        return await fn();
      } finally {
        // Best-effort unlock
        try { await redis.del(lockKey); } catch (_) {}
      }
    } catch (e) {
      if (!warnedRedis) {
        console.warn('Cache: Redis lock unavailable, using memory lock:', e?.message || e);
        warnedRedis = true;
      }
      redis = null;
    }
  }
  if (!redis) {
    if (memory.get(lockKey)) return null;
    memory.set(lockKey, { value: '1', expiresAt: deadline });
    try {
      return await fn();
    } finally {
      memory.delete(lockKey);
    }
  }
}

module.exports = { getJSON, setJSON, withLock };
