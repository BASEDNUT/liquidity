import { useState, useMemo } from "react";
import { Container, Grid, Typography, Box, Chip } from "@mui/material";
import Head from "next/head";
import Layout from "../components/Layout";
import PoolCard from "../components/PoolCard";
import { getStaticPools } from "../utils/fetchPools";

const STATUS_COLORS = {
  Concentrated: "#8B5A2B",
  Volatile: "#A0522D",
  Bonding: "#6B3D20",
  Experimental: "#B8860B",
  Stable: "#4CAF50",
};

// Pools index — every liquidity venue in the Orchard, one glance.
// Uses the same getStaticPools() data as the home page — nothing hardcoded here.
export default function PoolsPage({ pools }) {
  const [filter, setFilter] = useState("All");

  const categories = useMemo(() => {
    const set = new Set();
    pools.forEach((p) => {
      (Array.isArray(p.category) ? p.category : [p.category]).forEach((c) => set.add(c));
    });
    return ["All", ...Array.from(set).sort()];
  }, [pools]);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? pools
        : pools.filter((p) =>
            (Array.isArray(p.category) ? p.category : [p.category]).includes(filter)
          ),
    [pools, filter]
  );

  return (
    <Layout>
      <Head>
        <title>Pools | BASED NUT</title>
        <meta name="description" content="Every liquidity venue in the BASED NUT Orchard — DEX pairs, Mint Club bonding curves, Balancer baskets, and Sudoswap NFT pools." />
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", color: "#5B3A29" }}>
            💧 Liquidity Pools
          </Typography>
          <Typography sx={{ color: "rgba(93,64,55,0.7)", mt: 0.5 }}>
            Every venue where BASED NUT tokens trade — from DEX pairs to Mint Club bonding curves to the Balancer basket.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setFilter(cat)}
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                color: filter === cat ? "#fff" : STATUS_COLORS[cat] || "#5D4037",
                bgcolor: filter === cat ? "linear-gradient(135deg, #8B4513, #A0522D)" : "transparent",
                boxShadow: filter === cat ? 1 : 0,
                "&:hover": { bgcolor: filter === cat ? "#A0522D" : "rgba(139,69,19,0.08)" },
              }}
            />
          ))}
        </Box>

        <Grid container spacing={3}>
          {filtered.map((pool) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pool.id}>
              <PoolCard {...pool} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ width: "100%", textAlign: "center", mt: 3, mb: 2 }}>
          <Typography variant="caption" sx={{ color: "rgba(93,64,55,0.6)", fontSize: "0.7rem" }}>
            📊 Data sources: <strong>GT</strong> = GeckoTerminal · <strong>DS</strong> = DexScreener · <strong>RPC</strong> = Base RPC · <strong>CG</strong> = CoinGecko
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: { pools: getStaticPools() } };
}
