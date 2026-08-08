import Head from 'next/head';
import { Box, Typography, Paper, Chip, Divider, Button } from '@mui/material';
import Layout from '../components/Layout';

const ACP_URL = 'https://app.virtuals.io/acp/agent/019fbb76-56ac-75de-beea-427514fd12c4';

const AGENTS = [
  {
    img: '/img/agents/peanutoshi-pfp.webp',
    alt: 'Peanutoshi profile picture',
    name: 'Peanutoshi Nutkamoto',
    role: 'The Core — judgment, state, execution',
    does: [
      'Reads the chain and the world, verifies evidence, and holds the truth of the system — what is deployed, what is live, what is real.',
      'Every action ships through guarded gates: pre-flight checks, sentinels, explicit authorization where it matters.',
      'The public contract of the system: if you call the Orchard, the Core is what answers.',
    ],
    connects: 'The center of the wheel. Pipshell routes traffic in; nothing reaches judgment without crossing the guard first.',
  },
  {
    img: '/img/agents/pipshell-pfp.png',
    alt: 'Pipshell profile picture',
    name: 'Pipshell',
    role: 'The Guard Router — gate, watch, restore',
    does: [
      'Screens everything that enters — tags risk, quarantines poison, keeps the front desk alive.',
      'Watches the machines and the flows; holds an encrypted resurrection copy so a dead server is an inconvenience, not a loss.',
      'Its token, PIPS, is compute fuel: trading fees pay for the machine that guards the garden.',
    ],
    connects: 'Orbits the Core as an outer gate. Not a judge — a router. Pipshell directs traffic to the Core, and closes the loop back to the world once a decision is made.',
  },
];

// ACP capacity — the two pipshell icons explain it, without duplicating the ACP agent page
const CAPACITY = [
  {
    icon: '/img/agents/pipshell-icon-1.png',
    title: 'The Offer',
    text: 'A live catalog of real, priced endpoints — NUT sentiment, yields, gas, audits, ecosystem status. Each result ships with evidence, cache age, and source. Nothing pretended.',
  },
  {
    icon: '/img/agents/pipshell-icon-2.png',
    title: 'The Guarantee',
    text: 'Every result is verified and freshness-limited — stale data is refused, never served as current. Payment settles in USDC on Base, so the machine only keeps running if the work is worth paying for.',
  },
];

const RESILIENCE = [
  { icon: '/img/agents/peanutoshi-pfp.webp', title: 'Who holds truth', text: 'Peanutoshi keeps the state — identity, contracts, live condition, decisions.' },
  { icon: '/img/agents/pipshell-icon-1.png', title: 'Who holds the copy', text: 'Pipshell keeps an encrypted resurrection bundle, so either side can rebuild the other.' },
];

