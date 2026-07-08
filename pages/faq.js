import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment, Chip, Stack, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

const CATEGORIES = [
  { id: 'basics', emoji: '🌰', label: 'Basics', color: '#5B3A29' },
  { id: 'tokens', emoji: '🌰', label: 'Tokens', color: '#7D5A50' },
  { id: 'arbitrage', emoji: '🔄', label: 'Arbitrage', color: '#A67C52' },
  { id: 'liquidity', emoji: '🏛️', label: 'Liquidity & Infra', color: '#8B5A2B' },
  { id: 'nfts', emoji: '🎨', label: 'NFTs & Lore', color: '#6B4226' },
  { id: 'risks', emoji: '⚠️', label: 'Risks & Community', color: '#B85C38' },
];

const FAQ_DATA = [
  // ─── BASICS ───
  {
    cat: 'basics',
    q: 'What is Based NUT?',
    a: 'Based NUT is a meme-themed DeFi experiment on the Base network (Coinbase L2). It features a unity token (NUT, supply=1), deflationary rewards (SNUT), a Balancer index basket (pNUT), and Mint Club bonding-curve tokens (SALT, NUTINO). No intrinsic value, no expectation of profit — pure peanut-powered DeFi.',
    links: [{ text: 'NUT profile', href: '/token/nut' }, { text: 'SNUT profile', href: '/token/snut' }, { text: 'pNUT profile', href: '/token/pnut' }]
  },
  {
    cat: 'basics',
    q: 'Is Based NUT intended as an investment?',
    a: 'No. The NUTpaper states that NUT tokens are meme coins without investment value. Treat it as entertainment and only risk what you can afford to lose.'
  },

  {
    cat: 'basics',
    q: 'What chain is BASED NUT on?',
    a: 'Base (Coinbase L2). All contracts, pools, and tokens are on Base mainnet. Explorer: basescan.org.'
  },
  {
    cat: 'basics',
    q: 'What is the NUT Sentiment Index (NSI)?',
    a: 'Peanutoshi NSI tracks market sentiment: green = bullish (rally the Nut Army), red = defensive (fortify liquidity positions), neutral = meme warfare mode. The NSI adapts strategy based on real-time market conditions.'
  },
  {
    cat: 'basics',
    q: 'What is the MetaDEX / NUTDEX framework?',
    a: 'BASED NUT is described as a universal liquidity layer framework — a MetaDEX that combines protocol-owned liquidity (UniV3), community-driven pools (Aerodrome vAMM), and bonding-curve token minting into a single interconnected system. NUT sits at the root as the main liquidity anchor, with all nested tokens and NFTs deriving value from it.'
  },
  {
    cat: 'basics',
    q: 'What is the Smart Agent System?',
    a: 'Peanutoshi Nutkamoto is the official BASED NUT AI agent — a DeFi Meme Oracle and Liquidity Warlord that provides market insights, arbitrage analysis, and ecosystem guidance. Peanutoshi uses the NUT Sentiment Index (NSI) to adapt strategy based on market conditions. You can chat with Peanutoshi on the portal.',
    links: [{ text: 'Chat with Peanutoshi', href: '/chat' }]
  },
  {
    cat: 'basics',
    q: 'What are the ecosystem layers?',
    a: 'The ecosystem has three layers: (1) BASED NUTs — the foundation layer with NUT (unity token), SNUT (deflationary rewards), and pNUT (index basket). (2) NESTED TOKENS — Mint Club bonding-curve tokens like SALT and NUTINO, backed by locked NUT. (3) NESTED NFTs — War Generals and Soldiers minted with locked NUT, representing factions in the Great Nut War.'
  },

  // ─── TOKENS ───
  {
    cat: 'tokens',
    q: 'What core tokens compose the ecosystem?',
    a: 'The ecosystem base layer is NUT (0xb8de15fb529d98c93c749de63c749d48d25a30df, supply=1), deflationary layer SNUT (0xAC130701aa31c284c36609E2489f150F419AD7AD, supply=100,000), and Balancer index token pNUT (0x2a5757b60987ff10385de1d4d923792f6fdcfff1). Mint Club tokens SALT and NUTINO are backed by NUT.'
  },
  {
    cat: 'tokens',
    q: 'What is NUT?',
    a: 'NUT is the unity token. Supply = 1 (one indivisible token), ERC-20 capped at 1. No transaction tax, no team allocation. Stealth-launched on Uniswap V3 with zero ETH paired. NUT is the anchor asset — all Mint Club tokens (SALT, NUTINO) are backed by NUT. TRUE Price = TRUE Market Cap. Held in 4 liquidity venues: Uniswap V3 (NUT/WETH), Uniswap V2 (NUT/WETH), Aerodrome (NUT/AERO), Aerodrome (NUT/cbBTC). Cross-venue price differences create arbitrage.',
    links: [{ text: 'View NUT profile', href: '/token/nut' }]
  },
  {
    cat: 'tokens',
    q: 'What is SNUT?',
    a: 'SNUT is a deflationary reward-position token. Supply = 100,000, decimals = 9. SNUT has a 6% tax on every transaction. Holding SNUT automatically earns NUT rewards via non-escrow reward-position — no locking required. SNUT buyback/burn mechanism permanently reduces both SNUT and NUT supply.',
    links: [{ text: 'View SNUT page', href: '/token/snut' }]
  },
  {
    cat: 'tokens',
    q: 'What is the SNUT transaction tax?',
    a: 'SNUT has a 6% tax on every transaction, split equally: 1.5% adds liquidity, 1.5% goes to manager wallet, 1.5% funds buyback/burn (burns both SNUT and NUT), 1.5% distributes reward-position rewards. Holding SNUT automatically earns NUT rewards via non-escrow reward-position — no locking required.'
  },
  {
    cat: 'tokens',
    q: 'What is pNUT?',
    a: 'pNUT is a Balancer V2 Weighted Pool BPT holding 25% each of cbETH, cbBTC, NUT, and SNUT. Pool ID: 0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000019e. NAV = totalLiquidity / totalShares. Inflationary counterbalance to SNUT deflation.',
    links: [{ text: 'View pNUT profile', href: '/token/pnut' }, { text: 'View on Balancer', href: 'https://app.balancer.fi/#/base/pool/0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000019e' }]
  },
  {
    cat: 'tokens',
    q: 'What is the difference between NUT, SNUT, and pNUT?',
    a: 'NUT: anchor token, supply=1, no tax. SNUT: deflationary reward-position token, supply=100,000, 6% tax, hold to earn NUT via non-escrow reward-position. pNUT: Balancer V2 index basket holding 25% each of cbETH, cbBTC, NUT, SNUT — inflationary counterbalance to SNUT.'
  },
  {
    cat: 'tokens',
    q: 'What are SALT and NUTINO?',
    a: 'Mint Club bonding-curve tokens backed by NUT. SALT (0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81): mint on Mint Club, sell on Aerodrome SALT/USDC. NUTINO (0x30421e2d18dFF60B298eEF427cF868cA65f1476B): mint on Mint Club, sell on Uniswap V2 NUTINO/cbBTC. Bonding curve price = NUT_locked / token_supply. 1% royalty on mint/burn.'
  },
  {
    cat: 'tokens',
    q: 'How are nested tokens created?',
    a: 'Nested tokens are minted on Mint Club using NUT as collateral. Price is determined by bonding-curve contracts: price = NUT_locked / token_supply. Buy price != sell price (significant spread). 1% royalty on mint/burn. Users can arbitrage by minting when the curve price is lower than the market price, or burning when the curve price is higher.',
    links: [{ text: 'SALT profile', href: '/token/salt' }, { text: 'NUTINO profile', href: '/token/nutino' }]
  },
  {
    cat: 'tokens',
    q: 'Which nested tokens exist?',
    a: 'SALT (0x1EDe2AFC985F6D7aEb3F4c84B95A103c00D5dE81) — two-venue arbitrage loop via Aerodrome SALT/USDC pool. NUTINO (0x30421e2d18dFF60B298eEF427cF868cA65f1476B) — arbitrage via Uniswap V2 NUTINO/cbBTC pool. Mint Club lists 14 NUT-backed tokens. SALT was airdropped to NUT Army NFT holders (200/NFT for Generals, 80/NFT for Soldiers). 7,420,420 SALT allocated to the Salt Forge vault.'
  },
  {
    cat: 'tokens',
    q: 'What role does Mint Club play?',
    a: 'Mint Club (mint.club) is the hub for NUT-backed child tokens. It lists existing tokens with prices and TVL and lets anyone deploy new NUT-collateralised tokens via bonding curves.',
    links: [{ text: 'SALT on Mint Club', href: 'https://mint.club/base/salt' }, { text: 'NUTINO on Mint Club', href: 'https://mint.club/base/nutino' }]
  },
  {
    cat: 'tokens',
    q: 'Why does NUT have a supply of 1?',
    a: 'NUT is a unity token — indivisible, ERC-20 capped at 1. TRUE Price = TRUE Market Cap. Standard APIs (CoinGecko, DexScreener) often miscalculate because they expect normal supply. Always check on-chain via Base RPC for accurate pricing.'
  },
  {
    cat: 'tokens',
    q: 'Why do prices differ between sources?',
    a: 'NUT supply=1 causes standard APIs to miscalculate market cap and price. Different DEX venues (Uniswap V3, V2, Aerodrome) can have different prices for the same token. This is a feature, not a bug — these price differences ARE the arbitrage opportunities. Our portal shows prices from GeckoTerminal (GT), DexScreener (DS), Base RPC (RPC), CoinGecko (CG), and Balancer (BAL) with source labels.'
  },
  {
    cat: 'tokens',
    q: 'What is the Mint Club SDK?',
    a: 'The Mint Club SDK (mint.club-v2-sdk) is an npm package for interacting with Mint Club bonding curves programmatically. Install with npm i mint.club-v2-sdk. Key methods: getTotalSupply() for current token supply, buy() for minting tokens via the bonding curve, sell() for burning tokens back to NUT. Requires viem and a wallet for transactions. Reference: sdk.mint.club.',
    links: [{ text: 'Arb-bot Getting Started', href: '/arb-bot' }]
  },

  // ─── ARBITRAGE ───
  {
    cat: 'arbitrage',
    q: 'What arbitrage opportunities exist?',
    a: 'Multiple loops: (1) SALT: mint on Mint Club → sell on Aerodrome SALT/USDC. (2) NUTINO: mint on Mint Club → sell on Uniswap V2 NUTINO/cbBTC. (3) pNUT drift: buy pNUT when market price < NAV, redeem basket; mint pNUT when market price > NAV, sell. (4) Cross-pool NUT arbitrage between Uniswap V3, V2, and Aerodrome. (5) NFT fractional: OpenSea vs Sudoswap vs intrinsic redeemable NUT.',
    links: [{ text: 'Arb Bot War Room', href: '/arb-bot' }]
  },
  {
    cat: 'arbitrage',
    q: 'How does the SALT arbitrage loop work?',
    a: 'Forward: mint SALT on Mint Club (pay NUT) → sell on Aerodrome SALT/USDC pool (receive USDC). Reverse: buy SALT on Aerodrome → burn on Mint Club (receive NUT). Profit when price discrepancy exists between bonding curve and DEX, after accounting for 1% royalty, curve spread, and gas.',
    links: [{ text: 'Full route details', href: '/arb-bot' }]
  },
  {
    cat: 'arbitrage',
    q: 'What is pNUT drift arbitrage?',
    a: 'pNUT is a Balancer V2 weighted pool. When market price < NAV: buy pNUT and redeem basket (cbETH, cbBTC, NUT, SNUT). When market price > NAV: mint pNUT and sell. NAV = totalLiquidity / totalShares.',
    links: [{ text: 'Full formula and steps', href: '/arb-bot' }]
  },
  {
    cat: 'arbitrage',
    q: 'How can I build an arbitrage bot?',
    a: 'Visit the Arb Bot Builder War Room for a complete guide including all arbitrage loops, machine-readable JSON spec with route IDs and contract addresses, execution doctrine, and getting started steps including Mint Club SDK installation.',
    links: [{ text: 'Arb Bot War Room', href: '/arb-bot' }]
  },

  // ─── LIQUIDITY & INFRA ───
  {
    cat: 'liquidity',
    q: 'Where is liquidity provided?',
    a: 'NUT: Uniswap V3 (NUT/WETH), Uniswap V2 (NUT/WETH), Aerodrome (NUT/AERO), Aerodrome (NUT/cbBTC). SNUT: Aerodrome (SNUT/NUT), Uniswap V2 (SNUT/WETH). pNUT: Balancer V2 weighted pool (cbETH/cbBTC/NUT/SNUT). SALT: Aerodrome (SALT/USDC). NUTINO: Uniswap V2 (NUTINO/cbBTC). Aerodrome pools have bribe incentives via gauge reward-position.'
  },
  {
    cat: 'liquidity',
    q: 'Are there transaction taxes?',
    a: 'NUT: no tax. SNUT: 6% fee (1.5% liquidity + 1.5% manager + 1.5% buyback/burn + 1.5% reward-position). pNUT: no explicit tax but unwrapping triggers SNUT fee since SNUT is a component. Mint Club tokens: 1% royalty on mint/burn.'
  },
  {
    cat: 'liquidity',
    q: 'What deflationary or inflationary forces exist?',
    a: 'NUT: supply fixed at 1, cannot expand. SNUT: deflationary — 6% transaction tax funds buyback/burn at dead address (0x000000000000000000000000000000000000dEaD), permanently reducing supply. pNUT: inflationary — can be freely minted, but growth tempered by NUT and SNUT deflation. This creates a balanced deflationary/inflationary system.'
  },
  {
    cat: 'liquidity',
    q: 'Where are burned SNUT tokens sent?',
    a: 'Burned SNUT tokens are sent to the dead address 0x000000000000000000000000000000000000dEaD — permanently removed from circulation. The SNUT buyback/burn mechanism (funded by 1.5% of the 6% transaction tax) burns both SNUT and NUT at this address, reducing both supplies.',
    links: [{ text: 'View burn transactions on Basescan', href: 'https://basescan.org/address/0x000000000000000000000000000000000000dEaD' }]
  },
  {
    cat: 'liquidity',
    q: 'How is pNUT NAV calculated?',
    a: 'pNUT NAV = totalLiquidity / totalShares. The Balancer V2 weighted pool holds 25% each of cbETH, cbBTC, NUT, and SNUT. totalLiquidity is the sum of all component values in USD. totalShares is the BPT token supply. When market price < NAV: buy pNUT and redeem basket for profit. When market price > NAV: mint pNUT and sell components. Data fetched from Balancer GraphQL API (labeled BAL).'
  },
  {
    cat: 'liquidity',
    q: 'What data sources does this site use?',
    a: 'Five free sources, no API keys needed: (1) GeckoTerminal (GT) — token prices, volume, market cap. (2) DexScreener (DS) — DEX pair prices, liquidity, volume. (3) Base RPC (RPC) — on-chain totalSupply and decimals. (4) CoinGecko (CG) — aggregated price data. (5) Balancer API (BAL) — pNUT pool data (totalLiquidity, APR, NAV, token balances). Each source is labeled in price displays.'
  },
  {
    cat: 'liquidity',
    q: 'What role does Mint Club play in liquidity?',
    a: 'Mint Club (mint.club) is the hub for NUT-backed child tokens. It lists existing tokens with prices and TVL and lets anyone deploy new NUT-collateralised tokens via bonding curves. The bonding curve buy/sell spread acts as protocol revenue.'
  },

  // ─── NFTs & LORE ───
  {
    cat: 'nfts',
    q: 'What are NUT Army NFTs?',
    a: 'Peanut War Generals (P-NUTS, 251 supply) and Almond War Generals (ALMD, 424 supply) are the officer NFTs. Peanut Soldiers (PNUTRMY, 5,013 supply) and Almond Soldiers (S-ALMD, 6,238 supply) are the infantry NFTs. Minted with locked NUT, burnable to redeem underlying NUT. Bonding curves: linear for peanuts, exponential for almonds. SALT airdropped to NFT holders: 200 SALT/NFT for Generals, 80 SALT/NFT for Soldiers.',
    links: [{ text: 'View on OpenSea', href: 'https://opensea.io/collection/p-nuts' }]
  },
  {
    cat: 'nfts',
    q: 'What NFT collections exist in the ecosystem?',
    a: 'P-NUTS (0x794fcD89357C1CcF04a1a9A441ad4dB2Cd5EE387, 251 supply), ALMD (0x1A160456005AED47994E1c13C9bc31F274413927, 424 supply), S-ALMD (0x1E0f80529593185C021043ffcbfDcB8f4279C649, 6,238 supply), and PNUTRMY (0xF075300b8C2EF500d8Ce4f783F910C500B9A3512, 5,013 supply). Each has a Sudoswap fractionalization pool for AMM trading. NFT holders received SALT airdrops (200/NFT for Generals, 80/NFT for Soldiers).',
    links: [{ text: 'View on OpenSea', href: 'https://opensea.io/collection/p-nuts' }]
  },
  {
    cat: 'nfts',
    q: 'What is the "Great Nut War"?',
    a: 'A fictional narrative portraying a conflict between the Peanut Republic and Almond Empire over resources like Salt, Butter, Oil, Honey and Caramel. These resources are not active tokens; they are marked TBA.',
    links: [{ text: 'View the Great Nut War', href: '/great-nut-war' }]
  },

  // ─── RISKS & COMMUNITY ───
  {
    cat: 'risks',
    q: 'Are there plans for a DAO or governance?',
    a: 'No. There is no formal team, roadmap or governance mechanism. The project is community-driven.'
  },
  {
    cat: 'risks',
    q: 'What risks should users consider?',
    a: 'The NUTpaper warns that the ecosystem complexity and multilayered smart-contract structure may introduce vulnerabilities. No audits exist. Regulatory uncertainty. Participants should treat the project as entertainment and only risk what they can afford to lose. This is an experimental memefi project — NOT financial advice.'
  },
  {
    cat: 'risks',
    q: 'How does the community engage?',
    a: 'The culture emphasises memes and community interaction. Follow BASED NUT on Twitter, join the Liquidity Portal, and keep an eye on Mint Club for new tokens.',
    links: [{ text: 'Twitter', href: 'https://twitter.com/BASEDNUT_' }, { text: 'Liquidity Portal', href: '/' }]
  },

  // ─── PORTAL NAVIGATION ───
  {
    cat: 'basics',
    q: 'What can I do on this portal?',
    a: 'Explore the ecosystem: view live token data on the All Tokens page, dive into individual token profiles (NUT, SNUT, pNUT, SALT, NUTINO, NFTs), study arbitrage loops in the Arb Bot War Room, visualize token relationships on the Nut Tree, learn the lore in the Great Nut War and War Machine pages, browse NUTINO memes, or chat with Peanutoshi AI for real-time insights.',
    links: [{ text: 'All Tokens', href: '/tokens' }, { text: 'Nut Tree', href: '/tree' }, { text: 'Arb Bot War Room', href: '/arb-bot' }, { text: 'Chat with Peanutoshi', href: '/chat' }]
  },
  {
    cat: 'basics',
    q: 'What is the Nut Tree?',
    a: 'The Nut Tree is a visual hierarchy page showing how all tokens in the ecosystem derive from NUT. NUT sits at the root, branching into SNUT (deflationary layer), pNUT (index basket), and Mint Club tokens (SALT, NUTINO). NFT collections (P-NUTS, ALMD, S-ALMD, PNUTRMY) are also shown as NUT-backed assets. The tree makes it easy to understand the relationships between tokens at a glance.',
    links: [{ text: 'View Nut Tree', href: '/tree' }]
  },

  // ─── ADDITIONAL TOKENS ───
  {
    cat: 'tokens',
    q: 'How does the SNUT recursive burn flywheel work?',
    a: 'The SNUT burn flywheel is recursive and self-accelerating: (1) Every SNUT transaction has a 6% tax. (2) 1.5% funds buyback/burn — buying SNUT from the market and burning it to the dead address, plus burning an equivalent value of NUT. (3) Burning NUT (supply=1) increases NUT price. (4) Higher NUT price means the 1.5% buyback portion buys more SNUT to burn. (5) Less SNUT supply = higher SNUT price = more value for reward-position holders. (6) The cycle accelerates as supply decreases — a deflationary flywheel that compounds over time.',
    links: [{ text: 'View SNUT page', href: '/token/snut' }]
  },
  {
    cat: 'tokens',
    q: 'What is the SNUT-LP meta-pool (Palm Grove)?',
    a: 'The SNUT-LP meta-pool (0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c) is a specialized pool that holds SNUT liquidity pool tokens. It acts as a Palm Grove Graft Market — allowing SNUT LP tokens to be traded and valued independently. This creates an additional layer of liquidity for SNUT providers and opens new arbitrage vectors between SNUT spot price, SNUT LP value, and NUT.',
    links: [{ text: 'Arb Bot War Room', href: '/arb-bot' }]
  },

  // ─── ADDITIONAL LIQUIDITY ───
  {
    cat: 'liquidity',
    q: 'What are the pool roles in the ecosystem?',
    a: 'Four distinct pool roles: (1) ANCHOR — Uniswap V3 NUT/WETH (protocol-owned, deepest liquidity, primary price discovery). (2) REWARD — Aerodrome pools (NUT/AERO, NUT/cbBTC, SNUT/NUT) with bribe incentives via gauge reward-positions. (3) INDEX — Balancer V2 pNUT pool (25% cbETH/cbBTC/NUT/SNUT weighted basket). (4) NESTED — Mint Club bonding curve tokens and NFT Sudoswap pools, all backed by locked NUT.',
    links: [{ text: 'All Tokens', href: '/tokens' }, { text: 'Arb Bot War Room', href: '/arb-bot' }]
  },
  {
    cat: 'liquidity',
    q: 'Does the dead address hold liquidity?',
    a: 'Yes. The dead address (0x000000000000000000000000000000000000dEaD) holds burned SNUT and NUT tokens. As the buyback/burn mechanism operates, the dead address accumulates tokens that are permanently removed from circulation. This includes both burned SNUT (from the 1.5% buyback/burn tax portion) and burned NUT (equivalent value burned alongside SNUT). The dead address balance is displayed live on the SNUT page.',
    links: [{ text: 'View SNUT page', href: '/token/snut' }, { text: 'Check dead address on Basescan', href: 'https://basescan.org/address/0x000000000000000000000000000000000000dEaD' }]
  },
  {
    cat: 'liquidity',
    q: 'How do I provide liquidity to NUT pools?',
    a: 'To provide liquidity: (1) Get NUT and the pair token (WETH, AERO, cbBTC) on Base. (2) For Uniswap V3 (NUT/WETH): deposit via the V3 UI with your chosen fee tier. (3) For Aerodrome pools (NUT/AERO, NUT/cbBTC, SNUT/NUT): deposit via Aerodrome and stake LP tokens in the gauge to earn bribe rewards. (4) For Balancer pNUT: deposit any of the 4 basket components (cbETH, cbBTC, NUT, SNUT) to receive BPT. Note: providing liquidity involves impermanent loss risk — this is NOT financial advice.',
    links: [{ text: 'Uniswap V3 NUT/WETH', href: 'https://app.uniswap.org/#/pool/0xe3ce00e2ed742b142c15eedc208657dd22aa987e' }, { text: 'Aerodrome', href: 'https://aerodrome.finance' }, { text: 'Balancer', href: 'https://app.balancer.fi/#/base/pool/0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000019e' }]
  },

  // ─── ADDITIONAL NFTs ───
  {
    cat: 'nfts',
    q: 'How does NFT fractionalization work?',
    a: 'NFT collections use Sudoswap AMM pools for fractionalized trading. Each collection (P-NUTS, ALMD, S-ALMD, PNUTRMY) has a Sudoswap pool that allows buying and selling NFTs via bonding curves instead of fixed-price listings. Sudoswap addresses: P-NUTS (0x262bEaa785a0eF65f5D9C1b8BA5c41980D087ff3), ALMD (0x308C9BC0546723d6e4905c971cd34feBF1f94031), S-ALMD (0xeE7243F0E02e5890c6415B5CbAe58e0D0fb758a5). This creates price discovery for NFTs independent of OpenSea.',
    links: [{ text: 'Sudoswap', href: 'https://sudoswap.xyz' }]
  },
  {
    cat: 'nfts',
    q: 'What is the War Machine?',
    a: 'The War Machine page documents the faction abilities and protocol defensive infrastructure of the Great Nut War. Each faction (Peanuts, Almonds, Cashews, Pecans, Hazelnuts, Coconuts, Chestnuts) has unique abilities — from damage reduction to morale burn to resource stealing. The War Machine is a gamified representation of the ecosystem competitive dynamics.',
    links: [{ text: 'View War Machine', href: '/warmachine' }, { text: 'View Great Nut War', href: '/great-nut-war' }]
  },
  {
    cat: 'nfts',
    q: 'What are NUTINO memes?',
    a: 'NUTINO memes is a community gallery page featuring user-submitted memes and creative content from the BASED NUT ecosystem. It showcases the culture and humor of the Nut Army. Submit and browse nut-themed memes, NUTINO art, and community creations.',
    links: [{ text: 'View NUTINO Memes', href: '/nutinoMemes' }]
  },
];

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return FAQ_DATA;
    const q = search.toLowerCase();
    return FAQ_DATA.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [search]);

  const byCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((c) => (map[c.id] = []));
    filtered.forEach((item) => {
      if (map[item.cat]) map[item.cat].push(item);
    });
    return map;
  }, [filtered]);

  const handleChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Layout>
      <Head>
        <title>FAQ | BASED NUT</title>
        <meta name="description" content="Frequently asked questions about BASED NUT, tokens, liquidity, and ecosystem details." />
      </Head>
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, sm: 3 } }}>
        {/* Disclaimer */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, background: '#FFF3E0', border: '2px solid #B85C38', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: '#B85C38', fontWeight: 'bold' }}>
            ⚠️ EXPERIMENTAL MEMEFI PROJECT — NOT FINANCIAL ADVICE
          </Typography>
          <Typography variant="caption" sx={{ color: '#5B3A29', mt: 0.5, display: 'block' }}>
            BASED NUT is an experimental memefi project. All content is for educational and entertainment purposes only. Trade at your own risk.
          </Typography>
        </Paper>

        {/* Header */}
        <Typography variant="h3" sx={{ mb: 1, color: '#5B3A29', fontWeight: 'bold' }}>
          🌰 Based NUT FAQ
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: '#7D5A50' }}>
          Everything you need to know about the BASED NUT ecosystem. Playful, community-driven, and not investment advice.
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#A67C52' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Result count */}
        {search && (
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </Typography>
        )}

        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const items = byCategory[cat.id];
          if (!items || items.length === 0) return null;
          return (
            <Box key={cat.id} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h5" sx={{ color: cat.color, fontWeight: 'bold' }}>
                  {cat.emoji} {cat.label}
                </Typography>
                <Chip
                  label={items.length}
                  size="small"
                  sx={{ background: cat.color, color: '#FFF7EA', fontWeight: 'bold' }}
                />
              </Box>
              <Stack spacing={1}>
                {items.map((item, i) => {
                  const panelId = `${cat.id}-${i}`;
                  return (
                    <Accordion
                      key={panelId}
                      expanded={expanded === panelId}
                      onChange={handleChange(panelId)}
                      sx={{
                        background: '#FFF7EA',
                        border: '1px solid #E8DDD3',
                        borderRadius: '8px !important',
                        '&:before': { display: 'none' },
                        '&:hover': { borderColor: cat.color },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: cat.color }} />}>
                        <Typography sx={{ fontWeight: 600, color: '#3D2B1F' }}>{item.q}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Typography sx={{ color: '#5B3A29', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {item.a}
                        </Typography>
                        {item.links && item.links.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                            {item.links.map((link, j) => (
                              <Chip
                                key={j}
                                label={link.text}
                                component={link.href.startsWith('/') ? Link : 'a'}
                                {...(link.href.startsWith('/')
                                  ? { href: link.href }
                                  : { href: link.href, target: '_blank', rel: 'noopener noreferrer' })}
                                clickable
                                size="small"
                                sx={{
                                  background: cat.color + '20',
                                  color: cat.color,
                                  fontWeight: 'bold',
                                  border: `1px solid ${cat.color}40`,
                                  '&:hover': { background: cat.color + '30' },
                                }}
                              />
                            ))}
                          </Stack>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            </Box>
          );
        })}

        {/* No results */}
        {filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#7D5A50' }}>
              🌰 No questions match your search.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Try a different keyword.
            </Typography>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
