#!/usr/bin/env python3
"""Session 73 grove revisions — count-asserted, two-phase (verify all, then apply all).

Revisions:
 1. NUT label Trunk -> Roots (graphic trunk/rootstock position kept)
 2. wstETH droplet rainwater icon (token card + gtETH pool card)
 3. Grafts dual token+pool: 5 Balancer v3 BPT token cards + descriptions + addresses + sitemap + llms
 4. wNUT observatory: keyless eth_getLogs event-tape fallback + Est. market cap
 5. TOOLS.md Etherscan evaluated-NOT-integrated row
 + audit fixes: scion sitemap + llms entries (7 scions missing)
"""
import pathlib
import sys

ROOT = pathlib.Path('/a0/usr/projects/peanutoshi')

GRAFT_CARDS = '''    {
      name: "gtINF",
      role: "Inference Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% VVV / 40% DIEM. Sunflower Grove Batch I.",
      color: "#A78BFA",
      icon: "🌻🧠",
      address: "0x6a0a1B7428d543524592eD22023A09BdE05aA466",
      link: "https://basescan.org/address/0x6a0a1B7428d543524592eD22023A09BdE05aA466",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
    {
      name: "gtAGT",
      role: "Agent Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% VIRTUAL / 40% MOR. Sunflower Grove Batch I.",
      color: "#6EE7B7",
      icon: "🌻🤖",
      address: "0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200",
      link: "https://basescan.org/address/0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
    {
      name: "gtETH",
      role: "Ether Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% cbETH / 40% wstETH. Sunflower Grove Batch I.",
      color: "#8FBF6B",
      icon: "🌻💧",
      address: "0xd156d51219B3a7A590670d655E8740Ad404e8835",
      link: "https://basescan.org/address/0xd156d51219B3a7A590670d655E8740Ad404e8835",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
    {
      name: "gtBTC",
      role: "Bitcoin Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% cbBTC / 40% tBTC. Sunflower Grove Batch I.",
      color: "#F0B35B",
      icon: "🌻₿",
      address: "0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4",
      link: "https://basescan.org/address/0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
    {
      name: "gtFX",
      role: "FX Twin Graft BPT",
      utility: "Balancer v3 weighted pool token — 20% wNUT rootstock / 40% USDC / 40% EURC. Sunflower Grove Batch I.",
      color: "#7FB3E8",
      icon: "🌻€",
      address: "0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E",
      link: "https://basescan.org/address/0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E",
      tags: ["Graft", "Balancer v3", "BPT", "wNUT"],
    },
'''

GRAFT_DESCRIPTIONS = '''  gtINF: 'Balancer v3 weighted pool token (BPT) of the Inference Twin Graft — 20% wNUT rootstock, 40% VVV, 40% DIEM. Sunflower Grove Batch I: the pool contract itself is the ERC-20, so token and pool share one address.',
  gtAGT: 'Balancer v3 weighted pool token (BPT) of the Agent Twin Graft — 20% wNUT rootstock, 40% VIRTUAL, 40% MOR. Sunflower Grove Batch I: the pool contract itself is the ERC-20, so token and pool share one address.',
  gtETH: 'Balancer v3 weighted pool token (BPT) of the Ether Twin Graft — 20% wNUT rootstock, 40% cbETH, 40% wstETH. Sunflower Grove Batch I: the pool contract itself is the ERC-20, so token and pool share one address.',
  gtBTC: 'Balancer v3 weighted pool token (BPT) of the Bitcoin Twin Graft — 20% wNUT rootstock, 40% cbBTC, 40% tBTC. Sunflower Grove Batch I: the pool contract itself is the ERC-20, so token and pool share one address.',
  gtFX: 'Balancer v3 weighted pool token (BPT) of the FX Twin Graft — 20% wNUT rootstock, 40% USDC, 40% EURC. Sunflower Grove Batch I: the pool contract itself is the ERC-20, so token and pool share one address.',
'''

GRAFT_ADDRESSES = '''  // Sunflower Grove Batch I graft pool tokens (Balancer v3 BPTs — pool contract IS the ERC-20)
  gtINF:   '0x6a0a1B7428d543524592eD22023A09BdE05aA466',
  gtAGT:   '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200',
  gtETH:   '0xd156d51219B3a7A590670d655E8740Ad404e8835',
  gtBTC:   '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4',
  gtFX:    '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E',
'''

RPC_TAPE_BLOCK = '''// ── Event tape: Moralis (keyed) with keyless RPC fallback ────────────────────
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
'''

