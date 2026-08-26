// API Route: /api/agent-economy-data
// Live treasury + ledger for the Pipshell/Peanut shared operations wallet.
// Sources: Base RPC (balances) · Blockscout (transfers) · GeckoTerminal (PIPS price) · CoinGecko (ETH price).
// Redis cache (5 min TTL) with stale fallback — mirrors the token-data.js pattern.
// Spoof defense: only the canonical USDC contract is counted; all other token events
// touching the wallet are classified as counterfeit/spam (homoglyph address poisoning).

import { getJSON, setJSON } from '../../src/utils/cache.js';

const WALLET = '0x762a8235506c719a4da37389c6b84b35d02df230'.toLowerCase(); // Pipshell operations wallet — the shared treasury
const PIPS_TOKEN = '0x3f2327221dd4f0bae660172606d6b288a1cf8ad9'.toLowerCase();
const USDC_TOKEN = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'.toLowerCase(); // canonical native USDC on Base
const SEED_ADDRESS = '0x135b208ac2480b0d876944416de16e7a3b9a1f65'.toLowerCase(); // operator seed funding (documented, sessions 33/40)
const ACP_PAYMENT_ADDRESS = '0x238e541bfefd82238730d00a2208e5497f1832e0'.toLowerCase(); // ACP escrow release — job 70824 (documented, session 40)
const ESCROW_FUND_ADDRESS = '0xc9b6d66b28ce8cd34a33cccad8d5cf5fe7ccb287'.toLowerCase(); // ACP job escrow funding outflow
const ESCROW_RELEASE_ADDRESS = '0xc9b67cf086e8763dd407f6dc464a844ce0790287'.toLowerCase(); // ACP escrow micro-release inflow

// Documented ledger fact: first ACP sale — job 70824, $0.01 base_gas offering (archive/2026-08-04-session40-acp-first-sale.md)
const FIRST_JOB_DATE = Date.parse('2026-08-04T04:36:35Z');
const FIRST_JOB_GROSS_USDC = 0.01;

// On-chain verified baseline ledger — eth_getLogs scan of canonical-USDC Transfer events to/from
// the wallet (blocks 49.30M → 50.46M), timestamps via eth_getBlockByNumber (2026-08-25 session).
// Math: inflow 60.00904 − outflow 40.80 = 19.20904 USDC == live wallet balance (reconciles exactly).
// Served when Blockscout is unreachable and no cache exists; per-request reconciliation against
// the live RPC balance proves whether this baseline is still complete.
const VERIFIED_BASELINE = [
  { blockNumber: 49404058, timeStamp: '1785597463', from: SEED_ADDRESS, to: WALLET, value: '60000000', contractAddress: USDC_TOKEN, tokenSymbol: 'USDC' },
  { blockNumber: 49465179, timeStamp: '1785719705', from: WALLET, to: ESCROW_FUND_ADDRESS, value: '20400000', contractAddress: USDC_TOKEN, tokenSymbol: 'USDC' },
  { blockNumber: 49465236, timeStamp: '1785719819', from: ESCROW_RELEASE_ADDRESS, to: WALLET, value: '20', contractAddress: USDC_TOKEN, tokenSymbol: 'USDC' },
  { blockNumber: 49514424, timeStamp: '1785818195', from: ACP_PAYMENT_ADDRESS, to: WALLET, value: '9000', contractAddress: USDC_TOKEN, tokenSymbol: 'USDC' },
  { blockNumber: 49582448, timeStamp: '1785954243', from: WALLET, to: ESCROW_FUND_ADDRESS, value: '20400000', contractAddress: USDC_TOKEN, tokenSymbol: 'USDC' },
  { blockNumber: 49582478, timeStamp: '1785954303', from: ESCROW_RELEASE_ADDRESS, to: WALLET, value: '20', contractAddress: USDC_TOKEN, tokenSymbol: 'USDC' },
];

const RPC_URLS = ['https://mainnet.base.org', 'https://base.publicnode.com'];
const CACHE_KEY = 'agent-economy:v1';
const CACHE_TTL_SECONDS = 300;
const TRANSFERS_CACHE_KEY = 'agent-economy:transfers:v1';
const TRANSFERS_TTL_SECONDS = 7 * 24 * 3600; // transfers are append-only history — serve stale on upstream failure

