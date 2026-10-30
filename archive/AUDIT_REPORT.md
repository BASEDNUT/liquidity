# COMPREHENSIVE AUDIT REPORT — Token & Pool Pages

## Executive Summary

The site has 3 custom token pages (NUT, SNUT, pNUT) that are rich with live data and charts. The remaining 11 token pages and all 20 pool pages use generic templates that range from decent to very sad with TBD values, missing content, and no live data fetching.

---

## TOKEN PAGES AUDIT

### Custom Pages (Reference — Good)
| Page | Data Sources | Charts | Live Data | Status |
|---|---|---|---|---|
| NUT (/token/nut) | /api/nut-data, nutDataSources.js | Bar chart (distribution) + DEX embed | ✅ Full | Rich, 8 sections |
| SNUT (/token/snut) | snutDataSources.js | DEX embed + burn tracker | ✅ Full | Rich, 8 sections |
| pNUT (/token/pnut) | /api/pnut-data | Bar chart (basket) + DEX embed | ✅ Full | Rich, 8 sections |

### Generic Pages — [id].js Template

| Token | Description | Tokenomics | Docs Link | Market Data | Chart Embed | Overall |
|---|---|---|---|---|---|---|
| NUTINO | ✅ | ✅ | ✅ | ✅ (TOKEN_ADDRESSES) | ✅ DEX | Good — has all sections |
| SALT | ✅ | ✅ | ✅ | ✅ (TOKEN_ADDRESSES) | ✅ DEX | Good — has all sections |
| PNUTS | ✅ | ❌ Missing | ❌ Missing | ❌ Not in TOKEN_ADDRESSES | ⚠️ Empty (Sudoswap) | Sad — no data, no tokenomics |
| ALMD | ✅ | ❌ Missing | ❌ Missing | ❌ Not in TOKEN_ADDRESSES | ⚠️ Empty (Sudoswap) | Sad — no data, no tokenomics |
| SALMD | ✅ | ❌ Missing | ❌ Missing | ❌ Not in TOKEN_ADDRESSES | ⚠️ Empty (Sudoswap) | Sad — no data, no tokenomics |
| PNUTRMY | ✅ | ❌ Missing | ❌ Missing | ❌ Not in TOKEN_ADDRESSES | ⚠️ Empty (Sudoswap) | Sad — no data, no tokenomics |
| cbETH | ❌ Missing | ❌ Missing | ❌ Missing | ✅ (TOKEN_ADDRESSES) | ✅ DEX | Sad — no description, stats only |
| cbBTC | ❌ Missing | ❌ Missing | ❌ Missing | ✅ (TOKEN_ADDRESSES) | ✅ DEX | Sad — no description, stats only |
| USDC | ❌ Missing | ❌ Missing | ❌ Missing | ✅ (TOKEN_ADDRESSES) | ✅ DEX | Sad — no description, stats only |
| AERO | ❌ Missing | ❌ Missing | ❌ Missing | ✅ (TOKEN_ADDRESSES) | ✅ DEX | Sad — no description, stats only |
| wETH | ❌ Missing | ❌ Missing | ❌ Missing | ✅ (TOKEN_ADDRESSES) | ✅ DEX | Sad — no description, stats only |

### Token Issues Detail

**NFT Tokens (PNUTS, ALMD, SALMD, PNUTRMY):**
- Have descriptions but NO tokenomics, NO docs links
- Not in TOKEN_ADDRESSES → no market data → all stats show 'TBD'
- Chart embed is empty — Sudoswap pools are not on DEX Screener
- Recommendation: Add tokenomics, add Mint Club / Sudoswap data source, add docs links, add NFT collection info (floor price, total supply, holders)

**Soil Tokens (cbETH, cbBTC, USDC, AERO, wETH):**
- NO description, NO tokenomics, NO docs links
- ARE in TOKEN_ADDRESSES → have market data (price, volume, liquidity)
- Have DEX chart embeds
- But pages look bare — just stats with no context about why they exist in the ecosystem
- Recommendation: Add descriptions explaining their role as 'soil' (collateral/base assets), add tokenomics, add docs links to external docs

---

## POOL PAGES AUDIT

### All 20 Pools — [id].js Template

