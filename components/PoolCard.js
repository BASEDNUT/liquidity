import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
} from "@mui/material";
import { keyframes } from "@mui/system";

// Wiggle Animation
const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(3deg); }
  40% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
  80% { transform: rotate(-2deg); }
`;

export default function PoolCard({
  name,
  flavor,
  tvl,
  status,
  category,
  url,
  checkPoolUrl,
  dexscreenerUrl,
  platform,
}) {
  const chipColor =
    category.includes("NFTs") && status === "Bonding"
      ? "success"
      : status === "Volatile"
        ? "error"
        : status === "Stable"
          ? "success"
          : status === "Bonding"
            ? "warning"
            : status === "Experimental"
              ? "secondary"
              : "info";

  const nftChipStyle = category.includes("NFTs")
    ? {
        backgroundColor: "#E6B87D",
        color: "#5B3A29",
        fontWeight: "bold",
      }
    : {};

  const formattedTVL =
    tvl && !isNaN(tvl)
      ? Number(tvl).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })
      : tvl;

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #FAF3E6 0%, #F2E4CE 100%)",
        border: "3px double #D1B48C",
        borderRadius: "30px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        transition: "transform 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          transform: "scale(1.02)",
          borderColor: "#C49260",
        },
      }}
    >
      <CardContent sx={{ padding: "24px" }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#7D5A50", mb: 1 }}
        >
          {name}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 1 }}>
          {Array.isArray(category)
            ? category.map((cat, i) => (
                <Chip key={i} label={cat} size="small" sx={nftChipStyle} />
              ))
            : category && (
                <Chip label={category} size="small" sx={nftChipStyle} />
              )}
        </Box>

        <Typography variant="body1" sx={{ color: "#7D5A50", mb: 0.5 }}>
          <strong>Flavor:</strong> {flavor}
        </Typography>

        <Typography variant="body1" sx={{ color: "#7D5A50", mb: 0.5 }}>
          <strong>TVL:</strong>{" "}
          {formattedTVL !== "TBD" ? `$${formattedTVL}` : "TBD"}
        </Typography>

        <Typography variant="body1" sx={{ color: "#7D5A50", mb: 1 }}>
          <strong>Platform:</strong> {platform}
        </Typography>

        <Chip
          label={status}
          color={chipColor}
          variant="filled"
          sx={{
            fontWeight: "bold",
            color: "#fff",
            borderRadius: "6px",
            px: 1,
          }}
        />
      </CardContent>

      {/* Vertical list of actions */}
      <Box
        component="nav"
        sx={{
          px: 2,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          size="small"
          href={checkPoolUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            background: "linear-gradient(45deg, #7D5A50, #A67C52)",
            textTransform: "none",
            height: "42px",
            width: "100%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            transition: "background 0.3s ease, transform 0.3s ease",
            "&:hover": {
              background: "linear-gradient(45deg, #6C4A3C, #8A623F)",
              animation: `${wiggle} 0.4s ease-in-out`,
              transform: "translateY(-2px)",
            },
          }}
        >
          TRADE
        </Button>
        <Button
          variant="contained"
          size="small"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            background: "linear-gradient(45deg, #7D5A50, #A67C52)",
            textTransform: "none",
            height: "42px",
            width: "100%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            transition: "background 0.3s ease, transform 0.3s ease",
            "&:hover": {
              background: "linear-gradient(45deg, #6C4A3C, #8A623F)",
              animation: `${wiggle} 0.4s ease-in-out`,
              transform: "translateY(-2px)",
            },
          }}
        >
          CONTRACT
        </Button>
        <Button
          variant="contained"
          size="small"
          href={dexscreenerUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            background: "linear-gradient(45deg, #7D5A50, #A67C52)",
            textTransform: "none",
            height: "42px",
            width: "100%",
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            transition: "background 0.3s ease, transform 0.3s ease",
            "&:hover": {
              background: "linear-gradient(45deg, #6C4A3C, #8A623F)",
              animation: `${wiggle} 0.4s ease-in-out`,
              transform: "translateY(-2px)",
            },
          }}
        >
          EXPLORE
        </Button>
      </Box>
    </Card>
  );
}