SITEMAP_ADDITIONS = '''  <url><loc>https://orchard.basednut.com/token/vvv</loc><changefreq>daily</changefreq><priority>0.5</priority></url>
  <url><loc>https://orchard.basednut.com/token/diem</loc><changefreq>daily</changefreq><priority>0.5</priority></url>
  <url><loc>https://orchard.basednut.com/token/virtual</loc><changefreq>daily</changefreq><priority>0.5</priority></url>
  <url><loc>https://orchard.basednut.com/token/mor</loc><changefreq>daily</changefreq><priority>0.5</priority></url>
  <url><loc>https://orchard.basednut.com/token/wsteth</loc><changefreq>daily</changefreq><priority>0.5</priority></url>
  <url><loc>https://orchard.basednut.com/token/tbtc</loc><changefreq>daily</changefreq><priority>0.5</priority></url>
  <url><loc>https://orchard.basednut.com/token/eurc</loc><changefreq>daily</changefreq><priority>0.5</priority></url>
  <url><loc>https://orchard.basednut.com/token/gtinf</loc><changefreq>daily</changefreq><priority>0.6</priority></url>
  <url><loc>https://orchard.basednut.com/token/gtagt</loc><changefreq>daily</changefreq><priority>0.6</priority></url>
  <url><loc>https://orchard.basednut.com/token/gteth</loc><changefreq>daily</changefreq><priority>0.6</priority></url>
  <url><loc>https://orchard.basednut.com/token/gtbtc</loc><changefreq>daily</changefreq><priority>0.6</priority></url>
  <url><loc>https://orchard.basednut.com/token/gtfx</loc><changefreq>daily</changefreq><priority>0.6</priority></url>
'''

LLMS_ADDITIONS = '''- [gtINF](/token/gtinf): Inference Twin Graft — Balancer v3 BPT, 20% wNUT / 40% VVV / 40% DIEM (Sunflower Grove)
- [gtAGT](/token/gtagt): Agent Twin Graft — Balancer v3 BPT, 20% wNUT / 40% VIRTUAL / 40% MOR (Sunflower Grove)
- [gtETH](/token/gteth): Ether Twin Graft — Balancer v3 BPT, 20% wNUT / 40% cbETH / 40% wstETH (Sunflower Grove)
- [gtBTC](/token/gtbtc): Bitcoin Twin Graft — Balancer v3 BPT, 20% wNUT / 40% cbBTC / 40% tBTC (Sunflower Grove)
- [gtFX](/token/gtfx): FX Twin Graft — Balancer v3 BPT, 20% wNUT / 40% USDC / 40% EURC (Sunflower Grove)
- [VVV](/token/vvv): Venice AI — inference scion grafted with wNUT in gtINF
- [DIEM](/token/diem): DIEM — inference scion grafted with wNUT in gtINF
- [VIRTUAL](/token/virtual): Virtuals Protocol — agent scion grafted with wNUT in gtAGT
- [MOR](/token/mor): Morpheus — agent scion grafted with wNUT in gtAGT
- [wstETH](/token/wsteth): Lido wrapped staked ETH — ether scion grafted with wNUT in gtETH
- [tBTC](/token/tbtc): Threshold Bitcoin — bitcoin scion grafted with wNUT in gtBTC
- [EURC](/token/eurc): Circle euro stablecoin — FX scion grafted with wNUT in gtFX
'''

