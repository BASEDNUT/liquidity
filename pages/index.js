// pages/index.js
import { useState, useEffect } from "react";
import { Container, Grid, CircularProgress, Typography } from "@mui/material";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer"; // <-- Import Footer
import FilterTabs from "../components/FilterTabs";
import PoolCard from "../components/PoolCard";
import { fetchPools } from "../utils/fetchPools";

export default function Home() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const loadPools = async () => {
    setLoading(true);
    try {
      const data = await fetchPools();
      setPools(data);
    } catch (error) {
      console.error("Error fetching pools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
    const interval = setInterval(loadPools, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const filteredPools = pools.filter((pool) => {
    if (filter === "All") return true;
    return pool.category.includes(filter);
  });

  return (
    <div>
      <Head>{/* any head content here */}</Head>
      <Header />
      <Container
        sx={{
          mt: 4,
          px: { xs: 2, sm: 4 }, // Adds better padding on small screens
          maxWidth: "lg", // Prevents content from being too wide on larger screens
        }}
      >
        <Typography variant="h4" gutterBottom>
          Liquidity Pools 🌳
        </Typography>
        <FilterTabs filter={filter} setFilter={setFilter} />
        {loading ? (
          <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {filteredPools.map((pool, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PoolCard {...pool} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <Footer /> {/* <-- Place Footer at the very bottom */}
    </div>
  );
}
