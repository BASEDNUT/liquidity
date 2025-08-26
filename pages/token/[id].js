import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { fetchTokens } from '../../utils/fetchTokens';
import { fetchPools } from '../../utils/fetchPools';
import { useMemo } from 'react';
import { Box, Typography, Button, Grid, Chip, Stack, Divider } from '@mui/material';
import GlossaryTooltip from '../../components/GlossaryTooltip';

export default function TokenProfile({ token: initialToken }) {
  const router = useRouter();
  const { id } = router.query;
  const data = fetchTokens();
  const pools = fetchPools();

  const tokens = useMemo(() => {
    if (!data) return [];
    const list = [
      { ...data.trunk, id: (data.trunk?.name || 'trunk').toLowerCase(), category: 'Trunk' },
      ...(data.branches || []).map((t, i) => ({ ...t, id: (t.name || `branch-${i}`).toLowerCase(), category: 'Branch' })),
      ...(data.nestedTokens || []).map((t, i) => ({ ...t, id: (t.name || `nested-${i}`).toLowerCase(), category: 'Nested' })),
      ...(data.soil || []).map((t, i) => ({ ...t, id: (t.name || `soil-${i}`).toLowerCase(), category: 'Soil' })),
    ];
    return list;
  }, [data]);

  const token = initialToken || tokens.find((t) => t.id === id);

  // Try to find a primary market/pool for this token to power a chart embed
  const primaryPool = useMemo(() => {
    if (!token) return null;
    const name = String(token.name || '').toUpperCase();
    // exclude NFT-only pools from consideration
    const marketPools = (pools || []).filter((p) => p && p.dexscreenerUrl && p.category && !(
      (Array.isArray(p.category) ? p.category : [p.category]).includes('NFTs')
    ));
    // Prefer pools that include the token name in their pool name
    const directMatches = marketPools.filter((p) => String(p.name || '').toUpperCase().includes(name));
    // Tie-breaker preferences: prefer Uniswap V3 > Uniswap V2 > Aerodrome > others
    const rank = (platform = '') => {
      const u = platform.toUpperCase();
      if (u.includes('UNISWAP V3')) return 0;
      if (u.includes('UNISWAP V2')) return 1;
      if (u.includes('AERODROME')) return 2;
      return 3;
    };
  const pick = (list) => list.slice().sort((a, b) => rank(a.platform) - rank(b.platform))[0] || null;
  // Only embed when we have a direct market for this token
  return directMatches.length ? pick(directMatches) : null;
  }, [token, pools]);

  const embed = useMemo(() => {
    const urlStr = primaryPool?.dexscreenerUrl;
    if (!urlStr) return null;
    try {
      const url = new URL(urlStr);
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
        const cleanPath = url.pathname.endsWith('/embed')
          ? url.pathname
          : `${url.pathname.replace(/\/$/, '')}/embed`;
        url.pathname = cleanPath;
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
      // ignore
    }
    return null;
  }, [primaryPool?.dexscreenerUrl]);

  if (!token) {
    return (
      <Layout>
        <Box sx={{ p: 4 }}>
          <Typography variant="h4">Token not found</Typography>
          <Button sx={{ mt: 2 }} onClick={() => router.push('/')}>Back to Home</Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{token.name} | Token Profile</title>
        <meta name="description" content={`Profile for ${token.name}.`} />
      </Head>
      <Box sx={{ p: 3 }}>
        {/* Hero */}
        <Typography variant="h3" sx={{ mb: 1, color: '#5B3A29' }}>
          {token.icon} {token.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={token.category} />
          {token.address && <Chip label={`${token.address.slice(0,6)}…${token.address.slice(-4)}`} />}
        </Box>
        <Typography sx={{ mb: 1 }}>{token.role}</Typography>
        {token.utility && (
          <Typography sx={{ mb: 3, color: 'rgba(91,58,41,0.9)' }}>{token.utility}</Typography>
        )}

        {/* Chart + Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {embed ? (
              <Box sx={{ position: 'relative', width: '100%', pb: { xs: '125%', md: '65%' }, borderRadius: 2, overflow: 'hidden', border: '1px solid #E0D5C1' }}>
                <iframe
                  title={`${token.name} ${embed.type} embed`}
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
              <Typography>Price: TBD</Typography>
              <Typography>Volume (24h): TBD</Typography>
              <Typography>
                Liquidity: TBD
                <GlossaryTooltip term="Liquidity" />
              </Typography>
              <Typography>Holders: TBD</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Actions */}
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Mint</Typography>
            {token.mintUrl ? (
              <Button variant="contained" color="primary" href={token.mintUrl} target="_blank" rel="noopener noreferrer">Mint {token.name}</Button>
            ) : (
              <Typography variant="body2" color="text.secondary">No minting available.</Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Trade</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(token.tradeLinks || token.nftTradeLinks || []).map((l, i) => (
                <Button key={i} variant="outlined" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</Button>
              ))}
              {token.link && (
                <Button variant="text" href={token.link} target="_blank" rel="noopener noreferrer">Contract</Button>
              )}
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Arbitrage pathways
              <GlossaryTooltip term="Arbitrage" />
            </Typography>
            {token.arb && token.arb.length ? (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {token.arb.map((a, i) => (
                  <Button key={i} size="small" variant="outlined" href={a.url} target="_blank" rel="noopener noreferrer">{a.route}</Button>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No suggested routes yet.</Typography>
            )}
          </Box>
        </Stack>
      </Box>
    </Layout>
  );
}

export async function getStaticPaths() {
  const data = fetchTokens();
  const tokens = [
    { ...data.trunk, id: (data.trunk?.name || 'trunk').toLowerCase() },
    ...(data.branches || []).map((t, i) => ({ ...t, id: (t.name || `branch-${i}`).toLowerCase() })),
    ...(data.nestedTokens || []).map((t, i) => ({ ...t, id: (t.name || `nested-${i}`).toLowerCase() })),
    ...(data.soil || []).map((t, i) => ({ ...t, id: (t.name || `soil-${i}`).toLowerCase() })),
  ];
  const paths = tokens.map((t) => ({ params: { id: t.id } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const data = fetchTokens();
  const tokens = [
    { ...data.trunk, id: (data.trunk?.name || 'trunk').toLowerCase(), category: 'Trunk' },
    ...(data.branches || []).map((t, i) => ({ ...t, id: (t.name || `branch-${i}`).toLowerCase(), category: 'Branch' })),
    ...(data.nestedTokens || []).map((t, i) => ({ ...t, id: (t.name || `nested-${i}`).toLowerCase(), category: 'Nested' })),
    ...(data.soil || []).map((t, i) => ({ ...t, id: (t.name || `soil-${i}`).toLowerCase(), category: 'Soil' })),
  ];
  const token = tokens.find((t) => t.id === params.id);
  if (!token) {
    return { notFound: true };
  }
  return { props: { token } };
}
