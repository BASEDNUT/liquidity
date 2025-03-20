import { Container, Typography, Box } from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Head from "next/head";

export default function FAQ() {
  return (
    <div>
      <Head>
        <title>FAQ | Based Nut</title>
      </Head>
      <Header />
      <Container sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            Q: How often are pools updated?<br />
            A: Every 15 seconds.
          </Typography>
          {/* Add more Q&A as needed */}
        </Box>
      </Container>
      <Footer />
    </div>
  );
}