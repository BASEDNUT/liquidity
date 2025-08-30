import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { fetchPools } from '../../utils/fetchPools';
import { Box, Chip, Typography, Button, Grid, Stack } from '@mui/material';
import GlossaryTooltip from '../../components/GlossaryTooltip';
import { useMemo } from 'react';
import { fetchTokens } from '../../utils/fetchTokens';

const PoolPage = ({ pool: initialPool }) => {
  const router = useRouter();
  const { id } = router.query;
  const pools = fetchPools();
  const tokenData = fetchTokens();
  const pool = initialPool || pools.find((p) => p.id === id);
  const tokenList = useMemo(() => {
    if (!tokenData) return [];
    return [
      { ...tokenData.trunk, id: (tokenData.trunk?.name || 'trunk').toLowerCase() },
      ...(tokenData.branches || []).map((t, i) => ({ ...t, id: (t.name || `branch-${i}`).toLowerCase() })),
      ...(tokenData.nestedTokens || []).map((t, i) => ({ ...t, id: (t.name || `nested-${i}`).toLowerCase() })),
      ...(tokenData.soil || []).map((t, i) => ({ ...t, id: (t.name || `soil-${i}`).toLowerCase() })),
    ];
  }, [tokenData]);

  const constituents = useMemo(() => {
    if (!initialPool && !pool) return [];
    const parts = String((initialPool || pool)?.name || '').split('/').map(s => s.trim());
    return parts.map((nm) => ({
      name: nm,
      token: tokenList.find((t) => (t.name || '').toLowerCase() === nm.toLowerCase()) || null,
    }));
  }, [initialPool, pool, tokenList]);

  const embed = useMemo(() => {
    if (!pool?.dexscreenerUrl) return null;
    try {
      const url = new URL(pool.dexscreenerUrl);
      if (url.hostname.includes('dexscreener.com')) {
        const params = {
          embed: '1',
          loadChartSettings: '0',
          trades: '0',
          tabs: '0',
          info: '0',
          chartLeftToolbar: '0',
          chartDefaultOnMobile: '1',
          chartTheme: 'dark',
          theme: 'dark',
          chartStyle: '1',
          chartType: 'usd',
          interval: '1D',
        };
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        return { type: 'dexscreener', src: url.toString() };
      }
      if (url.hostname.includes('defined.fi')) {
        // Ensure "/embed" path and set sane defaults
        const cleanPath = url.pathname.endsWith('/embed')
          ? url.pathname
          : `${url.pathname.replace(/\/$/, '')}/embed`;
        url.pathname = cleanPath;
        // Reset query to avoid duplications
        url.search = '';
        const params = {
          quoteToken: 'token0',
          hideTxTable: '1',
          hideSidebar: '1',
          hideChart: '0',
          hideChartEmptyBars: '1',
          chartSmoothing: '0',
          embedColorMode: 'DEFAULT',
        };
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        return { type: 'defined', src: url.toString() };
      }
    } catch (e) {
      // no-op, fall through to placeholder
    }
    return null;
  }, [pool?.dexscreenerUrl]);

  if (!pool) {
    return (
      <Layout>
        <Box sx={{ p: 4 }}>
          <Typography variant="h4">Pool not found</Typography>
          <Button sx={{ mt: 2 }} onClick={() => router.push('/')}>Back to Home</Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{pool.name} | Pool Profile</title>
        <meta name="description" content={`Profile for ${pool.name} on ${pool.platform}.`} />
      </Head>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{
          mb: 3,
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #FAF3E6 0%, #E6C9A8 50%, #C8A27A 100%)',
          color: '#3D2B1F',
          boxShadow: '0 10px 30px rgba(90, 60, 30, 0.25)'
        }}>
          <Typography variant="h3" sx={{ mb: 1 }}>{pool.icon} {pool.name}</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip sx={{ bgcolor: 'rgba(100,70,40,0.15)', color: '#3D2B1F' }} label={pool.platform} />
            {Array.isArray(pool.category) ? pool.category.map((c, i) => (
              <Chip key={i} sx={{ bgcolor: 'rgba(100,70,40,0.12)', color: '#3D2B1F' }} label={c} />
            )) : (
              <Chip sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} label={pool.category} />
            )}
              <Chip sx={{ bgcolor: 'rgba(100,70,40,0.18)', color: '#3D2B1F' }} label={pool.status} />
            <GlossaryTooltip term={pool.status === 'Concentrated' ? 'Concentrated' : 'Volatile'} />
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {embed ? (
              <Box sx={{ position: 'relative', width: '100%', pb: { xs: '125%', md: '65%' }, borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(100,70,40,0.25)', boxShadow: '0 6px 18px rgba(90,60,30,0.15)' }}>
                <iframe
                  title={`${pool.name} ${embed.type} embed`}
                  src={embed.src}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  frameBorder="0"
                  allow={embed.type === 'defined' ? 'clipboard-write' : undefined}
                />
              </Box>
            ) : (
              <Box sx={{ height: 260, border: '2px dashed rgba(100,70,40,0.35)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B3A29' }} aria-label="Chart placeholder">
                <Typography>Chart coming soon</Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, border: '1px solid rgba(124,58,237,0.25)', borderRadius: 3, boxShadow: '0 4px 12px rgba(6,182,212,0.08)' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Stats</Typography>
              <Typography>TVL: {pool.tvl}</Typography>
              <Typography>Price: TBD</Typography>
              <Typography>Volume (24h): TBD</Typography>
              <Typography>
                Liquidity: TBD
                <GlossaryTooltip term="Liquidity" />
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid rgba(124,58,237,0.25)', borderRadius: 3 }}>
              <Typography variant="h6">Holders</Typography>
              <Typography>Coming soon</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid rgba(124,58,237,0.25)', borderRadius: 3 }}>
              <Typography variant="h6">Transfers</Typography>
              <Typography>Coming soon</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1.25, mt: 3, flexWrap: 'wrap' }}>
          <Button href={pool.checkPoolUrl} target="_blank" rel="noopener noreferrer"
            sx={{
              px: 2.5, py: 1.25, borderRadius: 2, color: '#fff', textTransform: 'none', fontWeight: 700,
              backgroundImage: 'linear-gradient(90deg, #A67C52, #7D5A50)', boxShadow: '0 8px 20px rgba(93,58,41,0.25)', '&:hover': { filter: 'brightness(1.05)' }
            }}
          >
            Trade
          </Button>
          <Button href={pool.url} target="_blank" rel="noopener noreferrer"
            sx={{ px: 2, py: 1, borderRadius: 999, color: '#5B3A29', textTransform: 'none', border: '1px solid rgba(100,70,40,0.25)', backgroundColor: 'rgba(100,70,40,0.05)', '&:hover': { backgroundColor: 'rgba(100,70,40,0.1)' } }}
          >
            Contract
          </Button>
          <Button href={pool.dexscreenerUrl} target="_blank" rel="noopener noreferrer"
            sx={{ px: 2, py: 1, borderRadius: 999, color: '#5B3A29', textTransform: 'none', border: '1px solid rgba(100,70,40,0.25)', backgroundColor: 'rgba(100,70,40,0.05)', '&:hover': { backgroundColor: 'rgba(100,70,40,0.1)' } }}
          >
            Explore
          </Button>
        </Box>

        {/* Constituents */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Constituent tokens</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {constituents.map(({ name, token }) => (
              <Button key={name} href={token ? `/token/${token.id}` : undefined} target={token ? undefined : '_blank'}
                sx={{ textTransform: 'none', border: '1px solid rgba(100,70,40,0.25)' }}
              >
                {name}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>
    </Layout>
  );
};

export default PoolPage;

export async function getStaticPaths() {
  const pools = fetchPools();
  const paths = pools.map((p) => ({ params: { id: p.id } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const pools = fetchPools();
  const pool = pools.find((p) => p.id === params.id) || null;
  if (!pool) return { notFound: true };
  return { props: { pool } };
}
