import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import PoolNav from '../../components/PoolNav';
import { fetchPools, getStaticPools } from '../../utils/fetchPools';
import { Box, Chip, Typography, Button, Grid, Stack, Skeleton, Tooltip } from '@mui/material';
import GlossaryTooltip from '../../components/GlossaryTooltip';
import { useMemo, useState, useEffect } from 'react';
import { fetchTokens } from '../../utils/fetchTokens';

// ── Pool descriptions ──
const POOL_DESCRIPTIONS = {
  'nut-weth-uniswap-v3': 'Primary concentrated liquidity venue for NUT. Uniswap V3 enables capital-efficient positions with custom tick ranges. Deep liquidity for large swaps with minimal slippage.',
  'nut-weth-uniswap-v2': 'Legacy NUT/wETH pair on Uniswap V2. Simple x*y=k AMM. Full-range liquidity — easier to LP but less capital-efficient than V3.',
  'snut-nut-aerodrome': 'Keeper-Arb Reactor pool. SNUT/NUT pair on Aerodrome. Arbitrageurs cycle between this pool and the SNUT/wETH pool to keep NUT price aligned across venues. Aerodrome emissions reward LPs.',
  'pnut-balancer': 'Balancer V2 4-asset index basket (25% cbETH, 25% cbBTC, 25% NUT, 25% SNUT). Mint/redeem BPT to enter/exit the basket. NAV drift from market price creates arbitrage opportunities.',
  'nut-aero-aerodrome': 'NUT/AERO pair on Aerodrome. Provides NUT exposure denominated in AERO. Aerodrome gauge emissions may incentivize liquidity.',
  'nut-cbbtc-aerodrome': 'NUT/cbBTC pair on Aerodrome. Bitcoin-denominated NUT liquidity. Connects the NUT ecosystem to Base\'s wrapped Bitcoin via cbBTC.',
  'snut-weth-uniswap-v2': 'Main spot liquidity for SNUT. SNUT/wETH on Uniswap V2. Primary price discovery venue for SNUT — 1% tax applies on all swaps (cut from 6%, Session 30).',
  'pips-nut-aerodrome-slipstream-cl': 'PIPS/NUT concentrated liquidity on Aerodrome Slipstream CL (1% fee). Gives the Pipshell machine a NUT-denominated venue. Thin but live. Token tax is unregistered here — untaxed today; owner registration would break CL invariant.',
  'pips-usdc-balancer-reclamm': 'PIPS/USDC Balancer V3 reCLAMM. Auto-recentering concentrated liquidity, 1% pool fee. LP build-out in progress: needs ~$120 USDC to match the remaining PIPS side. Token tax is unregistered here — untaxed today.',
  'snut-lp-weth-uniswap-v2': 'Meta-Market pool for SNUT-LP tokens. LPs who provide SNUT/wETH liquidity can trade their LP positions here. Liquidity rights trading venue.',
  'nutino-nut-mintclub': 'Mint Club bonding curve for NUTINO backed by NUT. Mint NUTINO by depositing NUT, burn to withdraw. Bonding curve price = NUT locked ÷ NUTINO supply. Two-venue arb: mint on Mint Club → sell on Uniswap V2 (NUTINO/cbBTC).',
  'nutino-cbbtc-uniswap-v2': 'NUTINO/cbBTC DEX pair on Uniswap V2. Second venue for NUTINO — enables two-venue arbitrage with the Mint Club bonding curve. Bitcoin-denominated.',
  'salt-usdc-aerodrome': 'SALT/USDC pair on Aerodrome. Primary DEX venue for SALT. Enables the two-venue arb loop: mint SALT with NUT on Mint Club → sell for USDC here.',
  'nut-salt-mintclub': 'Mint Club bonding curve for SALT backed by NUT. Mint SALT by depositing NUT, burn to withdraw. Curve price = NUT locked ÷ SALT supply. Significant buy/sell spread is the bonding curve\'s value capture mechanism.',
  'pnuts-nut-mintclub': 'Mint Club NFT bonding curve for P-NUTS (Extra Roasted Trio NFT collection). Backed by NUT. Mint/burn mechanism determines floor price via bonding curve position.',
  'almd-nut-mintclub': 'Mint Club NFT bonding curve for ALMONDS (Golden Salted Swarm NFT collection). Backed by NUT. Bonding curve sets floor price.',
  'salmd-nut-mintclub': 'Mint Club NFT bonding curve for S-ALMONDS (Sky-Seasoned Crunch NFT collection). Backed by NUT. Bonding curve sets floor price.',
  'pnutrmy-nut-mintclub': 'Mint Club NFT bonding curve for PEANUT ARMY NFT collection. Holders received SALT airdrop. Backed by NUT.',
  'spnut-usdc-sudoswap': 'Sudoswap NFT AMM pool for SPNUT NFTs. Buy/sell whole NFTs priced by the Sudoswap bonding curve in USDC — AMM trading instead of fixed-price listings.',
  'pnuts-usdc-sudoswap': 'Sudoswap NFT AMM pool for P-NUTS NFTs. Whole-NFT trading with USDC pricing via bonding curve.',
  'salmd-cbeth-sudoswap': 'Sudoswap NFT AMM pool for S-ALMONDS NFTs priced in cbETH. Whole-NFT trading venue.',
  'almd-cbeth-sudoswap': 'Sudoswap NFT AMM pool for ALMONDS NFTs priced in cbETH. Whole-NFT trading venue.',
};

