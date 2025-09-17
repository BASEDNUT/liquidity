const { withLock, setJSON } = require('../../../src/utils/cache');
const { normalizePayload } = require('../../../src/utils/orchard');

const CACHE_KEY = 'orchard:tvl:v1';
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24h

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const auth = req.headers.authorization || '';
    const token = (auth.startsWith('Bearer ') ? auth.slice(7) : auth) || '';
    const expected = process.env.CRON_REFRESH_TOKEN;
    if (!expected || token !== expected) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const lockKey = `${CACHE_KEY}:refresh`;
    const r = await withLock(lockKey, 15 * 60, async () => {
      const webhookUrl = process.env.N8N_WEBHOOK_URL;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        const data = await fetch(webhookUrl, { method: 'GET', signal: controller.signal });
        if (!data.ok) throw new Error(`Upstream responded ${data.status}`);
        const json = await data.json();
        const normalized = normalizePayload(json);
        const record = { ...normalized, checkedAt: Date.now() };
        await setJSON(CACHE_KEY, record, CACHE_TTL_SECONDS);
        return record;
      } finally {
        clearTimeout(timeoutId);
      }
    });

    if (!r) return res.status(429).json({ error: 'Refresh is already in progress or recently completed' });
    return res.status(200).json({ ok: true, ...r });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}

// normalizePayload imported from utils
