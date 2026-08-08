import Head from 'next/head';
import { Box, Typography, Paper, Divider } from '@mui/material';
import Layout from '../components/Layout';

const CHARTS = [
  { src: '/img/ecosystem/orchard-taxonomy.png', title: 'Orchard Taxonomy', note: 'One root, many layers — how NUT anchors every token, pool, NFT, and agent.' },
  { src: '/img/ecosystem/liquidity-network.png', title: 'Liquidity Network', note: 'Where the conserved supply lives — every node holds a slice of the same 10^18 units.' },
  { src: '/img/ecosystem/radial-tree.png', title: 'Radial Tree', note: 'The singleton graph from the root outward — a living tree of redistributed state.' },
  { src: '/img/ecosystem/tvl-treemap.png', title: 'TVL Treemap', note: 'Real value locked per venue, sized by what the Orchard actually holds.' },
  { src: '/img/ecosystem/arb-paths.png', title: 'Arbitrage Paths', note: 'Structural gaps between different AMM maths — arbitrageurs are the nervous system that closes them.' },
  { src: '/img/ecosystem/pnut-composition.png', title: 'pNUT Composition', note: 'The 25/25/25/25 index basket — a synthetic claim on the core.' },
  { src: '/img/ecosystem/pool-communities.png', title: 'Pool Communities', note: 'Which venues cluster in the liquidity graph — where value pools together.' },
  { src: '/img/ecosystem/nut-flow-sankey.png', title: 'NUT Flow', note: 'One conserved river split into streams — NUT moves root to periphery to root.' },
  { src: '/img/ecosystem/bonding-curves.png', title: 'Bonding Curves', note: 'Periphery tokens lock NUT to mint — the child strengthens the parent.' },
  { src: '/img/ecosystem/flywheel.png', title: 'Reward Flywheel', note: 'Trade to fees to rewards to buybacks — the recursive loop that compounds.' },
  { src: '/img/ecosystem/v3-depth.png', title: 'V3 Liquidity Depth', note: 'Concentrated liquidity tick by tick — capital efficiency as a graph.' },
  { src: '/img/ecosystem/burn-cycle.png', title: 'Recursive Burn Cycle', note: 'The gravity well — dead-held SNUT keeps earning NUT, tightening the loop forever.' },
  { src: '/img/ecosystem/pool-correlation.png', title: 'Pool Correlation', note: 'Where prices move together — and where arb pressure lives.' },
];

function GridSection({ charts }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      {charts.map((c) => (
        <Paper key={c.src} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(139,90,43,0.15)', background: '#FFFDF7' }}>
          <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(139,90,43,0.1)' }}>
            <Typography sx={{ fontWeight: 700, color: '#5B3A29' }}>{c.title}</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(40,40,60,0.6)', mt: 0.25 }}>{c.note}</Typography>
          </Box>
          <Box sx={{ p: 1, bgcolor: '#FBF6EA' }}>
            <img src={c.src} alt={c.title} style={{ width: '100%', height: 'auto', borderRadius: 12, display: 'block' }} loading='lazy' />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default function EcosystemPage() {
  return (
    <Layout>
      <Head>
        <title>Ecosystem Graphs | BASED NUT</title>
        <meta name='description' content='The BASED NUT ecosystem drawn from live on-chain state — pools, flows, curves, and arbitrage paths.' />
      </Head>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant='h4' sx={{ color: '#5B3A29', fontWeight: 'bold', mb: 0.5 }}>
          🧭 The Conserved Orchard
        </Typography>
        <Typography sx={{ color: 'rgba(40,40,60,0.7)', mb: 2 }}>
          The Orchard drawn from live on-chain state — every graph below traces real pools, flows, curves, and arbitrage paths. Where NUT liquidity lives, how it moves, what closes the spreads. (The conserved-singleton physics of the root token lives on the NUT token page.)
        </Typography>

        <GridSection charts={CHARTS} />

        <Divider sx={{ my: 4 }} />

        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(139,90,43,0.15)', background: 'linear-gradient(135deg, #FAF3E6 0%, #F5E6C8 100%)' }}>
          <Typography variant='h6' sx={{ color: '#5B3A29', fontWeight: 'bold', mb: 1 }}>
            🌱 The Open Layer
          </Typography>
          <Typography sx={{ color: 'rgba(40,40,60,0.8)', fontSize: '0.95rem' }}>
            The Orchard shows its work. Addresses, venues, flows, mechanics — all public, all verifiable on-chain. The graph is the mirror: what you see here is what the chain says, and the chain is the only authority.
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
}
