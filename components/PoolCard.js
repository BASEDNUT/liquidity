import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
} from "@mui/material";
import { styled, keyframes } from "@mui/system";

// Wiggle Animation
const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(3deg); }
  40% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
  80% { transform: rotate(-2deg); }
`;

// New animations copied from TokenCard.js
const rainDown = keyframes`
  0% {
    transform: translateY(-20px);
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const splashUp = keyframes`
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  50% {
    transform: translateY(-10px);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px);
    opacity: 0;
  }
`;

const EmojiSplash = styled("div")(({ top, left, splashType }) => ({
  position: "absolute",
  fontSize: "1.5rem",
  pointerEvents: "none",
  top,
  left,
  animation:
    splashType === "rain"
      ? `${rainDown} 0.3s ease-out forwards`
      : `${splashUp} 0.3s ease-out forwards`,
}));

const ShowerHeadCursor = styled("div")(({ top, left }) => ({
  position: "absolute",
  fontSize: "2rem",
  pointerEvents: "none",
  top,
  left,
  transform: "translate(-50%, -50%)",
}));

// Gentle float + pulse for the main icon and background floaters
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
`;

const pulse = keyframes`
  0% { opacity: 0.36; }
  50% { opacity: 0.85; }
  100% { opacity: 0.36; }
`;

const FloatyIcon = styled(Box)({
  position: "relative",
  fontSize: "48px",
  lineHeight: 1,
  animation: `${float} 3s ease-in-out infinite`,
});

const Aura = styled("div")(({ color = "#FFB86B" }) => ({
  position: "absolute",
  top: "-8px",
  left: "-8px",
  right: "-8px",
  bottom: "-8px",
  borderRadius: "999px",
  background: `radial-gradient(50% 50% at 50% 50%, ${color}55 0%, transparent 70%)`,
  filter: "blur(8px)",
  animation: `${pulse} 2.6s ease-in-out infinite`,
  zIndex: 0,
}));

const FloatingEmoji = styled("div")(({ left, top, delay }) => ({
  position: "absolute",
  left,
  top,
  opacity: 0.14,
  fontSize: "28px",
  pointerEvents: "none",
  animation: `${float} 4.5s ease-in-out ${delay} infinite`,
}));

export default function PoolCard({
  id,
  name,
  flavor,
  tvl,
  status,
  category,
  url,
  checkPoolUrl,
  dexscreenerUrl,
  platform,
  icon, // new prop: the emoji icon from the pool
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

  // New state and refs for emoji animations
  const [splashes, setSplashes] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const rainInterval = useRef(null);
  const splashInterval = useRef(null);
  const cardRef = useRef(null);
  const cursorRef = useRef({ x: -100, y: -100 });

  const generateRain = () => {
    const newSplashes = Array.from({ length: 3 }).map(() => ({
      id: Date.now() + Math.random(),
      top: "0%",
      left: `${Math.random() * 80 + 10}%`,
      emoji: "💧",
      splashType: "rain",
    }));
    setSplashes((prev) => [...prev, ...newSplashes]);
    setTimeout(() => {
      setSplashes((prev) => prev.filter((splash) => Date.now() - splash.id < 300));
    }, 300);
  };

  const generateSplash = (x, y) => {
    const splash = {
      id: Date.now() + Math.random(),
      top: `${y}px`,
      left: `${x}px`,
      emoji: "💦",
      splashType: "splash",
    };
    setSplashes((prev) => [...prev, splash]);
    setTimeout(() => {
      setSplashes((prev) => prev.filter((s) => Date.now() - s.id < 300));
    }, 300);
  };

  const handleCardMouseEnter = () => {
    rainInterval.current = setInterval(generateRain, 300);
    splashInterval.current = setInterval(() => {
      generateSplash(cursorRef.current.x, cursorRef.current.y);
    }, 800);
  };

  const handleCardMouseLeave = () => {
    clearInterval(rainInterval.current);
    clearInterval(splashInterval.current);
    rainInterval.current = null;
    splashInterval.current = null;
    setCursorPos({ x: -100, y: -100 });
  };

  const handleCardMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x, y });
    cursorRef.current = { x, y };
  };

  // Create a couple of soft floating background emojis using the existing icon
  const floaters = useMemo(() => {
    const items = [
      { left: "8%", top: "14%", delay: "0.2s" },
      { left: "78%", top: "22%", delay: "0.8s" },
      { left: "64%", top: "68%", delay: "0.4s" },
    ];
    return items;
  }, [id]);

  return (
    <Card
      ref={cardRef}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      onMouseMove={handleCardMouseMove}
      sx={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #FFF7EA 0%, #FFEED6 100%)",
        border: "1px solid #E8DCC8",
        borderRadius: "30px",
        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
        transition: "transform 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          transform: "scale(1.02)",
          borderColor: "#E2CDAE",
        },
      }}
    >
      {/* Soft header tint */}
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 76,
        background: "linear-gradient(180deg, #FFF3DD 0%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none",
      }}/>

      <CardContent sx={{ padding: "24px", position: "relative", zIndex: 1 }}>
        <Link href={`/pool/${id}`} passHref legacyBehavior>
          <a aria-label={`View details for pool ${name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {icon && (
              <FloatyIcon sx={{ mb: 1 }} aria-hidden="true">
                <Aura />
                <span style={{ position: "relative", zIndex: 1 }}>{icon}</span>
              </FloatyIcon>
            )}
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#7D5A50", mb: 1 }}
            >
              {name}
            </Typography>
          </a>
        </Link>

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

      {/* Actions: one bold brown CTA + clean outlined secondary buttons */}
      <Box
        component="nav"
        sx={{
          px: 2,
          pb: 2,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 1.25,
        }}
      >
        {/* Primary CTA (brown) */}
        <Button
          variant="contained"
          size="medium"
          href={checkPoolUrl || url || dexscreenerUrl || `/pool/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            background: "linear-gradient(180deg, #8B6A5F 0%, #6F5249 100%)",
            border: "1px solid #5E463E",
            textTransform: "none",
            height: 46,
            width: "100%",
            color: "#fff",
            borderRadius: "14px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 10px 18px rgba(0,0,0,0.16)",
            letterSpacing: 0.3,
            fontWeight: 800,
            transition: "transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              filter: "brightness(1.04)",
              animation: `${wiggle} 0.4s ease-in-out`,
              transform: "translateY(-2px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 12px 22px rgba(0,0,0,0.2)",
            },
            "&:active": {
              transform: "translateY(0)",
              filter: "brightness(0.98)",
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.16)",
            }
          }}
        >
          TRADE
        </Button>

        {/* Secondary actions (outlined, brown) */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1 }}>
          <Link href={`/pool/${id}`} passHref legacyBehavior>
            <a aria-label={`Open profile for pool ${name}`} style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderColor: "#7D5A50",
                  color: "#7D5A50",
                  borderRadius: "12px",
                  height: 40,
                  backgroundColor: "rgba(125,90,80,0.04)",
                  borderWidth: 1.5,
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: "rgba(125,90,80,0.09)",
                    borderColor: "#6C4A3C",
                  },
                }}
              >
                DETAILS
              </Button>
            </a>
          </Link>
          <Button
            variant="outlined"
            size="small"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              textTransform: "none",
              borderColor: "#7D5A50",
              color: "#7D5A50",
              borderRadius: "12px",
              height: 40,
              backgroundColor: "rgba(125,90,80,0.04)",
              borderWidth: 1.5,
              fontWeight: 700,
              "&:hover": {
                backgroundColor: "rgba(125,90,80,0.09)",
                borderColor: "#6C4A3C",
              },
            }}
          >
            CONTRACT
          </Button>
          <Button
            variant="outlined"
            size="small"
            href={dexscreenerUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              textTransform: "none",
              borderColor: "#7D5A50",
              color: "#7D5A50",
              borderRadius: "12px",
              height: 40,
              backgroundColor: "rgba(125,90,80,0.04)",
              borderWidth: 1.5,
              fontWeight: 700,
              "&:hover": {
                backgroundColor: "rgba(125,90,80,0.09)",
                borderColor: "#6C4A3C",
              },
            }}
          >
            EXPLORE
          </Button>
        </Box>
      </Box>

      {/* Soft floating background emojis using existing icon */}
      {icon && floaters.map((f, i) => (
        <FloatingEmoji key={i} left={f.left} top={f.top} delay={f.delay}>
          {icon}
        </FloatingEmoji>
      ))}

      {/* Render animated splashes */}
      {splashes.map((splash) => (
        <EmojiSplash
          key={splash.id}
          top={splash.top}
          left={splash.left}
          splashType={splash.splashType}
        >
          {splash.emoji}
        </EmojiSplash>
      ))}

      {/* Render the shower head cursor */}
      <ShowerHeadCursor top={`${cursorPos.y}px`} left={`${cursorPos.x}px`}>
        🚿
      </ShowerHeadCursor>
    </Card>
  );
}
