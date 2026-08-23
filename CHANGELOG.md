# Changelog

All notable changes to the BASED NUT Liquidity Portal are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed
- Removed incorrect "NFT fractionalization" references — Sudoswap pools are whole-NFT AMMs (bonding curves); no fractionalization exists in the ecosystem. Corrected FAQ (removed Q&A + 2 answers), arb-bot (loop 6, route, venues row, /nft-status), pool/token descriptions, skills.md, llms.txt. Arb loops 9 → 8.
- FAQ question count corrected to 46 (was 42)

### Added
- AGENTS.md — AI agent coding instructions
- skills.md — developer/AI architecture documentation
- llms.txt — LLM-friendly site summary
- robots.txt, sitemap.xml, manifest.json, .well-known/security.txt
- /429 error page with peanut character
- /nutinoMemes community gallery page
- FAQ expanded across 6 categories with search and accordion
- Arb-bot page: 8 arbitrage loops with 7 context fields each, risk disclaimer
- SNUT page: live burn tracker, tax flow diagram, recursive burn flywheel
- Homepage SSR via getServerSideProps for instant data rendering
- 404 error page with 4 random peanut character illustrations
- 500 error page with peanut character
- PIPS token profile + PIPS/NUT (Aerodrome Slipstream CL) + PIPS/USDC (Balancer V3 reCLAMM) in all registries, token/pool pages, arb-bot machine spec, skills.md

### Changed
- NFT supply numbers corrected to on-chain values (251/424/6238/5013)
- Terminology: "staking" → "reward-position" across all pages
- "Experimental memefi" disclaimer added to homepage, tokens, arb-bot, footer
- Pool page colors: purple/cyan → orchard palette
- Arb-bot: VAULTS + POOLS merged into single Address Registry
- Footer: removed Dune Dashboard link
- SNUT casing standardized (not sNUT)
- Palm tree emoji for meta-pool
- _app.js title: "Liquidity App" → "BASED NUT Liquidity Portal"
- SNUT tax 6% → 1% across token/pool/FAQ/arb-bot/skills
- NFT token descriptions refreshed with on-chain facts (supply, airdrop, Sudoswap venues)
- PIPS tax claims corrected to on-chain truth: 1%/1% configured, only official Virtuals pair registered; external pools untaxed today

### Fixed
- 23 critical bugs from full site audit (chat prompts, warmachine factions, FAQ address/supply, pool colors, 404/500 Layout+Head)
- Homepage loading: client-side useEffect → SSR getServerSideProps
- Chat.js timeout overwrite and prepackaged prompt bugs
- Warmachine.js: 6 faction ability bugs (3 missing, 3 mismatched)
- FAQ: P-NUTS address corrected, NFT supply fixed
- Error pages: beige background, tight spacing, large images
- Stale "6% Tax Breakdown" heading + 1.5% four-way split in arb-bot

## [1.0.0] - 2024-06-27

### Added
- Initial Next.js project with token pages, pools, staking, tree, great-nut-war, warmachine, chat, FAQ, images
- MUI orchard theme (browns, creams, warm tones)
- Live on-chain data from GeckoTerminal, DexScreener, Base RPC, CoinGecko, Balancer API
- Machine-readable JSON spec for arbitrage bot building