async function rpc(method, params) {
  for (const url of RPC_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'orchard-site/1.0' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json && json.result !== undefined) return json.result;
    } catch (e) {
      // try next endpoint
    }
  }
  return null;
}

async function erc20Balance(token, wallet) {
  const data = '0x70a08231' + wallet.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const out = await rpc('eth_call', [{ to: token, data }, 'latest']);
  return out ? parseInt(out, 16) : null;
}

async function fetchTransfers(wallet) {
  const url = `https://base.blockscout.com/api?module=account&action=tokentx&address=${wallet}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'orchard-site/1.0' } });
  if (!res.ok) throw new Error(`blockscout ${res.status}`);
  const json = await res.json();
  if (!json || json.status !== '1' || !Array.isArray(json.result)) throw new Error('blockscout payload');
  return json.result;
}

async function fetchJson(url, timeoutMs) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { 'User-Agent': 'orchard-site/1.0' } });
  if (!res.ok) return null;
  return res.json();
}

function classifyTransfer(t) {
  const contract = (t.contractAddress || '').toLowerCase();
  const from = (t.from || '').toLowerCase();
  const to = (t.to || '').toLowerCase();
  const ts = parseInt(t.timeStamp, 10) * 1000;
  if (contract !== USDC_TOKEN) {
    return { kind: 'counterfeit', direction: 'spam', amountUsdc: 0, ts, counterparty: from === WALLET ? to : from, symbol: t.tokenSymbol || 'UNKNOWN' };
  }
  const amount = Number(t.value) / 1e6;
  if (to === WALLET) {
    let kind = 'inflow';
    if (from === SEED_ADDRESS) kind = 'seed';
    else if (from === ACP_PAYMENT_ADDRESS) kind = 'acp_payment';
    else if (from === ESCROW_RELEASE_ADDRESS) kind = 'escrow_release';
    return { kind, direction: 'in', amountUsdc: amount, ts, counterparty: from, symbol: 'USDC' };
  }
  let kind = 'outflow';
  if (to === ESCROW_FUND_ADDRESS) kind = 'escrow_fund';
  return { kind, direction: 'out', amountUsdc: amount, ts, counterparty: to, symbol: 'USDC' };
}

function buildSnapshot({ ethWei, usdcRaw, pipsRaw, ethUsd, pipsUsd, pipsVol24h, transfers }) {
  const eth = ethWei === null ? null : ethWei / 1e18;
  const usdc = usdcRaw === null ? null : usdcRaw / 1e6;
  const pips = pipsRaw === null ? null : pipsRaw / 1e18;
  const usdOf = (balance, price) => {
    if (balance === null) return null;
    if (balance === 0) return 0;
    if (price === null) return null;
    return balance * price;
  };
  const ethUsdValue = usdOf(eth, ethUsd);
  const usdcUsdValue = usdc; // USDC is the unit of account
  const pipsUsdValue = usdOf(pips, pipsUsd);
  const parts = [ethUsdValue, usdcUsdValue, pipsUsdValue];
  const treasuryUsd = parts.some((p) => p === null) ? null : parts.reduce((a, b) => a + b, 0);

  const rows = transfers.map(classifyTransfer).sort((a, b) => a.ts - b.ts);
  const real = rows.filter((r) => r.kind !== 'counterfeit');
  const counterfeit = rows.filter((r) => r.kind === 'counterfeit');
  const sum = (pred) => real.filter(pred).reduce((acc, r) => acc + r.amountUsdc, 0);
  const seedUsdc = sum((r) => r.direction === 'in' && r.kind === 'seed');
  const acpIncomeUsdc = sum((r) => r.direction === 'in' && r.kind === 'acp_payment');
  const escrowReleasedUsdc = sum((r) => r.direction === 'in' && r.kind === 'escrow_release');
  const escrowFundedUsdc = sum((r) => r.direction === 'out' && r.kind === 'escrow_fund');
  const inflowTotal = sum((r) => r.direction === 'in');
  const outflowTotal = sum((r) => r.direction === 'out');

  const now = Date.now();
  const window30d = now - 30 * 24 * 3600 * 1000;
  const acpIncome30d = real.filter((r) => r.direction === 'in' && r.kind === 'acp_payment' && r.ts >= window30d).reduce((a, r) => a + r.amountUsdc, 0);
  const firstJobLive = FIRST_JOB_DATE >= window30d;
  const externalInflowUsdc = inflowTotal - acpIncomeUsdc;

  const reconciled = usdc === null ? null : Math.abs(inflowTotal - outflowTotal - usdc) < 1e-6;

  return {
    ts: now,
    wallet: WALLET,
    balances: { eth, usdc, pips, ethUsd, pipsUsd },
    treasuryUsd,
    pipsMarket: { priceUsd: pipsUsd, volume24hUsd: pipsVol24h === undefined ? null : pipsVol24h },
    ledger: {
      seedUsdc,
      acpIncomeUsdc,
      escrowFundedUsdc,
      escrowReleasedUsdc,
      inflowTotalUsdc: inflowTotal,
      outflowTotalUsdc: outflowTotal,
      externalInflowUsdc,
      counterfeitEvents: counterfeit.length,
      counterfeitSymbols: [...new Set(counterfeit.map((c) => c.symbol))],
      reconciled,
      escrowOutstandingUsdc: Math.max(0, escrowFundedUsdc - acpIncomeUsdc - escrowReleasedUsdc),
    },
    income30d: {
      jobsCompleted: firstJobLive ? 1 : 0,
      grossJobValueUsdc: firstJobLive ? FIRST_JOB_GROSS_USDC : 0,
      receivedUsdc: acpIncome30d,
      uniqueCounterparties: new Set(real.filter((r) => r.direction === 'in' && r.kind === 'acp_payment').map((r) => r.counterparty)).size,
    },
    transfers: rows.map((r) => ({
      ts: r.ts,
      direction: r.direction,
      kind: r.kind,
      amountUsdc: r.amountUsdc,
      counterparty: r.counterparty,
      symbol: r.symbol,
    })),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cached = await getJSON(CACHE_KEY).catch(() => null);
  if (cached) {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ source: 'cache', ...cached });
  }

  // Transfers are append-only history: fetch independently and fall back to a long-TTL
  // stale cache when Blockscout is down — a ledger outage must not kill live balances.
  let transfersRaw = null;
  let ledgerSource = 'unavailable';
  try {
    transfersRaw = await fetchTransfers(WALLET);
    ledgerSource = 'live';
    await setJSON(TRANSFERS_CACHE_KEY, transfersRaw, TRANSFERS_TTL_SECONDS).catch(() => {});
  } catch (e) {
    const stale = await getJSON(TRANSFERS_CACHE_KEY).catch(() => null);
    if (Array.isArray(stale) && stale.length) {
      transfersRaw = stale;
      ledgerSource = 'stale-cache';
    } else {
      transfersRaw = VERIFIED_BASELINE;
      ledgerSource = 'on-chain-verified';
    }
  }

  try {
    const [ethWei, usdcRaw, pipsRaw, pipsQuote, ethQuote] = await Promise.all([
      rpc('eth_getBalance', [WALLET, 'latest']),
      erc20Balance(USDC_TOKEN, WALLET),
      erc20Balance(PIPS_TOKEN, WALLET),
      fetchJson(`https://api.geckoterminal.com/api/v2/networks/base/tokens/${PIPS_TOKEN}`, 8000),
      fetchJson('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', 8000),
    ]);

    if (ethWei === null || usdcRaw === null || pipsRaw === null) throw new Error('rpc_failed');

    const pipsAttrs = pipsQuote?.data?.attributes || null;
    const pipsUsd = pipsAttrs ? Number(pipsAttrs.price_usd) : null;
    const pipsVol24h = pipsAttrs ? Number(pipsAttrs.volume_usd?.h24 ?? 0) : null;
    const ethUsd = ethQuote?.ethereum?.usd !== undefined ? Number(ethQuote.ethereum.usd) : null;

    const snapshot = buildSnapshot({ ethWei, usdcRaw, pipsRaw, ethUsd, pipsUsd, pipsVol24h, transfers: transfersRaw || [] });
    snapshot.ledgerSource = ledgerSource; // persist through cache round-trip

    await setJSON(CACHE_KEY, snapshot, CACHE_TTL_SECONDS).catch(() => {});
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ source: 'live', ledgerSource, ...snapshot });
  } catch (err) {
    console.error('[api/agent-economy-data] Error:', err?.message || err);
    if (cached) {
      res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
      return res.status(200).json({ source: 'stale-cache', ledgerSource: 'stale-cache', ...cached });
    }
    return res.status(503).json({ error: 'fetch_failed' });
  }
}
