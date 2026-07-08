import Head from "next/head";
import Layout from "../components/Layout";
import { Box, Button } from "@mui/material";
import Link from "next/link";
import Image from "next/image";

export default function RateLimited() {
  return (
    <Layout>
      <Head>
        <title>429 - Too Many Requests | BASED NUT</title>
        <meta name="description" content="Slow down, squirrel. BASED NUT — an experimental memefi project." />
      </Head>
      <Box sx={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        flex: 1, textAlign: "center", pt: 3, pb: 2,
        background: "#F5E6D3", borderRadius: 2, my: 1, mx: "auto", maxWidth: "95vw"
      }}>
        <Box sx={{ mb: 2, maxWidth: { xs: "90vw", md: "85vw" } }}>
          <Image
            src="/img/errors/peanut-429-1.png"
            alt="Peanut 429 character"
            width={1672}
            height={941}
            priority
            sizes="(max-width: 600px) 90vw, 85vw"
            style={{ width: "100%", height: "auto", maxHeight: "70vh" }}
          />
        </Box>
        <Link href="/" passHref legacyBehavior>
          <Button variant="contained" sx={{ background: "linear-gradient(135deg, #7D5A50, #A67C52)", color: "#FFF7EA", fontWeight: 600, borderRadius: 2, px: 3, py: 1.2, "&:hover": { background: "linear-gradient(135deg, #6d4321, #8B5A2B)" } }}>🌰 Back to the Orchard</Button>
        </Link>
      </Box>
    </Layout>
  );
}
