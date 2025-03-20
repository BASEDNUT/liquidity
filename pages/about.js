import { Container, Typography, Box } from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Head from "next/head";

export default function About() {
  return (
    <div>
      <Head>
        <title>About | Based Nut</title>
      </Head>
      <Header />
      <Container sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          About Based Nut
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            We are dedicated to providing the best liquidity pool insights and market data.
          </Typography>
        </Box>
      </Container>
      <Footer />
    </div>
  );
}