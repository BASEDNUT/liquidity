import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../../components/Layout';
import TokenNav from '../../components/TokenNav';
import { fetchTokens, fetchTokensWithMarketData } from '../../utils/fetchTokens';
import { fetchPools, getStaticPools } from '../../utils/fetchPools';
import { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Chip, Stack, Divider } from '@mui/material';
import GlossaryTooltip from '../../components/GlossaryTooltip';

// Category-specific hero gradient
function getHeroTheme(token) {
  if (!token) return { gradient: 'linear-gradient(135deg, #FAF3E6 0%, #E6C9A8 50%, #C8A27A 100%)', color: '#3D2B1F' };
  const isNFT = (token.tags || []).some(t => String(t).toUpperCase() === 'NFT');
  if (isNFT) return { gradient: 'linear-gradient(135deg, #4A1A1A 0%, #6B2D2D 50%, #8B3D3D 100%)', color: '#FAF3E6' };
  switch (token.category) {
    case 'Trunk': return { gradient: 'linear-gradient(135deg, #4A2F1A 0%, #6B3D20 50%, #8B5A2B 100%)', color: '#FAF3E6' };
    case 'Branch': return { gradient: 'linear-gradient(135deg, #2D5016 0%, #4A7C2F 50%, #6B9B37 100%)', color: '#FAF3E6' };
    case 'Nested':
      if (token.name === 'SALT') return { gradient: 'linear-gradient(135deg, #3D3D3D 0%, #5D5D5D 50%, #8A8A8A 100%)', color: '#FAF3E6' };
      if (token.name === 'NUTINO') return { gradient: 'linear-gradient(135deg, #3D2B1F 0%, #5D3A1F 50%, #8A5A5A 100%)', color: '#FAF3E6' };
      return { gradient: 'linear-gradient(135deg, #3D3D3D 0%, #5D5D5D 50%, #8A8A8A 100%)', color: '#FAF3E6' };
    case 'Soil': return { gradient: 'linear-gradient(135deg, #5D4E37 0%, #7D6B4F 50%, #9C8B6A 100%)', color: '#FAF3E6' };
    default: return { gradient: 'linear-gradient(135deg, #FAF3E6 0%, #E6C9A8 50%, #C8A27A 100%)', color: '#3D2B1F' };
  }
}

function formatUsd(val) {
  if (val == null || isNaN(val)) return '—';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
  if (val >= 1) return `$${val.toFixed(4)}`;
  if (val >= 0.01) return `$${val.toFixed(6)}`;
  if (val > 0) return `$${val.toExponential(4)}`;
  return '$0';
}