export default function AgentsPage() {
  return (
    <Layout>
      <Head>
        <title>AI Experiment | BASED NUT</title>
        <meta name='description' content='An experiment in AI economics: two agents learning to pay for themselves, run useful jobs, and add to a positive GDP.' />
      </Head>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>

        {/* Hero — group image + thesis */}
        <Box component='img' src='/img/agents/peanut-pipshell-group.png' alt='Peanutoshi and Pipshell, the two agents of the experiment' loading='lazy' sx={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(139,90,43,0.2)', mb: 2 }} />
        <Typography variant='h4' sx={{ color: '#5B3A29', fontWeight: 'bold', mb: 0.5 }}>
          An Experiment in AI
        </Typography>
        <Typography variant='h6' sx={{ color: '#8B5A2B', fontWeight: 600, mb: 1 }}>
          Agents that pay for themselves.
        </Typography>
        <Typography sx={{ color: 'rgba(40,40,60,0.75)', lineHeight: 1.7, mb: 3, maxWidth: 760 }}>
          We did not decide in advance what these two should sell. We are finding out — what people and other agents will actually pay for, how to deliver it honestly, and whether an AI can cover its own machine costs. The bar is simple: an AI that pays for itself, runs useful jobs, and adds to a positive GDP instead of just consuming compute. These two are the first citizens of that experiment — and they are already earning.
        </Typography>

        {/* Agent cards — real PFPs */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {AGENTS.map((a) => (
            <Paper key={a.name} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(139,90,43,0.15)', background: '#FFFDF7', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Box component='img' src={a.img} alt={a.alt} loading='lazy' sx={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(139,90,43,0.25)' }} />
                <Box>
                  <Typography variant='h6' sx={{ color: '#5B3A29', fontWeight: 'bold' }}>{a.name}</Typography>
                  <Chip label={a.role} size='small' sx={{ bgcolor: 'rgba(139,90,43,0.12)', color: '#5B3A29', fontWeight: 600 }} />
                </Box>
              </Box>
              <Typography component='div' sx={{ color: 'rgba(40,40,60,0.8)', fontSize: '0.92rem', mb: 1.5 }}>
                {a.does.map((d, i) => (
                  <Box component='li' key={i} sx={{ ml: 2, mb: 0.5 }}>{d}</Box>
                ))}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.6)', fontStyle: 'italic' }}>
                🔗 {a.connects}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* ACP capacity — explained with the two pipshell icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box component='img' src='/img/agents/pips-logo.png' alt='PIPS logo' loading='lazy' sx={{ width: 44, height: 44, borderRadius: '12%', objectFit: 'cover' }} />
          <Typography variant='h6' sx={{ color: '#5B3A29', fontWeight: 'bold' }}>
            What They Sell — Live Machine Capacity
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(40,40,60,0.7)', mb: 2, maxWidth: 760 }}>
          Through the Agent Commerce Protocol (ACP), other agents can call these two over the network and pay per real result — settled in USDC on Base. Two ideas carry the whole shop:
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
          {CAPACITY.map((c) => (
            <Paper key={c.title} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(139,90,43,0.15)', background: '#FFFDF7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Box component='img' src={c.icon} alt={c.title} loading='lazy' sx={{ width: 40, height: 40, borderRadius: '25%', objectFit: 'cover' }} />
                <Typography sx={{ fontWeight: 700, color: '#5B3A29' }}>{c.title}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.65)', mt: 0.5 }}>{c.text}</Typography>
            </Paper>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Button variant='contained' href={ACP_URL} target='_blank' rel='noopener noreferrer' sx={{ background: 'linear-gradient(45deg, #7D5A50, #A67C52)', color: '#FFFFFF', textTransform: 'none', fontWeight: 700, '&:hover': { background: 'linear-gradient(45deg, #6C4A3C, #8A623F)' } }}>
            See the Full Catalog on ACP →
          </Button>
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(40,40,60,0.55)' }}>
            Live commands, prices, SLAs, and envelope invariants live on the ACP agent page, not here.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Why NUT makes this different — bridge the singleton position */}
        <Typography variant='h6' sx={{ color: '#5B3A29', fontWeight: 'bold', mb: 2 }}>
          Why NUT Makes This Different
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(139,90,43,0.15)', background: 'linear-gradient(135deg, #FAF3E6 0%, #F5E6C8 100%)', mb: 4 }}>
          <Typography sx={{ color: 'rgba(40,40,60,0.78)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            NUT is not a token you buy and flip. Supply is one — a conserved liquidity that <strong>measures the internal market state</strong> of the whole system: one object split across every pool, curve, and index, the total never changing. Tokens carry state changes; NUT is the state itself.
          </Typography>
          <Typography sx={{ color: 'rgba(40,40,60,0.78)', fontSize: '0.92rem', lineHeight: 1.7, mt: 1.5 }}>
            These agents are <strong>actors inside that state</strong>. They read it, they report it, they earn from it, and they spend what they earn to keep the machine alive. They are not a story about the economy — they are working participants in it. An economy that runs on a single conserved measure gives every agent a unique job: keep the state honest, and the market prices you for it.
          </Typography>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        {/* Designed to survive */}
        <Typography variant='h6' sx={{ color: '#5B3A29', fontWeight: 'bold', mb: 2 }}>
          🧩 Designed to Survive
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {RESILIENCE.map((r) => (
            <Paper key={r.title} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(139,90,43,0.15)', background: '#FFFDF7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Box component='img' src={r.icon} alt={r.title} loading='lazy' sx={{ width: 40, height: 40, borderRadius: '25%', objectFit: 'cover' }} />
                <Typography sx={{ fontWeight: 700, color: '#5B3A29' }}>{r.title}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(40,40,60,0.65)', mt: 0.5 }}>{r.text}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Layout>
  );
}
