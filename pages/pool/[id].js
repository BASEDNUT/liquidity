import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { fetchPools } from '../../utils/fetchPools';
import { Box, Chip, Typography, Button, Grid } from '@mui/material';
import GlossaryTooltip from '../../components/GlossaryTooltip';
import { useMemo } from 'react';

const PoolPage = ({ pool: initialPool }) => {
  const router = useRouter();
  const { id } = router.query;
  const pools = fetchPools();
  const pool = initialPool || pools.find((p) => p.id === id);

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
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>{pool.icon} {pool.name}</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={pool.platform} />
          {Array.isArray(pool.category) ? pool.category.map((c, i) => <Chip key={i} label={c} />) : <Chip label={pool.category} />}
          <Chip label={pool.status} color="primary" icon={<span style={{ width: 0 }} />} />
          <GlossaryTooltip term={pool.status === 'Concentrated' ? 'Concentrated' : 'Volatile'} />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {embed ? (
              <Box sx={{ position: 'relative', width: '100%', pb: { xs: '125%', md: '65%' }, borderRadius: 2, overflow: 'hidden', border: '1px solid #E0D5C1' }}>
                <iframe
                  title={`${pool.name} ${embed.type} embed`}
                  src={embed.src}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  frameBorder="0"
                  allow={embed.type === 'defined' ? 'clipboard-write' : undefined}
                />
              </Box>
            ) : (
              <Box sx={{ height: 260, border: '2px dashed #D1B48C', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Chart placeholder">
                <Typography>Chart coming soon</Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, border: '1px solid #E0D5C1', borderRadius: 2 }}>
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
            <Box sx={{ p: 2, border: '1px solid #E0D5C1', borderRadius: 2 }}>
              <Typography variant="h6">Holders</Typography>
              <Typography>Coming soon</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid #E0D5C1', borderRadius: 2 }}>
              <Typography variant="h6">Transfers</Typography>
              <Typography>Coming soon</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
          <Button variant="contained" href={pool.checkPoolUrl} target="_blank" rel="noopener noreferrer">Trade</Button>
          <Button variant="outlined" href={pool.url} target="_blank" rel="noopener noreferrer">Contract</Button>
          <Button variant="outlined" href={pool.dexscreenerUrl} target="_blank" rel="noopener noreferrer">Explore</Button>
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
