// Sunflower Grove — dedicated grove page
// Six Balancer v3 Twin Grafts rooted in wNUT. Verified on-chain; zero fabricated numbers.
// Live prices/liquidity: links out to Balancer/Dexscreener. Seeds are experiment-scale.

import Head from 'next/head';
import Link from 'next/link';
import { Box, Typography, Chip } from '@mui/material';
import Layout from '../components/Layout';

const C = {
  bgDark: '#0E1A0B',
  bgCard: 'rgba(24,42,20,0.92)',
  border: 'rgba(107,142,78,0.30)',
  sun: '#E8B33D',
  sunDeep: '#C9A227',
  leaf: '#6B8E4E',
  greenLight: '#9CBF7A',
  cream: '#F2EAD3',
  textDim: '#C4BBA0',
  textFaint: '#8F8871',
};

const WNUT = '0xBA5ED46e31F80dafF307cbf60bd422a6f62E3dd3';
const VAULT = '0xBA1333333333a1BA1108E8412F11850A5C319ba9';

const GRAFTS = [
  {
    symbol: 'gtINF', name: 'Inference Twin Graft', pair: 'wNUT · VVV · DIEM', theme: 'AI Inference',
    pool: '0x6a0a1B7428d543524592eD22023A09BdE05aA466', icon: '🌻🧠', batch: 'Batch I · 2026-08-27',
    blurb: 'Venice inference economics grafted onto NUT rootstock.',
  },
  {
    symbol: 'gtAGT', name: 'Agent Twin Graft', pair: 'wNUT · VIRTUAL · MOR', theme: 'AI Agents',
    pool: '0x5dA95cC31C840Fd33180e4C7f879e3F3d8Eca200', icon: '🌻🤖', batch: 'Batch I · 2026-08-27',
    blurb: 'Agent-launchpad rails grafted onto NUT rootstock.',
  },
  {
    symbol: 'gtETH', name: 'Ether Twin Graft', pair: 'wNUT · cbETH · wstETH', theme: 'Ether',
    pool: '0xd156d51219B3a7A590670d655E8740Ad404e8835', icon: '🌻💧', batch: 'Batch I · 2026-08-27',
    blurb: 'Staked + liquid ether scions on NUT rootstock.',
  },
  {
    symbol: 'gtBTC', name: 'Bitcoin Twin Graft', pair: 'wNUT · cbBTC · tBTC', theme: 'Bitcoin',
    pool: '0xb2a63935e1391Ee49E5cfB6cc4f184C285fE29b4', icon: '🌻₿', batch: 'Batch I · 2026-08-27',
    blurb: 'Coinbase + Threshold bitcoin scions on NUT rootstock.',
  },
  {
    symbol: 'gtFX', name: 'FX Twin Graft', pair: 'wNUT · USDC · EURC', theme: 'Currencies',
    pool: '0x1cCB8c61b62b9c7a9d4e66C9c824C1539B8b1f2E', icon: '🌻€', batch: 'Batch I · 2026-08-27',
    blurb: 'Dollar + euro stablecoin scions on NUT rootstock.',
  },
  {
    symbol: 'gtSIL', name: 'Silicon Twin Graft', pair: 'wNUT · NVDAc · AAPLc', theme: 'RWA — Tokenized Equities',
    pool: '0xA669275f92e49aff80aBA7AaD86E5AFDDe3540B0', icon: '🌻💽', batch: 'RWA graft · 2026-09-01',
    blurb: 'Coinbase B20 tokenized NVIDIA and Apple shares grafted onto NUT rootstock.',
  },
];

