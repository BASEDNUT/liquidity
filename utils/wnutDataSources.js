// wNUT On-Chain Data Fetcher
// Wrapped NUT Observatory — live state + event history on Base mainnet.
// State (supply/backing/block) from Base RPC; event history from Moralis (keyed) or keyless eth_getLogs tape.
// Zero hard-coded numbers: every metric derived from live reads, verified contracts, or the event tape.

const RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.drpc.org', // keyless getLogs-capable fallback (verified 2026-09-01)
  'https://base.publicnode.com',
];

// Canonical addresses (config.py truth)
const WNUT = '0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3';
const NUT = '0xb8de15fb529d98c93c749de63c749d48d25a30df';
const BEETS_VAULT = '0xba1333333333a1ba1108e8412f11850a5c319ba9';
const ZERO = '0x0000000000000000000000000000000000000000';

const DECIMALS = 1e18;

// Function selectors
const BALANCE_OF = '0x70a08231';
const TOTAL_SUPPLY = '0x18160ddd';

// Moralis API key from the Vercel environment.
const MORALIS_KEY = process.env.MORALIS_API_KEY || '';

// Keyless event-tape fallback — eth_getLogs Transfer logs from the wNUT deploy block.
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const WNUT_DEPLOY_BLOCK = 50507871; // wNUT deploy block — first wrap tx 0xbfc0...2ef75
const LOG_CHUNK = 10000; // mainnet.base.org rejects wider ranges (HTTP 413)

// Verified wNUT markets — Sunflower Grove Batch I (Balancer v3 WEIGHTED 20/40/40).
// Addresses canonical from config.py. Live liquidity/volume/price intentionally null:
// these are experiment-scale pools with no observed swaps (zero-fabrication rule).
const VERIFIED_MARKETS = [
  { pair: 'wNUT/VVV/DIEM', venue: 'Balancer v3 · Beets', poolAddress: '0x6a0a1B7428d543524592eD22023A09BdE05aA466' },
  { pair: 'wNUT/VIRTUAL/MOR', venue: 'Balancer v3 · Beets', poolAddress: '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200' },
  { pair: 'wNUT/cbETH/wstETH', venue: 'Balancer v3 · Beets', poolAddress: '0xd156d51219B3a7A590670d655E8740Ad404e8835' },
  { pair: 'wNUT/cbBTC/tBTC', venue: 'Balancer v3 · Beets', poolAddress: '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4' },
  { pair: 'wNUT/USDC/EURC', venue: 'Balancer v3 · Beets', poolAddress: '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E' },
];

function pad32(addr) {
  return addr.toLowerCase().slice(2).padStart(64, '0');
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function rpcCall(method, params, retryCount = 0) {
  const rpc = RPC_URLS[retryCount % RPC_URLS.length];
  try {
    const res = await fetchWithTimeout(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'peanutoshi-wnut' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    });
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    return json.result;
  } catch (e) {
    if (retryCount < RPC_URLS.length - 1) {
      return rpcCall(method, params, retryCount + 1);
    }
    return null;
  }
}

function hexToNum(hex) {
  if (!hex || hex === '0x') return null;
  try { return Number(BigInt(hex)); } catch { return null; }
}

// ── Live state reads ─────────────────────────────────────────────────────────
async function fetchState() {
  const [blockNumberRaw, totalSupplyRaw, backingRaw] = await Promise.all([
    rpcCall('eth_blockNumber', []),
    rpcCall('eth_call', [{ to: WNUT, data: TOTAL_SUPPLY }, 'latest']),
    rpcCall('eth_call', [{ to: NUT, data: BALANCE_OF + pad32(WNUT) }, 'latest']),
  ]);

  const blockNumber = hexToNum(blockNumberRaw);
  const totalSupply = hexToNum(totalSupplyRaw) != null ? hexToNum(totalSupplyRaw) / DECIMALS : null;
  const underlyingBalance = hexToNum(backingRaw) != null ? hexToNum(backingRaw) / DECIMALS : null;

  const backingRatio = totalSupply != null && underlyingBalance != null && totalSupply > 0
    ? underlyingBalance / totalSupply
    : null;
  const backingSurplus = totalSupply != null && underlyingBalance != null
    ? Math.max(0, underlyingBalance - totalSupply)
    : null;
  // wrapped fraction of the 1-NUT root
  const wrappedPctOfNut = underlyingBalance != null ? underlyingBalance * 100 : null;

  return {
    address: WNUT,
    underlying: NUT,
    totalSupply,
    underlyingBalance,
    backingRatio,
    backingSurplus,
    wrappedPctOfNut,
    blockNumber,
  };
}

