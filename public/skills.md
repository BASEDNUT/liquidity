# BASED NUT Liquidity Portal — Skills & Capabilities

> A Next.js frontend for the BASED NUT DeFi ecosystem on Base (Coinbase L2). This document describes the site's architecture, data sources, and capabilities for developers and AI agents.

## Architecture

- **Framework**: Next.js (Pages Router) with static export support
- **Chain**: Base mainnet (chainId 8453)
- **Styling**: MUI (Material-UI) with custom orchard theme (browns, creams, warm tones)
- **Data**: 100% live on-chain data — zero hard-coded numbers
- **Deployment**: Vercel (liquidity-six.vercel.app)

## Data Sources (all free, no API keys)

1. **GeckoTerminal API (GT)** — token prices, volume, market cap, pool data
2. **DexScreener API (DS)** — DEX pair prices, liquidity, volume (cannot handle UniV3)
3. **Base RPC (RPC)** — on-chain totalSupply, decimals, balanceOf, slot0, getReserves
4. **CoinGecko API (CG)** — aggregated price data
5. **Balancer GraphQL API (BAL)** — pNUT pool data (totalLiquidity, APR, NAV, token balances)

Each source is labeled in price displays: GT, DS, RPC, CG, BAL.

## Core Tokens

| Token | Address | Supply | Decimals | Tax |
|-------|---------|--------|----------|-----|
| NUT | 0xb8de15fb529d98c93c749de63c749d48d25a30df | 1 | 18 | 0% |
| SNUT | 0xAC130701aa31c284c36609E2489f150F419AD7AD | 100,000 | 9 | 1% |
| pNUT | 0x2a5757b60987ff10385de1d4d923792f6fdcfff1 | variable | 18 | 0% (unwrapping triggers SNUT fee) |
| SALT | 0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81 | variable | 18 | 1% royalty (Mint Club) |
| NUTINO | 0x30421e2d18dFF60B298eEF427cF868cA65f1476B | variable | 18 | 1% royalty (Mint Club) |
| PIPS | 0x3f2327221dd4f0bae660172606d6b288a1cf8ad9 | 1,000,000,000 | 18 | 1%/1% configured; only official Virtuals pair registered |

## NFT Collections

| Collection | Address | Supply |
|------------|---------|--------|
| P-NUTS (Peanut War Generals) | 0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387 | 251 |
| ALMD (Almond War Generals) | 0x1A160456005AED47994E1c13C9bc31F274413927 | 424 |
| S-ALMD (Almond Soldiers) | 0x1E0f80529593185C021043ffcbfDcB8f4279C649 | 6,238 |
| PNUTRMY (Peanut Soldiers) | 0xF075300b8C2EF500d8Ce4f783F910C500B9A3512 | 5,013 |

## Liquidity Pools

| Pool | Address | Type |
|------|---------|------|
| NUT/WETH | 0xe3ce00e2ed742b142c15eedc208657dd22aa987e | Uniswap V3 |
| NUT/WETH | 0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53 | Uniswap V2 |
| NUT/AERO | 0x38630fede5e2032652640d98b2d3f9c6296eea5d | Aerodrome V2 |
| NUT/cbBTC | 0x15385c9281bc12d2e9bf5c081621944b0ee2acca | Aerodrome V2 |
| SNUT/NUT | 0x893faaa7baf7a8247fc7142afb28e13d51a5aae8 | Aerodrome V2 |
| SNUT/WETH | 0xB22895d2ee6e29395F30Ec47c8D9FE0d55355AE1 | Uniswap V2 |
| NUTINO/cbBTC | 0xeafde67d470480d14139e3d91164c158b82b38e2 | Uniswap V2 |
| SALT/USDC | 0x64ca0b147f625007b6f082abbb3ba217930eccb2 | Aerodrome V2 |
| PIPS/NUT | 0x7f8e532cf1be9ed688adb9e6585bc69f017201b5 | Aerodrome Slipstream CL |
| PIPS/USDC | 0xb19e3af68bb307369e8772a9e157431fcfe9dd44 | Balancer V3 reCLAMM |
| pNUT (Balancer) | 0x2a5757b60987ff10385de1d4d923792f6fdcfff1 | Balancer V2 Weighted |
| SNUT-LP/ETH (meta-pool) | 0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c | Aerodrome V2 |

## Pool Roles

1. **ANCHOR** — Uniswap V3 NUT/WETH (protocol-owned, deepest liquidity, primary price discovery)
2. **REWARD** — Aerodrome pools with bribe incentives via gauge reward-positions
3. **INDEX** — Balancer V2 pNUT pool (25% each cbETH/cbBTC/NUT/SNUT)
4. **NESTED** — Mint Club bonding curve tokens and NFT Sudoswap pools, backed by locked NUT

## SNUT Tax — 1% total (was 6% — cut Session 30, 2026-07-30)

- Streams: liquidity, manager wallet, buyback/burn, NUT rewards
- Live per-stream rates are read from the SNUT contract on `/token/snut`

## Arbitrage Loops (9 total)

1. Cross-Venue NUT Arbitrage (Beginner)
2. pNUT NAV Drift Arbitrage (Expert)
3. SALT Loop — Mint Club to Aerodrome (Advanced)
4. NUTINO Loop — Mint Club to Uniswap V2 (Advanced)
5. SNUT Buyback/Burn Capture (Beginner)
6. NFT Fractional Arbitrage (Intermediate)
7. SNUT-LP Meta-Pool Arbitrage (Expert)
8. Forced Liquidity Arbitrage (Expert)
9. Balancer Basket Drift (Advanced)

## Pages

- `/` — Homepage with ecosystem overview, token cards, live market data (SSR)
- `/tokens` — All tokens overview with filters
- `/token/[id]` — Individual token profiles (NUT, SNUT, pNUT, SALT, NUTINO, NFTs)
- `/token/snut` — Dedicated SNUT page with live burn tracker, tax flow, recursive flywheel
- `/staking` — Active reward-position pools, vaults, and TVL
- `/arb-bot` — 9 arbitrage loops with execution strategies, machine-readable JSON spec, risk disclaimer
- `/tree` — Visual token hierarchy and derivation tree
- `/great-nut-war` — Epic narrative of Peanut Republic vs Almond Empire
- `/warmachine` — Faction abilities and protocol defensive infrastructure
- `/nutinoMemes` — Community meme gallery
- `/chat` — Chat with Peanutoshi AI assistant
- `/images` — Media gallery
- `/faq` — 42 questions in 6 categories with search and accordion
- `/404` — Random peanut character error page
- `/429` — Rate limit error page
- `/500` — Server error page

## Important Notes

- NUT has supply=1 (unity token) — TRUE Price = TRUE Market Cap. Standard APIs miscalculate.
- SNUT is a non-escrow reward-position: hold to earn NUT rewards, no locking required.
- GitBook docs (docs.basednut.com) may be outdated — refer to on-chain data and this portal for current state.
- This is an EXPERIMENTAL MEMEFI project — NOT financial advice. Trade at your own risk.
