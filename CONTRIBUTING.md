# Contributing to BASED NUT Liquidity Portal

## Getting Started

1. Install Node.js 22+ (`nvm use`)
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in keys
4. `npm run dev` — runs on port 3000
5. `npm run build` — verify build passes (46+ pages)

## Code Style

- Next.js Pages Router
- MUI (Material-UI) with custom orchard theme
- 2-space indentation, LF line endings (see .editorconfig)
- No hard-coded token numbers — all data fetched live from on-chain sources
- Use "reward-position" not "staking" in user-facing text
- Use "experimental memefi" disclaimer where appropriate
- NUT is always uppercase in product terms

## Data Sources

All token data is fetched from free, no-API-key sources:
- GeckoTerminal (GT) — prices, volume, market cap
- DexScreener (DS) — DEX pair data (cannot handle UniV3)
- Base RPC (RPC) — on-chain supply, decimals, reserves
- CoinGecko (CG) — aggregated price data
- Balancer GraphQL API (BAL) — pNUT pool data

Label each source in price displays.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage (SSR) |
| `/tokens` | All tokens overview |
| `/token/[id]` | Individual token profiles |
| `/token/snut` | Dedicated SNUT page |
| `/staking` | Reward-position pools |
| `/arb-bot` | Arbitrage war room |
| `/tree` | Token hierarchy |
| `/faq` | FAQ with search + accordion |
| `/great-nut-war` | Lore narrative |
| `/warmachine` | Faction abilities |
| `/nutinoMemes` | Community memes |
| `/chat` | Peanutoshi AI chat |
| `/404`, `/429`, `/500` | Error pages |

## Build Verification

Before submitting changes:
1. `npm run build` must pass with 0 errors
2. All pages must render correctly
3. No hard-coded token prices or supplies
4. Check mobile responsiveness
5. Verify orchard theme consistency

## Pull Request Process

1. Create a feature branch from `main`
2. Make focused, minimal changes
3. Verify build passes
4. Describe what changed and why
5. Link any related issues

## Important Notes

- This is an EXPERIMENTAL MEMEFI project
- NOT financial advice — include disclaimers
- GitBook docs may be outdated — rely on on-chain data
- NUT has supply=1 — standard APIs miscalculate
