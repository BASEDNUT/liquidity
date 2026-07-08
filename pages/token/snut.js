// SNUT Dedicated Page — Roasted Nut Theme with Fire Accents
// Experimental Memefi: Liquid Non-Escrow NUT Reward-Position Token with Recursive Burn Mechanics
// ALL numbers are LIVE from Base RPC via /api/snut-data — nothing hard-coded

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Box, Typography } from '@mui/material';
import Layout from '../../components/Layout';
import TokenNav from '../../components/TokenNav';

const SNUT_ADDR = '0xac130701aa31c284c36609e2489f150f419ad7ad';
const DEAD_ADDR = '0x000000000000000000000000000000000000dEaD';
const SNUT_ETH_POOL = '0xB22895d2ee6e29395F30Ec47c8D9FE0d55355AE1';
const SNUT_NUT_POOL = '0x893faaa7baf7a8247fc7142afb28e13d51a5aae8';
const META_POOL = '0x82bbadb9d6b2c0a59ed01809e30323f89f6faa1c';
const BALANCER_POOL = '0x2a5757b60987ff10385de1d4d923792f6fdcfff1';
const BALANCER_JOIN = 'https://balancer.fi/pools/base/v2/0x2a5757b60987ff10385de1d4d923792f6fdcfff100010000000000000000019e';

// BASED NUT earthy palette
const C = {
  bgDark:   '#2A1A0F',
  bgCard:   'rgba(61,43,31,0.92)',
  bgCard2:  'rgba(93,58,31,0.85)',
  border:   'rgba(139,90,43,0.25)',
  text:     '#FAF3E6',
  textDim:  'rgba(250,243,230,0.65)',
  textFaint:'rgba(250,243,230,0.4)',
  nut:      '#8B5A2B',
  nutLight: '#C8A27A',
  cream:    '#FAF3E6',
  gold:     '#D4A676',
  fire:     '#FF6B35',
  fireDeep: '#E53935',
  fireGlow: '#FF8C42',
};

function fmtNum(v, dec = 2) {
  if (v == null || isNaN(v)) return '...';
  if (v >= 1e6) return `${(v / 1e6).toFixed(dec)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(dec)}K`;
  if (v >= 1) return v.toFixed(dec);
  if (v > 0) return v.toFixed(6);
  return '0';
}

function fmtUsd(v) {
  if (v == null || isNaN(v)) return '...';
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
  if (v >= 1) return `$${v.toFixed(4)}`;
  if (v > 0) return `$${v.toFixed(8)}`;
  return '$0';
}

function fmtTime(iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
  catch { return ''; }
}

function fmtPct(v) {
  if (v == null || isNaN(v)) return '...';
  return `${v.toFixed(2)}%`;
}

function bpsToPct(bps) {
  if (bps == null || isNaN(bps)) return '...';
  return `${(bps / 100).toFixed(1)}%`;
}

// Address component with copy button and full display
function AddrBox({ label, addr, href, fire }) {
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
      background: fire ? 'rgba(255,107,53,0.06)' : 'rgba(139,90,43,0.08)',
      border: `1px solid ${fire ? 'rgba(255,107,53,0.15)' : C.border}`,
      '&:hover': { background: fire ? 'rgba(255,107,53,0.12)' : 'rgba(139,90,43,0.15)' },
    }} onClick={() => window.open(href || `https://basescan.org/address/${addr}`, '_blank')}>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: fire ? C.fireGlow : C.nutLight, minWidth: 'fit-content' }}>
        {label}:
      </Typography>
      <Typography sx={{
        fontSize: '0.62rem', fontFamily: 'monospace', color: C.textDim,
        userSelect: 'all',
      }}>
        {addr}
      </Typography>
      <Typography sx={{ fontSize: '0.6rem', color: copied ? '#4CAF50' : C.textFaint, ml: 0.5 }} onClick={handleCopy}>
        {copied ? '✓ copied' : '📋'}
      </Typography>
    </Box>
  );
}