| Pool | Platform | Chart | Live Stats | TVL | Holders/Transfers |
|---|---|---|---|---|---|
| NUT/wETH V3 | Uniswap V3 | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| NUT/wETH V2 | Uniswap V2 | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| SNUT/NUT | Aerodrome | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| pNUT | Balancer | ❌ None | ❌ TBD | ❌ TBD | ❌ Coming soon |
| NUT/AERO | Aerodrome | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| NUT/cbBTC | Aerodrome | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| SNUT/wETH | Uniswap V2 | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| SNUT-LP/wETH | Uniswap V2 | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| NUTINO/NUT | Uniswap V2 | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| NUTINO/cbBTC | Uniswap V2 | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| SALT/USDC | Aerodrome | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| NUT/SALT | Aerodrome | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| PNUTS/NUT | Sudoswap | ❌ None | ❌ TBD | ❌ TBD | ❌ Coming soon |
| ALMD/NUT | Sudoswap | ❌ None | ❌ TBD | ❌ TBD | ❌ Coming soon |
| SALMD/NUT | Sudoswap | ❌ None | ❌ TBD | ❌ TBD | ❌ Coming soon |
| PNUTRMY/NUT | Sudoswap | ❌ None | ❌ TBD | ❌ TBD | ❌ Coming soon |
| sPNUT/USDC | Aerodrome | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| PNUTS/USDC | Sudoswap | ❌ None | ❌ TBD | ❌ TBD | ❌ Coming soon |
| SALMD/cbETH | Uniswap V2 | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |
| ALMD/cbETH | Uniswap V2 | ✅ DEX | ❌ TBD | ❌ TBD | ❌ Coming soon |

### Pool Issues Detail

**CRITICAL: Live data exists but is NOT being used**
- `/api/market-data` route exists and fetches real pool data from GeckoTerminal, DexScreener, and Base RPC
- `utils/marketDataSources.js` has POOL_CONFIG with all 20 pool addresses
- But `pages/pool/[id].js` does NOT call this API — all stats are hardcoded as 'TBD'
- Fix: Wire pool/[id].js to fetch from /api/market-data and display real Price, Volume, Liquidity, TVL

**TVL is 'TBD' in static data**
- fetchPools.js has tvl: 'TBD' for all 20 pools
- The /api/market-data API can provide this

**No charts for 8 pools**
- 7 Sudoswap pools (NFT AMM) — not on DEX Screener
- 1 Balancer pool (compound) — not on DEX Screener
- These show empty chart placeholder areas
- Fix: Find alternative chart sources or display pool-specific visualizations

**Holders/Transfers show 'Coming soon'**
- Could be fetched from Basescan API or RPC

---

## PRIORITY FIX LIST

### P0 — High Impact, Data Already Available
1. **Wire pool/[id].js to /api/market-data** — The API exists and fetches real data, but pool pages don't call it. This would fix TBD stats for all 20 pools instantly.
2. **Add TOKEN_DESCRIPTIONS for soil tokens** (cbETH, cbBTC, USDC, AERO, wETH) — Explain their role as base/collateral assets in the ecosystem
3. **Add TOKENOMICS for NFT tokens** (PNUTS, ALMD, SALMD, PNUTRMY) — Supply, collection size, Sudoswap AMM details

### P1 — Medium Impact, Needs New Data Sources
4. **Add NFT tokens to TOKEN_ADDRESSES** and fetch market data from Mint Club / Sudoswap APIs
5. **Add DOCS_LINKS for all missing tokens** — Link to BasedNut docs or external docs
6. **Add TOKENOMICS for soil tokens** — Standard ERC20 info (supply, decimals, platform)

### P2 — Nice to Have
7. **Alternative charts for Sudoswap pools** — Mint Club price charts or custom visualizations
8. **Holders/Transfers data** — Basescan API or RPC calls
9. **Balancer pool chart** — Balancer-specific visualization
10. **Pool descriptions** — Explain each pool's role, arbitrage opportunities, flavor text

---

## FILES RELEVANT TO FIXES

- `pages/pool/[id].js` — Pool template (needs /api/market-data integration)
- `pages/token/[id].js` — Token template (needs more descriptions, tokenomics, docs links)
- `utils/fetchPools.js` — Static pool data (TVL is 'TBD')
- `utils/marketDataSources.js` — Pool data fetching (POOL_CONFIG with all addresses)
- `utils/tokenDataSources.js` — Token data fetching (TOKEN_ADDRESSES)
- `pages/api/market-data.js` — Pool market data API (exists, unused by pool pages)
- `pages/api/token-data.js` — Token market data API (exists, used by token pages)