const SCIONS = [
  { sym: 'VVV', name: 'Venice Token', addr: '0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf', icon: '🧠' },
  { sym: 'DIEM', name: 'Diem — Venice Compute', addr: '0xF4d97F2da56e8c3098f3a8D538DB630A2606a024', icon: '💠' },
  { sym: 'VIRTUAL', name: 'Virtuals Protocol', addr: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', icon: '🤖' },
  { sym: 'MOR', name: 'Morpheus AI', addr: '0x7431aDa8a591C955a994a21710752EF9b882b8e3', icon: '🕶️' },
  { sym: 'cbETH', name: 'Coinbase ETH', addr: '0x2Ae3F1Ec7F1f5012cFEab0185bFc7Aa3cf0dEc22', icon: '🌱' },
  { sym: 'wstETH', name: 'Lido wstETH', addr: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', icon: '💧' },
  { sym: 'cbBTC', name: 'Coinbase BTC', addr: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', icon: '🌾' },
  { sym: 'tBTC', name: 'Threshold tBTC', addr: '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b', icon: '₿' },
  { sym: 'USDC', name: 'USD Coin', addr: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', icon: '💵' },
  { sym: 'EURC', name: 'Circle EURC', addr: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42', icon: '€' },
  { sym: 'NVDAc', name: 'NVIDIA (B20)', addr: '0xb20000000000000000000078ee7ce2fE4908108C', icon: '💽' },
  { sym: 'AAPLc', name: 'Apple (B20)', addr: '0xb200000000000000000000C2e324d24d7eEcd1fb', icon: '🍎' },
];

const shortAddr = (a) => a.slice(0, 6) + '…' + a.slice(-4);

function Section({ title, icon, children, id }) {
  return (
    <Box id={id} component="section" sx={{ mb: 4 }}>
      <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, mb: 2, color: C.sun, display: 'flex', alignItems: 'center', gap: 1 }}>{icon} {title}</Typography>
      {children}
    </Box>
  );
}

export default function SunflowerGrovePage() {
  return (
    <Layout>
      <Head>
        <title>Sunflower Grove — BASED NUT</title>
        <meta name="description" content="Sunflower Grove — six Balancer v3 Twin Grafts rooting wNUT with AI, ether, bitcoin, FX and tokenized-equity scions on Base. Verified on-chain." />
      </Head>

      <Box sx={{ background: `linear-gradient(180deg, ${C.bgDark} 0%, #162411 100%)`, minHeight: '100vh', color: C.cream, px: { xs: 2, md: 4 }, py: 5, maxWidth: 1200, mx: 'auto' }}>

        {/* HERO */}
        <Box sx={{ mb: 5, textAlign: { xs: 'left', md: 'left' } }}>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 900, color: C.sun, lineHeight: 1.1 }}>
            🌻 Sunflower Grove
          </Typography>
          <Typography sx={{ color: C.textDim, fontSize: '1.05rem', mt: 1, maxWidth: 720 }}>
            Six Balancer v3 Twin Grafts, each rooting <strong style={{ color: C.cream }}>20% wNUT rootstock</strong> with two <strong style={{ color: C.cream }}>40% scions</strong> — inference, agents, ether, bitcoin, currencies, and tokenized equities. One root, many sunflowers.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            <Chip label="6 grafts live" size="small" sx={{ background: 'rgba(232,179,61,0.15)', color: C.sun, border: `1px solid ${C.border}` }} />
            <Chip label="Balancer v3 WEIGHTED 20/40/40" size="small" sx={{ background: 'rgba(107,142,78,0.15)', color: C.greenLight, border: `1px solid ${C.border}` }} />
            <Chip label="Base mainnet" size="small" sx={{ background: 'rgba(107,142,78,0.15)', color: C.greenLight, border: `1px solid ${C.border}` }} />
            <Chip label="Boss sole LP — experiment scale" size="small" sx={{ background: 'rgba(232,179,61,0.10)', color: C.textDim, border: `1px solid ${C.border}` }} />
          </Box>
        </Box>

        {/* DOCTRINE */}
        <Section title="Graft anatomy" icon="🌱">
          <Box sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, background: C.bgCard, border: `1px solid ${C.border}`, color: C.textDim, fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 860 }}>
            A sunflower graft is a <strong style={{ color: C.cream }}>Balancer v3 weighted pool</strong> where
            <strong style={{ color: C.sun }}> wNUT is the rootstock (20%)</strong> — wrapped NUT, the indivisible root made divisible —
            and two <strong style={{ color: C.cream }}>scions (40% each)</strong> are grafted onto it.
            The pool mints a <strong style={{ color: C.cream }}>BPT (Balancer Pool Token)</strong>: holding the graft is holding a slice of the whole sunflower.
            <br /><br />
            <strong style={{ color: C.sun }}>Naming grammar:</strong> <code style={{ color: C.greenLight }}>g</code> = Graft pool-token namespace ·
            bare <code style={{ color: C.greenLight }}>g + theme</code> = Twin form (20/40/40) ·
            form letters <code style={{ color: C.greenLight }}>e / r / p / l</code> reserve future weight forms.
            gtINF, gtAGT, gtETH, gtBTC, gtFX, gtSIL — six twins, one rootstock.
            <br /><br />
            <strong style={{ color: C.cream }}>wNUT rootstock:</strong> <code style={{ color: C.greenLight }}>{shortAddr(WNUT)}</code> —
            ERC-20 wrapper, 1:1 NUT backing, audited (WNUT-SEC-2026-08-22, PASS). Live state on the{' '}
            <Link href="/token/wnut" style={{ color: C.sun, textDecoration: 'none' }}>wNUT Observatory ↗</Link>.
          </Box>
        </Section>

        {/* GROVE GRID */}
        <Section title="The six grafts" icon="🌻">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
            {GRAFTS.map((g) => (
              <Box key={g.symbol} sx={{ p: 2, borderRadius: 2, background: C.bgCard, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 1, transition: 'border-color 0.2s', '&:hover': { borderColor: C.sun } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: C.cream }}>{g.icon} {g.symbol}</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: C.textFaint }}>{g.batch}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: C.sun, fontWeight: 700 }}>{g.name}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: C.greenLight, fontFamily: 'monospace' }}>{g.pair}</Typography>
                {/* weights bar */}
                <Box sx={{ display: 'flex', height: 14, borderRadius: 1, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                  <Box sx={{ width: '20%', background: C.sunDeep }} title="wNUT rootstock 20%" />
                  <Box sx={{ width: '40%', background: C.leaf }} title="scion 40%" />
                  <Box sx={{ width: '40%', background: '#4A7C2F' }} title="scion 40%" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: C.textFaint }}>
                  <span>root 20%</span><span>scion 40%</span><span>scion 40%</span>
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: C.textDim, lineHeight: 1.5, minHeight: 44 }}>{g.blurb}</Typography>
                <Typography sx={{ fontSize: '0.62rem', color: C.textFaint, fontFamily: 'monospace' }}>{shortAddr(g.pool)}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 'auto' }}>
                  <Link href={`https://balancer.fi/pools/base/v3/${g.pool}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box sx={{ px: 1, py: 0.25, borderRadius: 1, fontSize: '0.6rem', fontWeight: 700, color: C.sun, background: 'rgba(232,179,61,0.12)', border: `1px solid ${C.border}`, cursor: 'pointer' }}>Balancer ↗</Box>
                  </Link>
                  <Link href={`https://basescan.org/address/${g.pool}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Box sx={{ px: 1, py: 0.25, borderRadius: 1, fontSize: '0.6rem', fontWeight: 700, color: C.greenLight, background: 'rgba(107,142,78,0.12)', border: `1px solid ${C.border}`, cursor: 'pointer' }}>Basescan ↗</Box>
                  </Link>
                  <Link href={`/token/${g.symbol.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                    <Box sx={{ px: 1, py: 0.25, borderRadius: 1, fontSize: '0.6rem', fontWeight: 700, color: C.cream, background: 'rgba(242,234,211,0.08)', border: `1px solid ${C.border}`, cursor: 'pointer' }}>BPT page →</Box>
                  </Link>
                </Box>
              </Box>
            ))}
          </Box>
        </Section>

        {/* SCION REGISTRY */}
        <Section title="Scion registry — 12 verified scions" icon="🌿">
          <Box sx={{ borderRadius: 2, border: `1px solid ${C.border}`, overflow: 'hidden', maxWidth: 900 }}>
            {SCIONS.map((s, i) => (
              <Box key={s.sym} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, background: i % 2 === 0 ? C.bgCard : 'rgba(16,28,13,0.9)', borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
                <Typography sx={{ fontSize: '0.9rem' }}>{s.icon}</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: C.cream, minWidth: 80 }}>{s.sym}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: C.textDim, flex: 1 }}>{s.name}</Typography>
                <Link href={`https://basescan.org/token/${s.addr}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Typography sx={{ fontSize: '0.62rem', color: C.greenLight, fontFamily: 'monospace', cursor: 'pointer' }}>{shortAddr(s.addr)} ↗</Typography>
                </Link>
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: '0.7rem', color: C.textFaint, mt: 1 }}>
            All scion contracts RPC-verified on Base. B20 scions (NVDAc, AAPLc) are Coinbase tokenized equities — 8 decimals, issuer Coinbase Onchain SPV.
          </Typography>
        </Section>

        {/* HONESTY */}
        <Section title="Zero-fabrication rule" icon="🚿">
          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(232,179,61,0.06)', border: `1px dashed ${C.sunDeep}`, color: C.textDim, fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 860 }}>
            Seeds are experiment-scale. This page shows <strong style={{ color: C.cream }}>no TVL, volume, or price numbers</strong> —
            live numbers live on <Link href="https://balancer.fi" target="_blank" rel="noopener noreferrer" style={{ color: C.sun, textDecoration: 'none' }}>Balancer ↗</Link> and{' '}
            <Link href="https://dexscreener.com/base" target="_blank" rel="noopener noreferrer" style={{ color: C.sun, textDecoration: 'none' }}>Dexscreener ↗</Link>.
            Pool addresses are the contract truth; everything else is a link, not a claim. Vault:{' '}
            <code style={{ color: C.greenLight }}>{shortAddr(VAULT)}</code>.
          </Box>
        </Section>

        {/* CTA */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 3 }}>
          <Link href="/token/wnut" style={{ textDecoration: 'none' }}>
            <Box sx={{ px: 2.5, py: 1, borderRadius: 2, fontSize: '0.85rem', fontWeight: 800, color: '#1A1408', background: `linear-gradient(135deg, ${C.sun}, ${C.sunDeep})`, cursor: 'pointer' }}>🎁 wNUT Observatory →</Box>
          </Link>
          <Link href="/pair-your-token" style={{ textDecoration: 'none' }}>
            <Box sx={{ px: 2.5, py: 1, borderRadius: 2, fontSize: '0.85rem', fontWeight: 800, color: C.cream, background: 'rgba(107,142,78,0.18)', border: `1px solid ${C.border}`, cursor: 'pointer' }}>🔗 Pair your token with NUT →</Box>
          </Link>
        </Box>

      </Box>
    </Layout>
  );
}
