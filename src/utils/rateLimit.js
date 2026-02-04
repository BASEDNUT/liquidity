const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX = 30;

const buckets = new Map();

function getClientIp(req) {
  const xfwd = req.headers['x-forwarded-for'];
  if (typeof xfwd === 'string' && xfwd.length > 0) {
    return xfwd.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) return realIp.trim();
  return req.socket?.remoteAddress || 'unknown';
}

function rateLimit(req, options = {}) {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const max = options.max || DEFAULT_MAX;
  const keyPrefix = options.keyPrefix || 'rl';
  const key = `${keyPrefix}:${getClientIp(req)}`;

  const now = Date.now();
  const entry = buckets.get(key) || { count: 0, start: now };

  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }

  entry.count += 1;
  buckets.set(key, entry);

  const remaining = Math.max(0, max - entry.count);
  const reset = entry.start + windowMs;

  return {
    ok: entry.count <= max,
    limit: max,
    remaining,
    reset,
  };
}

module.exports = {
  rateLimit,
};