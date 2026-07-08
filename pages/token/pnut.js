// pNUT Dedicated Page — Amber / Gold Basket Theme
// The Basket Index Token — NUT + SNUT + cbETH + cbBTC in a Balancer weighted pool
// ALL numbers LIVE from /api/pnut-data + /api/token-data

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Box, Typography, Chip } from '@mui/material';
import Layout from '../../components/Layout';
import TokenNav from '../../components/TokenNav';

const PNUT_BPT_ADDR = '0x2a5757b60987ff10385de1d4d923792f6fdcfff1';
const BALANCER_POOL_ID = '0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e';
const BALANCER_JOIN = 'https://balancer.fi/pools/base/v2/' + BALANCER_POOL_ID;

// Amber / Gold palette — warm honey tones with dark background
const C = {
  bgDark:    '#1A1208',
  bgCard:    'rgba(42,30,12,0.92)',
  bgCard2:   'rgba(61,43,15,0.85)',
  border:    'rgba(255,183,77,0.18)',
  text:      '#FFF8E1',
  textDim:   'rgba(255,248,225,0.65)',
  textFaint: 'rgba(255,248,225,0.4)',
  amber:     '#FFB74D',
  amberLight:'#FFCC80',
  gold:      '#FFD54F',
  goldDeep:  '#D4A676',
  honey:     '#FFA000',
  honeyGlow: '#FFC107',
  cream:     '#FFF8E1',
  green:     '#81C784',
  red:       '#EF5350',
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

function fmtDrift(v) {
  if (v == null || isNaN(v)) return '...';
  const s = v > 0 ? '+' : '';
  return s + v.toFixed(2) + '%';
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
      background: 'rgba(255,183,77,0.06)',
      border: '1px solid ' + C.border,
      '&:hover': { background: 'rgba(255,183,77,0.12)' },
    }} onClick={() => window.open(href || 'https://basescan.org/token/' + addr, '_blank')}>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: C.amber, minWidth: 'fit-content' }}>
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

import { fetchPnutData } from '../api/pnut-data';
import { fetchTokenData, TOKEN_ADDRESSES } from '../../utils/tokenDataSources';

export async function getStaticProps() {
  let initialPnut = null;
  let initialToken = null;
  try {
    // Direct imports — avoids self-referencing HTTP calls that fail on Vercel serverless
    // Wrap in 10s timeout to avoid hanging during build (client-side useEffect will populate at runtime)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Build-time fetch timeout')), 10000)
    );
    const [pnutData, tokenData] = await Promise.race([
      Promise.all([
        fetchPnutData().catch(() => null),
        fetchTokenData(TOKEN_ADDRESSES).catch(() => null),
      ]),
      timeoutPromise,
    ]).catch(() => [null, null]);
    initialPnut = pnutData?.pnut || null;
    initialToken = tokenData?.pNUT || tokenData?.PNUT || null;
  } catch (e) {
    // Build-time fetch may fail; client-side useEffect will populate
  }
  return { props: { initialPnut, initialToken }, revalidate: 300 };
}

