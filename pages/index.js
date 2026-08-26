// Unified Home with Pools/Tokens toggle and shared fetch
import { useState, useMemo, useEffect } from "react";
import { Container, Grid, Typography, Box } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import FallingNutsOverlay from "../components/FallingNutsOverlay";
import FilterTabs from "../components/FilterTabs";
import FilterTokens from "../components/FilterTokens";
import SearchBar from "../components/SearchBar";
import PoolCard from "../components/PoolCard";
import TokenCard from "../components/TokenCard";
import OrchardBoard from "../components/OrchardBoard";
import DataToggle from "../components/DataToggle";
import { fetchPools } from "../utils/fetchPools";
import { fetchTokens } from "../utils/fetchTokens";
import Image from "next/image";
import OrchardTVLNotice from "../components/OrchardTVLNotice";

export default function Home({ initialPools, initialTokens }) {
  const [view, setView] = useState("tokens");
  const [poolFilter, setPoolFilter] = useState("All");
  const [tokenFilter, setTokenFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveTokens, setLiveTokens] = useState(null);
  const [marketData, setMarketData] = useState(null);

  const pools = initialPools || [];
  const tokens = liveTokens || initialTokens || [];

  // Client-side hydration: fetch live market data after initial render
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/token-data');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data || !data.tokens) return;

        // Merge market data into the static token list
        const merged = (initialTokens || []).map((t) => {
          const md = data.tokens[t.name];
          if (!md) return t;
          return { ...t, marketData: md };
        });
        setLiveTokens(merged);
      } catch {
        // Silent fail — static data is already rendered
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Client-side hydration: fetch live pool market data for the table view
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/market-data');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setMarketData(data);
      } catch {
        // Silent fail - static data is already rendered
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredPools = useMemo(() => {
    let result = pools;
    if (poolFilter !== "All") {
      result = result.filter((pool) => Array.isArray(pool.category) ? pool.category.includes(poolFilter) : pool.category === poolFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((pool) => {
        const name = (pool.name || "").toLowerCase();
        const platform = (pool.platform || "").toLowerCase();
        const flavor = (pool.flavor || "").toLowerCase();
        const id = (pool.id || "").toLowerCase();
        return name.includes(q) || platform.includes(q) || flavor.includes(q) || id.includes(q);
      });
    }
    return result;
  }, [pools, poolFilter, searchQuery]);

  const filteredTokens = useMemo(() => {
    let result = tokens;
    if (tokenFilter !== "All") {
      result = result.filter((t) => t.category === tokenFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const name = (t.name || "").toLowerCase();
        const role = (t.role || "").toLowerCase();
        const category = (t.category || "").toLowerCase();
        const tags = (t.tags || []).join(" ").toLowerCase();
        return name.includes(q) || role.includes(q) || category.includes(q) || tags.includes(q);
      });
    }
    return result;
  }, [tokens, tokenFilter, searchQuery]);

  return (
    <Layout>
      <FallingNutsOverlay active density="low" />
      {(() => {
        // Dynamic titles based on current view
        const headingMap = { pools: 'Explore Nut Trees', tokens: 'Explore Nuts' };
        const dynamicHeading = headingMap[view] || 'Explore Nutty Assets';
        return (
          <Head>
            <title>{`${dynamicHeading} | BASED NUT`}</title>
            <meta
              name="description"
              content="BASED NUT — an experimental memefi project. Browse tokens, liquidity pools, and arbitrage pathways across the orchard."
            />
          </Head>
        );
      })()}
      <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, px: { xs: 2, sm: 4 }, maxWidth: 'lg' }}>
        <Box sx={{ width: '100%', textAlign: 'center', mb: 0 }}>
          <Image src="/img/hero-logo.png" alt="Based Nut's - The Orchard" width={800} height={600} priority style={{ width: '100%', height: 'auto' }} />
        </Box>
        {process.env.NEXT_PUBLIC_FEATURE_ORCHARD_SIGN_ENABLED !== 'false' && (
          <OrchardTVLNotice />
        )}
        {(() => {
          const headingMap = { pools: 'Explore Nut Trees', tokens: 'Explore Nuts' };
          const dynamicHeading = headingMap[view] || 'Explore Nutty Assets';
          return (
            <Typography variant="h4" gutterBottom sx={{ color: '#5B3A29', textAlign: 'center' }}>
              {dynamicHeading}
            </Typography>
          );
        })()}

        <Box sx={{ width: '100%', mb: 2, mt: 1 }}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={view === 'pools' ? "Search pools, platforms, flavors..." : "Search tokens, roles, categories..."} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            rowGap: 1,
            mb: 3,
          }}
        >
          <DataToggle value={view} onChange={setView} />
          {view === 'pools' ? (
            <FilterTabs filter={poolFilter} setFilter={setPoolFilter} pools={pools} />
          ) : (
            <FilterTokens activeFilter={tokenFilter} onFilterChange={setTokenFilter} />
          )}
        </Box>

        {view === 'pools' ? (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {filteredPools.map((pool) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pool.id}>
                  <PoolCard {...pool} />
                </Grid>
              ))}
            </Grid>

          </>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {filteredTokens.map((token) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={token.id}>
                  <TokenCard token={token} />
                </Grid>
              ))}
            </Grid>

          </>
        )}

        <Box sx={{ width: '100%', mt: 6 }}>
          <Typography variant="h6" sx={{ color: '#5B3A29', mb: 2, fontWeight: 700 }}>
            📋 All NUTs — live board
          </Typography>
          <OrchardBoard tokens={filteredTokens} pools={filteredPools} marketData={marketData} />
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#7D5A50', mb: 1 }}>
              Have your own token? Root it into the Orchard.
            </Typography>
            <Typography
              component="a"
              href="/pair-your-token"
              sx={{ color: '#8B4513', fontWeight: 700, textDecoration: 'underline', '&:hover': { color: '#A0522D' } }}
            >
              🔗 Pair your token with NUT →
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', textAlign: 'center', mt: 3, mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(93,64,55,0.6)', fontSize: '0.7rem' }}>
            📊 Data sources: <strong>GT</strong> = GeckoTerminal · <strong>DS</strong> = DexScreener · <strong>RPC</strong> = Base RPC · <strong>CG</strong> = CoinGecko
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}


export async function getStaticProps() {
  try {
    // Use static data only — no external API calls during build
    // Live market data hydrates client-side via useEffect → /api/token-data
    const p = fetchPools();
    const t = fetchTokens();

    const flatTokens = [
      { ...t.trunk, id: (t.trunk?.name || "trunk").toLowerCase(), category: "Trunk" },
      ...(t.branches || []).map((item, i) => ({ ...item, id: (item.name || `branch-${i}`).toLowerCase(), category: "Branch" })),
      ...(t.nestedTokens || []).map((item, i) => ({ ...item, id: (item.name || `nested-${i}`).toLowerCase(), category: "Nested" })),
      ...(t.soil || []).map((item, i) => ({ ...item, id: (item.name || `soil-${i}`).toLowerCase(), category: "Soil" })),
    ];

    const serializedPools = JSON.parse(JSON.stringify(p));
    const serializedTokens = JSON.parse(JSON.stringify(flatTokens));

    return {
      props: {
        initialPools: serializedPools,
        initialTokens: serializedTokens,
      },
      revalidate: 300, // ISR — regenerate page every 5 minutes
    };
  } catch (e) {
    console.error("Static props build failed:", e);
    return {
      props: {
        initialPools: [],
        initialTokens: [],
      },
      revalidate: 300,
    };
  }
}