export default function SnutPage() {
  const [snutData, setSnutData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [snutRes, marketRes] = await Promise.all([
          fetch('/api/snut-data').then(r => r.json()),
          fetch('/api/token-data').then(r => r.json()),
        ]);
        if (cancelled) return;
        setSnutData(snutRes?.snut || null);
        setMarketData(marketRes?.tokens?.SNUT || null);
      } catch (e) {
        if (!cancelled) console.error('SNUT fetch error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const d = snutData || {};
  const m = marketData || {};
  const lastUpdate = d.lastCheckedAt ? fmtTime(d.lastCheckedAt) : '';

  // Live data — NO hard-coded fallbacks
  const totalSupply = d.snutTotalSupply || 0;
  const burned = d.deadSnutBalance || 0;
  const circulating = d.circulatingSupply || (totalSupply - burned);
  const inPools = (d.snutEthPoolActualSnut || 0) + (d.snutNutPoolActualSnut || 0) + (d.metaPoolActualSnut || 0) + (d.balancerBalances?.SNUT || 0);
  const freeFloat = Math.max(0, circulating - inPools);
  const burnPct = d.burnPercentage || 0;
  const poolPct = totalSupply > 0 ? (inPools / totalSupply) * 100 : 0;
  const floatPct = totalSupply > 0 ? (freeFloat / totalSupply) * 100 : 0;

  // Live fees from contract
  const fees = d.fees || {};
  const totalFeePct = fees.totalFee != null ? bpsToPct(fees.totalFee) : '...';

  // Reactor
  const reactorExcess = d.reactorExcess || 0;
  const reactorActive = d.reactorActive || false;
  const buybackFuel = d.buybackFuelEth || 0;

  // Market data
  const price = m?.geckoTerminal?.price_usd ?? m?.dexScreener?.priceUsd ?? null;
  const volume24h = m?.geckoTerminal?.volume_usd_h24 ?? m?.dexScreener?.volume_h24 ?? null;
  const liquidity = m?.geckoTerminal?.total_reserve_in_usd ?? m?.dexScreener?.liquidity_usd ?? null;

  // Tax breakdown from live fees
  const taxItems = [
    { bps: fees.liquidityFee, dest: 'Auto Liquidity', icon: '💧', desc: 'SNUT/ETH LP created, some burned to dead', color: '#5B9BD5' },
    { bps: fees.marketingFee, dest: 'Manager Wallet', icon: '⚙️', desc: 'Operations and development', color: '#A8A8A8' },
    { bps: fees.buybackFee, dest: 'Buyback & Burn', icon: '🔥', desc: 'Buys SNUT with ETH → sends to dead', color: C.fire },
    { bps: fees.rewardsFee, dest: 'NUT Rewards', icon: '🌰', desc: 'NUT bought and sent to SNUT holders', color: C.gold },
  ];

  // Section wrapper
  const Section = ({ title, icon, children, fire }) => (
    <Box sx={{
      mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3,
      background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgCard2} 100%)`,
      border: `1px solid ${fire ? 'rgba(255,107,53,0.2)' : C.border}`,
      boxShadow: fire ? '0 4px 20px rgba(255,80,0,0.06)' : '0 4px 16px rgba(0,0,0,0.15)',
    }}>
      <Typography sx={{
        fontSize: '1.15rem', fontWeight: 800, mb: 2,
        color: fire ? C.fireGlow : C.nutLight,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>{icon} {title}</Typography>
      {children}
    </Box>
  );

  return (
    <Layout>
      <Head>
        <title>SNUT | The Burn Token | BASED NUT</title>
        <meta name="description" content="SNUT — experimental memefi. Hold SNUT, earn NUT. Buybacks burn SNUT to dead. Dead earns more NUT. The burn flywheel never stops." />
      </Head>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <TokenNav dark />


        {/* ════ HERO ════ */}
        <Box sx={{
          position: 'relative', mb: 3, p: { xs: 2.5, md: 4 }, borderRadius: 4, overflow: 'hidden',
          background: `linear-gradient(160deg, ${C.bgDark} 0%, #3D2B1F 50%, #4A2F1A 100%)`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          border: `1px solid ${C.border}`,
        }}>
          <Box sx={{
            position: 'absolute', bottom: -20, right: -10, width: 200, height: 120, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,107,53,0.06) 0%, transparent 70%)',
            filter: 'blur(25px)', pointerEvents: 'none',
          }} />

          <Box sx={{ position: 'relative' }}>
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
              <Typography variant="h3" sx={{
                fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 900,
                color: C.cream, letterSpacing: '-0.02em',
              }}>🔥 SNUT</Typography>
              <Box sx={{
                px: 1.5, py: 0.3, borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: 'rgba(255,107,53,0.12)', color: C.fireGlow,
                border: '1px solid rgba(255,107,53,0.25)',
              }}>Experimental Memefi</Box>
            </Box>

            {/* Clear explanation of what SNUT is */}
            <Typography sx={{
              color: C.text, fontSize: { xs: '0.95rem', md: '1.05rem' }, mb: 1, lineHeight: 1.6, maxWidth: 700,
            }}>
              <strong style={{ color: C.gold }}>SNUT is a liquid, non-escrow NUT reward-position token.</strong>{' '}
              Hold SNUT in any wallet to automatically earn NUT rewards — no locking, no staking contract, no escrow.
              Every SNUT trade pays a {loading ? '...' : totalFeePct} tax that funds NUT rewards, buybacks, and liquidity.
              Buybacks send SNUT to the burn address, where it <em>keeps earning NUT</em> — creating a recursive burn flywheel.
            </Typography>
            <Typography sx={{
              color: C.textDim, fontSize: { xs: '0.82rem', md: '0.9rem' }, mb: 2, maxWidth: 700,
            }}>
              <strong style={{ color: C.fireGlow }}>Burn feeds burn.</strong> Dead-held SNUT earns NUT. That NUT goes to dead too. The flywheel never stops. 🔥
            </Typography>

            {/* Quick stats */}
            <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 3 }, flexWrap: 'wrap', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.65rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>Burned</Typography>
                <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 900, color: C.fire }}>
                  {loading ? '...' : fmtPct(burnPct)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.65rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>Circulating</Typography>
                <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 900, color: C.gold }}>
                  {loading ? '...' : fmtNum(circulating)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.65rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>Price</Typography>
                <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 900, color: C.nutLight }}>
                  {fmtUsd(price)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.65rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>Buyback Fuel</Typography>
                <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 900, color: C.fireGlow }}>
                  {loading ? '...' : `${fmtNum(buybackFuel, 4)} ETH`}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.65rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>Reactor</Typography>
                <Typography sx={{
                  fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 900,
                  color: reactorActive ? '#4CAF50' : C.textFaint,
                }}>
                  {loading ? '...' : reactorActive ? '⚡ ACTIVE' : '💤 IDLE'}
                </Typography>
              </Box>
            </Box>

            {/* Full contract addresses */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <AddrBox label="SNUT" addr={SNUT_ADDR} fire />
                <AddrBox label="Dead" addr={DEAD_ADDR} href={`https://basescan.org/token/${SNUT_ADDR}?a=${DEAD_ADDR}#tokentxns`} fire />
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <AddrBox label="SNUT/ETH" addr={SNUT_ETH_POOL} />
                <AddrBox label="SNUT/NUT" addr={SNUT_NUT_POOL} />
                <AddrBox label="Meta-pool" addr={META_POOL} />
                <AddrBox label="Balancer" addr={BALANCER_POOL} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                <Link href="https://docs.basednut.com/snut" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600, color: C.textDim, background: 'rgba(139,90,43,0.1)', border: `1px solid ${C.border}` }}>📖 Docs</Box>
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ════ CHART + MARKET STATS ════ */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 3 }}>
          {/* Chart */}
          <Box sx={{
            position: 'relative', width: '100%', pb: { xs: '70%', md: '55%' }, borderRadius: 3, overflow: 'hidden',
            border: `1px solid ${C.border}`,
          }}>
            <iframe
              title="SNUT chart"
              src={`https://www.geckoterminal.com/base/pools/${SNUT_ETH_POOL}?embed=1&info=0&chart=1&theme=dark&chartType=candlestick&chartInterval=1D&interval=1D`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              frameBorder="0"
            />
          </Box>

          {/* Market Stats */}
          <Box sx={{
            p: 2, borderRadius: 3,
            background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgCard2} 100%)`,
            border: `1px solid ${C.border}`,
          }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: C.nutLight, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
              Market Stats
            </Typography>
            {[
              { label: 'Price', value: fmtUsd(price), source: m?.geckoTerminal ? 'GeckoTerminal' : m?.dexScreener ? 'DexScreener' : null },
              { label: 'Volume (24h)', value: fmtUsd(volume24h), source: m?.geckoTerminal ? 'GeckoTerminal' : m?.dexScreener ? 'DexScreener' : null },
              { label: 'Liquidity', value: fmtUsd(liquidity), source: m?.geckoTerminal ? 'GeckoTerminal' : m?.dexScreener ? 'DexScreener' : null },
              { label: 'Total Supply', value: `${fmtNum(totalSupply)} SNUT`, source: 'Base RPC' },
              { label: 'Circulating', value: `${fmtNum(circulating)} SNUT`, source: 'Base RPC' },
              { label: 'Buyback Fuel', value: `${fmtNum(buybackFuel, 4)} ETH`, source: 'Base RPC' },
              { label: 'Tax Rate', value: loading ? '...' : totalFeePct, source: 'Smart Contract' },
            ].map((stat, i) => (
              <Box key={i} sx={{
                py: 1, borderBottom: i < 6 ? `1px solid ${C.border}` : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <Typography sx={{ fontSize: '0.78rem', color: C.textFaint }}>{stat.label}</Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: C.text }}>{stat.value}</Typography>
                  {stat.source && <Typography sx={{ fontSize: '0.62rem', color: C.textFaint }}>{stat.source}</Typography>}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ════ LIVE DISTRIBUTION ════ */}
        <Section title="Live Distribution" icon="📊">
          <Typography sx={{ fontSize: '0.85rem', color: C.textDim, mb: 2 }}>
            Where is all the SNUT right now? Live from Base blockchain.
          </Typography>
          {/* Stacked bar */}
          <Box sx={{
            height: 30, borderRadius: 15, overflow: 'hidden', display: 'flex', mb: 2,
            border: `1px solid ${C.border}`,
          }}>
            <Box sx={{
              width: `${burnPct}%`, background: 'linear-gradient(90deg, #E53935, #FF6B35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 1s ease',
            }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#fff' }}>{loading ? '' : fmtPct(burnPct)}</Typography>
            </Box>
            <Box sx={{
              width: `${poolPct}%`, background: 'linear-gradient(90deg, #5B9BD5, #29B6F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 1s ease',
            }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#fff' }}>{loading ? '' : fmtPct(poolPct)}</Typography>
            </Box>
            <Box sx={{
              width: `${floatPct}%`, background: 'linear-gradient(90deg, #D4A676, #C8A27A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 1s ease',
            }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#2A1A0F' }}>{loading ? '' : fmtPct(floatPct)}</Typography>
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 2, background: '#FF6B35' }} />
              <Typography sx={{ fontSize: '0.82rem', color: C.textDim }}>
                🔥 Burned: <strong style={{ color: C.fire }}>{loading ? '...' : fmtNum(burned)}</strong> SNUT
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 2, background: '#5B9BD5' }} />
              <Typography sx={{ fontSize: '0.82rem', color: C.textDim }}>
                🌊 In Pools: <strong style={{ color: '#5B9BD5' }}>{loading ? '...' : fmtNum(inPools)}</strong> SNUT
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 2, background: '#D4A676' }} />
              <Typography sx={{ fontSize: '0.82rem', color: C.textDim }}>
                🌿 Free Float: <strong style={{ color: C.gold }}>{loading ? '...' : fmtNum(freeFloat)}</strong> SNUT
              </Typography>
            </Box>
          </Box>
        </Section>

        {/* ════ BURN TRACKER ════ */}
        <Section title="Live Burn Tracker" icon="🔥" fire>
          {/* Progress bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.85rem', color: C.textDim }}>Burned to Dead Address</Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.fire }}>
                {loading ? '...' : `${fmtNum(burned)} SNUT (${fmtPct(burnPct)})`}
              </Typography>
            </Box>
            <Box sx={{
              height: 22, borderRadius: 11, overflow: 'hidden', position: 'relative',
              background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,107,53,0.15)',
            }}>
              <Box sx={{
                height: '100%', width: `${Math.min(burnPct, 100)}%`,
                background: 'linear-gradient(90deg, #E53935 0%, #FF6B35 50%, #FF8C42 100%)',
                borderRadius: 11, transition: 'width 1s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1,
              }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>
                  {loading ? '' : fmtPct(burnPct)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Supply breakdown */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1.5 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.08)', border: `1px solid ${C.border}` }}>
              <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>Total Supply</Typography>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: C.gold }}>
                {loading ? '...' : fmtNum(totalSupply)}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: C.textFaint }}>SNUT (from contract)</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.15)' }}>
              <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>💀 Dead-Held</Typography>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: C.fire }}>
                {loading ? '...' : fmtNum(burned)}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: C.textFaint }}>burned + still earning NUT</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(212,166,118,0.08)', border: '1px solid rgba(212,166,118,0.15)' }}>
              <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>🌿 Circulating</Typography>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: C.nutLight }}>
                {loading ? '...' : fmtNum(circulating)}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: C.textFaint }}>in wallets + pools</Typography>
            </Box>
          </Box>

          {/* LP burn */}
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, background: 'rgba(255,107,53,0.04)', border: '1px solid rgba(255,107,53,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontSize: '0.85rem', color: C.textDim }}>
                🔥 Dead-held SNUT/ETH LP: <strong style={{ color: C.fire }}>{loading ? '...' : fmtPct(d.deadLpPercentage)}</strong>
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: C.textFaint }}>
                Permanently locked — cannot be removed
              </Typography>
            </Box>
          </Box>

          {lastUpdate && (
            <Typography sx={{ fontSize: '0.65rem', color: C.textFaint, mt: 1, textAlign: 'right' }}>
              Last checked: {lastUpdate}{d.stale ? ' (stale cache)' : d.cached ? ' (cached)' : ' (live)'}
            </Typography>
          )}
        </Section>

        {/* ════ THE FLYWHEEL ════ */}
        <Section title="The Recursive Burn Flywheel" icon="🔄" fire>
          <Typography sx={{ fontSize: '0.9rem', color: C.textDim, mb: 2, lineHeight: 1.5 }}>
            Every SNUT trade pays <strong style={{ color: C.fireGlow }}>{loading ? '...' : totalFeePct}</strong> tax.
            That tax becomes ETH. ETH buys NUT rewards and SNUT buybacks.
            Buyback SNUT goes to dead. Dead-held SNUT earns NUT rewards.
            Those NUT also go to dead. <strong style={{ color: C.fireGlow }}>Burn feeds burn. It never stops.</strong>
          </Typography>

          {/* Flow steps */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
            {[
              { label: 'SNUT Trade', icon: '🔄', desc: 'buy or sell', fire: false },
              { label: `${loading ? '...' : totalFeePct} Tax Collected`, icon: '💰', desc: 'auto-deducted on transfer', fire: false },
              { label: 'Swapback → ETH', icon: '⚡', desc: 'tax SNUT sold for ETH', fire: false },
              { label: 'ETH Routes 4 Ways', icon: '🔀', desc: 'rewards / buyback / liquidity / manager', fire: false },
              { label: 'Buyback SNUT → Dead', icon: '🔥', desc: 'SNUT purchased and sent to burn address', fire: true },
              { label: 'Dead-Held SNUT Earns NUT', icon: '💀', desc: 'dead address earns rewards by design', fire: true },
              { label: 'NUT Rewards → Dead', icon: '🔥', desc: 'NUT sent to dead = NUT burned', fire: true },
              { label: 'Recursive Burn Compounds', icon: '♾️', desc: 'dead share grows → more NUT to dead → more burn', fire: true },
            ].map((step, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600 }}>
                <Box sx={{
                  flex: 1, p: 1, borderRadius: 2, textAlign: 'center',
                  background: step.fire
                    ? 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(229,57,53,0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(139,90,43,0.1) 0%, rgba(93,58,31,0.05) 100%)',
                  border: step.fire ? '1px solid rgba(255,107,53,0.2)' : `1px solid ${C.border}`,
                }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: step.fire ? C.fireGlow : C.nutLight }}>
                    {step.icon} {step.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: C.textFaint, mt: 0.25 }}>
                    {step.desc}
                  </Typography>
                </Box>
                {i < 7 && (
                  <Typography sx={{ fontSize: '1.3rem', color: step.fire ? 'rgba(255,107,53,0.3)' : 'rgba(139,90,43,0.3)', mx: 0.5 }}>↓</Typography>
                )}
              </Box>
            ))}
          </Box>
        </Section>

        {/* ════ TAX BREAKDOWN ════ */}
        <Section title={`Tax Breakdown (${loading ? '...' : totalFeePct})`} icon="💰">
          <Typography sx={{ fontSize: '0.85rem', color: C.textDim, mb: 2 }}>
            Every SNUT transfer pays {loading ? '...' : totalFeePct} tax, split into 4 streams. Rates are read live from the smart contract.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            {taxItems.map((t, i) => (
              <Box key={i} sx={{
                p: 1.5, borderRadius: 2,
                background: `${t.color}08`, border: `1px solid ${t.color}20`,
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <Box sx={{
                  minWidth: 44, height: 44, borderRadius: 2,
                  background: `linear-gradient(135deg, ${t.color}25 0%, ${t.color}10 100%)`,
                  border: `1px solid ${t.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.35rem',
                }}>{t.icon}</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: t.color }}>
                    {loading ? '...' : bpsToPct(t.bps)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.text }}>{t.dest}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: C.textFaint, mt: 0.25 }}>{t.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, background: 'rgba(139,90,43,0.06)', border: `1px solid ${C.border}` }}>
            <Typography sx={{ fontSize: '0.78rem', color: C.textFaint, lineHeight: 1.5 }}>
              💡 <strong style={{ color: C.nutLight }}>Swapback engine</strong>: Tax SNUT is collected, sold for ETH, and routed to 4 destinations. Buyback fuel sits as ETH in the contract until triggered. Live fee values are read directly from the SNUT smart contract.
            </Typography>
          </Box>
        </Section>

        {/* ════ FOUR POOLS ════ */}
        <Section title="Four Pools, Four Roles" icon="🌊">
          <Typography sx={{ fontSize: '0.88rem', color: C.textDim, mb: 2 }}>
            SNUT lives in multiple pools. Each has a different job — main liquidity, meta-market for LP rights, keeper-arb reactor, and multi-asset arbitrage reactor.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {/* Pool 1: SNUT/ETH Main */}
            <Box sx={{
              p: 2, borderRadius: 3, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(91,155,213,0.08) 0%, rgba(42,26,15,0.6) 100%)',
              border: '1px solid rgba(91,155,213,0.2)',
              transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)' },
            }} onClick={() => window.open(`https://basescan.org/address/${SNUT_ETH_POOL}`, '_blank')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#5B9BD5' }}>SNUT/ETH</Typography>
                <Box sx={{ px: 1, py: 0.15, borderRadius: 999, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(91,155,213,0.15)', color: '#5B9BD5' }}>MAIN LIQUIDITY</Box>
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: C.textDim, mb: 1, lineHeight: 1.4 }}>
                Primary market for SNUT. Price discovery happens here. LP token = claim on SNUT + ETH.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>SNUT</Typography><Typography sx={{ color: '#5B9BD5', fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.snutEthPoolActualSnut)}</Typography></Box>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>ETH</Typography><Typography sx={{ color: '#5B9BD5', fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.snutEthReserveEth, 4)}</Typography></Box>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>LP Burned</Typography><Typography sx={{ color: C.fire, fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtPct(d.deadLpPercentage)}</Typography></Box>
              </Box>
              <AddrBox label="Pool" addr={SNUT_ETH_POOL} />
            </Box>

            {/* Pool 2: Meta-pool */}
            <Box sx={{
              p: 2, borderRadius: 3, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(171,71,188,0.08) 0%, rgba(42,26,15,0.6) 100%)',
              border: '1px solid rgba(171,71,188,0.2)',
              transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)' },
            }} onClick={() => window.open(`https://basescan.org/address/${META_POOL}`, '_blank')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#AB47BC' }}>SNUT-LP/ETH</Typography>
                <Box sx={{ px: 1, py: 0.15, borderRadius: 999, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(171,71,188,0.15)', color: '#AB47BC' }}>META</Box>
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: C.textDim, mb: 1, lineHeight: 1.4 }}>
                Trade the LP token itself against ETH. Exit liquidity without removing it from the main pool.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>ETH</Typography><Typography sx={{ color: '#AB47BC', fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.metaPoolReserve0, 4)}</Typography></Box>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>LP Token</Typography><Typography sx={{ color: '#AB47BC', fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.metaPoolReserve1, 6)}</Typography></Box>
              </Box>
              <AddrBox label="Pool" addr={META_POOL} />
            </Box>

            {/* Pool 3: SNUT/NUT Reactor */}
            <Box sx={{
              p: 2, borderRadius: 3, cursor: 'pointer',
              background: `linear-gradient(135deg, ${reactorActive ? 'rgba(76,175,80,0.1)' : 'rgba(255,107,53,0.06)'} 0%, rgba(42,26,15,0.6) 100%)`,
              border: `1px solid ${reactorActive ? 'rgba(76,175,80,0.3)' : 'rgba(255,107,53,0.2)'}`,
              transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)' },
            }} onClick={() => window.open(`https://basescan.org/address/${SNUT_NUT_POOL}`, '_blank')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: reactorActive ? '#4CAF50' : C.fireGlow }}>SNUT/NUT</Typography>
                <Box sx={{
                  px: 1, py: 0.15, borderRadius: 999, fontSize: '0.62rem', fontWeight: 700,
                  background: reactorActive ? 'rgba(76,175,80,0.15)' : 'rgba(255,107,53,0.15)',
                  color: reactorActive ? '#4CAF50' : C.fireGlow,
                }}>REACTOR</Box>
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: C.textDim, mb: 1, lineHeight: 1.4 }}>
                Intentionally earns NUT rewards. Excess NUT creates arbitrage opportunities for keepers.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>SNUT</Typography><Typography sx={{ color: C.nutLight, fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.snutNutPoolActualSnut)}</Typography></Box>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>NUT</Typography><Typography sx={{ color: C.nutLight, fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.snutNutPoolActualNut, 4)}</Typography></Box>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>Excess</Typography><Typography sx={{ color: reactorActive ? '#4CAF50' : C.textFaint, fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(reactorExcess, 6)}</Typography></Box>
              </Box>
              <AddrBox label="Pool" addr={SNUT_NUT_POOL} />
            </Box>

            {/* Pool 4: Balancer */}
            <Box sx={{
              p: 2, borderRadius: 3, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(212,166,118,0.08) 0%, rgba(42,26,15,0.6) 100%)',
              border: '1px solid rgba(212,166,118,0.2)',
              transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)' },
            }} onClick={() => window.open(BALANCER_JOIN, '_blank')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: C.gold }}>Balancer pNUT</Typography>
                <Box sx={{ px: 1, py: 0.15, borderRadius: 999, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(212,166,118,0.15)', color: C.gold }}>ARB REACTOR</Box>
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: C.textDim, mb: 1, lineHeight: 1.4 }}>
                Multi-asset pool: cbETH, SNUT, NUT, cbBTC. Arbitrage routing surface. Dividend-exempt by design.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>cbETH</Typography><Typography sx={{ color: C.gold, fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.balancerBalances?.cbETH, 4)}</Typography></Box>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>SNUT</Typography><Typography sx={{ color: C.gold, fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.balancerBalances?.SNUT)}</Typography></Box>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>NUT</Typography><Typography sx={{ color: C.gold, fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.balancerBalances?.NUT, 4)}</Typography></Box>
                <Box><Typography sx={{ color: C.textFaint, fontSize: '0.68rem' }}>cbBTC</Typography><Typography sx={{ color: C.gold, fontWeight: 600, fontSize: '0.82rem' }}>{loading ? '...' : fmtNum(d.balancerBalances?.cbBTC, 4)}</Typography></Box>
              </Box>
              <AddrBox label="Pool" addr={BALANCER_POOL} />
            </Box>
          </Box>
        </Section>

        {/* ════ ECONOMIC LAYERS ════ */}
        <Section title="Four Economic Layers" icon="🏗️">
          <Typography sx={{ fontSize: '0.85rem', color: C.textDim, mb: 2 }}>
            SNUT is not just a token. It is four economic mechanisms stacked into one liquid position.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
            {[
              { num: '1', title: 'Reward-Position', icon: '🎁', desc: 'Hold SNUT, earn NUT. No locking, no escrow. Your wallet is your stake. The SNUT contract distributes NUT rewards to all holders proportional to their balance.', color: C.gold },
              { num: '2', title: 'Burn Layer', icon: '🔥', desc: 'Buybacks send SNUT to dead. Dead earns NUT. NUT sent to dead = NUT burned. Dead-held SNUT share grows over time, compounding the recursive burn.', color: C.fire },
              { num: '3', title: 'Liquidity-Rights', icon: '🌴', desc: 'SNUT/ETH LP = claim on pool assets. Meta-pool lets you trade that claim without exiting liquidity. LP token is a redeemable pro-rata claim on SNUT + ETH.', color: '#AB47BC' },
              { num: '4', title: 'Reactor Layer', icon: '⚡', desc: 'Balancer = multi-asset arbitrage routing surface. SNUT/NUT = reward-fed keeper-arb reactor where NUT inflows create excess-balance games for keepers.', color: '#4CAF50' },
            ].map((layer) => (
              <Box key={layer.num} sx={{
                p: 2, borderRadius: 2,
                background: `${layer.color}08`, border: `1px solid ${layer.color}20`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box sx={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: `${layer.color}20`, border: `1px solid ${layer.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800, color: layer.color,
                  }}>{layer.num}</Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: layer.color }}>
                    {layer.icon} {layer.title}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.82rem', color: C.textDim, lineHeight: 1.5 }}>
                  {layer.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Section>

        {/* ════ MISCONCEPTIONS ════ */}
        <Box sx={{
          mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3,
          background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgCard2} 100%)`,
          border: `1px solid ${C.border}`,
        }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, mb: 1.5, color: C.nutLight }}>
            🧠 Common Misconceptions
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
            {[
              { wrong: 'Escrow staking', right: 'Non-escrow reward-position — your wallet, your keys' },
              { wrong: 'Supply burns literally', right: 'Economic burn — SNUT sent to dead, still earns NUT' },
              { wrong: 'Just a passive dividend', right: 'Recursive burn flywheel that compounds over time' },
              { wrong: 'All pools are the same', right: 'Each pool has a distinct economic purpose' },
            ].map((item, i) => (
              <Box key={i} sx={{ p: 1.25, borderRadius: 2, background: 'rgba(0,0,0,0.15)' }}>
                <Typography sx={{ fontSize: '0.75rem', color: C.textFaint, textDecoration: 'line-through' }}>
                  ❌ {item.wrong}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: C.text, mt: 0.25 }}>
                  ✅ {item.right}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ════ ACTION BUTTONS ════ */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
          <Link href={`https://app.uniswap.org/explore/tokens/base/${SNUT_ADDR}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Box sx={{
              px: 2.5, py: 1, borderRadius: 2, fontSize: '0.88rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              color: '#fff', background: `linear-gradient(135deg, ${C.nut} 0%, ${C.gold} 100%)`,
              border: `1px solid ${C.nutLight}`, cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 5px 15px rgba(139,90,43,0.3)' },
            }}>🔄 Trade on Uniswap</Box>
          </Link>
          <Link href={`https://basescan.org/token/${SNUT_ADDR}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Box sx={{
              px: 2.5, py: 1, borderRadius: 2, fontSize: '0.88rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              color: C.textDim, background: 'rgba(139,90,43,0.1)', border: `1px solid ${C.border}`, cursor: 'pointer',
              '&:hover': { background: 'rgba(139,90,43,0.2)' },
            }}>🔍 Basescan</Box>
          </Link>
          <Link href={`https://basescan.org/token/${SNUT_ADDR}?a=${DEAD_ADDR}#tokentxns`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Box sx={{
              px: 2.5, py: 1, borderRadius: 2, fontSize: '0.88rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              color: C.fire, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', cursor: 'pointer',
              '&:hover': { background: 'rgba(255,107,53,0.15)' },
            }}>🔥 Burn Transactions</Box>
          </Link>
          <Link href="https://docs.basednut.com/snut" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Box sx={{
              px: 2.5, py: 1, borderRadius: 2, fontSize: '0.88rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              color: C.textDim, background: 'rgba(139,90,43,0.1)', border: `1px solid ${C.border}`, cursor: 'pointer',
              '&:hover': { background: 'rgba(139,90,43,0.2)' },
            }}>📖 Docs</Box>
          </Link>
        </Box>

      </Box>
    </Layout>
  );
}
