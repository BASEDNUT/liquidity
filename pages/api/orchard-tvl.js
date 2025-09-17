// API route: proxies n8n webhook and normalizes the TVL payload for the UI
// Env: N8N_WEBHOOK_URL (e.g., https://n8n.example.com/webhook/1e5b023d-...)

const { getJSON, setJSON, withLock } = require('../../src/utils/cache');
const { normalizePayload } = require('../../src/utils/orchard');

const CACHE_KEY = 'orchard:tvl:v1';
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24h

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const controller = new AbortController();
  const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 120000);
  const timeoutId = setTimeout(() => controller.abort(), Math.min(timeoutMs, 30000)); // cap at 30s for UI

  try {
    // 1) Try cache
    const cached = await getJSON(CACHE_KEY);
    const now = Date.now();
    if (cached) {
      const ageMs = now - (cached.checkedAt || now);
      const isFresh = ageMs < CACHE_TTL_SECONDS * 1000;
      // Return cached immediately
      res.status(200).json({ source: 'cache', ...cached });
      // If stale, refresh in background (best-effort)
      if (!isFresh) refreshInBackground(webhookUrl).catch(() => {});
      return;
    }

    // 2) No cache -> fetch, normalize, store, return
    const normalized = await fetchNormalize(webhookUrl, controller);
    const record = { ...normalized, checkedAt: now };
    await setJSON(CACHE_KEY, record, CACHE_TTL_SECONDS);
    return res.status(200).json({ source: 'n8n', ...record });
  } catch (err) {
    // Use stale cache if available, else error (no hardcoded fallback)
    const stale = await getJSON(CACHE_KEY);
    if (stale) {
      return res.status(200).json({ source: 'stale-cache', ...stale });
    }
    return res.status(502).json({ error: 'Upstream TVL unavailable', note: String(err?.message || err) });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function refreshInBackground(webhookUrl) {
  const now = Date.now();
  const lockKey = `${CACHE_KEY}:lock`;
  await withLock(lockKey, 60, async () => {
    const normalized = await fetchNormalize(webhookUrl);
    const record = { ...normalized, checkedAt: now };
    await setJSON(CACHE_KEY, record, CACHE_TTL_SECONDS);
  });
}

async function fetchNormalize(webhookUrl, controller) {
  if (!webhookUrl) throw new Error('N8N_WEBHOOK_URL not configured');
  const resp = await fetch(webhookUrl, { method: 'GET', signal: controller?.signal });
  if (!resp.ok) throw new Error(`Upstream responded ${resp.status}`);
  const data = await resp.json();
  return normalizePayload(data);
}

// normalizePayload is imported from utils
