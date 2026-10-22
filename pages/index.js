// Unified Home with Pools/Tokens toggle and shared fetch
import { useState, useMemo, useEffect } from "react";
import { Container, Grid, Typography, Box } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import FallingNutsOverlay from "../components/FallingNutsOverlay";
import FilterTabs from "../components/FilterTabs";
import FilterTokens from "../components/FilterTokens";
import SearchBar from "../components/SearchBar";
import FGTokenCard from "../components/pools/TokenSpecimenCard";
import OrchardMarketing from "../components/OrchardMarketing";
import DataToggle from "../components/DataToggle";
import { fetchPools } from "../utils/fetchPools";
import { fetchTokens } from "../utils/fetchTokens";
import OrchardBoardBanner from "../components/OrchardBoardBanner";
import FGPoolCard from "../components/pools/PoolCard";
import fgStyles from "../components/pools/Repair02.module.css";
import { normalizePool } from "../lib/pools/catalog";

export default function Home({ initialPools, initialTokens }) {
  const [view, setView] = useState("tokens");
  const [poolFilter, setPoolFilter] = useState("All");
  const [tokenFilter, setTokenFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveTokens, setLiveTokens] = useState(null);
  const [marketData, setMarketData] = useState(null);

  const pools = initialPools || [];
  // Field Guide view-model: normalized catalog shape (hrefs/kind/assets) merged with
  // raw record fields (site id for marketData lookup, category for filters, icon).
  const fgPools = useMemo(() => (initialPools || []).map((p) => ({
    ...normalizePool(p),
    id: p.id,
    category: p.category,
    icon: p.icon,
    role: p.role,
  })), [initialPools]);
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
    let result = fgPools;
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
  }, [fgPools, poolFilter, searchQuery]);

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
        <Box sx={{ width: '100%', mt: 2, mb: 1, px: { xs: 1, sm: 0 } }}>
          <OrchardBoardBanner />
        </Box>
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
          <div className={`${fgStyles.fgGrid} ${fgStyles.theme}`} style={{ width: '100%', marginTop: 16 }}>
            {filteredPools.map((pool) => (
              <FGPoolCard key={pool.id} pool={pool} index={filteredPools.indexOf(pool)} marketData={marketData ? marketData.pools[pool.id] : undefined} />
            ))}
          </div>
        ) : (
          <div className={`${fgStyles.fgGrid} ${fgStyles.theme}`} style={{ width: '100%', marginTop: 16 }}>
            {filteredTokens.map((token, i) => (
              <FGTokenCard key={token.id} token={token} index={i} />
            ))}
          </div>
        )}

      </Container>
      <OrchardMarketing tokens={filteredTokens} pools={filteredPools} marketData={marketData} />
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
      { ...t.trunk, id: (t.trunk?.name || "trunk").toLowerCase(), category: "Root" },
      ...(t.branches || []).map((item, i) => ({ ...item, id: (item.name || `branch-${i}`).toLowerCase(), category: "Ecosystem" })),
      ...(t.nestedTokens || []).map((item, i) => ({ ...item, id: (item.name || `nested-${i}`).toLowerCase(), category: "Nested" })),
      ...(t.soil || []).map((item, i) => ({ ...item, id: (item.name || `soil-${i}`).toLowerCase(), category: "External" })),
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
