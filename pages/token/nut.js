// NUT Dedicated Page — Earth / Root Theme
// The Root of All Liquidity — supply = 1, forever
// ALL numbers LIVE from /api/nut-data + /api/token-data

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Box, Typography, Chip } from '@mui/material';
import Layout from '../../components/Layout';
import TokenNav from '../../components/TokenNav';

const NUT_ADDR = '0xb8de15fb529d98c93c749de63c749d48d25a30df';
const NUT_WETH_V3 = '0xe3ce00e2ed742b142c15eedc208657dd22aa987e';
const NUT_WETH_V2 = '0x997bad8e9f5c34d5e9784caaa8a554a5e6192f53';
const SNUT_NUT_AERO = '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8';
const NUT_AERO_AERO = '0x38630fede5e2032652640d98b2d3f9c6296eea5d';
const NUT_CBTC_AERO = '0x15385c9281bc12d2e9bf5c081621944b0ee2acca';
const BALANCER_POOL = '0x2a5757b60987ff10385de1d4d923792f6fdcfff1';
const BALANCER_JOIN = 'https://balancer.fi/pools/base/v2/0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000019e';

// Earth / Root palette
const C = {
  bgDark:    '#1A0F08',
  bgCard:    'rgba(42,26,15,0.92)',
  bgCard2:   'rgba(61,43,31,0.85)',
  border:    'rgba(139,90,43,0.25)',
  text:      '#FAF3E6',
  textDim:   'rgba(250,243,230,0.92)',
  textFaint: 'rgba(250,243,230,0.68)',
  nut:       '#8B5A2B',
  nutLight:  '#C8A27A',
  cream:     '#FAF3E6',
  gold:      '#D4A676',
  green:     '#6B8E4E',
  greenLight:'#8FBC8F',
  greenGlow: '#7CB968',
  rootGlow:  '#E8B56E', // bright gold — legible on dark brown (was '#A0522D' dark orange, unreadable)
};

function fmtNum(v, dec = 2) {
  if (v == null || isNaN(v)) return '...';
  if (v >= 1e6) return (v / 1e6).toFixed(dec) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(dec) + 'K';
  if (v >= 1) return v.toFixed(dec);
  if (v > 0) return v.toFixed(6);
  return '0';
}

function fmtUsd(v) {
  if (v == null || isNaN(v)) return '...';
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(2) + 'K';
  if (v >= 1) return '$' + v.toFixed(4);
  if (v > 0) return '$' + v.toFixed(8);
  return '$0';
}

function fmtTime(iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
  catch { return ''; }
}

function fmtPct(v) {
  if (v == null || isNaN(v)) return '...';
  return v.toFixed(2) + '%';
}
function fmtNut(v) {
  if (v == null || isNaN(v)) return '...';
  if (v >= 1) return v.toFixed(6).replace(/\.?0+$/, '') || '0';
  if (v > 0) return v.toFixed(6).replace(/\.?0+$/, '') || '0';
  return '0';
}

function AddrBox({ label, addr, href }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [addr]);
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap',
      p: 0.75, borderRadius: 1, cursor: 'pointer',
      background: 'rgba(139,90,43,0.08)',
      border: '1px solid ' + C.border,
      '&:hover': { background: 'rgba(139,90,43,0.15)' },
    }} onClick={() => window.open(href || 'https://basescan.org/token/' + addr, '_blank')}>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: C.nutLight, minWidth: 'fit-content' }}>
        {label}:
      </Typography>
      <Typography sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: C.textDim, userSelect: 'all' }}>
        {addr}
      </Typography>
      <Typography sx={{ fontSize: '0.6rem', color: copied ? '#4CAF50' : C.textFaint, ml: 0.5 }} onClick={handleCopy}>
        {copied ? '✓ copied' : '📋'}
      </Typography>
    </Box>
  );
}