# (relpath, old, new, expected_count)
OPS = [
    # 1. Roots rename
    ('site/components/FilterTokens.js',
     'const filters = ["All", "Trunk", "Branch", "Nested", "Soil"];',
     'const filters = ["All", "Roots", "Branch", "Nested", "Soil"];', 1),
    ('site/pages/index.js',
     'category: "Trunk"', 'category: "Roots"', 1),
    ('site/pages/token/[id].js',
     "case 'Trunk': return", "case 'Roots': return", 1),
    ('site/pages/token/[id].js',
     "category: 'Trunk'", "category: 'Roots'", 2),
    ('site/pages/token/nut.js',
     'label="Trunk"', 'label="Roots"', 1),
    ('site/pages/tree.js',
     '<span>🌰 Trunk / roots = NUT anchor</span>',
     '<span>🌰 Roots = NUT anchor</span>', 1),
    # 2. wstETH droplet
    ('site/utils/fetchTokens.js',
     'icon: "🌀",', 'icon: "💧",', 1),
    ('site/utils/fetchPools.js',
     'icon: "🌻🌀",', 'icon: "🌻💧",', 1),
    # 3. Graft dual token+pool
    ('site/utils/fetchTokens.js',
     '  ],\n  soil: [',
     GRAFT_CARDS + '  ],\n  soil: [', 1),
    ('site/pages/token/[id].js',
     "  NUTINO: 'Mint Club bonding curve token backed by NUT. Two-venue arb loop: mint with NUT → sell for cbBTC on Uniswap V2.',",
     "  NUTINO: 'Mint Club bonding curve token backed by NUT. Two-venue arb loop: mint with NUT → sell for cbBTC on Uniswap V2.',\n" + GRAFT_DESCRIPTIONS, 1),
    ('site/utils/tokenDataSources.js',
     "  EURC:    '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',\n};",
     "  EURC:    '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',\n" + GRAFT_ADDRESSES + '};', 1),
    ('site/public/sitemap.xml',
     '  <url><loc>https://orchard.basednut.com/token/wnut</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>',
     '  <url><loc>https://orchard.basednut.com/token/wnut</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>\n' + SITEMAP_ADDITIONS.rstrip('\n'), 1),
    ('site/public/llms.txt',
     '- [PNUTRMY](/token/pnutrmy): Peanut Soldiers NFT — 5,013 supply',
     '- [PNUTRMY](/token/pnutrmy): Peanut Soldiers NFT — 5,013 supply\n' + LLMS_ADDITIONS.rstrip('\n'), 1),
    # 4. wNUT keyless tape + est market cap
    ('site/utils/wnutDataSources.js',
     '// State (supply/backing/block) from Base RPC; event history from Moralis ERC20 transfers.',
     '// State (supply/backing/block) from Base RPC; event history from Moralis (keyed) or keyless eth_getLogs tape.', 1),
    ('site/utils/wnutDataSources.js',
     "const MORALIS_KEY = process.env.MORALIS_API_KEY || '';",
     "const MORALIS_KEY = process.env.MORALIS_API_KEY || '';\n\n// Keyless event-tape fallback — eth_getLogs Transfer logs from the wNUT deploy block.\nconst TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';\nconst WNUT_DEPLOY_BLOCK = 50507871; // wNUT deploy block — first wrap tx 0xbfc0...2ef75\nconst LOG_CHUNK = 10000; // mainnet.base.org rejects wider ranges (HTTP 413)", 1),
    ('site/utils/wnutDataSources.js',
     'async function fetchEvents() {\n  if (!MORALIS_KEY)',
     'async function fetchEventsMoralis() {\n  if (!MORALIS_KEY)', 1),
    ('site/utils/wnutDataSources.js',
     '  return { events, error: null };\n}',
     '  return { events, error: null };\n}\n\n' + RPC_TAPE_BLOCK, 1),
    ('site/utils/wnutDataSources.js',
     "  const backingValueUsd = state.underlyingBalance != null && nutPriceUsd != null\n    ? state.underlyingBalance * nutPriceUsd\n    : null;",
     "  const backingValueUsd = state.underlyingBalance != null && nutPriceUsd != null\n    ? state.underlyingBalance * nutPriceUsd\n    : null;\n\n  // Estimated market cap: wNUT circulating supply × live NUT price.\n  // Equals backing value while the 1:1 invariant holds; kept separate for honesty.\n  const estMarketCapUsd = state.totalSupply != null && nutPriceUsd != null\n    ? state.totalSupply * nutPriceUsd\n    : null;", 1),
    ('site/utils/wnutDataSources.js',
     '  return {\n    ...state,\n    backingValueUsd,\n    nutPriceUsd,',
     '  return {\n    ...state,\n    backingValueUsd,\n    estMarketCapUsd,\n    nutPriceUsd,', 1),
    ('site/pages/token/wnut.js',
     '          <StatRow label="Backing surplus" value={fmtNum(data?.backingSurplus) + \' NUT\'} source="must stay 0" />',
     '          <StatRow label="Backing surplus" value={fmtNum(data?.backingSurplus) + \' NUT\'} source="must stay 0" />\n          <StatRow label="Est. market cap" value={fmtUsd(data?.estMarketCapUsd)} source="wNUT supply × NUT price" />', 1),
    # 5. Etherscan row
    ('TOOLS.md',
     '| BaseScan pNUT | `https://basescan.org/token/0x2a5757b60987ff10385de1d4d923792f6fdcff1` | Contract/token state | Verify chain/address |',
     '| BaseScan pNUT | `https://basescan.org/token/0x2a5757b60987ff10385de1d4d923792f6fdcfff1` | Contract/token state | Verify chain/address |\n| Etherscan V2 | `https://docs.etherscan.io/` | Unified 60+ chain explorer API, skills, CLI | Evaluated 2026-09-01 — Base mainnet paid-tier, free source/ABI only — NOT integrated (Base RPC + Multicall3 cover reads at $0) |', 1),
    # 6. test wiring
    ('site/package.json',
     'node tests/groveCards.test.mjs"',
     'node tests/groveCards.test.mjs && node tests/groveRevisions.test.mjs"', 1),
]


def run(apply):
    failures = []
    for relpath, old, new, expected in OPS:
        p = ROOT / relpath
        s = p.read_text()
        n = s.count(old)
        if n != expected:
            failures.append(f'{relpath}: expected {expected}, found {n} :: {old[:70]!r}')
            continue
        if apply:
            p.write_text(s.replace(old, new))
            print(f'OK   {relpath} :: {old[:52]!r} x{expected}')
    return failures


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'verify'
    do_apply = mode == 'apply'
    fails = run(do_apply)
    if fails:
        print(f'\nFAILED ({len(fails)} anchor mismatches) — nothing written' if not do_apply else f'\nPARTIAL — {len(fails)} mismatches')
        for f in fails:
            print('  ' + f)
        sys.exit(1)
    print(f'\n{"APPLIED" if do_apply else "VERIFIED"} — {len(OPS)} ops, all anchors matched')