// ── NUT reference price (GeckoTerminal, keyless) ─────────────────────────────
async function fetchNutPriceUsd() {
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/base/tokens/${NUT}`;
    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 5000);
    if (!res.ok) return null;
    const json = await res.json();
    const p = json?.data?.attributes?.price_usd;
    return p != null ? Number(p) : null;
  } catch {
    return null;
  }
}

// ── Event history (Moralis) ──────────────────────────────────────────────────
// wNUT is young: single wrap + market movements. Full tape fits one page.
// from=ZERO -> mint (wrap); to=ZERO -> burn (unwrap); else transfer.
async function fetchEventsMoralis() {
  if (!MORALIS_KEY) return { events: [], error: 'missing_moralis_key' };
  const url = `https://deep-index.moralis.io/api/v2.2/erc20/${WNUT}/transfers?chain=base&limit=100&order=ASC`;
  const res = await fetchWithTimeout(url, {
    headers: { Accept: 'application/json', 'X-API-Key': MORALIS_KEY },
  });
  if (!res.ok) return { events: [], error: `moralis_http_${res.status}` };
  const json = await res.json();
  const result = json?.result || [];

  const events = result.map((t) => {
    const from = (t.from_address || '').toLowerCase();
    const to = (t.to_address || '').toLowerCase();
    let type = 'transfer';
    if (from === ZERO) type = 'wrap';
    else if (to === ZERO) type = 'unwrap';
    return {
      type,
      amount: t.value_decimal != null ? Number(t.value_decimal) : null,
      from,
      to,
      txHash: t.transaction_hash || null,
      blockNumber: t.block_number != null ? Number(t.block_number) : null,
      timestamp: t.block_timestamp || null,
    };
  });

  return { events, error: null };
}

// ── Event tape: Moralis (keyed) with keyless RPC fallback ────────────────────
// Moralis first when a key exists; otherwise (or on Moralis failure) the full
// tape is rebuilt from eth_getLogs Transfer logs, chunked from the deploy block.
// Zero fabrication: if both paths fail we report the error and show nothing.
async function fetchEvents() {
  if (MORALIS_KEY) {
    const moralis = await fetchEventsMoralis();
    if (!moralis.error) return moralis;
  }
  return fetchEventsRpc();
}

function logToEvent(log) {
  const from = '0x' + String(log.topics[1] || '').slice(-40).toLowerCase();
  const to = '0x' + String(log.topics[2] || '').slice(-40).toLowerCase();
  let type = 'transfer';
  if (from === ZERO) type = 'wrap';
  else if (to === ZERO) type = 'unwrap';
  let amount = null;
  try { amount = Number(BigInt(log.data)) / DECIMALS; } catch { /* keep null */ }
  return {
    type,
    amount,
    from,
    to,
    txHash: log.transactionHash || null,
    blockNumber: log.blockNumber != null ? Number(BigInt(log.blockNumber)) : null,
    timestamp: null, // filled from block headers below
  };
}

async function fetchEventsRpc() {
  const latestRaw = await rpcCall('eth_blockNumber', []);
  if (latestRaw == null) return { events: [], error: 'rpc_tape_failed' };
  const latest = Number(BigInt(latestRaw));

  const chunks = [];
  for (let from = WNUT_DEPLOY_BLOCK; from <= latest; from += LOG_CHUNK) {
    chunks.push([from, Math.min(from + LOG_CHUNK - 1, latest)]);
  }

  const logs = [];
  let answered = 0;
  for (let i = 0; i < chunks.length; i += 4) {
    const batch = chunks.slice(i, i + 4);
    const results = await Promise.all(batch.map(([f, t]) =>
      rpcCall('eth_getLogs', [{
        address: WNUT,
        fromBlock: '0x' + f.toString(16),
        toBlock: '0x' + t.toString(16),
        topics: [TRANSFER_TOPIC],
      }]),
    ));
    for (const r of results) {
      if (Array.isArray(r)) { answered += 1; logs.push(...r); }
    }
  }
  if (answered === 0) return { events: [], error: 'rpc_tape_failed' };

  const events = logs
    .map(logToEvent)
    .sort((a, b) => (a.blockNumber || 0) - (b.blockNumber || 0));

  // Timestamps: one block header per distinct block (the tape is small).
  const blocks = [...new Set(events.map((e) => e.blockNumber).filter((n) => n != null))];
  const headers = await Promise.all(blocks.map((b) =>
    rpcCall('eth_getBlockByNumber', ['0x' + b.toString(16), false]),
  ));
  const tsByBlock = new Map();
  blocks.forEach((b, i) => {
    const h = headers[i];
    const ts = h && h.timestamp ? Number(BigInt(h.timestamp)) * 1000 : null;
    if (ts != null) tsByBlock.set(b, new Date(ts).toISOString());
  });
  for (const e of events) e.timestamp = tsByBlock.get(e.blockNumber) || null;

  return { events, error: null };
}