export default function PnutPage({ initialPnut, initialToken }) {
  const [pnutData, setPnutData] = useState(initialPnut || null);
  const [tokenData, setTokenData] = useState(initialToken || null);
  const [loading, setLoading] = useState(!initialPnut);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [pnutRes, tokenRes] = await Promise.all([
          fetch('/api/pnut-data').then(r => r.json()),
          fetch('/api/token-data').then(r => r.json()),
        ]);
        if (cancelled) return;
        setPnutData(pnutRes?.pnut || null);
        setTokenData(tokenRes?.tokens?.pNUT || tokenRes?.tokens?.PNUT || null);
      } catch (e) {
        if (!cancelled) console.error('pNUT fetch error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (!initialPnut) fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const d = pnutData || {};
  const t = tokenData || {};
  const lastUpdate = d.lastCheckedAt ? fmtTime(d.lastCheckedAt) : '';

  // Live data from API
  const bptPrice = d.bptPrice ?? null;
  const nav = d.nav ?? null;
  const totalLiquidity = d.totalLiquidity ?? null;
  const totalSupply = d.totalSupply ?? t?.rpc?.totalSupply ?? null;
  const constituents = Array.isArray(d.constituents) ? d.constituents : [];

  // Constituent links
  const constLink = (sym) => {
    if (sym === 'NUT') return '/token/nut';
    if (sym === 'SNUT') return '/token/snut';
    return null; // cbETH, cbBTC → Basescan
  };

  // Section wrapper
  const Section = ({ title, icon, children, glow }) => (
    <Box sx={{
      mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3,
      background: 'linear-gradient(135deg, ' + C.bgCard + ' 0%, ' + C.bgCard2 + ' 100%)',
      border: '1px solid ' + (glow ? 'rgba(255,160,0,0.25)' : C.border),
      boxShadow: glow ? '0 4px 20px rgba(255,160,0,0.08)' : '0 4px 16px rgba(0,0,0,0.15)',
    }}>
      <Typography sx={{
        fontSize: '1.15rem', fontWeight: 800, mb: 2,
        color: glow ? C.honeyGlow : C.amber,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>{icon} {title}</Typography>
      {children}
    </Box>
  );

  // Stat card
  const StatCard = ({ label, value, source }) => (
    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.05)', border: '1px solid ' + C.border }}>
      <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: C.gold }}>{loading ? '...' : value}</Typography>
      {source && <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, mt: 0.25 }}>{source}</Typography>}
    </Box>
  );

  return (
    <Layout>
      <Head>
        <title>pNUT | The Basket Index Token | BASED NUT</title>
        <meta name="description" content="pNUT — the basket index token. A Balancer weighted pool holding 25% each of NUT, SNUT, cbETH, and cbBTC." />
      </Head>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <TokenNav dark />


        {/* 1. HERO */}
        <Box sx={{
          position: 'relative', mb: 3, p: { xs: 2.5, md: 4 }, borderRadius: 4, overflow: 'hidden',
          background: 'linear-gradient(160deg, ' + C.bgDark + ' 0%, #3D2B0F 50%, #4A3210 100%)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          border: '1px solid ' + C.border,
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: C.cream, fontWeight: 900 }}>
              🥜 pNUT
            </Typography>
            <Typography sx={{ mb: 2, fontSize: '1.1rem', color: C.amber, fontWeight: 600 }}>
              The Basket Index Token
            </Typography>
            <Typography sx={{ mb: 2, color: C.textDim, fontSize: '0.9rem', maxWidth: 600 }}>
              A <strong style={{ color: C.gold }}>Balancer Weighted Pool</strong> holding 25% each of NUT, SNUT, cbETH, and cbBTC. pNUT is the <em>BPT</em> (Balancer Pool Token) that represents proportional ownership of the entire basket.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip sx={{ bgcolor: 'rgba(255,213,79,0.15)', color: C.gold, fontWeight: 600 }} label="Basket Index" size="small" />
              <Chip sx={{ bgcolor: 'rgba(255,183,77,0.12)', color: C.amber }} label="Balancer V2" size="small" />
              <Chip sx={{ bgcolor: 'rgba(255,183,77,0.12)', color: C.amber }} label="Base" size="small" />
              <Chip sx={{ bgcolor: 'rgba(255,183,77,0.12)', color: C.amber }} label="25/25/25/25" size="small" />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Link href={BALANCER_JOIN} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ px: 2, py: 0.5, borderRadius: 2, fontSize: '0.8rem', fontWeight: 700, color: C.cream, background: 'linear-gradient(135deg, #FFA000, #FFC107)', border: '1px solid #E65100', cursor: 'pointer', '&:hover': { transform: 'translateY(-1px)' }, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>📖 Balancer Pool</Box>
              </Link>
              <Link href={'https://basescan.org/token/' + PNUT_BPT_ADDR} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ px: 2, py: 0.5, borderRadius: 2, fontSize: '0.8rem', fontWeight: 700, color: C.amber, background: 'rgba(255,183,77,0.08)', border: '1px solid ' + C.border, cursor: 'pointer', '&:hover': { background: 'rgba(255,183,77,0.15)' }, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>🔍 Basescan</Box>
              </Link>
            </Box>
            <Box sx={{ mt: 2 }}>
              <AddrBox label="BPT Contract" addr={PNUT_BPT_ADDR} />
            </Box>
          </Box>
        </Box>

        {/* 2. POOL METRICS — stat grid in dark wrapper, no DEX chart */}
        <Box sx={{
          mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3,
          background: 'linear-gradient(135deg, ' + C.bgCard + ' 0%, ' + C.bgCard2 + ' 100%)',
          border: '1px solid ' + C.border,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          <Typography sx={{
            fontSize: '1.15rem', fontWeight: 800, mb: 1.5,
            color: C.amber, display: 'flex', alignItems: 'center', gap: 1,
          }}>
            📊 Pool Metrics
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.78rem', mb: 2, maxWidth: 650, lineHeight: 1.5 }}>
            The Balancer implied price is derived from the pool's internal balances and external price feeds. This pool alone should not decide price — it relies on its internal mechanics to force arbitrage. Treat it as an <em>endogenous state sensor</em> inside a reflexive AMM network, not as an exogenous truth oracle.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 1.5 }}>
            <StatCard label="Balancer implied price" value={fmtUsd(bptPrice)} source="Base RPC + Balancer" />
            <StatCard label="NAV (raw)" value={fmtUsd(nav)} source="Balances × prices" />
            <StatCard label="Total Liquidity" value={fmtUsd(totalLiquidity)} source="Balancer Vault" />
            <StatCard label="BPT Supply" value={fmtNum(totalSupply, 4)} source="Base RPC" />
          </Box>
          {lastUpdate && (
            <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, mt: 1, textAlign: 'right' }}>
              Updated {lastUpdate}
            </Typography>
          )}
        </Box>

        {/* 3. WHAT IS pNUT? */}
        <Section title="What Is pNUT?" icon="🥜" glow>
          <Typography sx={{ color: C.text, fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 700 }}>
            pNUT is a <strong style={{ color: C.gold }}>basket index token</strong> — a <em>BPT</em> (Balancer Pool Token) that represents proportional ownership of a Balancer <em>weighted pool</em> containing four assets: NUT, SNUT, cbETH, and cbBTC, each targeting 25% weight.
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mt: 1.5, maxWidth: 700 }}>
            The pool uses a <em>constant-mean AMM</em> (Automated Market Maker) — Balancer's weighted-pool math that maintains the 25/25/25/25 target ratio through trading activity. pNUT converts NUT from a <strong style={{ color: C.amber }}>singleton meme-root</strong> into a <strong style={{ color: C.gold }}>basketized liquidity index</strong>, coupling it with blue-chip reserve assets (cbETH = Coinbase ETH, cbBTC = Coinbase BTC).
          </Typography>
        </Section>

        {/* 4. BASKET COMPOSITION */}
        <Section title="Basket Composition" icon="📊" glow>
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', mb: 2, maxWidth: 600 }}>
            Live weights of all 4 constituents. Target is 25% each — actual weights drift as prices change.
          </Typography>

          {/* Weight bar chart */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', height: 36, borderRadius: 2, overflow: 'hidden', border: '1px solid ' + C.border }}>
              {constituents.map((c, i) => {
                const w = c.liveWeight || 0;
                if (w < 0.1) return null;
                return (
                  <Box key={i} sx={{
                    width: w + '%',
                    background: c.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: w > 3 ? 'fit-content' : 0,
                    '&:hover': { filter: 'brightness(1.2)' },
                    transition: 'filter 0.2s',
                  }} title={c.symbol + ': ' + fmtPct(w)}>
                    {w > 8 && <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#1A1208' }}>{c.symbol}</Typography>}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.5, mb: 2 }}>
            {constituents.map((c, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 1, background: c.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: C.cream, minWidth: 40 }}>{c.symbol}</Typography>
                <Box sx={{ flex: 1, display: 'flex', gap: 1, fontSize: '0.65rem', color: C.textDim }}>
                  <span>Live: <strong style={{ color: C.gold }}>{fmtPct(c.liveWeight)}</strong></span>
                  <span>Target: 25%</span>
                  <span style={{ color: c.weightDrift > 0 ? C.red : C.green }}>Drift: {fmtDrift(c.weightDrift)}</span>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Constituent cards 2x2 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
            {constituents.map((c, i) => {
              const link = constLink(c.symbol);
              const addrHref = link ? link : 'https://basescan.org/token/' + c.address;
              return (
                <Box key={i} sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.04)', border: '1px solid ' + C.border }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: c.color, flexShrink: 0, boxShadow: '0 0 8px ' + c.color + '66' }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: C.cream }}>{c.symbol}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: C.textDim }}>{c.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase' }}>Balance</Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: C.amberLight }}>{fmtNum(c.balance, 6)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase' }}>Price</Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: C.amberLight }}>{fmtUsd(c.price)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase' }}>Live Weight</Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: C.gold }}>{fmtPct(c.liveWeight)} <span style={{ fontSize: '0.65rem', color: C.textFaint }}>/ 25%</span></Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase' }}>Drift</Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: c.weightDrift > 0 ? C.red : C.green }}>{fmtDrift(c.weightDrift)}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase' }}>USD Value</Typography>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: C.honeyGlow }}>{fmtUsd(c.value)}</Typography>
                  </Box>
                  <Link href={addrHref} target={link ? '' : '_blank'} rel={link ? '' : 'noopener noreferrer'} style={{ textDecoration: 'none' }}>
                    <Box sx={{ mt: 0.5, fontSize: '0.62rem', fontFamily: 'monospace', color: C.textFaint, cursor: 'pointer', '&:hover': { color: C.amber }, wordBreak: 'break-all' }}>
                      {c.address} →
                    </Box>
                  </Link>
                </Box>
              );
            })}
          </Box>
        </Section>

        {/* 5. HOW IT WORKS */}
        <Section title="How It Works" icon="🧠">
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', mb: 2, maxWidth: 600 }}>
            pNUT is powered by Balancer's weighted-pool mechanics. Here is how the basket maintains its target ratios.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.05)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>a. Constant-Mean AMM</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textDim, lineHeight: 1.5 }}>Balancer's <em>weighted pool</em> uses a constant-mean invariant — the geometric weighted mean of token balances stays constant. This targets 25/25/25/25 but lets weights drift as prices move, creating natural rebalancing through trades.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.05)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.amber, mb: 0.5 }}>b. BPT Valuation</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textDim, lineHeight: 1.5 }}><em>BPT</em> value = (underlying balances × market prices) / total BPT supply. Balancer explicitly warns this is <strong style={{ color: C.red }}>informational and manipulable</strong> if naively used as an on-chain oracle. For safer on-chain valuation: use <em>getActualSupply()</em> (not raw totalSupply), check Vault reentrancy, and use invariant-based weighted-pool valuation rather than raw balance × price.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.05)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.honeyGlow, mb: 0.5 }}>c. NAV Arbitrage</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textDim, lineHeight: 1.5 }}>If BPT market price drifts from <em>NAV</em> (Net Asset Value — the sum of underlying values per BPT), arbitrageurs mint or redeem BPT to restore parity. This keeps pNUT priced close to its intrinsic basket value.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.05)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.goldDeep, mb: 0.5 }}>d. Forced Coherence</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: C.textDim, lineHeight: 1.5 }}>The basket creates <em>arbitrage pressure</em> linking NUT ecosystem tokens with blue-chip reserves. When NUT or SNUT drift in weight, traders swap them in or out of the pool, connecting their prices to cbETH and cbBTC markets.</Typography>
            </Box>
          </Box>
        </Section>

        {/* 6. CONNECTIONS */}
        <Section title="Connections" icon="🔗">
          {/* Constituent links */}
          <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>Constituent Tokens</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {constituents.map((c, i) => {
              const link = constLink(c.symbol);
              const href = link ? link : 'https://basescan.org/token/' + c.address;
              return (
                <Link key={i} href={href} target={link ? '' : '_blank'} rel={link ? '' : 'noopener noreferrer'} style={{ textDecoration: 'none' }}>
                  <Box sx={{
                    px: 1.5, py: 0.5, borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
                    cursor: 'pointer', color: C.cream, display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    background: 'rgba(255,183,77,0.08)', border: '1px solid ' + C.border,
                    '&:hover': { background: 'rgba(255,183,77,0.15)', transform: 'translateY(-1px)' },
                  }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                    {c.symbol}
                  </Box>
                </Link>
              );
            })}
          </Box>

          {/* Balancer pool link */}
          <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>Balancer Pool</Typography>
          <Link href={BALANCER_JOIN} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Box sx={{ p: 1, borderRadius: 1.5, background: 'rgba(255,183,77,0.04)', border: '1px solid ' + C.border, cursor: 'pointer', '&:hover': { background: 'rgba(255,183,77,0.1)' }, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: C.gold }}>Balancer V2 Weighted Pool</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: C.textDim }}>25% NUT + 25% SNUT + 25% cbETH + 25% cbBTC</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, ml: 'auto' }}>→</Typography>
            </Box>
          </Link>

          {/* Arb routes */}
          <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>Arbitrage Routes</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {[
              { route: 'BPT vs NAV', desc: 'Mint/redeem BPT when market price diverges from intrinsic NAV (underlying values per BPT).' },
              { route: 'Constituent vs Basket', desc: 'If NUT weight drifts high, swap NUT into pool, arbitrage vs external NUT pools (Uniswap V3, Aerodrome).' },
              { route: 'SNUT weight drift', desc: 'SNUT overweight → swap SNUT in, sell externally; underweight → buy externally, add to pool.' },
              { route: 'Cross-pool', desc: 'NUT in Balancer vs NUT in Uniswap V3 — pNUT basket creates additional arbitrage pressure on NUT price.' },
            ].map((a, i) => (
              <Box key={i} sx={{ p: 1.25, borderRadius: 2, background: 'rgba(255,183,77,0.04)', border: '1px solid ' + C.border, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,213,79,0.15)', border: '1px solid rgba(255,213,79,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: C.gold }}>{i + 1}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: C.gold, mb: 0.25 }}>{a.route}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.4 }}>{a.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Section>

        {/* 7. ADVANCED: ROOT-INDEXED CONSTANT-MEAN MARKET MAKER */}
        <Section title="Advanced: Root-Indexed Constant-Mean Market Maker" icon="📐" glow>
          <Typography sx={{ color: C.textDim, fontSize: '0.82rem', mb: 2, maxWidth: 700, fontStyle: 'italic' }}>
            pNUT couples endogenous network assets with exogenous reserves in a reflexive AMM. The following is theoretical analysis, not financial advice.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Root-Indexed AMM</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5 }}>pNUT couples <em>endogenous</em> network assets (NUT, SNUT) with <em>exogenous</em> reserve assets (cbETH, cbBTC) in a reflexive AMM network. The basket's invariant links internal scarcity dynamics to external market prices.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.amber, mb: 0.5 }}>Basketized Liquidity Index</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5 }}>pNUT converts NUT from a <em>singleton meme-root</em> into an <em>indexable market object</em> with forced coherence — the pool's constant-mean invariant continuously pushes weights toward target.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.honeyGlow, mb: 0.5 }}>Not an Oracle</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5 }}>The pool encodes useful internal market state, but it is <strong style={{ color: C.red }}>not an oracle</strong>. Because it contains both exogenous reserves (cbETH, cbBTC) and endogenous ecosystem assets (NUT, SNUT), its spot prices and naive BPT NAV are <strong style={{ color: C.red }}>manipulable via forced trading</strong> and circular when used as price truth. The pool is an <em>endogenous state sensor</em> — it reflects what is happening inside the AMM, not what the true external price is.</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,183,77,0.04)', border: '1px solid ' + C.border }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.goldDeep, mb: 0.5 }}>Forced Rebalancing Pressure</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5 }}>The <em>constant-mean invariant</em> creates continuous rebalancing pressure that links NUT's scarcity dynamics to blue-chip crypto markets. Every trade in the pool moves weights, and every weight gap is an arbitrage opportunity.</Typography>
            </Box>
          </Box>

          {/* Oracle graph solution */}
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,160,0,0.06)', border: '1px solid rgba(255,160,0,0.2)', mb: 2 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: C.gold, mb: 0.5 }}>Price Truth Comes From Outside</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5 }}>
              Do <strong style={{ color: C.red }}>not</strong> use this pool as a price oracle. If you need reliable price discovery, use <strong style={{ color: C.amber }}>external sources</strong>: external price feeds for exogenous assets (cbETH, cbBTC), multi-venue TWAP/median aggregation from <em>other</em> DEXes (Uniswap V3, Aerodrome) for endogenous assets (NUT, SNUT). The pool's role is to reflect internal AMM state, not to dictate external prices. Any on-chain integration should use invariant-based BPT valuation with <em>getActualSupply()</em>, Vault reentrancy checks, liquidity thresholds, and circuit breakers — treating the pool as a state sensor, never as truth.
            </Typography>
          </Box>

          {/* Research questions */}
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,160,0,0.06)', border: '1px solid rgba(255,160,0,0.15)' }}>
            <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 1 }}>Research Questions pNUT Tests</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0.5 }}>
              {[
                'Can a basket index enforce topological monetary policy without governance?',
                'Do LPs in a weighted pool act as constitutional actors in the basket?',
                'Can TWAP in a weighted pool serve as memory for the basket index?',
                'Is there reflexivity between the NUT singleton and the pNUT basket index?',
                'Does forced coherence between meme-root and blue-chip reserves create stable pricing?',
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
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: C.honey }}>⚠️ Experimental Memefi</Typography>
          </Box>
          <Typography sx={{ color: C.textDim, fontSize: '0.85rem', maxWidth: 700, lineHeight: 1.6 }}>
            pNUT is a cryptoeconomic basket index experiment. The Balancer implied price is informational and manipulable — do not use it as a standalone price oracle. Not a utility token. Not a security. No guarantee of profit or value retention. Use at your own risk.
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography sx={{ fontSize: '0.85rem', color: C.amber, '&:hover': { color: C.honeyGlow } }}>← Back to the Orchard</Typography>
          </Link>
        </Box>
      </Box>
    </Layout>
  );
}
