import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
  List,
  ListItemButton,
  Collapse,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useTheme, keyframes } from "@mui/system";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

// Wiggle Animation (borrowed from the pool cards) - the juicy hover
const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(3deg); }
  40% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
  80% { transform: rotate(-2deg); }
`;

// Reusable gradient button styling (original juicy nutty look)
const gradientButtonStyle = {
  background: "linear-gradient(45deg, #7D5A50, #A67C52)",
  color: "#FFFFFF",
  textTransform: "none",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
  transition: "background 0.3s ease, transform 0.3s ease",
  "&:hover": {
    background: "linear-gradient(45deg, #6C4A3C, #8A623F)",
    animation: `${wiggle} 0.4s ease-in-out`,
    transform: "translateY(-2px)",
  },
};

// Nested leaf: slightly lighter gradient so sections still pop
const gradientNestedStyle = {
  background: "linear-gradient(45deg, #A67C52, #C08A5A)",
  color: "#FFFFFF",
  textTransform: "none",
  boxShadow: "0 3px 6px rgba(0, 0, 0, 0.12)",
  transition: "background 0.3s ease, transform 0.3s ease",
  "&:hover": {
    background: "linear-gradient(45deg, #8A623F, #A67C52)",
    animation: `${wiggle} 0.4s ease-in-out`,
    transform: "translateY(-2px)",
  },
};

// Grouped navigation: top-level sections with nested juicy items.
// All routes exist in pages/ — nothing invented, nothing removed.
const NAV_SECTIONS = [
  {
    title: "🌳 The Orchard",
    items: [
      { label: "Home", href: "/" },
      {
        label: "Tokens",
        sub: [
          { label: "NUT", href: "/token/nut" },
          { label: "SNUT", href: "/token/snut" },
          { label: "pNUT", href: "/token/pnut" },
          { label: "All Tokens", href: "/tokens" },
        ],
      },
      {
        label: "Pools",
        sub: [
          { label: "NUT/wETH · V3", href: "/pool/nut-weth-uniswap-v3" },
          { label: "NUT/SALT · Mint Club", href: "/pool/nut-salt-mintclub" },
          { label: "SNUT/NUT · Aerodrome", href: "/pool/snut-nut-aerodrome" },
          { label: "SALT/USDC · Aerodrome", href: "/pool/salt-usdc-aerodrome" },
          { label: "PIPS/USDC · reCLAMM", href: "/pool/pips-usdc-balancer-reclamm" },
        ],
      },
      { label: "🔗 Pair Your Token", href: "/pair-your-token" },
      { label: "TVL", href: "/tvl" },
      { label: "Staking", href: "/staking" },
      { label: "Tree", href: "/tree" },
      { label: "Graphs", href: "/ecosystem" },
    ],
  },
  {
    title: "⚔️ Nut Wars",
    items: [
      { label: "Great Nut War", href: "/great-nut-war" },
      { label: "Nut War Battlefield", href: "/warmachine" },
      { label: "🌰 Nut Catcher", href: "/nut-catcher" },
    ],
  },
  {
    title: "🤖 AI Agents",
    items: [
      { label: "Agents", href: "/agents" },
      { label: "Agent Economy", href: "/agent-economy" },
      { label: "Arb Bot", href: "/arb-bot" },
      { label: "Chat", href: "/chat" },
      { label: "Images", href: "/images" },
      { label: "Mycelium + Taproot", href: "/infra/mycelium-taproot" },
    ],
  },
  {
    title: "🏦 RWA",
    items: [
      { label: "US Nut Economy", href: "/rwa/nuts-production" },
      { label: "Nut Atlas", href: "/rwa/nut-atlas" },
      { label: "Nut Stocks", href: "/rwa/nut-stocks" },
      { label: "Nut Trade Flows", href: "/rwa/nut-trade-flows" },
      { label: "Nut Standard", href: "/rwa/nut-inflation" },
      { label: "Carbon Pricing Exposure", href: "/rwa/carbon-debt" },
    ],
  },
  {
    title: "📚 Learn",
    items: [
      { label: "FAQ", href: "/faq" },
      { label: "Department of Complaints", href: "/complaints" },
      { label: "Docs", href: "https://docs.basednut.com/", external: true },
    ],
  },
];

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMap, setOpenMap] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const isTreePage = router.pathname === "/tree";

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };
  const toggle = (key) => setOpenMap((m) => ({ ...m, [key]: !m[key] }));

  const headerButtonSx = isTreePage
    ? {
        background: "rgba(0,0,0,0.06)",
        color: "#5D3A1A",
        textTransform: "none",
        border: "1px solid rgba(93,58,26,0.25)",
        boxShadow: "none",
        transition: "background 0.2s ease, transform 0.2s ease",
        "&:hover": {
          background: "rgba(0,0,0,0.1)",
          transform: "translateY(-1px)",
        },
      }
    : gradientButtonStyle;

  const renderItem = (item) => {
    const key = item.label;
    if (item.sub) {
      const subOpen = !!openMap[key];
      return (
        <Box key={key} sx={{ my: 0.5 }}>
          <Button
            onClick={() => toggle(key)}
            variant="contained"
            fullWidth
            endIcon={subOpen ? <ExpandLess /> : <ExpandMore />}
            sx={{
              ...gradientNestedStyle,
              justifyContent: "space-between",
              px: 2,
              py: 1,
              borderRadius: 999,
            }}
          >
            {key}
          </Button>
          <Collapse in={subOpen} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 1, pt: 0.5 }}>
              {item.sub.map((si) => renderItem(si))}
            </Box>
          </Collapse>
        </Box>
      );
    }

    const btn = (
      <Button
        variant="contained"
        fullWidth
        onClick={() => setDrawerOpen(false)}
        sx={{
          ...gradientNestedStyle,
          px: 2,
          py: 1,
          borderRadius: 999,
          my: 0.5,
        }}
      >
        {item.label}
      </Button>
    );

    if (item.external) {
      return (
        <a
          key={key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          {btn}
        </a>
      );
    }
    return (
      <Link key={key} href={item.href} style={{ textDecoration: "none" }}>
        {btn}
      </Link>
    );
  };

  const menuItems = (
    <Box
      role="presentation"
      onKeyDown={toggleDrawer(false)}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        boxSizing: "border-box",
        height: "100%",
        backgroundColor: "#F5E9DA",
      }}
    >
      {NAV_SECTIONS.map((sec, i) => {
        const open = !!openMap[sec.title];
        return (
          <Box key={sec.title}>
            {i > 0 && <Divider sx={{ my: 1, borderColor: "#D1B48C" }} />}
            <Button
              onClick={() => toggle(sec.title)}
              variant="text"
              fullWidth
              endIcon={open ? <ExpandLess /> : <ExpandMore />}
              sx={{
                justifyContent: "space-between",
                px: 1,
                py: 0.75,
                color: "#5D3A1A",
                fontWeight: 800,
                fontSize: "0.95rem",
                textTransform: "none",
                letterSpacing: 0.5,
              }}
            >
              {sec.title}
            </Button>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ px: 0.5 }}>
                {sec.items.map((item) => renderItem(item))}
              </Box>
            </Collapse>
          </Box>
        );
      })}
      {isMobile && (
        <Link href="https://docs.basednut.com/" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            fullWidth
            sx={{ ...(isTreePage ? headerButtonSx : gradientButtonStyle), my: 1 }}
            aria-label="Learn more about Based Nut"
          >
            LEARN MORE
          </Button>
        </Link>
      )}
    </Box>
  );

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: isTreePage ? "transparent" : "#D1B48C",
        borderBottom: isTreePage ? "none" : "4px solid #7D5A50",
        boxShadow: isTreePage ? "none" : undefined,
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }} title="Home">
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                color: isTreePage ? "#3E1F0A" : undefined,
                "&:hover": { textDecoration: "underline" },
              }}
              aria-label="Go to Home"
            >
              BASED NUT 🌰
            </Typography>
          </Link>
        </Box>

        {!isMobile && (
          <Button
            variant="contained"
            href="https://docs.basednut.com/"
            sx={{ ...(isTreePage ? headerButtonSx : gradientButtonStyle), mr: 2 }}
          >
            LEARN MORE
          </Button>
        )}

        {isMobile ? (
          <IconButton
            onClick={toggleDrawer(true)}
            color="inherit"
            aria-label="Open menu"
            sx={{
              ...(isTreePage ? headerButtonSx : gradientButtonStyle),
              width: 48,
              height: 48,
              borderRadius: 2,
              p: 1,
            }}
          >
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>
        ) : (
          <Button
            onClick={toggleDrawer(true)}
            variant="contained"
            sx={{ ...(isTreePage ? headerButtonSx : gradientButtonStyle), px: 2.5, py: 1, borderRadius: 999, fontWeight: 800, letterSpacing: 1 }}
            startIcon={<MenuIcon sx={{ fontSize: 24 }} />}
            aria-label="Open menu"
          >
            MENU
          </Button>
        )}

        <SwipeableDrawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          PaperProps={{ sx: { width: 280, boxSizing: "border-box", backgroundColor: "#F5E9DA" } }}
        >
          {menuItems}
        </SwipeableDrawer>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
