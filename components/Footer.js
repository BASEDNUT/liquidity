import React from "react";
import { Box, Container, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#D1B48C", // Warm peanut-brown
        borderTop: "4px solid #7D5A50", // Darker brown border for emphasis
        mt: { xs: 4, md: 6 }, // Extra margin on top for spacing
        py: 2, // Vertical padding inside the footer
      }}
      role="contentinfo" // Accessibility improvement
    >
      <Container>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#5B3A29", fontWeight: "bold" }}
          >
            © {new Date().getFullYear()} BASED NUT. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: { xs: 1, sm: 0 } }}>
            <Link
              href="https://basednut.com"
              target="_blank"
              rel="noopener noreferrer" // Security improvement
              underline="none"
              sx={{
                color: "#5B3A29",
                fontWeight: "bold",
                ":hover": { color: "#7D5A50" },
              }}
            >
              Basednut.com
            </Link>
          </Box>
          {/* New social links */}
          <Box sx={{ display: "flex", gap: 2, mt: { xs: 1, sm: 0 } }}>
            <a href="https://twitter.com/BASEDNUT_" target="_blank" rel="noopener noreferrer" style={{ color: "#5B3A29", fontWeight: "bold", textDecoration: "none" }}>
              Twitter
            </a>
          </Box>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "#5B3A29", fontWeight: "bold", mt: 2 }}
        >
          <em style={{ color: "#7D5A50" }}>
            BASED NUT is an experimental memefi project. BASED NUT TOKENS are whimsical meme coins devoid of any intrinsic value or anticipation of financial gains. Coins are for entertainment purposes only. No formal team or roadmap. Please nut responsibly!
          </em>
        </Typography>
      </Container>
    </Box>
  );
}
