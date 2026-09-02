// wNUT Dedicated Page — Graft / Leaf Theme
// Wrapped NUT Observatory — live supply, 1:1 backing, wrap/unwrap flows, distribution, holders, verified markets.
// ALL numbers LIVE from /api/wnut-data (Base RPC + Moralis event tape). Zero hardcoded stats.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Box, Typography, Chip } from '@mui/material';
import Layout from '../../components/Layout';
import TokenNav from '../../components/TokenNav';

const WNUT_ADDR = '0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3';
const NUT_ADDR = '0xb8de15fb529d98c93c749de63c749d48d25a30df';

// Graft / Leaf palette — earth family with green accent (distinct from NUT root brown, still Orchard)
const C = {
  bgDark: '#14200F',
  bgCard: 'rgba(30,45,24,0.92)',
  bgCard2: 'rgba(46,66,36,0.85)',
  border: 'rgba(139,90,43,0.30)',
  text: '#FAF3E6',
  textDim: 'rgba(250,243,230,0.92)',
  textFaint: 'rgba(250,243,230,0.66)',
  nut: '#8B5A2B',
  nutLight: '#C8A27A',
  cream: '#FAF3E6',
  gold: '#D4A676',
  green: '#6B8E4E',
  greenLight: '#8FBC8F',
  greenGlow: '#A8D08D',
  graftGlow: '#E8C56E',
};

function fmtNum(v, dec = 6) {
  if (v == null || v === '' || Number.isNaN(Number(v))) return '—';
  const n = Number(v);
  if (n === 0) return '0';
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toFixed(dec).replace(/(\.|\.[0-9]*[1-9])0+$/, '$1').replace(/\.$/, '');
}

function fmtUsd(v) {
  if (v == null || v === '' || Number.isNaN(Number(v))) return '—';
  const n = Number(v);
  if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
  return '$' + n.toFixed(n < 1 ? 4 : 2);
}

function fmtPct(v) {
  if (v == null || v === '' || Number.isNaN(Number(v))) return '—';
  return Number(v).toFixed(2) + '%';
}

function shortAddr(a) {
  if (!a) return '—';
  return a.slice(0, 6) + '…' + a.slice(-4);
}

function evTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}

function timeAgo(iso) {
  if (!iso) return '—';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  } catch { return '—'; }
}