export default function NutPage() {
  const [nutData, setNutData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [nutRes, marketRes] = await Promise.all([
          fetch('/api/nut-data').then(r => r.json()),
          fetch('/api/token-data').then(r => r.json()),
        ]);
        if (cancelled) return;
        setNutData(nutRes?.nut || null);
        setMarketData(marketRes?.tokens?.NUT || null);
      } catch (e) {
        if (!cancelled) console.error('NUT fetch error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const d = nutData || {};
  const m = marketData || {};
  const lastUpdate = d.lastCheckedAt ? fmtTime(d.lastCheckedAt) : '';

  // Market data
  const price = m?.geckoTerminal?.price_usd ?? m?.dexScreener?.priceUsd ?? null;
  const volume24h = m?.geckoTerminal?.volume_usd_h24 ?? m?.dexScreener?.volume_h24 ?? null;
  const liquidity = m?.geckoTerminal?.total_reserve_in_usd ?? m?.dexScreener?.liquidity_usd ?? null;

  // State distribution from live data
  // API returns dexPools array with {key, nutBalance} and balancerBalances object
  const totalSupply = d.nutTotalSupply || 0;
  const dexPoolMap = {};
  if (Array.isArray(d.dexPools)) {
    d.dexPools.forEach(p => { dexPoolMap[p.key] = p.nutBalance || 0; });
  }
  const v3Bal = dexPoolMap['nutWethV3'] || 0;
  const v2Bal = dexPoolMap['nutWethV2'] || 0;
  const snutNutBal = dexPoolMap['snutNutAero'] || 0;
  const nutAeroBal = dexPoolMap['nutAeroAero'] || 0;
  const nutCbtcBal = dexPoolMap['nutCbtcAero'] || 0;
  const balancerBal = d.balancerBalances?.NUT || 0;
  const deadBal = d.deadNutBalance || 0;
  const inDex = v3Bal + v2Bal + snutNutBal + nutAeroBal + nutCbtcBal;
  const inBalancer = balancerBal;
  const inPools = inDex + inBalancer;
  const freeOrWallets = Math.max(0, totalSupply - inPools - deadBal);

  // Distribution segments for bar chart
  const distSegments = [
    { label: 'NUT/wETH V3', val: v3Bal, color: '#D4A676' },
    { label: 'Balancer (pNUT)', val: balancerBal, color: '#8FBC8F' },
    { label: 'SNUT/NUT Aero', val: snutNutBal, color: '#7CB968' },
    { label: 'NUT/AERO', val: nutAeroBal, color: '#A0522D' },
    { label: 'NUT/cbBTC', val: nutCbtcBal, color: '#CD853F' },
    { label: 'NUT/wETH V2', val: v2Bal, color: '#D2691E' },
    { label: 'Remainder (all other balances)', val: freeOrWallets, color: '#6B8E4E' },
    { label: 'Dead / Irrecoverable', val: deadBal, color: '#5A4A3A' },
  ];
  const distTotal = distSegments.reduce((s, x) => s + x.val, 0) || 1;

  // GeckoTerminal chart embed
  const chartSrc = 'https://www.geckoterminal.com/base/pools/' + NUT_WETH_V3 + '?embed=1&info=0&chart=1&theme=dark&chartType=candlestick&chartInterval=1D&interval=1D';

  // Pools data
  const pools = [
    { name: 'NUT/wETH', platform: 'Uniswap V3', status: 'Concentrated', url: 'https://app.uniswap.org/explore/tokens/base/' + NUT_ADDR, dex: 'https://dexscreener.com/base/' + NUT_WETH_V3, flavor: 'Primary price discovery pool' },
    { name: 'NUT/wETH', platform: 'Uniswap V2', status: 'Volatile', url: 'https://app.uniswap.org/explore/tokens/base/' + NUT_ADDR, dex: 'https://dexscreener.com/base/' + NUT_WETH_V2, flavor: 'Legacy liquidity pool' },
    { name: 'SNUT/NUT', platform: 'Aerodrome', status: 'Volatile', url: 'https://aerodrome.finance/pools?token1=' + NUT_ADDR, dex: 'https://dexscreener.com/base/' + SNUT_NUT_AERO, flavor: 'Reactor pool — keeps SNUT/NUT aligned' },
    { name: 'NUT/AERO', platform: 'Aerodrome', status: 'Volatile', url: 'https://aerodrome.finance/pools?token1=' + NUT_ADDR, dex: 'https://dexscreener.com/base/' + NUT_AERO_AERO, flavor: 'Aero-denominated route' },
    { name: 'NUT/cbBTC', platform: 'Aerodrome', status: 'Volatile', url: 'https://aerodrome.finance/pools?token1=' + NUT_ADDR, dex: 'https://dexscreener.com/base/' + NUT_CBTC_AERO, flavor: 'Bitcoin-denominated route' },
    { name: 'pNUT Basket', platform: 'Balancer V2', status: 'Index', url: BALANCER_JOIN, dex: 'https://dexscreener.com/base/' + BALANCER_POOL, flavor: '25% NUT + 25% SNUT + 25% cbETH + 25% cbBTC' },
  ];

  // Related tokens
  const related = [
    { name: 'SNUT', icon: '🌰', desc: 'Reward-position token with rewards flowing to holders', link: '/token/snut' },
    { name: 'pNUT', icon: '🌰', desc: 'Balancer index basket (NUT + SNUT + cbETH + cbBTC)', link: '/token/pnut' },
    { name: 'NUTINO', icon: '🌰', desc: 'Bonding curve token minted with NUT collateral', link: '/token/nutino' },
    { name: 'SALT', icon: '❄️', desc: 'Bonding curve token minted with NUT collateral', link: '/token/salt' },
  ];

  // Arb routes
  const arbRoutes = [
    { route: 'NUT/wETH V2 vs V3', desc: 'Same pair on different exchanges. Buy cheap, sell expensive.', url: 'https://dexscreener.com/base/' + NUT_WETH_V3 },
    { route: 'NUT → AERO → wETH', desc: 'Multi-hop route through Aerodrome for another price reference.', url: 'https://dexscreener.com/base/' + NUT_AERO_AERO },
    { route: 'Bonding curve vs LP', desc: 'NUTINO/SALT curve price vs their LP market price. If curve is cheaper, mint and sell on LP.', url: 'https://mint.club/token/base/nutino' },
    { route: 'pNUT index vs constituents', desc: 'If pNUT trades below its components value, buy pNUT and unwrap.', url: BALANCER_JOIN },
    { route: 'SNUT/NUT reactor', desc: 'The SNUT/NUT Aerodrome pool keeps SNUT and NUT prices aligned.', url: 'https://dexscreener.com/base/' + SNUT_NUT_AERO },
  ];

  // Beyond-Advanced — canonical state machine vocabulary
  // Beyond-Advanced — canonical state machine vocabulary, PhD terms, meme-translated
  // Beyond-Advanced — canonical state machine vocabulary, grouped by evidence level, meme-translated
  const VOCAB_GROUPS = [
    {
      title: 'Established Invariants',
      emoji: '✅',
      items: [
        { term: 'Conserved Root Supply', read: 'Exactly 1 NUT = 10^18 atomic units. No mint, no burn — every transition relocates a fraction of the same conserved total.', meme: 'The whole nut is always the same whole nut.' },
        { term: 'How NUT Changes — Temporal State', read: 'The conserved ledger is not a snapshot, it is a trajectory: state changes through balances, reserves, pools, curves, and indexes. Ω₀ → Ω₁ → Ω₂ → … every output remains a valid next input.', meme: 'Same tree, new leaf every block — you cannot step into the same orchard twice.' },
        { term: 'Arbitrage Coupling', read: 'Arbitrage couples otherwise separate venues: gaps between differently priced markets create the pressure that pulls the graph back toward alignment.', meme: 'Arb bots are nature’s market-maker: noise in, alignment out.' },
        { term: 'Nonlinear Dynamics', read: 'AMM pricing, concentrated liquidity, bonding curves, and slippage are nonlinear because prices depend on reserves and liquidity depth.', meme: 'Poke the edge of the curve and the whole orchard sways. Not a bug — the shape.' },
        { term: 'Multi-Pool Network', read: 'NUT participates in many pools at once, and pools share assets. The ecosystem is a network of conservation constraints among pools, not a single pairwise graph.', meme: 'Polycule energy: every pool dates multiple assets, and the relationship is not pairwise.' },
        { term: 'Conservation Identity', read: 'A known total bounds every remainder: unobserved = conserved total − observed. That is a conservation identity — mapping the remainder’s distribution and control needs more observables.', meme: 'One peek at the garden constrains every other square — the total is always the same number.' },
      ],
    },
    {
      title: 'Observed Feedback Mechanisms',
      emoji: '🔁',
      items: [
        { term: 'Liquidity Feedback', read: 'Venue state feeds venue behavior: gaps close, liquidity relocates, and the price surface reprices itself in a closed loop. Output becomes input.', meme: 'CLOSED LOOP CONFIRMED: the price surface reprices itself, then reprices the repricing.' },
        { term: 'Recursive Collateral Topology', read: 'Compositionally layered: NUT sits at the root, and every child claim (SALT, NUTINO, pNUT, NFTs) folds back into the root ledger through reserves. Strict recursion is claimed only where closed economic or state-transition cycles are demonstrated.', meme: 'It’s peanuts all the way down — every child claim wraps back to the same root.' },
        { term: 'Reflexivity Loop', read: 'Child assets derive value from NUT, and their activity feeds back to NUT’s price through deterministic contracts; agents choose actions, the graph does not vote. NUT itself just shows up.', meme: 'scarce root → venues → child minting → index wrapping → price gaps → arbitrage → root reprices → repeat' },
      ],
    },
    {
      title: 'Proposed Analytical Frameworks',
      emoji: '🔬',
      note: 'Conditional by design: each may be modeled, may be exhibited, or can be tested for — none is asserted as an automatic property of the deployed contracts.',
      items: [
        { term: 'No-Arbitrage Region', read: 'Venues may not reach identical prices. The realistic criterion: executable gaps shrink inside a band set by fees + gas + slippage. Fixed points are the idealized limit; the no-arbitrage band is the operative equilibrium.', meme: 'Arbitrage dies of boredom when every executable gap is cheaper to ignore than to harvest.' },
        { term: 'Recursive Self-Similarity', read: 'Layering alone is not self-similarity. The claim is rigorous only when the same relation recurs across scales (reserve → claim → market → reserve). Otherwise the accurate phrase is multiscale structural recurrence.', meme: 'It’s nuts all the way down — but which exact relation repeats? Measure it.' },
        { term: 'Multiscale Aggregation', read: 'attoNUT for the ledger, picoNUT for price impact, microNUT for humans, one for the legend: the same quantity described at different scales by different SI prefixes.', meme: 'Same nut at every zoom — only the descriptor changes.' },
      ],
    },
    {
      title: 'Open Research Questions',
      emoji: '🔭',
      items: [
        'Can a formal state vector x_t be defined that covers balances, reserves, supplies, LP positions, claims, and parameters?',
        'Can dominant modes of coupled movement be measured from pool-price and reserve time series?',
        'Do executable cross-venue gaps actually settle inside a stable no-arbitrage band?',
        'Can child-asset issuance be shown to strengthen the parent through measurable reserve flows?',
        'Which exact cycles, if any, make the system recursive rather than merely layered?',
        'Can a stability certificate exist, or is supply conservation the only hard invariant?',
      ],
    },
  ];

  // Section wrapper
  const Section = ({ title, icon, children, glow }) => (
    <Box sx={{
      mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3,
      background: 'linear-gradient(135deg, ' + C.bgCard + ' 0%, ' + C.bgCard2 + ' 100%)',
      border: '1px solid ' + (glow ? 'rgba(160,82,45,0.3)' : C.border),
      boxShadow: glow ? '0 4px 20px rgba(160,82,45,0.08)' : '0 4px 16px rgba(0,0,0,0.15)',
    }}>
      <Typography sx={{
        fontSize: '1.15rem', fontWeight: 800, mb: 2,
        color: glow ? C.rootGlow : C.nutLight,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>{icon} {title}</Typography>
      {children}
    </Box>
  );

  // Stat card for market stats
  const StatRow = ({ label, value, source }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.5, borderBottom: '1px solid ' + C.border }}>
      <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>{label}</Typography>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: C.cream }}>{value}</Typography>
        {source && <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>{source}</Typography>}
      </Box>
    </Box>
  );

  return (
    <Layout>
      <Head>
        <title>NUT | The Root of All Liquidity | BASED NUT</title>
        <meta name="description" content="NUT — the root of all liquidity. Supply = 1, forever. The scarce root asset of the BASED NUT ecosystem." />
      </Head>
        <TokenNav dark />


      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>

        {/* 1. HERO */}
        <Box sx={{
          position: 'relative', mb: 3, p: { xs: 2.5, md: 4 }, borderRadius: 4, overflow: 'hidden',
          background: 'linear-gradient(160deg, ' + C.bgDark + ' 0%, #3D2B1F 50%, #4A2F1A 100%)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          border: '1px solid ' + C.border,
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: C.cream, fontWeight: 900 }}>
              🌰 NUT
            </Typography>
            <Typography sx={{ mb: 2, fontSize: '1.1rem', color: C.nutLight, fontWeight: 600 }}>
              The Root of All Liquidity
            </Typography>
            <Typography sx={{ mb: 2, color: C.textDim, fontSize: '0.9rem', maxWidth: 600 }}>
              Supply = <strong style={{ color: C.gold }}>1</strong> whole token split into <strong style={{ color: C.gold }}>1 quintillion atomic units</strong> (10^18 attoNUTs) — a conserved ledger with no mint, no burn, and no admin on the root contract. Every swap relocates a fraction of the same supply; whole-token price equals FDV because total supply is one. Specified child assets use NUT as collateral, reward asset, constituent, or reference input.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip sx={{ bgcolor: 'rgba(212,166,118,0.15)', color: C.gold, fontWeight: 600 }} label="Trunk" size="small" />
              <Chip sx={{ bgcolor: 'rgba(139,90,43,0.12)', color: C.nutLight }} label="ERC-20" size="small" />
              <Chip sx={{ bgcolor: 'rgba(139,90,43,0.12)', color: C.nutLight }} label="Base" size="small" />
              <Chip sx={{ bgcolor: 'rgba(139,90,43,0.12)', color: C.nutLight }} label="Core" size="small" />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Link href="https://docs.basednut.com/nut" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ px: 2, py: 0.5, borderRadius: 2, fontSize: '0.8rem', fontWeight: 700, color: C.cream, background: 'linear-gradient(135deg, #8B5A2B, #A0522D)', border: '1px solid #6B3D20', cursor: 'pointer', '&:hover': { transform: 'translateY(-1px)' }, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>📖 Docs</Box>
              </Link>
              <Link href={'https://basescan.org/token/' + NUT_ADDR} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ px: 2, py: 0.5, borderRadius: 2, fontSize: '0.8rem', fontWeight: 700, color: C.nutLight, background: 'rgba(139,90,43,0.08)', border: '1px solid ' + C.border, cursor: 'pointer', '&:hover': { background: 'rgba(139,90,43,0.15)' }, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>🔍 Basescan</Box>
              </Link>
              <Link href={'https://app.uniswap.org/explore/tokens/base/' + NUT_ADDR} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ px: 2, py: 0.5, borderRadius: 2, fontSize: '0.8rem', fontWeight: 700, color: C.cream, background: 'linear-gradient(135deg, #8B5A2B, #A0522D)', border: '1px solid #6B3D20', cursor: 'pointer', '&:hover': { transform: 'translateY(-1px)' }, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>🔄 Trade on Uniswap V3</Box>
              </Link>
            </Box>
            <Box sx={{ mt: 2 }}>
              <AddrBox label="Contract" addr={NUT_ADDR} />
            </Box>
          </Box>
        </Box>

        {/* 2. CHART + MARKET STATS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 3 }}>
          {/* Chart */}
          <Box sx={{ position: 'relative', width: '100%', pb: { xs: '75%', md: '60%' }, borderRadius: 3, overflow: 'hidden', border: '1px solid ' + C.border, boxShadow: '0 6px 18px rgba(0,0,0,0.2)' }}>
            <iframe title="NUT chart" src={chartSrc} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} frameBorder="0" />
          </Box>
          {/* Market stats */}
          <Box sx={{ p: 2, borderRadius: 3, background: 'linear-gradient(135deg, ' + C.bgCard + ' 0%, ' + C.bgCard2 + ' 100%)', border: '1px solid ' + C.border }}>
            <Typography sx={{ fontSize: '0.9rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1.5, letterSpacing: '0.05em' }}>Market Stats</Typography>
            <StatRow label="Price" value={loading ? '...' : fmtUsd(price)} source={m?.geckoTerminal ? 'GeckoTerminal' : m?.dexScreener ? 'DexScreener' : null} />
            <StatRow label="Volume (24h)" value={loading ? '...' : fmtUsd(volume24h)} source={m?.geckoTerminal ? 'GeckoTerminal' : null} />
            <StatRow label="Liquidity" value={loading ? '...' : fmtUsd(liquidity)} source={m?.geckoTerminal ? 'GeckoTerminal' : null} />
            <StatRow label="Total Supply" value={loading ? '...' : fmtNum(totalSupply, 0)} source="Base RPC" />
            <StatRow label="Venues" value={loading ? '...' : '6 venues'} source="Live" />
            {lastUpdate && (
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, mt: 1, textAlign: 'right' }}>
                Updated {lastUpdate}
              </Typography>
            )}
          </Box>
        </Box>

        {/* 3. WHAT IS NUT? */}
        {/* 0. THE MASTER QUESTION */}
        <Box sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, ' + C.bgCard + ' 0%, ' + C.bgCard2 + ' 100%)', border: '1px solid rgba(212,166,118,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: C.gold, lineHeight: 1.5, textAlign: 'center' }}>
            How many economically distinct systems can coordinate around the same monetary root?
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.95rem', lineHeight: 1.6, mt: 1, textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
            That is the question this page exists to investigate. One token, quantity frozen forever. Everything below is the economic structure that can still expand around it.
          </Typography>
        </Box>

        <Section title="What Is NUT?" icon="🌰" glow>
          <Typography sx={{ color: C.text, fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 700 }}>
            NUT is the <strong style={{ color: C.gold }}>root asset</strong> of the BASED NUT ecosystem. It has a fixed supply of exactly <strong style={{ color: C.gold }}>1 token</strong> — no more can ever be minted. Because supply is 1, the whole-token price equals the FDV.
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mt: 1.5, maxWidth: 700 }}>
            Every other token in the ecosystem is built on top of NUT. <em>Bonding curve tokens</em> (NUTINO, SALT) are minted by locking NUT as collateral. <em>SNUT</em> is a reward-position token that earns NUT for holders. <em>pNUT</em> is an index basket that includes NUT as 25% of its weight. This makes NUT the <strong style={{ color: C.nutLight }}>reference coordinate</strong> — specified child assets use NUT as collateral, reward asset, constituent, or reference input.
          </Typography>
        </Section>

        {/* 3b. WHY LAYERS EXIST — flat tokenomics */}
        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, background: 'rgba(61,32,14,0.95)', border: '1px solid rgba(212,166,118,0.4)' }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Why layers exist — separate the pressures without separating the system</Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#F4EADA', lineHeight: 1.6 }}>
            A flat token forces incompatible economic pressures onto one instrument: if spending, rewards, collateral, and index value all ride the same balance, changing any one destabilizes the others. The layered system separates those pressures into distinct instruments <em>while keeping them all anchored to the same conserved root</em> — separation of monetary labor without splitting the monetary whole.
          </Typography>
        </Box>

        {/* 4. WHERE IS THE NUT? */}
        <Section title="Where Is The NUT?" icon="📊">
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', mb: 2, maxWidth: 600 }}>
            Supply is 1 — forever. But that 1 NUT is split across pools and wallets. This is a <em>conservation problem</em>: how is the single NUT distributed across the ecosystem?
          </Typography>

          {/* Visual bar chart */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', height: 32, borderRadius: 2, overflow: 'hidden', border: '1px solid ' + C.border }}>
              {distSegments.map((seg, i) => {
                const pct = (seg.val / distTotal) * 100;
                if (pct < 0.1) return null;
                return (
                  <Box key={i} sx={{
                    width: pct + '%',
                    background: seg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: pct > 3 ? 'fit-content' : 0,
                    '&:hover': { filter: 'brightness(1.2)' },
                    transition: 'filter 0.2s',
                  }} title={seg.label + ': ' + fmtNum(seg.val, 6) + ' (' + fmtPct(pct) + ')'}>
                    {pct > 8 && <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#1A0F08' }}>{fmtPct(pct)}</Typography>}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.5, mb: 2 }}>
            {distSegments.map((seg, i) => {
              const pct = (seg.val / distTotal) * 100;
              return (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 1, background: seg.color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.9rem', color: C.textDim, flex: 1 }}>{seg.label}</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: C.cream }}>{fmtNut(seg.val)} NUT</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: C.textFaint }}>{fmtPct(pct)}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Stat cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 1 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>Total Supply</Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: C.gold }}>{loading ? '...' : fmtNut(totalSupply)}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>NUT</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>In DEX Pools</Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: C.nutLight }}>{loading ? '...' : fmtNut(inDex)}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>NUT</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>In Balancer</Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: C.greenLight }}>{loading ? '...' : fmtNut(inBalancer)}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>NUT</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>Remainder</Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: C.greenGlow }}>{loading ? '...' : fmtNut(freeOrWallets)}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>NUT</Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Where Is The NUT? — a conserved measure over economic compartments</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.6 }}>
              Formally, μ<sub>t</sub>(C) = the fraction of total NUT residing in compartment C, and μ<sub>t</sub>(𝒞) = 1 across every compartment. So this chart is not just token distribution — it is the observable map of a conserved measure over the economic system. The question "where is the NUT?" asks how one conserved whole is distributed across economic compartments.
            </Typography>
          </Box>
        </Section>

        {/* 4b. LESS IS MORE — SUPPLY OF ONE */}
        <Section title="LESS IS MORE: Supply of One" icon="⚖️" glow>
          <Typography sx={{ color: C.text, fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 720 }}>
            A 10,000-supply token also holds quintillions of atomic units — 10,000 × 10<sup>18</sup> of them. So what is really different about NUT?
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mt: 1.5, maxWidth: 720 }}>
            Other supplies can be normalized too. What is different about NUT is that it begins normalized: because total supply is exactly one, every balance is numerically identical to its share of the whole. 0.01 NUT is 1% of every NUT that will ever exist — no secondary math needed.
          </Typography>
          <Typography sx={{ color: C.text, fontSize: '0.9rem', lineHeight: 1.7, mt: 1.5, maxWidth: 720 }}>
            NUT is scarce by supply and conserved by design. Nothing new enters and nothing leaves; the entire economy unfolds through where the same whole resides, how accessible it is, and what each market makes it worth.
          </Typography>
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
            <Typography sx={{ fontSize: '0.8rem', color: C.gold, fontWeight: 700, mb: 0.5 }}>A conserved measure of allocation</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: C.textDim, lineHeight: 1.6 }}>
              NUT is the conserved measure of its own allocation: every NUT amount is numerically identical to its share of total supply, S=1 ⇒ x<sub>i</sub> = quantity = share of the whole. The broader state Ω<sub>t</sub> — reserves, liquidity, derived claims, parameters, memory — is a separate object. NUT does not measure all state; it is the conserved root those states describe.
            </Typography>
          </Box>
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', lineHeight: 1.7, mt: 1.5, maxWidth: 720 }}>
            No supply curve, no issuance game. Because the root quantity begins at one, the entire economy unfolds through where that same whole resides, how accessible it is, and what each market makes it worth.<br />
            <strong style={{ color: C.gold }}>— Much more than a scarce token: a conserved ledger whose economy unfolds through position, accessibility, and local valuation.</strong>
          </Typography>
        </Section>

        {/* 5. LIQUIDITY CONNECTIONS */}
        <Section title="Liquidity Connections" icon="🔗">
          {/* Pools */}
          <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>Liquidity Pools</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 0.75, mb: 2 }}>
            {pools.map((p, i) => (
              <Box key={i} sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: C.cream }}>{p.name}</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>{p.platform}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.66rem', color: C.textDim, lineHeight: 1.3, minHeight: '2.6em' }}>{p.flavor}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Link href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box sx={{ px: 0.75, py: 0.2, borderRadius: 1, fontSize: '0.6rem', fontWeight: 600, color: C.cream, background: 'linear-gradient(135deg, #8B5A2B, #A0522D)', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { filter: 'brightness(1.15)' } }}>Trade →</Box>
                  </Link>
                  <Link href={p.dex} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box sx={{ px: 0.75, py: 0.2, borderRadius: 1, fontSize: '0.6rem', fontWeight: 600, color: C.nutLight, background: 'rgba(139,90,43,0.08)', border: '1px solid ' + C.border, cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { background: 'rgba(139,90,43,0.15)' } }}>Chart →</Box>
                  </Link>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Related tokens */}
          <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>Child Tokens</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {related.map((c, i) => (
              <Link key={i} href={c.link} style={{ textDecoration: 'none' }}>
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 999, fontSize: '0.92rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', color: C.cream, background: 'rgba(139,90,43,0.08)', border: '1px solid ' + C.border, '&:hover': { background: 'rgba(139,90,43,0.15)', transform: 'translateY(-1px)' } }}>
                  {c.icon} {c.name}
                </Box>
              </Link>
            ))}
          </Box>

          {/* Arb routes — plain-language explainer first */}
          <Box sx={{ mb: 1.5, p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>What is arbitrage, in plain words?</Typography>
            <Typography sx={{ fontSize: '0.92rem', color: C.textDim, lineHeight: 1.6 }}>
              The same NUT trades in many markets at once — Uniswap V2, V3, Aerodrome, Balancer, bonding curves. Every market has its own price, so sometimes the same NUT is cheaper in one place and pricier in another. <strong style={{ color: C.gold }}>Arbitrage is buying it where it is cheap and instantly selling it where it is dear</strong>, pocketing the difference. That gap-closing is not cheating or a bug — it is the ecosystem keeping itself honest. Bots race to find these gaps, which pulls every venue's price back into line. Multi-venue fragmentation creates the possibility of discrepancies; arbitrage economically couples those venues back into line. Because NUT is one conserved unit spread across many venues, its price surfaces are coupled by a shared root — which is exactly why we run a lot of arbitrage.
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>Arbitrage Routes</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {arbRoutes.map((a, i) => (
              <Link key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border, cursor: 'pointer', '&:hover': { background: 'rgba(139,90,43,0.1)' }, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(212,166,118,0.15)', border: '1px solid rgba(212,166,118,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: C.gold }}>{i + 1}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: C.gold, mb: 0.25 }}>{a.route}</Typography>
                    <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.4 }}>{a.desc}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, flexShrink: 0, mt: 0.5 }}>→</Typography>
                </Box>
              </Link>
            ))}
          </Box>
        </Section>

        {/* 5. HOW IT WORKS */}
        <Section title="How It Works" icon="🧠">
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', mb: 2, maxWidth: 600 }}>
            NUT sits at the center of a layered system. Each layer uses NUT differently.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>1. Root Layer</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}>NUT itself. Supply = 1, fixed forever. The scarce anchor everything else references.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.nutLight, mb: 0.5 }}>2. AMM Layer</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><em>Automated Market Makers</em> (Uniswap V3, V2, Aerodrome) and a Balancer index create price surfaces. NUT trades across 6 venues in 4 mechanism platforms.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.greenLight, mb: 0.5 }}>3. Bonding-Curve Layer</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><em>Bonding curves</em> (Mint Club) let users lock NUT to mint child tokens (NUTINO, SALT). The curve price depends on how much NUT is locked. Each curve computes a state-dependent exchange relation — another executable price surface.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.rootGlow, mb: 0.5 }}>4. Index Layer</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><em>pNUT</em> is a Balancer basket holding 25% each of NUT, SNUT, cbETH, cbBTC. Its <em>NAV</em> (net asset value) can drift from market price, creating arbitrage.</Typography>
            </Box>
          </Box>
          {/* Reflexivity loop */}
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(160,82,45,0.06)', border: '1px solid rgba(160,82,45,0.15)' }}>
            <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>The Reflexivity Loop</Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.88rem', color: C.nutLight, lineHeight: 1.8 }}>
              scarce root → multiple venues → child minting → index wrapping → price gaps → arbitrage → root reprices → repeat
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, mt: 1, lineHeight: 1.5 }}>
              The system is <em>reflexive</em> — child assets derive value from NUT, and their activity feeds back to NUT's price. Contracts execute deterministically and agents choose actions under those rules — the graph does not vote. NUT itself just shows up.
            </Typography>
          </Box>
        </Section>

        {/* 7. THE PHYSICS OF NUT — INVARIANTS */}
        <Section title="The Physics of NUT" icon="🔬" glow>
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', mb: 2, maxWidth: 600 }}>
            Not a supply curve. A conserved ledger. These are the rules, identities, and consequences that make the root what it is.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>1 — Conservation</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}>One whole NUT is 10<sup>18</sup> atomic units, minted once, never again. Total supply is verified on-chain as exactly 1 NUT; the root contract is reviewed as having no mint, no burn, no admin. Every swap, pool move, mint, or index change only relocates a fraction of the same total. State changes address; amount never changes. <strong style={{ color: C.gold }}>Why it matters:</strong> supply can never drift or dilute.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.nutLight, mb: 0.5 }}>2 — Whole Price Equals FDV</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}>Because total supply is exactly one, FDV = price × 1 = price — so no circulating-supply estimate is needed, no unlock schedule, no inflation curve. <strong style={{ color: C.gold }}>Why it matters:</strong> whole-token price equals FDV by construction. A separate fact: quantity is invariant, but effective float — how much of the one NUT is accessible to trade — is endogenous to pools, locks, indexes, and inactive balances.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.greenLight, mb: 0.5 }}>3 — State Transition</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}>Each venue couples fractions of the same conserved NUT root to different counter-assets and state variables under different transition rules — NUT/wETH, NUT/AERO, NUT/cbBTC, an index basket. So the same one NUT can carry different prices at the same moment. Deterministic rules make discrepancies observable; arbitrage creates pressure toward executable consistency within a band set by fees + gas + slippage. <strong style={{ color: C.gold }}>Why it matters:</strong> venue rules are deterministic; whether and how fast markets converge is an open question, not a guarantee.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.rootGlow, mb: 0.5 }}>4 — Denomination</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}>NUT uses strict SI units: the attoNUT is the monetary quantum of the ledger — its smallest representable transfer unit. 1 NUT = 10<sup>18</sup> monetary quanta. picoNUT, microNUT, and NUT are the same quantity at larger scales. <strong style={{ color: C.gold }}>Why it matters:</strong> one unit, one grammar, one conserved root at every zoom.</Typography>
            </Box>
          </Box>
        </Section>

        {/* 8. LOCAL VALUATION, GLOBAL CONSERVATION */}
        <Section title="Local Valuation, Global Conservation" icon="🎯" glow>
          <Typography sx={{ color: C.text, fontSize: '0.9rem', lineHeight: 1.7, mb: 1.5, maxWidth: 760 }}>
            One conserved root. Many local price surfaces. <strong style={{ color: C.gold }}>No venue owns the truth.</strong>
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', lineHeight: 1.7, mb: 1.5, maxWidth: 760 }}>
            The same fungible NUT trades on Uniswap V2, V3, Aerodrome, and Balancer — none speaks the other's language, yet fractions of the one unit live inside all of them. Each venue produces an executable exchange rate from its own reserves, liquidity, fees, and curve, so you get many local prices for one globally conserved asset.
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', lineHeight: 1.7, mb: 2, maxWidth: 760 }}>
            There is no canonical on-chain price of NUT — only local executable prices, coupled by arbitrage, which exists precisely because those prices are commensurable. The spread is not a flaw; it is the honest observable of one root living in many jobs.
          </Typography>
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
            <Typography sx={{ fontSize: '0.85rem', color: C.gold, fontWeight: 700, lineHeight: 1.6 }}>
              Price is not stored in NUT. Price is produced by the state of the market observing NUT.
            </Typography>
          </Box>

          {/* FOUR JOBS — ALLOCATION PRESSURE */}
          <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>The Four Jobs — Allocation Pressure</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Collateral</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Commits NUT as collateral to mint child tokens (NUTINO, SALT) on bonding curves, leaving it locked and stable.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.nutLight, mb: 0.5 }}>Reward</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Distributed out to participants through reward layers, keeping some NUT transferable.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.greenLight, mb: 0.5 }}>Basket Member</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Reserved and rebalanced at a defined weight inside the pNUT index by composition rules.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.rootGlow, mb: 0.5 }}>Price</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Exposed to exchange — markets keep some NUT liquid for trading, speculation, and price discovery.</Typography>
            </Box>
          </Box>
          <Typography sx={{ color: C.textDim, fontSize: '0.95rem', lineHeight: 1.7, mb: 2, maxWidth: 760, fontStyle: 'italic' }}>
            A conserved supply can perform all four jobs; what it cannot do is satisfy all four without competing demands on its allocation. Because root quantity cannot expand, competing uses resolve through reallocation rather than issuance.
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.95rem', lineHeight: 1.7, mb: 2, maxWidth: 760, fontStyle: 'italic' }}>
            Fungibility does not imply functional equivalence of placement. 0.01 NUT is always 1% of root supply wherever it resides, but 0.01 NUT in an AMM, a collateral reserve, an index basket, or an inactive wallet occupies a different economic state. Prices are commensurable; functions are heterogeneous.
          </Typography>

          {/* THE LIQUIDITY MACHINE */}
          <Box sx={{ mb: 1.5, p: 1.5, borderRadius: 2, background: 'rgba(160,82,45,0.06)', border: '1px solid rgba(160,82,45,0.15)' }}>
            <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>The Liquidity Machine</Typography>
            <Typography sx={{ color: C.text, fontSize: '0.85rem', lineHeight: 1.7, mb: 1 }}>
              NUT does not move through a passive market. It moves through a machine it rewrites by moving.
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.88rem', color: C.nutLight, lineHeight: 1.9, mb: 1 }}>
              object → position → graph → field → motion → backreaction → dynamics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0.75, mb: 1 }}>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Object</strong> — one conserved quantity, Q<sub>NUT</sub> = 1.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Position</strong> — a distributed allocation over economic compartments, ∑xᵢ = 1.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Graph</strong> — markets define the permitted paths through which allocation can change.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Field</strong> — prices, fees, reserves, liquidity generate a directed opportunity field over those paths.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Motion</strong> — agents exploit the directed opportunity field; those actions are transactions.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Backreaction</strong> — transactions change reserves and liquidity, changing the field that caused them.</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Dynamics</strong> — the repeated loop generates endogenous market behavior.</Typography>
            <Typography sx={{ color: C.gold, fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.6, mt: 1.5 }}>
              NUT is a conserved object moving through a liquidity graph whose geometry and incentive field are modified by the object's own movement.
            </Typography>
            <Typography sx={{ color: C.textDim, fontSize: '0.92rem', lineHeight: 1.6, mt: 1 }}>
              A road stays put when a car crosses it. A liquidity network does not: a swap is not just passing through a pipe — it is reshaping the pipe. Using the graph changes the state of the graph — reserves, prices, ticks, edge weights — and only adding or removing pools changes its topology.
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: C.nutLight, lineHeight: 1.8, mt: 1 }}>
              state → incentive → transaction → new state → new incentive
            </Typography>
            <Typography sx={{ color: C.textDim, fontSize: '0.92rem', lineHeight: 1.6, mt: 1 }}>
              When the gap between two venues exceeds the cost of moving value between them — fees, gas, slippage, risk — an actor has a reason to move NUT. That transaction changes reserves, which changes prices, which changes the opportunity field that caused the trade. The market creates the forces that move NUT, and the movement of NUT changes the market that created those forces.
            </Typography>
          </Box>
        </Section>

        {/* 9. STRUCTURAL LIQUIDITY — LP PLACEMENT */}
        <Section title="Structural Liquidity" icon="🛠️" glow>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', mb: 1.5, maxWidth: 720 }}>
            LPs choose where to place NUT liquidity — venue, range, and depth. Those choices change price impact, executable routes, and where price discovery lives, without changing a single unit of root supply.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Protocol-Owned Core Liquidity</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}>Protocol-owned core liquidity, intended to provide continuity and stability — the trunk. It defines the reference surface and keeps routes executable.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.nutLight, mb: 0.5 }}>Adaptive Community Liquidity</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}>Community-managed liquidity that moves with opportunity — the branches. It adapts without changing root supply.</Typography>
            </Box>
          </Box>
          <Typography sx={{ color: C.gold, fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.6 }}>
            When root quantity cannot adjust, part of economic adjustment migrates into liquidity placement and routing.
          </Typography>
        </Section>

        {/* 10. THE FULL STATE — BEYOND ALLOCATION */}
        <Section title="The Full State" icon="🧮" glow>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', mb: 1.5, maxWidth: 760 }}>
            The allocation vector x_t is fundamental, but it is not the whole ecosystem. The full state is a tuple of observables:
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.95rem', color: C.gold, textAlign: 'center', mb: 1.5, p: 1.5, borderRadius: 2, background: 'rgba(61,32,14,0.95)', border: '1px solid rgba(212,166,118,0.4)' }}>
            Ω<sub>t</sub> = (x<sub>t</sub>, R<sub>t</sub>, L<sub>t</sub>, Q<sub>t</sub>, Θ<sub>t</sub>, M<sub>t</sub>, E<sub>t</sub>)
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1, mb: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold }}>x_t — NUT allocation</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>The conserved simplex share of NUT itself.</Typography>
            </Box>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.nutLight }}>R_t — reserves</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>Counter-asset and collateral reserves per venue.</Typography>
            </Box>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.greenLight }}>L_t — liquidity</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>Liquidity positions, range, and depth.</Typography>
            </Box>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.rootGlow }}>Q_t — derived states</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>Child-token and index states built on NUT.</Typography>
            </Box>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold }}>Θ_t — parameters</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>Fees, curve parameters, weights, mechanism settings.</Typography>
            </Box>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.nutLight }}>M_t — memory</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>History-dependent observables such as TWAP.</Typography>
            </Box>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.rootGlow }}>E_t — external environment</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>External market and chain conditions — wETH, cbBTC, AERO, gas, block conditions, broader liquidity.</Typography>
            </Box>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(160,82,45,0.06)', border: '1px solid rgba(160,82,45,0.15)', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>State Grammar — what motion actually is</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.6 }}>
              Valid actions are lawful state transformations: T<sub>a</sub>: Ω<sub>t</sub> → Ω<sub>t+1</sub>. Swaps, curve mints, redemptions, joins, exits, and liquidity moves are different transition operators. Every valid transition changes state while preserving the conservation identity.
            </Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem', color: C.gold, mt: 1, lineHeight: 1.6 }}>
              T<sub>a</sub>(Ω<sub>t</sub>) = Ω<sub>t+1</sub>,&nbsp;&nbsp;with&nbsp;&nbsp;∑ x<sub>i</sub>(t+1) = ∑ x<sub>i</sub>(t) = 1
            </Box>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(160,82,45,0.06)', border: '1px solid rgba(160,82,45,0.15)', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Liquidity Computation Graph — pools compute, not just quote</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.6 }}>
              A pool does not merely contain a price; given current state and trade size it computes an executable transformation from state.
            </Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem', color: C.gold, mt: 1, lineHeight: 1.6 }}>
              T<sub>ij</sub>(Ω<sub>t</sub>, q) → (Ω<sub>t+1</sub>, q′)
            </Box>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.6, mt: 1 }}>
              A route is the composition of those transformations: T<sub>n</sub> ∘ ⋯ ∘ T<sub>2</sub> ∘ T<sub>1</sub>. This joins State Grammar, noncommutativity, and the liquidity graph into one model — the network is not merely connected markets, it is an executable computation graph of economic transformations.
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.nutLight, mb: 0.5 }}>State versus History — path dependence</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.6 }}>
              Two histories can land on the same NUT allocation while leaving different TWAP observations, LP configurations, or agent positions behind:
            </Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem', color: C.gold, mt: 1, lineHeight: 1.6 }}>
              x<sub>t</sub><sup>A</sup> = x<sub>t</sub><sup>B</sup> &nbsp;but&nbsp; Ω<sub>t</sub><sup>A</sup> ≠ Ω<sub>t</sub><sup>B</sup> &nbsp;⇒&nbsp; x<sub>t</sub> ≠ Ω<sub>t</sub>
            </Box>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.6, mt: 1 }}>
              That is why the allocation map is fundamental but insufficient — and what gives "TWAP is memory" a real function: the machine can carry history beyond the current allocation vector.
            </Typography>
          </Box>
        </Section>

        {/* 11. THE CONSERVATION IDENTITY */}
        <Section title="The Conservation Identity" icon="🧬" glow>
          <Box sx={{ mb: 1.5, p: 2, borderRadius: 2, background: 'rgba(61,32,14,0.95)', border: '1px solid rgba(212,166,118,0.4)' }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: C.gold, textAlign: 'center', lineHeight: 1.6 }}>
              ∑ xᵢ(t) = 1
            </Typography>
            <Typography sx={{ color: '#F4EADA', fontSize: '0.9rem', lineHeight: 1.7, mt: 1, textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
              x<sub>i</sub> ≥ 0, mutually exclusive and collectively exhaustive shares of NUT itself, so the allocation sits on a simplex. A pNUT claim is not NUT counted twice; child-token supply is not additional NUT. Derived claims live in the broader state vector, not the conserved sum. One conserved root — everything interesting happens around that equality.
            </Typography>
            <Typography sx={{ color: '#F4EADA', fontSize: '0.9rem', lineHeight: 1.7, mt: 1, textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
              The deployed state space is finite but combinatorially enormous. New mechanisms expand the set of economically relevant relationships and reachable configurations — not literal mathematical infinity.
            </Typography>
          </Box>

          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mb: 1.5, maxWidth: 760 }}>
            NUT is the conserved object. Balances and reserves are its position. Pools, curves, and indexes are the machinery. Prices are local exchange ratios. Moving value between venues is motion; what drives it is a directed opportunity field.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1, mb: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold }}>Opportunity field</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>Each edge carries a state-dependent executable net return w<sub>ij</sub>(x, q).</Typography>
            </Box>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.nutLight }}>Non-conservative loops</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>Profitable closed cycles exist — a loop is arbitrage when the sum of its returns is positive.</Typography>
            </Box>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.greenLight }}>Backreaction</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>Executing a trade changes reserves, so w<sub>ij</sub> changes — a conserved allocation moving through a state-dependent network.</Typography>
            </Box>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.rootGlow }}>Friction & memory</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.4 }}>Friction is fees + gas + slippage + risk. TWAP is memory. LP depth is conductance.</Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.6, mb: 1 }}>
            Using the graph changes the state of the graph — reserves, prices, ticks, edge weights — not necessarily its topology. Adding or removing pools changes topology; trading through existing pools changes their state.
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.6 }}>
            Not quantum mechanics — quantum-grade NUT mechanics. The distributed position is not probabilistic; every component is simultaneously realized on-chain. One conserved object, distributed occupancy across many realized economic coordinates.
          </Typography>
        </Section>

        {/* 12. OBSERVABLE NUT */}
        <Section title="Observable NUT" icon="📊" glow>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mb: 1.5, maxWidth: 760 }}>
            Doctrine is the conservation law; research is the test. These observables turn the claims into time series we can actually measure — proposed metrics, not doctrine.
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mb: 1.5, maxWidth: 760 }}>
            NUT is observable at several scales: assignments and individual ticks are microscopic (Ω<sup>micro</sup>); pools, bonding curves, and index balances are intermediate (Ω<sup>meso</sup>); effective float, concentration, and price dispersion are macroscopic (Ω<sup>macro</sup>). HHI, entropy, and effective float are macro observables precisely because they aggregate the micro state.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>HHI</strong> — concentration, HHI<sub>t</sub> = ∑ x<sub>i</sub>²</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Entropy</strong> — H<sub>t</sub> = −∑ x<sub>i</sub> ln x<sub>i</sub></Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Effective float</strong> — F<sub>t</sub> ≤ 1, accessible NUT</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Price dispersion</strong> — spread across venues</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Arbitrage half-life</strong> — how fast gaps close</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Collateral-lock ratio</strong> — NUT committed as collateral</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>Routing centrality</strong> — how much flow passes each venue</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textDim, lineHeight: 1.5 }}><strong style={{ color: C.gold }}>NUT velocity</strong> — how often the same NUT moves</Typography>
          </Box>
        </Section>

        {/* 13. THE RESEARCH FRONTIER */}
        {/* 13. THE NUT HYPOTHESIS */}
        <Section title="The NUT Hypothesis" icon="🔮" glow>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(61,32,14,0.95)', border: '1px solid rgba(212,166,118,0.4)' }}>
            <Typography sx={{ fontSize: '0.9rem', color: '#F4EADA', lineHeight: 1.7, maxWidth: 720 }}>
              Δ S<sub>NUT</sub> = 0 does not imply Δ economic complexity = 0. A monetary system does not need an expanding base asset to support an expanding economy <em>if</em> economic expansion can occur through increasingly sophisticated structures built around that base.
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.nutLight, lineHeight: 1.7, mt: 1, maxWidth: 720 }}>
              The experiment: can more markets, routes, claims, liquidity configurations, derived assets, and economic relationships expand economic state and functionality while S<sub>NUT</sub> = 1 remains invariant?
            </Typography>
          </Box>
        </Section>

        <Section title="The Research Frontier" icon="🔭" glow>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.6, mb: 1.5, maxWidth: 760 }}>
            NUT defines a constrained state space. Serious tooling may earn its place within it — no claim that NUT is any of it. Open questions, not doctrine:
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0.5 }}>
            {[
              'Equilibrium: do cross-venue gaps settle inside a friction-bounded no-arbitrage band?',
              'Modes: are there recurring dominant patterns of allocation change?',
              'State sufficiency: which on-chain observables fully describe the system?',
              'Noncommutativity: does the order of operations change the outcome?',
              'Coarse-graining: which aggregate variables survive when tick-level detail is discarded?',
              'Closure vs recursion: do valid operations return valid states — and is NUT recursive (closed economic cycles) or merely layered?',
              'Stability: do state or price disturbances stay bounded, returning toward executable consistency?',
              'Regime transitions: are there parameter thresholds — depth, fees, routing, collateralization — where the system changes regime?',
              'Hypergraph: does a multi-asset architecture like pNUT require liquidity hyperedges beyond pairwise routes?',
            ].map((q, i) => (
              <Typography key={i} sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5, display: 'flex', gap: 0.5 }}>
                <span style={{ color: C.gold, fontWeight: 700 }}>{i + 1}.</span> {q}
              </Typography>
            ))}
          </Box>
        </Section>
        {/* 13b. FUTURE RESEARCH STATES — candidate lenses, not claims */}
        <Section title="Future Research States" icon="🧠" glow>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.6, mb: 1.5, maxWidth: 760 }}>
            The conservation law is established. The dynamics around it are not finished theory. As data accumulates, several deeper mathematical frameworks <em>may</em> become useful tools for studying the resulting structure — candidate lenses for testing what actually emerges, never properties claimed for NUT today. No framework earns a place until it explains, predicts, compresses, or falsifies something observable.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Spectral Modes &amp; Eigenmodes</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>If a local approximation of system dynamics can be written x<sub>t+1</sub> ≈ A·x<sub>t</sub>, the eigenvectors of A may identify characteristic coupled modes of movement.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: are there persistent modes of system-wide NUT redistribution, or is movement predominantly idiosyncratic?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Koopman Operator Analysis</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>The liquidity machine is nonlinear — AMMs, concentrated liquidity, bonding curves, slippage. Koopman methods study nonlinear dynamics through linear evolution of observables: 𝒦g = g∘F for state evolution Ω<sub>t+1</sub> = F(Ω<sub>t</sub>).</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: can observable quantities — reserve ratios, price dispersion, effective float, arbitrage spreads — reveal coherent modes of otherwise nonlinear NUT dynamics?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Stability Theory</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Conservation alone does not guarantee stability; a conserved system can oscillate, fragment, become illiquid, or shift regimes. Tools may include local linearization, Jacobian analysis, Lyapunov-style criteria, and empirical stress testing.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: after a disturbance to liquidity, price, or allocation, does the ecosystem return toward a bounded region of executable consistency, remain displaced, or transition into another regime?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Fixed Points &amp; No-Arbitrage Regions</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>A live market may never settle at a literal fixed point; the more realistic object is a friction-bounded region where no executable route stays profitable after fees, gas, slippage, and risk.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: does the system repeatedly return to a measurable no-arbitrage region, and how wide is it under different liquidity conditions?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Limit Cycles &amp; Nonlinear Oscillation</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Repeated price movement is not automatically a limit cycle; but if endogenous interactions generate persistent periodic behavior, limit-cycle analysis may become relevant.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: do repeated NUT flows emerge from internal feedback alone, or are observed oscillations primarily responses to external shocks?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Bifurcations &amp; Regime Transitions</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Small quantitative changes can sometimes produce qualitative changes. Depth, route availability, fees, collateral, and volatility may move the machine across critical thresholds.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: are there parameter values at which the liquidity machine changes regime — tightly coupled to fragmented, stable convergence to persistent dislocation?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Renormalization &amp; Multiscale Dynamics</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>NUT is observable at several scales — atomic transfers/ticks (micro), pools/curves/index balances (meso), effective float/concentration/dispersion (macro). If stable relationships survive aggregation, renormalization-style methods may help.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: which variables remain informative when microscopic detail is coarse-grained away?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Hypergraph Theory</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Pairwise graphs may not fully represent multi-asset structures. An index basket or multi-asset pool connects more than two economic objects; a hyperedge (e ⊆ V, |e| &gt; 2) may be more natural than an ordinary edge.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: does a liquidity hypergraph capture systemic dependencies that ordinary pairwise routing graphs miss?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Recursive Structural Analysis</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Layering is not automatically recursion. True recursion requires identifiable structural relationships to recur through closed economic or state-transition cycles.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: which deployed cycles, if any, repeatedly map reserve → claim → market → reserve in a structurally equivalent way? Until demonstrated, the safer description is multilayered or structurally recurrent.</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Prime-Factor State Encoding</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Selected integer-valued state variables may be encoded canonically via unique prime factorization Ω = ∏ p<sub>i</sub><sup>e<sub>i</sub></sup>; unique factorization lets the exponent vector be recovered exactly. An encoding technique, not an ontology.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: can canonical arithmetic encoding simplify proofs about restricted classes of NUT state transitions?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>FRACTRAN State Machines</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Prime-factor encoding opens a more experimental computational thread: some discrete transitions may be represented as multiplication by rational factors, in the spirit of FRACTRAN.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: can restricted NUT transition systems be represented as arithmetic programs while preserving conservation and valid state-transition constraints? One formal lens among many, not the theory of NUT itself.</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Compositional Algebra</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>NUT operations are composable state transformations. For valid transitions T<sub>A</sub>, T<sub>B</sub>: Ω → Ω, the composition is T<sub>B</sub> ∘ T<sub>A</sub>; in general T<sub>B</sub> ∘ T<sub>A</sub> ≠ T<sub>A</sub> ∘ T<sub>B</sub>.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: which classes of NUT transformations commute, which are path-dependent, and which algebraic structures describe their composition? Category-theoretic or monad-like formulations remain possible research tools only if their formal laws can actually be established.</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>State Estimation</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Not every economically relevant variable is captured by one allocation snapshot; the observable state includes reserves, active LP ranges, derived claims, TWAP history, parameters, and external conditions.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: what is the smallest sufficient set of on-chain observables needed to reconstruct the economically relevant state of the NUT machine?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>On-Chain Economic Genealogy</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Child assets and derived claims may retain identifiable dependency relationships to root collateral and reference assets — a provenance graph. The genome language stays metaphor until heredity is formally defined.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: can the ancestry of derived claims be formally tracked through collateral, reserve, index, and liquidity relationships?</Typography>
            </Box>
            <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Propagation &amp; Memory</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.textDim, lineHeight: 1.5 }}>Not every effect propagates immediately. Cascade analysis, lag structure, and impulse response ask how a disturbance in one venue reaches others and how long it takes to appear — giving the path-dependence and TWAP-memory ideas an explicit temporal dimension.</Typography>
              <Typography sx={{ fontSize: '0.88rem', color: C.nutLight, fontStyle: 'italic', lineHeight: 1.5, mt: 0.5 }}>Research question: how do shocks propagate across venues, and what are the delays in their transmission?</Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, background: 'rgba(61,32,14,0.95)', border: '1px solid rgba(212,166,118,0.4)' }}>
            <Typography sx={{ fontSize: '0.9rem', color: C.nutLight, lineHeight: 1.7 }}>
              <strong style={{ color: C.gold }}>Research principle.</strong> These frameworks exist to test, not decorate. Each must earn its place by explaining, predicting, compressing, or falsifying something observable about the deployed system. Conservation is doctrine. Dynamics are measurable. Mathematics enters only where the machine gives it something real to explain.
            </Typography>
          </Box>
        </Section>

        {/* 14b. DOCTRINE CLOSE */}
        <Box sx={{ mb: 3, p: { xs: 2.5, md: 3.5 }, borderRadius: 3, background: 'linear-gradient(135deg, #3D200E 0%, #2A1609 100%)', border: '1px solid rgba(212,166,118,0.5)', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: C.gold, lineHeight: 1.6, maxWidth: 720, mx: 'auto' }}>
            How much economic complexity can coordinate around a monetary root whose quantity cannot expand?
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '1rem', color: C.cream, lineHeight: 2, mt: 1.5 }}>
            One root. Many markets. Many states. One conserved whole.
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: C.nutLight, lineHeight: 1.7, mt: 1.5, fontStyle: 'italic' }}>
            The doctrine is conservation. The machine is liquidity. The frontier is dynamics.
          </Typography>
        </Box>

        {/* 10. RISK */}
        <Box sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, ' + C.bgCard + ' 0%, ' + C.bgCard2 + ' 100%)', border: '1px solid ' + C.border, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: C.rootGlow }}>⚠️ Experimental Memefi</Typography>
          </Box>
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', maxWidth: 700, lineHeight: 1.6 }}>
            NUT is an experimental cryptoeconomic liquidity topology. It is an unregulated experimental asset and a documented Network Utility Token within the BASED NUT ecosystem — not investment advice, and no guarantee of profit or value retention. Use at your own risk.
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography sx={{ fontSize: '0.85rem', color: C.greenLight, '&:hover': { color: C.greenGlow } }}>← Back to the Orchard</Typography>
          </Link>
        </Box>
      </Box>
    </Layout>
  );
}