// ── Format helpers ──
function fmtUsd(val) {
  if (val == null || isNaN(val)) return '—';
  if (val >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
  if (val >= 1e3) return '$' + (val / 1e3).toFixed(2) + 'K';
  return '$' + val.toFixed(4);
}

function fmtPrice(val) {
  if (val == null || isNaN(val)) return '—';
  if (val >= 1) return '$' + val.toFixed(4);
  if (val >= 0.01) return '$' + val.toFixed(6);
  if (val > 0) return '$' + val.toPrecision(4);
  return '—';
}

function fmtPct(val) {
  if (val == null || isNaN(val)) return null;
  const sign = val >= 0 ? '+' : '';
  return sign + val.toFixed(2) + '%';
}

function fmtNum(val) {
  if (val == null || isNaN(val)) return '—';
  if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
  if (val >= 1e3) return (val / 1e3).toFixed(2) + 'K';
  return val.toString();
}

// ── Merge market data from multiple sources ──
function getPoolMarketData(poolId, apiData) {
  if (!apiData?.pools?.[poolId]) return null;
  const p = apiData.pools[poolId];
  // Prefer GeckoTerminal, then DexScreener, then MintClub
  const src = p.geckoTerminal || p.dexScreener || p.mintClub || null;
  if (!src) return null;
  return {
    tvl: src.tvl ?? null,
    volume24h: src.volume24h ?? null,
    price: src.price ?? null,
    priceChange24h: src.priceChange24h ?? null,
    txns24h: src.txns24h ?? null,
    stale: src.stale || false,
    source: p.geckoTerminal ? 'GeckoTerminal' : p.dexScreener ? 'DexScreener' : 'MintClub',
  };
}

const PoolPage = ({ pool: initialPool }) => {
  const router = useRouter();
  const { id } = router.query;
  const pools = getStaticPools();
  const tokenData = fetchTokens();
  const pool = initialPool || pools.find((p) => p.id === id);

  // ── Live market data ──
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!pool?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/market-data');
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setMarketData(json);
        }
      } catch {
        // silent fail — show dash
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pool?.id]);

  const liveData = useMemo(() => {
    if (!marketData || !pool?.id) return null;
    return getPoolMarketData(pool.id, marketData);
  }, [marketData, pool?.id]);

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
    // Issue 1 fix: Use GeckoTerminal token address embed for correct token labeling.
    // Pool embeds show tokens in GeckoTerminal's own base/quote order which may not match
    // our pool name. Token embeds always label correctly.
    const poolIsNFT = (Array.isArray(pool?.category) ? pool.category : [pool?.category]).includes('NFTs') || pool?.category === 'NFTs';
    if (poolIsNFT) return null; // NFTs not charted on DEX aggregators
    // Find first constituent token with an address for the embed
    const firstToken = constituents.find(c => c.token?.address)?.token;
    if (firstToken?.address) {
      const gtUrl = new URL(`https://www.geckoterminal.com/base/tokens/${firstToken.address}`);
      gtUrl.searchParams.set('embed', '1');
      gtUrl.searchParams.set('info', '0');
      gtUrl.searchParams.set('chart', '1');
      gtUrl.searchParams.set('theme', 'dark');
      gtUrl.searchParams.set('chartType', 'candlestick');
      gtUrl.searchParams.set('chartInterval', '1D');
      gtUrl.searchParams.set('interval', '1D');
      return { type: 'geckoterminal', src: gtUrl.toString() };
    }
    // Fallback: try pool-based embed from dexscreenerUrl
    if (!pool?.dexscreenerUrl) return null;
    try {
      const url = new URL(pool.dexscreenerUrl);
      if (url.hostname.includes('dexscreener.com')) {
        const pathSegments = url.pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1] || '';
        if (lastSegment.includes('-')) return null;
        const gtUrl = new URL(`https://www.geckoterminal.com/base/pools/${lastSegment}`);
        gtUrl.searchParams.set('embed', '1');
        gtUrl.searchParams.set('info', '0');
        gtUrl.searchParams.set('chart', '1');
        gtUrl.searchParams.set('theme', 'dark');
        gtUrl.searchParams.set('chartType', 'candlestick');
        gtUrl.searchParams.set('chartInterval', '1D');
        gtUrl.searchParams.set('interval', '1D');
        return { type: 'geckoterminal', src: gtUrl.toString() };
      }
    } catch {
      // no-op
    }
    return null;
  }, [pool?.dexscreenerUrl, pool?.category, constituents]);

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

  const description = POOL_DESCRIPTIONS[pool.id];
  const isNFTPool = (Array.isArray(pool.category) ? pool.category : [pool.category]).includes('NFTs') || pool.category === 'NFTs';
  // Extract contract address from pool.url (basescan link)
  const contractAddr = pool.url?.match(/0x[a-fA-F0-9]{40}/)?.[0] || null;
  const tvlDisplay = liveData?.tvl ?? (pool.tvl ?? null);
  const priceDisplay = liveData?.price ?? null;
  const volDisplay = liveData?.volume24h ?? null;
  const changePct = liveData?.priceChange24h ?? null;
  const txnsDisplay = liveData?.txns24h ?? null;

  return (
    <Layout>
      <Head>
        <title>{pool.name} | Pool Profile</title>
        <meta name="description" content={description || `Profile for ${pool.name} on ${pool.platform}.`} />
      </Head>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <PoolNav />

        <Box sx={{
          mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3,
          background: 'linear-gradient(135deg, #FAF3E6 0%, #E6C9A8 50%, #C8A27A 100%)',
          color: '#3D2B1F', boxShadow: '0 10px 30px rgba(90, 60, 30, 0.25)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="h3">{pool.icon} {pool.name}</Typography>
            {isNFTPool && (
              <Chip label="NFT" sx={{
                bgcolor: '#FFD700', color: '#1a1a1a', fontWeight: 900,
                fontSize: '1rem', height: 32, px: 1.5,
                border: '2px solid #B8860B',
                boxShadow: '0 2px 8px rgba(255,215,0,0.4)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: '0 2px 8px rgba(255,215,0,0.4)' },
                  '50%': { boxShadow: '0 2px 16px rgba(255,215,0,0.7)' },
                },
              }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip sx={{ bgcolor: 'rgba(100,70,40,0.15)', color: '#3D2B1F' }} label={pool.platform} />
            {pool.role && (
              <Chip sx={{ bgcolor: 'rgba(180,60,30,0.18)', color: '#8B3A1A', fontWeight: 'bold' }} label={pool.role} />
            )}
            {Array.isArray(pool.category) ? pool.category.map((c, i) => (
              <Chip key={i} sx={{ bgcolor: 'rgba(100,70,40,0.12)', color: '#3D2B1F' }} label={c} />
            )) : (
              <Chip sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' }} label={pool.category} />
            )}
            <Chip sx={{ bgcolor: 'rgba(100,70,40,0.18)', color: '#3D2B1F' }} label={pool.status} />
            <GlossaryTooltip term={pool.status === 'Concentrated' ? 'Concentrated' : 'Volatile'} />
          </Box>
          {description && (
            <Typography sx={{ mt: 2, fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 800 }}>
              {description}
            </Typography>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
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
              <Box sx={{ height: 260, border: '2px dashed rgba(100,70,40,0.35)', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#5B3A29', gap: 1, p: 2 }}>
                <Typography sx={{ fontSize: '2rem' }}>{isNFTPool ? '🎨' : '📊'}</Typography>
                <Typography>{isNFTPool ? 'NFT Pool — Chart not available' : 'Chart not available for this pool type'}</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(91,58,41,0.6)', textAlign: 'center' }}>
                  {pool.platform === 'Sudoswap' ? 'NFT AMM pools are not indexed by DEX charting services' : pool.platform === 'Balancer' ? 'Balancer compound pools require specialized charting' : 'Try the Explore link below for external charts'}
                </Typography>
                {isNFTPool && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1, justifyContent: 'center' }}>
                    {pool.checkPoolUrl && (
                      <Button href={pool.checkPoolUrl} target="_blank" rel="noopener noreferrer" size="small" sx={{ textTransform: 'none', color: '#8B5A2B', border: '1px solid rgba(139,90,43,0.3)' }}>
                        {pool.platform} ↗
                      </Button>
                    )}
                    {pool.dexscreenerUrl && (
                      <Button href={pool.dexscreenerUrl} target="_blank" rel="noopener noreferrer" size="small" sx={{ textTransform: 'none', color: '#8B5A2B', border: '1px solid rgba(139,90,43,0.3)' }}>
                        OpenSea ↗
                      </Button>
                    )}
                    {contractAddr && (
                      <Button href={pool.url} target="_blank" rel="noopener noreferrer" size="small" sx={{ textTransform: 'none', color: '#8B5A2B', border: '1px solid rgba(139,90,43,0.3)' }}>
                        Basescan ↗
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 2, border: '1px solid rgba(139,90,43,0.18)', borderRadius: 3, boxShadow: '0 4px 12px rgba(139,90,43,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="h6">Pool Stats</Typography>
                {liveData?.source && (
                  <Tooltip title={`Data from ${liveData.source}${liveData.stale ? ' (cached)' : ''}`}>
                    <Chip size="small" sx={{ bgcolor: 'rgba(100,70,40,0.1)', color: '#5B3A29', fontSize: '0.7rem' }} label={liveData.source} />
                  </Tooltip>
                )}
              </Box>
              <Stack spacing={1.5}>
                {/* Show contract address prominently for NFT/empty pools */}
                {isNFTPool && contractAddr && (
                  <Box sx={{ pb: 1.5, borderBottom: '1px solid rgba(139,90,43,0.1)' }}>
                    <Typography component="span" sx={{ fontSize: '0.85rem', color: 'rgba(91,58,41,0.6)', display: 'block', mb: 0.5 }}>Contract</Typography>
                    <Box component="a" href={pool.url} target="_blank" rel="noopener noreferrer" sx={{
                      fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 600, color: '#8B5A2B',
                      textDecoration: 'none', '&:hover': { textDecoration: 'underline' }
                    }}>
                      {contractAddr.slice(0,8)}...{contractAddr.slice(-6)}
                    </Box>
                  </Box>
                )}
                <Box>
                  <Typography component="span" sx={{ fontSize: '0.85rem', color: 'rgba(91,58,41,0.6)' }}>TVL</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {loading ? <Skeleton width={80} /> : (tvlDisplay != null ? fmtUsd(tvlDisplay) : '—')}
                  </Typography>
                </Box>
                <Box>
                  <Typography component="span" sx={{ fontSize: '0.85rem', color: 'rgba(91,58,41,0.6)' }}>Price</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {loading ? <Skeleton width={80} /> : (priceDisplay != null ? fmtPrice(priceDisplay) : '—')}
                    {changePct != null && !loading && (
                      <Chip size="small" sx={{
                        bgcolor: changePct >= 0 ? 'rgba(34,139,34,0.15)' : 'rgba(178,34,34,0.15)',
                        color: changePct >= 0 ? '#2a7d2a' : '#b22222',
                        fontSize: '0.75rem', fontWeight: 700
                      }} label={fmtPct(changePct)} />
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography component="span" sx={{ fontSize: '0.85rem', color: 'rgba(91,58,41,0.6)' }}>Volume (24h)</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {loading ? <Skeleton width={80} /> : (volDisplay != null ? fmtUsd(volDisplay) : '—')}
                  </Typography>
                </Box>
                {txnsDisplay != null && !loading && (
                  <Box>
                    <Typography component="span" sx={{ fontSize: '0.85rem', color: 'rgba(91,58,41,0.6)' }}>Transactions (24h)</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{fmtNum(txnsDisplay)}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography component="span" sx={{ fontSize: '0.85rem', color: 'rgba(91,58,41,0.6)' }}>Flavor</Typography>
                  <Typography sx={{ fontStyle: 'italic', fontSize: '0.9rem' }}>{pool.flavor}</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, border: '1px solid rgba(139,90,43,0.18)', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>LP Token Info</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: 'rgba(91,58,41,0.7)' }}>
                LP tokens represent proportional ownership of the pool\'s liquidity. Holders earn trading fees proportional to their share.
              </Typography>
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip size="small" sx={{ bgcolor: 'rgba(100,70,40,0.08)', color: '#5B3A29' }} label={`Platform: ${pool.platform}`} />
                <Chip size="small" sx={{ bgcolor: 'rgba(100,70,40,0.08)', color: '#5B3A29' }} label={`Status: ${pool.status}`} />
              </Box>
              <Typography sx={{ mt: 1.5, fontSize: '0.85rem', color: 'rgba(91,58,41,0.5)' }}>
                Holder counts and transfer history require on-chain indexing. Check Basescan for detailed data.
              </Typography>
              <Button href={pool.url} target="_blank" rel="noopener noreferrer" size="small" sx={{ mt: 1, textTransform: 'none', color: '#7D5A50' }}>
                View on Basescan →
              </Button>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, border: '1px solid rgba(139,90,43,0.18)', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Arbitrage & Role</Typography>
              {pool.role ? (
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(91,58,41,0.7)' }}>
                  <strong>Role:</strong> {pool.role}
                </Typography>
              ) : (
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(91,58,41,0.7)' }}>
                  Standard liquidity venue providing price discovery and swap functionality for {pool.name}.
                </Typography>
              )}
              {description && (
                <Typography sx={{ mt: 1, fontSize: '0.85rem', color: 'rgba(91,58,41,0.6)' }}>
                  {description}
                </Typography>
              )}
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
  const pools = getStaticPools();
  const paths = pools.map((p) => ({ params: { id: p.id } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const pools = await fetchPools();
  const pool = pools.find((p) => p.id === params.id) || null;
  if (!pool) return { notFound: true };
  return { props: { pool } };
}