export default function WNut() {
  const [data, setData] = useState(null);
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(true);

  async function pull() {
    try {
      const r = await fetch('/api/wnut-data', { headers: { accept: 'application/json' }, cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      setData(j?.wnut || null);
      setSrc(j?.source || '');
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    pull();
    const t = setInterval(pull, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const Section = ({ title, icon, glow, children }) => (
    <Box sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, ' + C.bgCard + ' 0%, ' + C.bgCard2 + ' 100%)', border: '1px solid ' + C.border, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
      <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, mb: 2, color: glow ? C.graftGlow : C.nutLight, display: 'flex', alignItems: 'center', gap: 1 }}>{icon} {title}</Typography>
      {children}
    </Box>
  );

  const StatRow = ({ label, value, source }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.5, borderBottom: '1px solid ' + C.border }}>
      <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>{label}</Typography>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: C.cream }}>{value}</Typography>
        {source && <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>{source}</Typography>}
      </Box>
    </Box>
  );

  const AddrBox = ({ label, addr }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.78rem', color: C.nutLight, fontFamily: 'monospace' }}>{addr}</Typography>
      <Link href={'https://basescan.org/token/' + addr} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <Box sx={{ px: 1, py: 0.15, borderRadius: 1, fontSize: '0.62rem', fontWeight: 700, color: C.gold, background: 'rgba(212,166,118,0.10)', border: '1px solid ' + C.border, cursor: 'pointer', '&:hover': { background: 'rgba(212,166,118,0.18)' } }}>↗</Box>
      </Link>
    </Box>
  );

  const MetricCell = ({ label, value, unit, color }) => (
    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(107,142,78,0.08)', border: '1px solid ' + C.border, textAlign: 'center' }}>
      <Typography sx={{ fontSize: '0.6rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color }}>{loading ? '...' : value}</Typography>
      {unit && <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>{unit}</Typography>}
    </Box>
  );

  const flows = data?.flows || {};
  const windows = [
    { key: 'h24', label: 'Last 24h' },
    { key: 'd7', label: 'Last 7 days' },
    { key: 'd30', label: 'Last 30 days' },
  ];
  const dist = data?.distribution || [];
  const holders = data?.topHolders || [];
  const markets = data?.markets || [];
  const events = data?.recentEvents || [];
  const noTape = events.length === 0 && data?.eventsError;

  return (
    <Layout>
      <Head>
        <title>wNUT | Wrapped NUT Observatory | BASED NUT</title>
        <meta name="description" content="wNUT — wrapped NUT on Base. Live supply, 1:1 backing, wrap/unwrap flows, holder distribution, and Sunflower Grove Balancer v3 markets." />
      </Head>

      <TokenNav dark />

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>

        {/* HERO */}
        <Box sx={{ position: 'relative', mb: 3, p: { xs: 2.5, md: 4 }, borderRadius: 4, overflow: 'hidden', background: 'linear-gradient(160deg, ' + C.bgDark + ' 0%, #1E2D18 50%, #2A3D1E 100%)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '1px solid ' + C.border }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: C.cream, fontWeight: 900 }}>🎁 wNUT</Typography>
            <Typography sx={{ mb: 2, fontSize: '1.1rem', color: C.greenLight, fontWeight: 600 }}>The Wrapped Leaf of the Root</Typography>
            <Typography sx={{ mb: 2, color: C.textDim, fontSize: '0.9rem', maxWidth: 620 }}>
              NUT, wrapped. One root — <strong style={{ color: C.gold }}>supply 1, forever</strong> — in two liquid states: the native <strong style={{ color: C.gold }}>NUT</strong> and <strong style={{ color: C.gold }}>wNUT</strong>, its ERC-20 wrapper. Every wNUT is a receipt for exactly one NUT locked in the wrapper — 1:1, audited, no admin. wNUT opens the Orchard to Balancer v3 composability through Sunflower Grove.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip sx={{ bgcolor: 'rgba(212,166,118,0.15)', color: C.gold, fontWeight: 600 }} label="Wrapper" size="small" />
              <Chip sx={{ bgcolor: 'rgba(139,90,43,0.12)', color: C.nutLight }} label="ERC-20" size="small" />
              <Chip sx={{ bgcolor: 'rgba(107,142,78,0.14)', color: C.greenLight }} label="1:1 Backed" size="small" />
              <Chip sx={{ bgcolor: 'rgba(107,142,78,0.14)', color: C.greenLight }} label="Audit PASS" size="small" />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Link href="https://docs.basednut.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ px: 2, py: 0.5, borderRadius: 2, fontSize: '0.8rem', fontWeight: 700, color: C.cream, background: 'linear-gradient(135deg, #6B8E4E, #4A6B3A)', border: '1px solid #3D582F', cursor: 'pointer', '&:hover': { transform: 'translateY(-1px)' }, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>📖 Docs</Box>
              </Link>
              <Link href={'https://basescan.org/token/' + WNUT_ADDR} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Box sx={{ px: 2, py: 0.5, borderRadius: 2, fontSize: '0.8rem', fontWeight: 700, color: C.nutLight, background: 'rgba(139,90,43,0.08)', border: '1px solid ' + C.border, cursor: 'pointer', '&:hover': { background: 'rgba(139,90,43,0.15)' }, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>🔍 Basescan</Box>
              </Link>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <AddrBox label="wNUT contract" addr={WNUT_ADDR} />
              <AddrBox label="Underlying NUT" addr={NUT_ADDR} />
            </Box>
          </Box>
        </Box>

        {/* 1. WRAPPED STATE */}
        <Section title="How much of NUT is wrapped?" icon="⚖️" glow>
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mb: 2, maxWidth: 700 }}>
            One root, two liquid states. The wrapper holds NUT 1:1 against every wNUT in circulation — the backing ratio is the invariant that should always read <strong style={{ color: C.greenGlow }}>exactly 1.00</strong>.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1, mb: 2 }}>
            <MetricCell label="wNUT supply" value={fmtNum(data?.totalSupply)} unit="wNUT" color={C.gold} />
            <MetricCell label="NUT backing" value={fmtNum(data?.underlyingBalance)} unit="NUT" color={C.greenLight} />
            <MetricCell label="Backing ratio" value={fmtNum(data?.backingRatio, 4) + '×'} unit="NUT per wNUT" color={C.greenGlow} />
            <MetricCell label="Backing value" value={fmtUsd(data?.backingValueUsd)} unit={data?.nutPriceUsd ? '@ NUT ' + fmtUsd(data.nutPriceUsd) : null} color={C.graftGlow} />
          </Box>
          <StatRow label="Wrapped share of NUT" value={fmtPct(data?.wrappedPctOfNut)} source="Base RPC" />
          <StatRow label="Backing surplus" value={fmtNum(data?.backingSurplus) + ' NUT'} source="must stay 0" />
          <StatRow label="Est. market cap" value={fmtUsd(data?.estMarketCapUsd)} source="wNUT supply × NUT price" />
          <StatRow label="Data source" value={src || '—'} source={data?.lastCheckedAt ? 'updated ' + timeAgo(data.lastCheckedAt) : null} />
          {data?.blockNumber != null && (
            <Typography sx={{ fontSize: '0.65rem', color: C.textFaint, mt: 1, textAlign: 'right' }}>Block {data.blockNumber} · verified live</Typography>
          )}
        </Section>

        {/* 2. FLOWS */}
        <Section title="Wrap / unwrap flows" icon="🔁">
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mb: 2, maxWidth: 700 }}>
            Every mint and burn on the tape. <strong style={{ color: C.gold }}>Wrap</strong> = NUT in, wNUT out. <strong style={{ color: C.gold }}>Unwrap</strong> = wNUT in, NUT out. Transfers move the same receipts between holders. Net flow = wrapped − unwrapped.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
            {windows.map((w) => (
              <Box key={w.key} sx={{ p: 1.5, borderRadius: 2, background: 'rgba(107,142,78,0.06)', border: '1px solid ' + C.border }}>
                <Typography sx={{ fontSize: '0.65rem', color: C.textFaint, textTransform: 'uppercase', fontWeight: 700, mb: 0.75 }}>{w.label}</Typography>
                <StatRow label="Wrapped" value={fmtNum(flows[w.key]?.wrapped)} source="NUT → wNUT" />
                <StatRow label="Unwrapped" value={fmtNum(flows[w.key]?.unwrapped)} source="wNUT → NUT" />
                <StatRow label="Transferred" value={fmtNum(flows[w.key]?.transferred)} source="wNUT → wNUT" />
                <StatRow label="Net flow" value={fmtNum(flows[w.key]?.net)} source="wrap − unwrap" />
                <StatRow label="Events" value={flows[w.key]?.txCount != null ? String(flows[w.key].txCount) : '—'} />
              </Box>
            ))}
          </Box>
          {noTape && (
            <Typography sx={{ fontSize: '0.72rem', color: C.textFaint, mt: 1.5 }}>
              Event tape unavailable right now ({String(data.eventsError)}). Flows show zero until the tape returns — no fabrication.
            </Typography>
          )}
        </Section>

        {/* 3. DISTRIBUTION */}
        <Section title="Where is the wNUT?" icon="📍">
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mb: 2, maxWidth: 700 }}>
            The wrapped supply is a conserved ledger too — every wNUT sits somewhere: pooled as liquidity in Sunflower Grove, or held in wallets.
          </Typography>
          {dist.length > 0 ? (
            <>
              <Box sx={{ display: 'flex', height: 28, borderRadius: 2, overflow: 'hidden', border: '1px solid ' + C.border, mb: 1.5 }}>
                {dist.map((d, i) => (
                  <Box key={i} sx={{ width: d.pct + '%', background: i === 0 ? C.graftGlow : C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'filter 0.2s', '&:hover': { filter: 'brightness(1.2)' } }} title={d.category + ' — ' + fmtNum(d.amount) + ' wNUT (' + fmtPct(d.pct) + ')'}>
                    {d.pct > 8 && <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#14200F' }}>{fmtPct(d.pct)}</Typography>}
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.5 }}>
                {dist.map((d, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: 1, background: i === 0 ? C.graftGlow : C.green, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.85rem', color: C.textDim, flex: 1 }}>{d.category}</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.cream, mr: 1 }}>{fmtNum(d.amount)}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, width: '4em', textAlign: 'right' }}>{fmtPct(d.pct)}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Typography sx={{ fontSize: '0.85rem', color: C.textFaint }}>{loading ? '...' : 'Distribution unavailable — event tape empty, no fabrication.'}</Typography>
          )}
        </Section>

        {/* 4. MARKETS */}
        <Section title="Verified wNUT markets" icon="🌻">
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mb: 2, maxWidth: 700 }}>
            Sunflower Grove — six Balancer v3 weighted pools, each grafting 20% wNUT rootstock with two 40% scions. Verified on Base; experiment-scale seeds, zero-fabrication rule: no observed swaps yet, so no liquidity/volume numbers shown.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 0.75 }}>
            {markets.map((m, i) => (
              <Box key={i} sx={{ p: 1, borderRadius: 1.5, background: 'rgba(107,142,78,0.05)', border: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: C.cream }}>{m.pair}</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: C.greenLight }}>20/40/40</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.66rem', color: C.nutLight }}>{m.venue}</Typography>
                <Typography sx={{ fontSize: '0.62rem', color: C.textFaint, fontFamily: 'monospace' }}>{shortAddr(m.poolAddress)}</Typography>
                <Link href={'https://basescan.org/address/' + m.poolAddress} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Box sx={{ mt: 0.5, px: 0.75, py: 0.2, borderRadius: 1, fontSize: '0.6rem', fontWeight: 600, color: C.gold, background: 'rgba(212,166,118,0.10)', border: '1px solid ' + C.border, cursor: 'pointer', textAlign: 'center', '&:hover': { background: 'rgba(212,166,118,0.18)' } }}>View on Basescan ↗</Box>
                </Link>
              </Box>
            ))}
          </Box>
        </Section>

        {/* 5. HOLDERS */}
        <Section title="Largest holders" icon="🐿️">
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mb: 2, maxWidth: 700 }}>
            wNUT is young — a handful of addresses hold the whole crop. Balances read live from Base RPC.
          </Typography>
          {holders.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {holders.map((h, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.75, borderRadius: 1.5, background: 'rgba(107,142,78,0.05)', border: '1px solid ' + C.border }}>
                  <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, fontSize: '0.62rem', fontWeight: 700, color: h.type === 'pool-vault' ? C.graftGlow : C.greenLight, background: 'rgba(107,142,78,0.10)', whiteSpace: 'nowrap' }}>{h.type === 'pool-vault' ? 'POOL' : 'WALLET'}</Box>
                  <Typography sx={{ fontSize: '0.72rem', color: C.nutLight, fontFamily: 'monospace', flex: 1 }}>{shortAddr(h.address)}</Typography>
                  {h.label && <Typography sx={{ fontSize: '0.66rem', color: C.gold, fontWeight: 700 }}>{h.label}</Typography>}
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.cream }}>{fmtNum(h.balance)}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: C.textFaint, width: '4em', textAlign: 'right' }}>{fmtPct(h.pct)}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.85rem', color: C.textFaint }}>{loading ? '...' : 'Holders unavailable — event tape empty, no fabrication.'}</Typography>
          )}
        </Section>

        {/* 6. RECENT EVENTS */}
        <Section title="Recent events" icon="🧾">
          <Typography sx={{ color: C.textDim, fontSize: '0.9rem', lineHeight: 1.7, mb: 2, maxWidth: 700 }}>
            The raw event tape, oldest first. Wrap = mint from zero. Unwrap = burn to zero. Everything else is a transfer.
          </Typography>
          {events.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, maxHeight: 400, overflowY: 'auto' }}>
              {events.map((e, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5, borderRadius: 1, background: 'rgba(107,142,78,0.04)' }}>
                  <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, fontSize: '0.62rem', fontWeight: 700, color: e.type === 'wrap' ? C.greenGlow : e.type === 'unwrap' ? '#E8A87C' : C.nutLight, background: 'rgba(107,142,78,0.10)', whiteSpace: 'nowrap' }}>{e.type}</Box>
                  <Typography sx={{ fontSize: '0.78rem', color: C.gold, fontWeight: 700 }}>{fmtNum(e.amount)}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: C.textFaint, flex: 1, fontFamily: 'monospace' }}>{evTime(e.timestamp)}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: C.textFaint, fontFamily: 'monospace' }}>#{e.blockNumber}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.85rem', color: C.textFaint }}>{loading ? '...' : 'Event tape unavailable (' + String(data?.eventsError || 'empty') + ') — no fabrication.'}</Typography>
          )}
        </Section>

        {/* 7. WRAPPER DISCIPLINE */}
        <Box sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'rgba(42,26,15,0.55)', border: '1px solid rgba(212,166,118,0.4)' }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: C.gold, mb: 1 }}>📦 ⇄ 🎁 · The wrapper should always explain itself</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: C.textDim, lineHeight: 1.7, maxWidth: 720 }}>
            Wrap with <strong style={{ color: C.gold }}>depositFor</strong>. Unwrap with <strong style={{ color: C.gold }}>withdrawTo</strong>. <strong style={{ color: '#E8A87C' }}>Do not send NUT directly to the wrapper contract</strong> — direct transfers create surplus the wrapper can never return to you. Every metric on this page is read live from the chain; if a source fails, the page says so instead of inventing numbers.
          </Typography>
        </Box>

      </Box>
    </Layout>
  );
}
