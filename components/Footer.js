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
              href="https://dune.com/basednut/basednut"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                color: "#5B3A29",
                fontWeight: "bold",
                ":hover": { color: "#7D5A50" },
              }}
            >
              Dune Dashboard
            </Link>
            <Link
              href="https://basednut.com"
              target="_blank"
              rel="noopener noreferrer"
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
        </Box>
      </Container>
    </Box>
  );
}
