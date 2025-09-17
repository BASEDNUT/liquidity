// Unified Home with Pools/Tokens toggle and shared fetch
import { useState, useEffect, useMemo } from "react";
import { Container, Grid, CircularProgress, Typography, Box } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import FallingNutsOverlay from "../components/FallingNutsOverlay";
import FilterTabs from "../components/FilterTabs";
import FilterTokens from "../components/FilterTokens";
import PoolCard from "../components/PoolCard";
import TokenCard from "../components/TokenCard";
import DataToggle from "../components/DataToggle";
import { fetchPools } from "../utils/fetchPools";
import { fetchTokens } from "../utils/fetchTokens";
import Image from "next/image";
import OrchardTVLNotice from "../components/OrchardTVLNotice";

export default function Home() {
  const [pools, setPools] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("pools");
  const [poolFilter, setPoolFilter] = useState("All");
  const [tokenFilter, setTokenFilter] = useState("All");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [p, t] = await Promise.all([
          Promise.resolve(fetchPools()),
          Promise.resolve(fetchTokens()),
        ]);

        if (!active) return;
        setPools(p);
        // Flatten tokens similar to tokens page
        const flatTokens = [
          { ...t.trunk, id: (t.trunk?.name || "trunk").toLowerCase(), category: "Trunk" },
          ...(t.branches || []).map((item, i) => ({ ...item, id: (item.name || `branch-${i}`).toLowerCase(), category: "Branch" })),
          ...(t.nestedTokens || []).map((item, i) => ({ ...item, id: (item.name || `nested-${i}`).toLowerCase(), category: "Nested" })),
          ...(t.soil || []).map((item, i) => ({ ...item, id: (item.name || `soil-${i}`).toLowerCase(), category: "Soil" })),
        ];
        setTokens(flatTokens);
      } catch (e) {
        console.error("Error loading data", e);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const filteredPools = useMemo(() => {
    if (poolFilter === "All") return pools;
    return pools.filter((pool) => Array.isArray(pool.category) ? pool.category.includes(poolFilter) : pool.category === poolFilter);
  }, [pools, poolFilter]);

  const filteredTokens = useMemo(() => {
    if (tokenFilter === "All") return tokens;
    return tokens.filter((t) => t.category === tokenFilter);
  }, [tokens, tokenFilter]);

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
              content="Browse nutty assets across the BASED NUT orchard — liquidity pools and tokens in one place."
            />
          </Head>
        );
      })()}
      <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, px: { xs: 2, sm: 4 }, maxWidth: 'lg' }}>
        <Box sx={{ width: '100%', textAlign: 'center', mb: 0 }}>
          <Image src="/img/based-nuts-hero.png" alt="Based Nut's - The Orchard" layout="responsive" width={800} height={600} priority />
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

        {loading ? (
          <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <CircularProgress />
          </Grid>
        ) : view === 'pools' ? (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {filteredPools.map((pool) => (
              <Grid item xs={12} sm={6} md={4} key={pool.id}>
                <PoolCard {...pool} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {filteredTokens.map((token) => (
              <Grid item xs={12} sm={6} md={4} key={token.id}>
                <TokenCard token={token} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
}