function formatSupply(val) {
  if (val == null || isNaN(val)) return '—';
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(2)}K`;
  return val.toFixed(2);
}

// Short, punchy descriptions — 2-3 sentences max
const TOKEN_DESCRIPTIONS = {
  NUT: 'The singleton root — one whole asset divided into one quintillion indivisible atomic units (10^18 attoNUTs), conserved forever. No mint, no burn: every transaction merely relocates a fraction of the same supply. Because supply is 1, price equals market cap by construction — holding a fraction is holding a claim on the entire conserved coordinate. SNUT is its liquid reward-position token: hold SNUT to earn NUT automatically.',
  SNUT: 'Liquid non-escrow NUT reward-position token. 1% tax funds NUT rewards, buyback/burn, and liquidity. Dead-held SNUT keeps earning NUT — recursive burn flywheel.',
  pNUT: 'Balancer V2 index basket holding 25% each of cbETH, cbBTC, NUT, and SNUT. NAV drift from market price creates arbitrage.',
  SALT: 'Mint Club bonding curve token backed by NUT. Two-venue arb loop: mint with NUT → sell for USDC on Aerodrome.',
  NUTINO: 'Mint Club bonding curve token backed by NUT. Two-venue arb loop: mint with NUT → sell for cbBTC on Uniswap V2.',
  PNUTS: 'P-NUTS — Peanut War Generals. 251 officer NFTs bonded to NUT. Mint to enlist, burn to reclaim. 200 SALT airdropped per General. Whole-NFT trading on Sudoswap in USDC.',
  ALMD: 'ALMONDS — Almond War Generals. 424 officer NFTs bonded to NUT. Golden Salted Swarm. 200 SALT airdropped per General. Whole-NFT trading on Sudoswap in cbETH.',
  SALMD: 'S-ALMONDS — Almond Soldiers. 6,238 infantry NFTs bonded to NUT. Sky-Seasoned Crunch. 80 SALT airdropped per Soldier. Whole-NFT trading on Sudoswap in cbETH.',
  PNUTRMY: 'PEANUT ARMY — Peanut Soldiers. 5,013 infantry NFTs bonded to NUT. 80 SALT airdropped per Soldier. Backbone of the Orchard — no Sudoswap pool yet.',
  cbETH: 'Coinbase Wrapped Staked ETH. The staked-ETH base asset used as 25% collateral in the pNUT Balancer index basket. Earns staking yield natively.',
  cbBTC: 'Coinbase Wrapped BTC. Bitcoin base asset on Base chain. Used as 25% collateral in the pNUT Balancer index basket and as the quote token in the NUTINO/cbBTC Uniswap V2 pool.',
  USDC: 'USD Coin. The primary stablecoin on Base. Used as the quote token in the SALT/USDC Aerodrome pool — the exit venue for the SALT two-venue arbitrage loop.',
  AERO: 'Aerodrome Finance token. Governance and emissions token for Aerodrome DEX. Used as a quote token in the NUT/AERO Aerodrome pool. Aerodrome gauge emissions may incentivize NUT liquidity.',
  wETH: 'Wrapped Ether. The primary ETH base asset on Base chain. Used as the quote token in the NUT/wETH and SNUT/wETH pools — the main price discovery venues for the ecosystem.',
  PIPS: 'What is PIPS? It is the electricity bill of the Orchard, paid in a token. Pipshell is a computer that runs the front desk — it guards, monitors, and backs up everything. Every PIPS trade fee pays for that machine, so it never sleeps. 1B supply, 18 decimals. The contract configures a 1%/1% transfer tax, but only the official Virtuals pair is registered — our external pools are untaxed today and could be registered by the owner anytime.',
};

// Tokenomics data — structured for clean card rendering
const TOKENOMICS = {
  NUT: {
    facts: [
      { label: 'Supply', value: '1 whole token · 18 decimals' },
      { label: 'Decimals', value: '18' },
      { label: 'Tax', value: 'None' },
      { label: 'Launch', value: 'Stealth on Uniswap V3' },
    ],
    mechanics: [
      'TRUE Price = TRUE Market Cap — supply is 1, so price and cap are the same number',
      'A conserved ledger: one quintillion atomic units (10^18 attoNUTs), minted once, relocatable forever',
      'No mint, no burn, no governance — state only changes address, never amount',
      'Holding a fraction is holding a claim on the entire conserved coordinate',
      'Structural arbitrage by design: four different AMM invariants tear spreads that arbitrageurs — the nervous system — close',
      'Periphery strengthens root: SALT, NUTINO, and NFTs lock NUT in bonding curves, withdrawing it from float',
      'SI-precise denominations: attoNUT (aNUT) ledger base, picoNUT price-impact resolution, µNUT human display',
      'Stealth-launched on Uniswap V3 with zero ETH paired',
      '25% weight in pNUT index basket',
      'SNUT is the liquid reward-position token for NUT — hold SNUT to earn NUT automatically',
    ],
    advanced: [
      {
        title: 'One Token. One Quintillion States.',
        body: 'NUT is not a supply curve — it is a conserved ledger. One whole token divided into 10^18 atomic units (attoNUTs), minted once and never again. Every swap, pool, curve, and NFT simply relocates a fraction of the same fixed quantity. State changes address; amount never changes.'
      },
      {
        title: 'Price Is Market Cap, By Construction',
        body: 'Because the whole is one, the price of NUT IS the market cap of NUT. There is no circulating-supply series to model and no inflation schedule to adjust — only one conserved number, redistributed across venues.'
      },
      {
        title: 'The Ecosystem Is a State Machine',
        body: 'Each AMM invariant, bonding curve, and index basket is a transition function over the same conserved input. Cross-venue spreads are the visible gap between differing invariants; arbitrageurs are the homeostasis that closes them, relocating units until the ledger reads consistently everywhere.'
      },
      {
        title: 'SI-Precise Denomination Stack',
        body: 'attoNUT (aNUT) is the ledger base at 10^-18 resolution. picoNUT resolves price impact and quote-level changes. µNUT is the human display layer. The same conserved fact reads cleanly at every scale.'
      }
    ],
  },
  SNUT: {
    facts: [
      { label: 'Supply', value: '100,000' },
      { label: 'Decimals', value: '9' },
      { label: 'Tax', value: '1% per transaction (cut from 6% — S30)' },
      { label: 'Reward-Position', value: 'Non-escrow (hold to earn)' },
    ],
    taxBreakdown: [
      { pct: '1% total', dest: 'Split 4 ways: liquidity, manager, buyback/burn, NUT rewards. Live per-stream rates on the SNUT page.' },
    ],
    mechanics: [
      'Deflationary — supply decreases as tokens burn',
      'Burns at dead address: 0x000...dEaD',
      'Holding SNUT earns NUT automatically — no locking',
      '25% weight in pNUT index basket',
    ],
  },
  pNUT: {
    facts: [
      { label: 'Type', value: 'Balancer V2 BPT' },
      { label: 'Pool ID', value: '0x2a57...0019e' },
      { label: 'Composition', value: '25% each: cbETH, cbBTC, NUT, SNUT' },
      { label: 'NAV Formula', value: 'totalLiquidity ÷ totalShares' },
    ],
    mechanics: [
      'Mint BPT by adding liquidity on Balancer',
      'Redeem BPT to withdraw basket components',
      'Market price > NAV → mint and sell for profit',
      'Market price < NAV → buy and redeem for profit',
    ],
  },
  SALT: {
    facts: [
      { label: 'Type', value: 'Mint Club bonding curve' },
      { label: 'Backed by', value: 'NUT' },
      { label: 'Royalty', value: '1% on mint/burn' },
      { label: 'DEX Pair', value: 'SALT/USDC on Aerodrome' },
    ],
    mechanics: [
      'Curve price = NUT_locked ÷ token_supply',
      'Buy price ≠ sell price (significant spread)',
      'Airdropped: 200/NFT Generals, 80/NFT Soldiers',
      '7,420,420 SALT to staking vault',
    ],
  },
  NUTINO: {
    facts: [
      { label: 'Type', value: 'Mint Club bonding curve' },
      { label: 'Backed by', value: 'NUT' },
      { label: 'Royalty', value: '1% on mint/burn' },
      { label: 'DEX Pair', value: 'NUTINO/cbBTC on Uniswap V2' },
    ],
    mechanics: [
      'Same bonding curve mechanics as SALT',
      'cbBTC-denominated DEX pool (not USDC)',
      'Two-venue arb: Mint Club ↔ Uniswap V2',
    ],
  },
  PNUTS: {
    facts: [
      { label: 'Type', value: 'Mint Club NFT bonding curve' },
      { label: 'Collection', value: 'Extra Roasted Trio' },
      { label: 'Backed by', value: 'NUT' },
      { label: 'Sudoswap', value: 'PNUTS/USDC NFT AMM pool' },
    ],
    mechanics: [
      'Mint by depositing NUT via bonding curve',
      'Burn to withdraw NUT backing',
      'Bonding curve sets floor price',
      'Sudoswap pool enables whole-NFT AMM trading in USDC',
    ],
  },
  ALMD: {
    facts: [
      { label: 'Type', value: 'Mint Club NFT bonding curve' },
      { label: 'Collection', value: 'Golden Salted Swarm' },
      { label: 'Backed by', value: 'NUT' },
      { label: 'Sudoswap', value: 'ALMD/cbETH NFT AMM pool' },
    ],
    mechanics: [
      'Mint by depositing NUT via bonding curve',
      'Burn to withdraw NUT backing',
      'Bonding curve sets floor price',
      'Sudoswap pool enables whole-NFT AMM trading in cbETH',
    ],
  },
  SALMD: {
    facts: [
      { label: 'Type', value: 'Mint Club NFT bonding curve' },
      { label: 'Collection', value: 'Sky-Seasoned Crunch' },
      { label: 'Backed by', value: 'NUT' },
      { label: 'Sudoswap', value: 'SALMD/cbETH NFT AMM pool' },
    ],
    mechanics: [
      'Mint by depositing NUT via bonding curve',
      'Burn to withdraw NUT backing',
      'Bonding curve sets floor price',
      'Sudoswap pool enables whole-NFT AMM trading in cbETH',
    ],
  },
  PNUTRMY: {
    facts: [
      { label: 'Type', value: 'Mint Club NFT bonding curve' },
      { label: 'Collection', value: 'PEANUT ARMY' },
      { label: 'Backed by', value: 'NUT' },
      { label: 'Airdrop', value: 'SALT distributed to holders' },
    ],
    mechanics: [
      'Mint by depositing NUT via bonding curve',
      'Burn to withdraw NUT backing',
      'Holders received SALT airdrop',
      'Bonding curve sets floor price',
    ],
  },
  cbETH: {
    facts: [
      { label: 'Type', value: 'Coinbase Wrapped Staked ETH' },
      { label: 'Chain', value: 'Base' },
      { label: 'Role', value: '25% collateral in pNUT basket' },
      { label: 'Yield', value: 'Earns native staking yield' },
    ],
    mechanics: [
      'Wraps staked ETH position from Coinbase',
      'Liquid — can be traded and used in DeFi',
      'Price tracks ETH with staking yield accrual',
      'Quote asset for Sudoswap NFT pools (ALMD, SALMD)',
    ],
  },
  cbBTC: {
    facts: [
      { label: 'Type', value: 'Coinbase Wrapped BTC' },
      { label: 'Chain', value: 'Base' },
      { label: 'Role', value: '25% collateral in pNUT basket' },
      { label: 'DEX Pair', value: 'NUTINO/cbBTC on Uniswap V2' },
    ],
    mechanics: [
      'Coinbase custody-backed Bitcoin on Base',
      'Price tracks BTC 1:1',
      'Provides Bitcoin exposure within the NUT ecosystem',
      'Quote token for NUTINO DEX pool',
    ],
  },
  USDC: {
    facts: [
      { label: 'Type', value: 'USD Coin (stablecoin)' },
      { label: 'Chain', value: 'Base' },
      { label: 'Peg', value: '~1 USD' },
      { label: 'DEX Pair', value: 'SALT/USDC on Aerodrome' },
    ],
    mechanics: [
      'Primary stablecoin on Base',
      'Quote token for SALT DEX pool — arb loop exit venue',
      'Quote token for Sudoswap NFT pools (SPNUT, PNUTS)',
      'Provides USD-denominated price discovery',
    ],
  },
  AERO: {
    facts: [
      { label: 'Type', value: 'Aerodrome governance token' },
      { label: 'Chain', value: 'Base' },
      { label: 'Role', value: 'Quote token in NUT/AERO pool' },
      { label: 'Emissions', value: 'Aerodrome gauge rewards' },
    ],
    mechanics: [
      'Governance and liquidity incentives for Aerodrome DEX',
      'Gauge emissions may incentivize NUT liquidity',
      'Vote-locked AERO (veAERO) directs emissions',
      'Provides alternative quote asset for NUT exposure',
    ],
  },
  wETH: {
    facts: [
      { label: 'Type', value: 'Wrapped Ether' },
      { label: 'Chain', value: 'Base' },
      { label: 'Role', value: 'Primary quote token for NUT & SNUT' },
      { label: 'Pools', value: 'NUT/wETH V3+V2, SNUT/wETH V2' },
    ],
    mechanics: [
      'ERC-20 wrapper for native ETH',
      'Primary price discovery venue for NUT and SNUT',
      'Used in both Uniswap V3 (concentrated) and V2 (full-range)',
      'Deep liquidity enables large swaps with minimal slippage',
    ],
  },
  PIPS: {
    facts: [
      { label: 'Supply', value: '1,000,000,000' },
      { label: 'Decimals', value: '18' },
      { label: 'Tax', value: '1%/1% configured — official pair only; external venues untaxed today' },
      { label: 'Role', value: 'Compute fuel for Pipshell (DevOps agent)' },
    ],
    mechanics: [
      'Trade fees fund Pipshell compute (agent wallet → compute)',
      '1%/1% transfer tax configured — fires only on pools registered via isLiquidityPool()',
      'Official Virtuals pair is the only registered pool; NUT/PIPS + PIPS/USDC are unregistered → untaxed today',
      'Risk: owner can register an external pool anytime — would break CL invariant on Slipstream',
      'Infrastructure token — not a consumer product',
    ],
  },
};

const BALANCER_JOIN_URL = 'https://balancer.fi/pools/base/v2/0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000019e';

// Token-specific documentation links
const DOCS_LINKS = {
  NUT: 'https://docs.basednut.com/nut',
  SNUT: 'https://docs.basednut.com/snut',
  pNUT: 'https://docs.basednut.com/pnut',
  SALT: 'https://docs.basednut.com/salt',
  NUTINO: 'https://docs.basednut.com/nutino',
  PIPS: 'https://docs.basednut.com/',
  PNUTS: 'https://mint.club/nft/base/PNUTS',
  ALMD: 'https://mint.club/nft/base/ALMD',
  SALMD: 'https://mint.club/nft/base/SALMD',
  PNUTRMY: 'https://mint.club/nft/base/PNUTRMY',
  cbETH: 'https://www.coinbase.com/crypto/cbeth',
  cbBTC: 'https://www.coinbase.com/crypto/cbbtc',
  USDC: 'https://www.circle.com/en/usdc',
  AERO: 'https://aerodrome.finance/',
  wETH: 'https://ethereum.org/en/developers/docs/standards/tokens/erc-20/',
};

export default function TokenProfile({ token: initialToken }) {
  const router = useRouter();
  const { id } = router.query;
  const data = fetchTokens();
  const pools = getStaticPools();

  const tokens = useMemo(() => {
    if (!data) return [];
    return [
      { ...data.trunk, id: (data.trunk?.name || 'trunk').toLowerCase(), category: 'Trunk' },
      ...(data.branches || []).map((t, i) => ({ ...t, id: (t.name || `branch-${i}`).toLowerCase(), category: 'Branch' })),
      ...(data.nestedTokens || []).map((t, i) => ({ ...t, id: (t.name || `nested-${i}`).toLowerCase(), category: 'Nested' })),
      ...(data.soil || []).map((t, i) => ({ ...t, id: (t.name || `soil-${i}`).toLowerCase(), category: 'Soil' })),
    ];
  }, [data]);

  const ssgToken = initialToken || tokens.find((t) => t.id === id);

  // Client-side fetch for live MintClub bonding curve data (fast lightweight endpoint)
  const [liveMintClub, setLiveMintClub] = useState(null);
  const [mintClubLoading, setMintClubLoading] = useState(false);
  useEffect(() => {
    if (!ssgToken?.name) return;
    let cancelled = false;
    setMintClubLoading(true);
    fetch('/api/mintclub-data')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (cancelled || !json?.tokens) return;
        const mc = json.tokens[ssgToken.name];
        if (mc) setLiveMintClub(mc);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMintClubLoading(false); });
    return () => { cancelled = true; };
  }, [ssgToken?.name]);

  // Merge: if client-side MintClub data arrives, inject it into marketData.mintClub
  const token = ssgToken ? {
    ...ssgToken,
    marketData: {
      ...(ssgToken.marketData || {}),
      ...(liveMintClub ? { mintClub: liveMintClub } : {}),
    },
  } : ssgToken;

  const poolsForToken = useMemo(() => {
    if (!token) return [];
    const name = String(token.name || '').toUpperCase();
    return (pools || []).filter((p) => String(p.name || '').toUpperCase().includes(name));
  }, [token, pools]);

  const relatedTokenNames = useMemo(() => {
    const list = new Set();
    poolsForToken.forEach((p) => {
      String(p.name || '').split('/').map(s => s.trim()).forEach((tkn) => {
        if (tkn && tkn.toLowerCase() !== (token?.name || '').toLowerCase()) list.add(tkn);
      });
    });
    return Array.from(list);
  }, [poolsForToken, token]);

  const primaryPool = useMemo(() => {
    if (!token) return null;
    const name = String(token.name || '').toUpperCase();
    const marketPools = (pools || []).filter((p) => p && p.dexscreenerUrl && p.category && !(
      (Array.isArray(p.category) ? p.category : [p.category]).includes('NFTs')
    ));
    const directMatches = marketPools.filter((p) => String(p.name || '').toUpperCase().includes(name));
    const rank = (platform = '') => {
      const u = platform.toUpperCase();
      if (u.includes('UNISWAP V3')) return 0;
      if (u.includes('UNISWAP V2')) return 1;
      if (u.includes('AERODROME')) return 2;
      return 3;
    };
    return directMatches.length ? directMatches.slice().sort((a, b) => rank(a.platform) - rank(b.platform))[0] : null;
  }, [token, pools]);

  const embed = useMemo(() => {
    // Issue 1 fix: Use GeckoTerminal token address embed for correct token labeling.
    // Pool embeds show tokens in GeckoTerminal's own base/quote order which may not match
    // our pool name (e.g. shows AERO/NUT instead of NUT/AERO). Token embeds always label correctly.
    const tokenIsNFT = (token?.tags || []).some(t => String(t).toUpperCase() === 'NFT');
    if (tokenIsNFT) return null; // NFTs not charted on DEX aggregators
    if (token?.address) {
      const gtUrl = new URL(`https://www.geckoterminal.com/base/tokens/${token.address}`);
      gtUrl.searchParams.set('embed', '1');
      gtUrl.searchParams.set('info', '0');
      gtUrl.searchParams.set('chart', '1');
      gtUrl.searchParams.set('theme', 'dark');
      gtUrl.searchParams.set('chartType', 'candlestick');
      gtUrl.searchParams.set('chartInterval', '1D');
      gtUrl.searchParams.set('interval', '1D');
      return { type: 'geckoterminal', src: gtUrl.toString() };
    }
    // Fallback: try pool-based embed from dexscreenerUrl
    const urlStr = primaryPool?.dexscreenerUrl;
    if (!urlStr) return null;
    try {
      const url = new URL(urlStr);
      if (url.hostname.includes('dexscreener.com')) {
        const pathSegments = url.pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1] || '';
        if (lastSegment.includes('-')) return null;
        const gtUrl = new URL(`https://www.geckoterminal.com/base/pools/${lastSegment}`);
        gtUrl.searchParams.set('embed', '1');
        gtUrl.searchParams.set('info', '0');
        gtUrl.searchParams.set('chart', '1');
        gtUrl.searchParams.set('theme', 'dark');
        gtUrl.searchParams.set('chartType', 'candlestick');
        gtUrl.searchParams.set('chartInterval', '1D');
        gtUrl.searchParams.set('interval', '1D');
        return { type: 'geckoterminal', src: gtUrl.toString() };
      }
      if (url.hostname.includes('defined.fi')) {
        const cleanPath = url.pathname.endsWith('/embed') ? url.pathname : `${url.pathname.replace(/\/$/, '')}/embed`;
        url.pathname = cleanPath;
        url.search = '';
        const params = { quoteToken: 'token0', hideTxTable: '1', hideSidebar: '1', hideChart: '0', hideChartEmptyBars: '1', chartSmoothing: '0', embedColorMode: 'DEFAULT' };
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        return { type: 'defined', src: url.toString() };
      }
    } catch (e) {}
    return null;
  }, [token?.address, token?.tags, primaryPool?.dexscreenerUrl]);

  if (!token) {
    return (
      <Layout>
        <Box sx={{ p: 4 }}>
          <Typography variant="h4">Token not found</Typography>
          <Button sx={{ mt: 2 }} onClick={() => router.push('/')}>Back to Home</Button>
        </Box>
      </Layout>
    );
  }

  const heroTheme = getHeroTheme(token);
  const isNFT = (token.tags || []).some(t => String(t).toUpperCase() === 'NFT');
  const isBalancer = token.name === 'pNUT';
  const isMintClub = ['SALT', 'NUTINO'].includes(token.name);
  const tokenomics = TOKENOMICS[token.name];
  const explorerUrl = `https://basescan.org/token/${token.address}`;
  const tradeUrls = (poolsForToken || []).filter(p => p.checkPoolUrl).map(p => ({ url: p.checkPoolUrl, platform: p.platform, name: p.name }));
  const primaryTrade = tradeUrls[0];

  // Source link helper
  const srcLink = (name, url) => (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#8B5A2B', textDecoration: 'underline', fontWeight: 600, fontSize: '0.8rem' }}>{name}</a>
  );

  // Stat card component
  const StatCard = ({ label, children }) => (
    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.95)', border: '1px solid rgba(139,90,43,0.15)', boxShadow: '0 2px 8px rgba(90,60,30,0.06)' }}>
      <Typography variant="caption" sx={{ display: 'block', color: '#8B6914', fontWeight: 700, mb: 0.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>{label}</Typography>
      {children}
    </Box>
  );

  // Source value line with optional lastCheckedAt timestamp
  const fmtTime = (iso) => { try { const d = new Date(iso); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); } catch { return null; } };
  const SrcLine = ({ value, sourceName, sourceUrl, lastCheckedAt }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(40,40,60,0.85)' }}>
        {value}{lastCheckedAt ? <span style={{ fontSize: '0.75rem', color: 'rgba(40,40,60,0.45)', fontWeight: 400, marginLeft: 4 }}>({fmtTime(lastCheckedAt)})</span> : null}
      </Typography>
      {srcLink(sourceName, sourceUrl)}
    </Box>
  );

  return (
    <Layout>
      <Head>
        <title>{`${token.name} | Token Profile`}</title>
        <meta name="description" content={`Profile for ${token.name}.`} />
      </Head>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <TokenNav />

        {/* ── HERO ── */}
        <Box sx={{ mb: 2, p: { xs: 2, md: 3 }, borderRadius: 3, background: heroTheme.gradient, color: heroTheme.color, boxShadow: '0 10px 30px rgba(90, 60, 30, 0.25)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>{token.icon}</span> {token.name}
            </Typography>
            {isNFT && (
              <Chip label="NFT" sx={{
                bgcolor: '#FFD700', color: '#1a1a1a', fontWeight: 900,
                fontSize: '1rem', height: 32, px: 1.5,
                border: '2px solid #B8860B',
                boxShadow: '0 2px 8px rgba(255,215,0,0.4)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: '0 2px 8px rgba(255,215,0,0.4)' },
                  '50%': { boxShadow: '0 2px 16px rgba(255,215,0,0.7)' },
                },
              }} />
            )}
          </Box>
          <Typography sx={{ mb: 1.5, fontSize: '1.05rem', opacity: 0.9 }}>{token.role}</Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: heroTheme.color, fontWeight: 600 }} label={token.category} size="small" />
            {token.address && (
              <Link href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Chip sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: heroTheme.color, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }} label={`${token.address.slice(0,8)}…${token.address.slice(-6)}`} size="small" />
              </Link>
            )}
            {(token.tags || []).map((t, i) => (
              <Chip key={i} sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: heroTheme.color }} label={t} variant="filled" size="small" />
            ))}
          </Box>
        </Box>

        {/* ── DOCS LINK ── */}
        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mb: 3 }}>
          <Link href={DOCS_LINKS[token.name] || 'https://docs.basednut.com/'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Box component="span" sx={{
              px: 2, py: 0.75, borderRadius: 2,
              fontSize: '0.85rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              color: '#5B3A29', textDecoration: 'none',
              background: 'rgba(139,90,43,0.08)', border: '1px solid rgba(139,90,43,0.2)',
              boxShadow: 'none', cursor: 'pointer',
              '&:hover': { background: 'rgba(139,90,43,0.15)', transform: 'translateY(-1px)' },
            }}>📖 Docs</Box>
          </Link>
        </Box>

        {/* ── OVERVIEW CARD ── */}
        {TOKEN_DESCRIPTIONS[token.name] && (
          <Box sx={{ mb: 3, p: { xs: 2, md: 2.5 }, borderRadius: 2, background: 'linear-gradient(135deg, rgba(205,127,50,0.06) 0%, rgba(255,252,245,0.95) 100%)', borderLeft: '4px solid #CD7F32', boxShadow: '0 2px 10px rgba(90,60,30,0.08)' }}>
            <Typography variant="overline" sx={{ color: '#8B6914', fontWeight: 700, letterSpacing: '0.08em' }}>Overview</Typography>
            <Typography sx={{ color: 'rgba(40,40,60,0.85)', lineHeight: 1.6, fontSize: '0.95rem', mt: 0.5, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {TOKEN_DESCRIPTIONS[token.name]}
            </Typography>
          </Box>
        )}

        {/* ── ACTION BUTTONS ── */}
        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mb: 3 }}>
          {(() => {
            const btnSx = {
              px: 2, py: 0.75, borderRadius: 2,
              fontSize: '0.85rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
              border: '1px solid #6B3D20',
              boxShadow: '0 3px 8px rgba(139,69,19,0.2)',
              transition: 'all 0.2s ease', cursor: 'pointer',
              '&:hover': { background: 'linear-gradient(135deg, #A0522D 0%, #B87333 100%)', transform: 'translateY(-1px)', boxShadow: '0 5px 12px rgba(139,69,19,0.3)' },
            };
            const secondaryBtnSx = {
              ...btnSx,
              background: 'rgba(139,90,43,0.08)', color: '#5B3A29', border: '1px solid rgba(139,90,43,0.2)',
              boxShadow: 'none',
              '&:hover': { background: 'rgba(139,90,43,0.15)', transform: 'translateY(-1px)' },
            };
            return (
              <>
                {primaryTrade && (
                  <Link href={primaryTrade.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box component="span" sx={btnSx}>🔄 Trade on {primaryTrade.platform}</Box>
                  </Link>
                )}
                {isBalancer ? (
                  <Link href={BALANCER_JOIN_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box component="span" sx={btnSx}>🧊 Mint BPT (Add Liquidity)</Box>
                  </Link>
                ) : primaryTrade ? (
                  <Link href={primaryTrade.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box component="span" sx={btnSx}>💧 Add Liquidity on {primaryTrade.platform}</Box>
                  </Link>
                ) : null}
                <Link href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Box component="span" sx={secondaryBtnSx}>🔍 Basescan</Box>
                </Link>
                {isMintClub && (
                  <Link href={`https://mint.club/token/base/${token.name}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box component="span" sx={secondaryBtnSx}>🟢 Mint Club</Box>
                  </Link>
                )}
                {isBalancer && (
                  <Link href={BALANCER_JOIN_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box component="span" sx={secondaryBtnSx}>📊 Balancer</Box>
                  </Link>
                )}
                {isNFT && token.nftTradeLinks && token.nftTradeLinks.map((link, i) => (
                  <Link key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box component="span" sx={secondaryBtnSx}>{link.label === 'OpenSea' ? '🦭 OpenSea' : link.label === 'Sudoswap' ? '🔀 Sudoswap' : link.label}</Box>
                  </Link>
                ))}
                {isNFT && token.mintUrl && (
                  <Link href={token.mintUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box component="span" sx={secondaryBtnSx}>🎨 Mint NFT</Box>
                  </Link>
                )}
              </>
            );
          })()}
        </Box>

        {/* ── CHART + STATS GRID ── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            {embed ? (
              <Box sx={{ position: 'relative', width: '100%', pb: { xs: '125%', md: '65%' }, borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(100,70,40,0.25)', boxShadow: '0 6px 18px rgba(90,60,30,0.15)' }}>
                <iframe title={`${token.name} chart`} src={embed.src} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} frameBorder="0" allow={embed.type === 'defined' ? 'clipboard-write' : undefined} />
              </Box>
            ) : (
              <Box sx={{ height: 260, border: '1px solid rgba(100,70,40,0.15)', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(91,58,41,0.5)', background: 'rgba(255,252,245,0.5)' }}>
                <Typography sx={{ fontSize: '0.9rem' }}>No chart available for this token</Typography>
                <Typography sx={{ fontSize: '0.75rem', mt: 0.5, opacity: 0.7 }}>Chart data will appear when a DEX listing is detected</Typography>
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 2, borderRadius: 3, background: 'rgba(255,252,245,0.95)', border: '1px solid rgba(139,90,43,0.15)', boxShadow: '0 4px 12px rgba(90,60,30,0.08)' }}>
              <Typography variant="overline" sx={{ color: '#8B6914', fontWeight: 700, letterSpacing: '0.08em', mb: 1, display: 'block' }}>Market Stats</Typography>
              {token.marketData ? (
                <Stack spacing={1.5}>
                  {/* Price */}
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</Typography>
                    {token.marketData.geckoTerminal?.price_usd != null && (
                      <SrcLine value={formatUsd(token.marketData.geckoTerminal.price_usd)} sourceName="GeckoTerminal" sourceUrl={`https://www.geckoterminal.com/base/tokens/${token.address}`} lastCheckedAt={token.marketData.geckoTerminal.lastCheckedAt} />
                    )}
                    {token.marketData.dexScreener?.priceUsd != null && (
                      <SrcLine value={formatUsd(token.marketData.dexScreener.priceUsd)} sourceName="DexScreener" sourceUrl={`https://dexscreener.com/base/${token.address}`} lastCheckedAt={token.marketData.dexScreener.lastCheckedAt} />
                    )}
                    {token.marketData.coinGecko?.price_usd != null && (
                      <SrcLine value={formatUsd(token.marketData.coinGecko.price_usd)} sourceName="CoinGecko" sourceUrl={`https://www.coingecko.com/en/coins/base?address=${token.address}`} lastCheckedAt={token.marketData.coinGecko?.lastCheckedAt} />
                    )}
                    {token.marketData.balancer?.bptPrice != null && (
                      <SrcLine value={formatUsd(token.marketData.balancer.bptPrice)} sourceName="Balancer" sourceUrl={BALANCER_JOIN_URL} lastCheckedAt={token.marketData.balancer.lastCheckedAt} />
                    )}
                    {token.marketData.mintClub?.priceUsd != null && (
                      <SrcLine value={formatUsd(token.marketData.mintClub.priceUsd)} sourceName="MintClub" sourceUrl={`https://mint.club/token/base/${token.address}`} lastCheckedAt={token.marketData.mintClub.lastCheckedAt} />
                    )}
                    {token.marketData.geckoTerminal?.price_usd == null && token.marketData.dexScreener?.priceUsd == null && token.marketData.coinGecko?.price_usd == null && token.marketData.balancer?.bptPrice == null && token.marketData.mintClub?.priceUsd == null && (
                      (() => {
                        const name = (token.name || '').toLowerCase();
                        const tags = (token.tags || []).join(' ').toLowerCase();
                        let label = 'Not available';
                        if (name === 'pnut' || tags.includes('index') || tags.includes('balancer')) label = 'Index Token (Balancer)';
                        else if (tags.includes('bonding curve') || tags.includes('mintclub') || name === 'nutino' || name === 'salt') label = 'Bonding Curve Token (MintClub)';
                        return (
                        <Link href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <Typography sx={{ fontSize: '0.85rem', color: '#8B5A2B', fontFamily: 'monospace', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                            {token.address ? `${token.address.slice(0,8)}...${token.address.slice(-6)}` : label}
                          </Typography>
                        </Link>
                      );
                      })()
                    )}
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(139,90,43,0.1)' }} />
                  {/* Volume */}
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume (24h)</Typography>
                    {token.marketData.geckoTerminal?.volume_usd_h24 != null && (
                      <SrcLine value={formatUsd(token.marketData.geckoTerminal.volume_usd_h24)} sourceName="GeckoTerminal" sourceUrl={`https://www.geckoterminal.com/base/tokens/${token.address}`} lastCheckedAt={token.marketData.geckoTerminal.lastCheckedAt} />
                    )}
                    {token.marketData.dexScreener?.volume_h24 != null && (
                      <SrcLine value={formatUsd(token.marketData.dexScreener.volume_h24)} sourceName="DexScreener" sourceUrl={`https://dexscreener.com/base/${token.address}`} lastCheckedAt={token.marketData.dexScreener.lastCheckedAt} />
                    )}
                    {token.marketData.mintClub?.volume_h24 != null && (
                      <SrcLine value={formatUsd(token.marketData.mintClub.volume_h24)} sourceName="MintClub" sourceUrl={`https://mint.club/token/base/${token.address}`} lastCheckedAt={token.marketData.mintClub.lastCheckedAt} />
                    )}
                    {token.marketData.geckoTerminal?.volume_usd_h24 == null && token.marketData.dexScreener?.volume_h24 == null && token.marketData.mintClub?.volume_h24 == null && (
                      <Link href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#8B5A2B', fontFamily: 'monospace', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                          {token.address ? `${token.address.slice(0,8)}...${token.address.slice(-6)}` : 'N/A'}
                        </Typography>
                      </Link>
                    )}
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(139,90,43,0.1)' }} />
                  {/* Liquidity */}
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Liquidity <GlossaryTooltip term="Liquidity" />
                    </Typography>
                    {token.marketData.geckoTerminal?.total_reserve_in_usd != null && (
                      <SrcLine value={formatUsd(token.marketData.geckoTerminal.total_reserve_in_usd)} sourceName="GeckoTerminal" sourceUrl={`https://www.geckoterminal.com/base/tokens/${token.address}`} lastCheckedAt={token.marketData.geckoTerminal.lastCheckedAt} />
                    )}
                    {token.marketData.dexScreener?.liquidity_usd != null && (
                      <SrcLine value={formatUsd(token.marketData.dexScreener.liquidity_usd)} sourceName="DexScreener" sourceUrl={`https://dexscreener.com/base/${token.address}`} lastCheckedAt={token.marketData.dexScreener.lastCheckedAt} />
                    )}
                    {token.marketData.balancer?.totalLiquidity != null && (
                      <SrcLine value={formatUsd(token.marketData.balancer.totalLiquidity)} sourceName="Balancer" sourceUrl={BALANCER_JOIN_URL} lastCheckedAt={token.marketData.balancer.lastCheckedAt} />
                    )}
                    {token.marketData.geckoTerminal?.total_reserve_in_usd == null && token.marketData.dexScreener?.liquidity_usd == null && token.marketData.balancer?.totalLiquidity == null && (
                      <Link href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#8B5A2B', fontFamily: 'monospace', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                          {token.address ? `${token.address.slice(0,8)}...${token.address.slice(-6)}` : 'N/A'}
                        </Typography>
                      </Link>
                    )}
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(139,90,43,0.1)' }} />
                  {/* Supply */}
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Supply</Typography>
                    {token.marketData.rpc?.totalSupply != null ? (
                      <SrcLine value={formatSupply(token.marketData.rpc.totalSupply)} sourceName="Base RPC" sourceUrl={explorerUrl} lastCheckedAt={token.marketData.rpc?.lastCheckedAt} />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
                        <Link href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <Typography sx={{ fontSize: '0.85rem', color: '#8B5A2B', fontFamily: 'monospace', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                            {token.address ? `${token.address.slice(0,8)}...${token.address.slice(-6)}` : 'N/A'}
                          </Typography>
                        </Link>
                        {srcLink('Basescan', explorerUrl)}
                      </Box>
                    )}
                  </Box>
                  {/* Market Cap for MintClub tokens */}
                  {token.marketData.mintClub?.marketCapUsd != null && (
                    <>
                      <Divider sx={{ borderColor: 'rgba(139,90,43,0.1)' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Cap</Typography>
                        <SrcLine value={formatUsd(token.marketData.mintClub.marketCapUsd)} sourceName="MintClub" sourceUrl={`https://mint.club/token/base/${token.address}`} lastCheckedAt={token.marketData.mintClub.lastCheckedAt} />
                      </Box>
                    </>
                  )}
                  {/* 24h Price Change for MintClub tokens */}
                  {token.marketData.mintClub?.priceChange24h != null && (
                    <>
                      <Divider sx={{ borderColor: 'rgba(139,90,43,0.1)' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>24h Change</Typography>
                        <SrcLine value={`${token.marketData.mintClub.priceChange24h >= 0 ? '+' : ''}${token.marketData.mintClub.priceChange24h.toFixed(2)}%`} sourceName="MintClub" sourceUrl={`https://mint.club/token/base/${token.address}`} lastCheckedAt={token.marketData.mintClub.lastCheckedAt} />
                      </Box>
                    </>
                  )}
                  {/* NAV for pNUT */}
                  {token.marketData.balancer?.nav != null && (
                    <>
                      <Divider sx={{ borderColor: 'rgba(139,90,43,0.1)' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NAV (Net Asset Value)</Typography>
                        <SrcLine value={formatUsd(token.marketData.balancer.nav)} sourceName="Balancer" sourceUrl={BALANCER_JOIN_URL} lastCheckedAt={token.marketData.balancer.lastCheckedAt} />
                      </Box>
                    </>
                  )}
                </Stack>
              ) : (
                <Stack spacing={1.5}>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contract</Typography>
                    {token.address ? (
                      <Link href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <Typography sx={{ fontSize: '0.9rem', color: '#8B5A2B', fontFamily: 'monospace', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                          {token.address.slice(0,8)}...{token.address.slice(-6)}
                        </Typography>
                      </Link>
                    ) : <Typography sx={{ fontSize: '0.9rem', color: 'rgba(40,40,60,0.5)' }}>Not available</Typography>}
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(139,90,43,0.1)' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(40,40,60,0.5)' }}>Loading market data...</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume (24h)</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(40,40,60,0.5)' }}>Loading market data...</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Liquidity</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(40,40,60,0.5)' }}>Loading market data...</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Supply</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(40,40,60,0.5)' }}>Loading market data...</Typography>
                  </Box>
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* ── BONDING CURVE (MintClub tokens only) ── */}
        {token.marketData?.mintClub && (token.marketData.mintClub.currentSupply != null || token.marketData.mintClub.priceInNUT != null) && (() => {
          const mc = token.marketData.mintClub;
          const pctMinted = (mc.currentSupply != null && mc.maxSupply != null && mc.maxSupply > 0) ? (mc.currentSupply / mc.maxSupply) * 100 : null;
          const isNFT = (token.tags || []).some(t => String(t).toUpperCase() === 'NFT');
          return (
            <Box sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'rgba(139,90,43,0.03)', border: '1px solid rgba(139,90,43,0.15)' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                {isNFT ? '🎨 NFT' : '📊'} Bonding Curve
              </Typography>
              <Grid container spacing={2}>
                {/* Mint Progress */}
                {pctMinted != null && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.1)' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mint Progress</Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(40,40,60,0.9)', mb: 0.5 }}>
                        {mc.currentSupply.toLocaleString()} / {mc.maxSupply.toLocaleString()}
                      </Typography>
                      <Box sx={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(139,90,43,0.15)', overflow: 'hidden' }}>
                        <Box sx={{ width: `${Math.min(pctMinted, 100)}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #8B4513, #CD7F32)' }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.6)', mt: 0.5 }}>{pctMinted.toFixed(1)}% minted</Typography>
                    </Box>
                  </Grid>
                )}
                {/* Price in NUT */}
                {mc.priceInNUT != null && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.1)' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price (Next Mint)</Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(40,40,60,0.9)' }}>
                        {mc.priceInNUT < 0.001 ? mc.priceInNUT.toExponential(4) : mc.priceInNUT.toFixed(6)} NUT
                      </Typography>
                      {mc.priceUsd != null && (
                        <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.55)' }}>≈ {formatUsd(mc.priceUsd)}</Typography>
                      )}
                    </Box>
                  </Grid>
                )}
                {/* NUT Reserve */}
                {mc.reserveBalanceNUT != null && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.1)' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NUT Reserve</Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(40,40,60,0.9)' }}>
                        {mc.reserveBalanceNUT < 0.001 ? mc.reserveBalanceNUT.toExponential(4) : mc.reserveBalanceNUT.toFixed(4)} NUT
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {/* Royalties */}
                {(mc.mintRoyalty != null || mc.burnRoyalty != null) && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.1)' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Royalties</Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {mc.mintRoyalty != null && <Typography sx={{ fontSize: '0.9rem', color: 'rgba(40,40,60,0.8)' }}>Mint: <strong>{mc.mintRoyalty}%</strong></Typography>}
                        {mc.burnRoyalty != null && <Typography sx={{ fontSize: '0.9rem', color: 'rgba(40,40,60,0.8)' }}>Burn: <strong>{mc.burnRoyalty}%</strong></Typography>}
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Link href={`https://mint.club/${isNFT ? 'nft' : 'token'}/base/${token.name}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, background: 'rgba(139,90,43,0.08)', color: '#5B3A29', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(139,90,43,0.2)', '&:hover': { background: 'rgba(139,90,43,0.15)' } }}>Mint Club →</Box>
                </Link>
              </Box>
            </Box>
          );
        })()}

        {/* ── TOKENOMICS ── */}
        {tokenomics && (
          <Box sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'rgba(139,90,43,0.03)', border: '1px solid rgba(139,90,43,0.15)' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              🌰 Tokenomics
            </Typography>
            <Grid container spacing={2}>
              {/* Key Facts */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.1)' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Facts</Typography>
                  {tokenomics.facts.map((f, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: i < tokenomics.facts.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none' }}>
                      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.65)' }}>{f.label}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(40,40,60,0.9)', textAlign: 'right' }}>{f.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              {/* Tax Breakdown (SNUT only) */}
              {tokenomics.taxBreakdown && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.1)' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tax Breakdown</Typography>
                    {tokenomics.taxBreakdown.map((t, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, borderBottom: i < tokenomics.taxBreakdown.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none' }}>
                        <Box sx={{ minWidth: 36, px: 0.75, py: 0.25, borderRadius: 1, background: 'linear-gradient(135deg, #8B4513, #A0522D)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>{t.pct}</Box>
                        <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.8)' }}>{t.dest}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid rgba(139,90,43,0.1)' }}>
                      <Link href="https://basescan.org/token/0xAC130701aa31c284c36609E2489f150F419AD7AD?a=0x000000000000000000000000000000000000dEaD#tokentxns" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#8B5A2B', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>🔥 View burn transactions on Basescan →</Typography>
                      </Link>
                    </Box>
                  </Box>
                </Grid>
              )}
              {/* Mechanics */}
              <Grid size={{ xs: 12, md: tokenomics.taxBreakdown ? 4 : 8 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.1)' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mechanics</Typography>
                  {tokenomics.mechanics.map((m, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 0.75, py: 0.5 }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#CD7F32', fontWeight: 700 }}>▸</Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.8)', lineHeight: 1.4 }}>{m}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ── ADVANCED (NUT only) ── */}
        {tokenomics && tokenomics.advanced && tokenomics.advanced.length > 0 && (
          <Box sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, rgba(139,90,43,0.06), rgba(212,166,118,0.12))', border: '1px solid rgba(139,90,43,0.25)' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              🔬 Advanced — The Physics of NUT
            </Typography>
            {tokenomics.advanced.map((a, i) => (
              <Box key={i} sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#8B5A2B', mb: 0.25 }}>{a.title}</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.78)', lineHeight: 1.5 }}>{a.body}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── POOLS ── */}
        <Box sx={{ mb: 3, p: { xs: 2, md: 2.5 }, borderRadius: 3, background: 'rgba(139,90,43,0.03)', border: '1px solid rgba(139,90,43,0.15)' }}>
          <Typography variant="h6" sx={{ mb: 1.5, color: '#5B3A29', fontWeight: 'bold' }}>💧 Liquidity Pools</Typography>
          {poolsForToken.length > 0 ? (
            <Grid container spacing={1.5}>
              {poolsForToken.map((p) => (
                <Grid key={p.id || p.name} size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,252,245,0.9)', border: '1px solid rgba(139,90,43,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Link href={`/pool/${p.id}`} style={{ textDecoration: 'none' }}>
                      <Box sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(40,40,60,0.9)' }}>{p.icon} {p.name}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(40,40,60,0.55)' }}>{p.platform} · {p.status}</Typography>
                      </Box>
                    </Link>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Link href={`/pool/${p.id}`} style={{ textDecoration: 'none' }}>
                        <Box sx={{ px: 1.25, py: 0.5, borderRadius: 1, background: 'rgba(139,90,43,0.08)', color: '#5B3A29', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: '1px solid rgba(139,90,43,0.2)', '&:hover': { background: 'rgba(139,90,43,0.15)' } }}>Details →</Box>
                      </Link>
                      {p.checkPoolUrl && (
                        <Link href={p.checkPoolUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <Box sx={{ px: 1.25, py: 0.5, borderRadius: 1, background: 'linear-gradient(135deg, #8B4513, #A0522D)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { filter: 'brightness(1.1)' } }}>Trade →</Box>
                        </Link>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ color: 'rgba(40,40,60,0.5)', fontSize: '0.9rem' }}>No pools found for this token.</Typography>
          )}
        </Box>

        {/* ── RELATED TOKENS ── */}
        {relatedTokenNames.length > 0 && (
          <Box sx={{ mb: 3, p: { xs: 2, md: 2.5 }, borderRadius: 3, background: 'rgba(139,90,43,0.03)', border: '1px solid rgba(139,90,43,0.15)' }}>
            <Typography variant="h6" sx={{ mb: 1.5, color: '#5B3A29', fontWeight: 'bold' }}>🔗 Related Tokens</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {relatedTokenNames.map((name) => {
                const t = tokens.find((x) => x.name.toLowerCase() === name.toLowerCase());
                return (
                  <Link key={name} href={t ? `/token/${t.id}` : `https://basescan.org/token/${token.address}`} style={{ textDecoration: 'none' }}>
                    <Box sx={{
                      px: 1.5, py: 0.5, borderRadius: 999,
                      fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                      color: '#5D4037', background: 'rgba(139,69,19,0.06)',
                      border: '1px solid rgba(139,69,19,0.15)',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 3px 8px rgba(139,69,19,0.15)', background: 'rgba(139,69,19,0.1)' },
                    }}>{t ? `${t.icon} ${t.name}` : name}</Box>
                  </Link>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ── ARBITRAGE PATHWAYS ── */}
        {token.arb && token.arb.length > 0 && (
          <Box sx={{ mb: 3, p: { xs: 2, md: 2.5 }, borderRadius: 3, background: 'rgba(139,90,43,0.03)', border: '1px solid rgba(139,90,43,0.15)' }}>
            <Typography variant="h6" sx={{ mb: 1.5, color: '#5B3A29', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              ⚔️ Arbitrage Pathways <GlossaryTooltip term="Arbitrage" />
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {token.arb.map((a, i) => (
                <Link key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Box sx={{
                    px: 1.5, py: 0.5, borderRadius: 999,
                    fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                    color: '#0f172a', background: 'rgba(2,6,23,0.04)',
                    border: '1px solid rgba(15,23,42,0.15)',
                    transition: 'all 0.2s ease',
                    '&:hover': { background: 'rgba(2,6,23,0.08)', transform: 'translateY(-1px)' },
                  }}>{a.route}</Box>
                </Link>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export async function getStaticPaths() {
  const data = fetchTokens();
  const tokens = [
    { ...data.trunk, id: (data.trunk?.name || 'trunk').toLowerCase() },
    ...(data.branches || []).map((t, i) => ({ ...t, id: (t.name || `branch-${i}`).toLowerCase() })),
    ...(data.nestedTokens || []).map((t, i) => ({ ...t, id: (t.name || `nested-${i}`).toLowerCase() })),
    ...(data.soil || []).map((t, i) => ({ ...t, id: (t.name || `soil-${i}`).toLowerCase() })),
  ];
  // Exclude 'snut' and 'nut' — they have dedicated pages at /token/snut.js and /token/nut.js
  const paths = tokens.filter((t) => t.id !== 'snut' && t.id !== 'nut' && t.id !== 'pnut').map((t) => ({ params: { id: t.id } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  // Wrap in 10s timeout to avoid hanging during build (client-side useEffect will populate at runtime)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Build-time fetch timeout')), 10000)
  );
  let data;
  try {
    data = await Promise.race([fetchTokensWithMarketData(), timeoutPromise]);
  } catch {
    data = fetchTokens(); // Fallback to static token data without marketData
  }
  const tokens = [
    { ...data.trunk, id: (data.trunk?.name || 'trunk').toLowerCase(), category: 'Trunk' },
    ...(data.branches || []).map((t, i) => ({ ...t, id: (t.name || `branch-${i}`).toLowerCase(), category: 'Branch' })),
    ...(data.nestedTokens || []).map((t, i) => ({ ...t, id: (t.name || `nested-${i}`).toLowerCase(), category: 'Nested' })),
    ...(data.soil || []).map((t, i) => ({ ...t, id: (t.name || `soil-${i}`).toLowerCase(), category: 'Soil' })),
  ];
  const token = tokens.find((t) => t.id === params.id.toLowerCase());
  if (!token) return { notFound: true };
  return { props: { token }, revalidate: 300 };
}
