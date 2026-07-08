// POST endpoint: forces a cache refresh of orchard TVL data
// Uses the same market-data aggregation as the GET endpoint (no more n8n)

import { withLock, setJSON } from '../../../src/utils/cache.js';
import { aggregateOrchardTVL } from '../orchard-tvl.js';

const CACHE_KEY = 'orchard:tvl:v2';
const CACHE_TTL_SECONDS = 60; // 60 seconds

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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
    const r = await withLock(lockKey, 60, async () => {
      const result = await aggregateOrchardTVL();
      const record = { ...result, checkedAt: Date.now() };
      await setJSON(CACHE_KEY, record, CACHE_TTL_SECONDS);
      return record;
    });

    if (!r) return res.status(429).json({ error: 'Refresh is already in progress or recently completed' });
    return res.status(200).json({ ok: true, ...r });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
