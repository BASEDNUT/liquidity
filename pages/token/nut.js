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
  textDim:   'rgba(250,243,230,0.65)',
  textFaint: 'rgba(250,243,230,0.4)',
  nut:       '#8B5A2B',
  nutLight:  '#C8A27A',
  cream:     '#FAF3E6',
  gold:      '#D4A676',
  green:     '#6B8E4E',
  greenLight:'#8FBC8F',
  greenGlow: '#7CB968',
  rootGlow:  '#A0522D',
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
    { label: 'Free / Wallets', val: freeOrWallets, color: '#6B8E4E' },
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
    { name: 'SNUT', icon: '🌰', desc: 'Reward-position token with recursive burn', link: '/token/snut' },
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
              Supply = <strong style={{ color: C.gold }}>1</strong>. One indivisible token. No mint, no tax, no governance. NUT is the scarce root asset that every other token in the ecosystem prices itself against.
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
            <Typography sx={{ fontSize: '0.75rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1.5, letterSpacing: '0.05em' }}>Market Stats</Typography>
            <StatRow label="Price" value={loading ? '...' : fmtUsd(price)} source={m?.geckoTerminal ? 'GeckoTerminal' : m?.dexScreener ? 'DexScreener' : null} />
            <StatRow label="Volume (24h)" value={loading ? '...' : fmtUsd(volume24h)} source={m?.geckoTerminal ? 'GeckoTerminal' : null} />
            <StatRow label="Liquidity" value={loading ? '...' : fmtUsd(liquidity)} source={m?.geckoTerminal ? 'GeckoTerminal' : null} />
            <StatRow label="Total Supply" value={loading ? '...' : fmtNum(totalSupply, 0)} source="Base RPC" />
            <StatRow label="Venues" value={loading ? '...' : '6 pools'} source="Live" />
            {lastUpdate && (
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, mt: 1, textAlign: 'right' }}>
                Updated {lastUpdate}
              </Typography>
            )}
          </Box>
        </Box>

        {/* 3. WHAT IS NUT? */}
        <Section title="What Is NUT?" icon="🌰" glow>
          <Typography sx={{ color: C.text, fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 700 }}>
            NUT is the <strong style={{ color: C.gold }}>root asset</strong> of the BASED NUT ecosystem. It has a fixed supply of exactly <strong style={{ color: C.gold }}>1 token</strong> — no more can ever be minted. Because supply is 1, the price of NUT equals its total market cap.
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mt: 1.5, maxWidth: 700 }}>
            Every other token in the ecosystem is built on top of NUT. <em>Bonding curve tokens</em> (NUTINO, SALT) are minted by locking NUT as collateral. <em>SNUT</em> is a reward-position token that earns NUT for holders. <em>pNUT</em> is an index basket that includes NUT as 25% of its weight. This makes NUT the <strong style={{ color: C.nutLight }}>reference coordinate</strong> — every asset prices itself against the same scarce root.
          </Typography>
        </Section>

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
                  <Typography sx={{ fontSize: '0.75rem', color: C.textDim, flex: 1 }}>{seg.label}</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: C.cream }}>{fmtNut(seg.val)} NUT</Typography>
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
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>Free / Wallets</Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: C.greenGlow }}>{loading ? '...' : fmtNut(freeOrWallets)}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>NUT</Typography>
            </Box>
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
              <Typography sx={{ fontSize: '0.75rem', color: C.textDim, lineHeight: 1.5 }}>NUT itself. Supply = 1, fixed forever. The scarce anchor everything else references.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.nutLight, mb: 0.5 }}>2. AMM Layer</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textDim, lineHeight: 1.5 }}><em>Automated Market Makers</em> (Uniswap V3, V2, Aerodrome) create price surfaces. NUT trades in 5 pools across 4 platforms.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.greenLight, mb: 0.5 }}>3. Bonding-Curve Layer</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textDim, lineHeight: 1.5 }}><em>Bonding curves</em> (Mint Club) let users lock NUT to mint child tokens (NUTINO, SALT). The curve price depends on how much NUT is locked.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.rootGlow, mb: 0.5 }}>4. Index Layer</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textDim, lineHeight: 1.5 }}><em>pNUT</em> is a Balancer basket holding 25% each of NUT, SNUT, cbETH, cbBTC. Its <em>NAV</em> (net asset value) can drift from market price, creating arbitrage.</Typography>
            </Box>
          </Box>
          {/* Reflexivity loop */}
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(160,82,45,0.06)', border: '1px solid rgba(160,82,45,0.15)' }}>
            <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>The Reflexivity Loop</Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: C.nutLight, lineHeight: 1.8 }}>
              scarce root → multiple venues → child minting → index wrapping → price gaps → arbitrage → root reprices → repeat
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: C.textDim, mt: 1, lineHeight: 1.5 }}>
              The system is <em>reflexive</em> — child assets derive value from NUT, and their activity feeds back to NUT's price. NUT itself does not decide. The <strong style={{ color: C.nutLight }}>graph decides</strong>.
            </Typography>
          </Box>
        </Section>

        {/* 6. CONNECTIONS */}
        <Section title="Connections" icon="🌳">
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
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', color: C.cream, background: 'rgba(139,90,43,0.08)', border: '1px solid ' + C.border, '&:hover': { background: 'rgba(139,90,43,0.15)', transform: 'translateY(-1px)' } }}>
                  {c.icon} {c.name}
                </Box>
              </Link>
            ))}
          </Box>

          {/* Arb routes */}
          <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>Arbitrage Routes</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {arbRoutes.map((a, i) => (
              <Link key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ p: 1.25, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border, cursor: 'pointer', '&:hover': { background: 'rgba(139,90,43,0.1)' }, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(212,166,118,0.15)', border: '1px solid rgba(212,166,118,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: C.gold }}>{i + 1}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: C.gold, mb: 0.25 }}>{a.route}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.4 }}>{a.desc}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, flexShrink: 0, mt: 0.5 }}>→</Typography>
                </Box>
              </Link>
            ))}
          </Box>
        </Section>

        {/* 7. ADVANCED: THE MONETARY ORGANISM */}
        <Section title="Advanced: The Monetary Organism" icon="🌱">
          <Typography sx={{ color: C.textDim, fontSize: '0.82rem', mb: 2, maxWidth: 700, fontStyle: 'italic' }}>
            NUT is not trying to imitate money through narrative. It creates a measurable monetary ecology. The following is theoretical analysis, not financial advice.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Singleton-Token Physics</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5 }}>
                A normal token has supply. NUT has <em>state distribution</em>. Every pool contains a fraction of the same object. 0.01 NUT = 1% of existence. This turns accounting into a conservation problem.
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.nutLight, mb: 0.5 }}>TWAP as Memory</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5 }}>
                Uniswap V3 stores <em>Time-Weighted Average Prices</em> on-chain. Spot price is emotion. TWAP is memory. This makes the NUT/wETH V3 pool a memory-bearing price surface, not just a trading venue.
              </Typography>
              <Link href="https://developers.uniswap.org/docs/protocols/v3/concepts/price-oracles" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Typography sx={{ fontSize: '0.65rem', color: C.greenLight, mt: 0.5, '&:hover': { textDecoration: 'underline' } }}>Source: Uniswap V3 Oracle Docs →</Typography>
              </Link>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.greenLight, mb: 0.5 }}>LPs as Constitutional Actors</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5 }}>
                Liquidity providers are not just market makers. By choosing where to place liquidity, they act like a central bank setting monetary policy — but without voting. LP allocation becomes monetary governance.
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.rootGlow, mb: 0.5 }}>Topological Monetary Policy</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5 }}>
                Not interest rates. Not emissions. Topology. Pool design, routing, curve parameters, and keeper incentives act as monetary policy. The graph structure IS the policy.
              </Typography>
            </Box>
          </Box>

          {/* Research questions */}
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(160,82,45,0.06)', border: '1px solid rgba(160,82,45,0.15)' }}>
            <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>Research Questions NUT Tests</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0.5 }}>
              {[
                'Can a reserve layer emerge without a central issuer?',
                'Can pools and curves replace banks as hierarchy constructors?',
                'Can LP placement act as constitutional policy?',
                'Can TWAP history substitute for trusted reporting?',
                'Can child assets increase the value of the parent they depend on?',
                'Can routing design act like monetary policy?',
              ].map((q, i) => (
                <Typography key={i} sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5, display: 'flex', gap: 0.5 }}>
                  <span style={{ color: C.gold, fontWeight: 700 }}>{i + 1}.</span> {q}
                </Typography>
              ))}
            </Box>
          </Box>
        </Section>

        {/* 8. RISK */}
        <Box sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, ' + C.bgCard + ' 0%, ' + C.bgCard2 + ' 100%)', border: '1px solid ' + C.border, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: C.rootGlow }}>⚠️ Experimental Memefi</Typography>
          </Box>
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', maxWidth: 700, lineHeight: 1.6 }}>
            NUT is a cryptoeconomic liquidity topology experiment. Not a utility token. Not a security. No guarantee of profit or value retention. Use at your own risk.
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
