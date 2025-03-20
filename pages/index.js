// pages/index.js
import { useState, useEffect } from "react";
import { Container, Grid, CircularProgress, Typography, Box } from "@mui/material";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FilterTabs from "../components/FilterTabs";
import PoolCard from "../components/PoolCard";
import { fetchPools } from "../utils/fetchPools";
import Link from 'next/link';
import Image from "next/image"; // <-- new import

export default function Tree() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // Updated to "All"

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
    // If the filter is set to "All", return all pools.
    if (filter === "All") return true;
    // Assuming "Tree" is another filter you might have in addition to "All"
    return pool.category.includes(filter);
  });

  return (
    <div>
      <Head>{/* any head content here */}</Head>
      <Header />
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 4,
          px: { xs: 2, sm: 4 }, // Adds better padding on small screens
          maxWidth: "lg", // Prevents content from being too wide on larger screens
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            textAlign: 'center', 
            mb: 3 
          }}
        >
          {/* Updated hero image to use responsive layout for natural rendering */}
          <Image 
            src="/img/based-nuts-hero.png" 
            alt="Based Nut's - The Orchard" 
            layout="responsive" 
            width={800}  
            height={600} 
            priority={true} 
          />
        </Box>
        <Typography variant="h4" gutterBottom>
          Liquidity Pools 🌳
        </Typography>
        <FilterTabs filter={filter} setFilter={setFilter} pools={pools} />
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