// ── Holder balances + distribution (RPC for known distinct addresses) ────────
async function deriveHolders(events) {
  const addrs = new Set();
  for (const e of events) {
    if (e.from !== ZERO) addrs.add(e.from);
    if (e.to !== ZERO) addrs.add(e.to);
  }
  const unique = [...addrs];
  if (!unique.length) return { topHolders: [], distribution: [], holders: 0 };

  const balances = await Promise.all(unique.map(async (addr) => {
    const raw = await rpcCall('eth_call', [{ to: WNUT, data: BALANCE_OF + pad32(addr) }, 'latest']);
    const n = hexToNum(raw);
    return { address: addr, balance: n != null ? n / DECIMALS : 0 };
  }));

  const nonZero = balances.filter((b) => b.balance > 0);
  const total = nonZero.reduce((s, b) => s + b.balance, 0) || 1;

  const labels = { [BEETS_VAULT]: 'Beets Vault (Balancer v3)' };

  const topHolders = nonZero
    .sort((a, b) => b.balance - a.balance)
    .map((b) => ({
      address: b.address,
      balance: b.balance,
      pct: (b.balance / total) * 100,
      label: labels[b.address] || null,
      type: b.address === BEETS_VAULT ? 'pool-vault' : 'wallet',
    }));

  // Distribution categories: group pool-vault (deployed to pools) vs held.
  const catMap = new Map();
  for (const h of topHolders) {
    const cat = h.type === 'pool-vault' ? 'Deployed to pools' : 'Held in wallets';
    catMap.set(cat, (catMap.get(cat) || 0) + h.balance);
  }
  const distribution = [...catMap.entries()]
    .map(([category, amount]) => ({ category, amount, pct: (amount / total) * 100 }))
    .sort((a, b) => b.amount - a.amount);

  return { topHolders, distribution, holders: nonZero.length };
}

// ── Flows aggregation ────────────────────────────────────────────────────────
function aggregateFlows(events) {
  const now = Date.now();
  const windows = {
    h24: 24 * 60 * 60 * 1000,
    d7: 7 * 24 * 60 * 60 * 1000,
    d30: 30 * 24 * 60 * 60 * 1000,
  };

  const flows = {};
  for (const [range, ms] of Object.entries(windows)) {
    const cutoff = now - ms;
    const inRange = events.filter((e) => e.timestamp && new Date(e.timestamp).getTime() >= cutoff);
    let wrapped = 0, unwrapped = 0, transferred = 0, txCount = 0;
    for (const e of inRange) {
      txCount += 1;
      if (e.type === 'wrap') wrapped += e.amount || 0;
      else if (e.type === 'unwrap') unwrapped += e.amount || 0;
      else if (e.type === 'transfer') transferred += e.amount || 0;
    }
    flows[range] = {
      wrapped,
      unwrapped,
      transferred,
      net: wrapped - unwrapped,
      txCount,
    };
  }

  // history: cumulative supply stepping per event (for chart)
  let supply = 0;
  const history = events.map((e) => {
    if (e.type === 'wrap') supply += e.amount || 0;
    else if (e.type === 'unwrap') supply -= e.amount || 0;
    return {
      ts: e.timestamp,
      wrapped: e.type === 'wrap' ? e.amount || 0 : 0,
      unwrapped: e.type === 'unwrap' ? e.amount || 0 : 0,
      supply,
    };
  });

  return { ...flows, history };
}

// ── Main entry ───────────────────────────────────────────────────────────────
export async function fetchWnutData() {
  const [state, eventsResult, nutPriceUsd] = await Promise.all([
    fetchState(),
    fetchEvents(),
    fetchNutPriceUsd(),
  ]);

  const events = eventsResult.events || [];
  const holdersData = await deriveHolders(events).catch(() => ({ topHolders: [], distribution: [], holders: null }));
  const flows = aggregateFlows(events);

  const backingValueUsd = state.underlyingBalance != null && nutPriceUsd != null
    ? state.underlyingBalance * nutPriceUsd
    : null;

  // Estimated market cap: wNUT circulating supply × live NUT price.
  // Equals backing value while the 1:1 invariant holds; kept separate for honesty.
  const estMarketCapUsd = state.totalSupply != null && nutPriceUsd != null
    ? state.totalSupply * nutPriceUsd
    : null;

  return {
    ...state,
    backingValueUsd,
    estMarketCapUsd,
    nutPriceUsd,
    holders: holdersData.holders,
    topHolders: holdersData.topHolders || [],
    distribution: holdersData.distribution || [],
    flows,
    markets: VERIFIED_MARKETS,
    recentEvents: events,
    eventsError: eventsResult.error || null,
    lastCheckedAt: new Date().toISOString(),
  };
}
