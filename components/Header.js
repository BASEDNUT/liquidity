import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme, keyframes } from "@mui/system";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

// Wiggle Animation (borrowed from the pool cards)
const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(3deg); }
  40% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
  80% { transform: rotate(-2deg); }
`;

// Reusable gradient button styling
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

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const isTreePage = router.pathname === "/tree";

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

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

  const menuItems = (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
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
      <Link href="/" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
          aria-label="Navigate to Home"
        >
          Home
        </Button>
      </Link>
      <Link href="/arb-bot" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
          aria-label="Navigate to Arb Bot"
        >
          Arb Bot
        </Button>
      </Link>
    <Link href="/great-nut-war" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
      aria-label="Navigate to Great Nut War"
        >
      Great Nut War
        </Button>
      </Link>
    <Link href="/staking" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
      aria-label="Navigate to Staking"
        >
      Staking
        </Button>
      </Link>
    <Link href="/chat" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
      aria-label="Navigate to Chat"
        >
      Chat
        </Button>
      </Link>
    <Link href="/images" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
      aria-label="Navigate to Images"
        >
      Images
        </Button>
      </Link>
    <Link href="/warmachine" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
      aria-label="Navigate to Nut War Battlefield"
        >
      Nut War Battlefield
        </Button>
      </Link>
    <Link href="/tree" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
      aria-label="Navigate to Tree"
        >
      Tree
        </Button>
      </Link>
      <Link href="/tvl" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
          aria-label="Navigate to TVL Transparency"
        >
          TVL
        </Button>
      </Link>
      <Link href="/faq" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
          aria-label="Navigate to FAQ"
        >
          FAQ
        </Button>
      </Link>
      <Link href="/ecosystem" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
          aria-label="View Ecosystem Graphs"
        >
          Graphs
        </Button>
      </Link>
      <Link href="/agents" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
          aria-label="Meet the AI Agents"
        >
          Agents
        </Button>
      </Link>
      <Link href="/nut-catcher" passHref>
        <Button
          variant="contained"
          sx={{
            ...(isTreePage ? headerButtonSx : gradientButtonStyle),
            width: "100%",
            my: 1,
          }}
          aria-label="Play Nut Catcher Game"
        >
          🌰 Nut Catcher
        </Button>
      </Link>
      {isMobile && (
        <Link href="https://docs.basednut.com/" passHref>
          <Button
            variant="contained"
            sx={{
              ...(isTreePage ? headerButtonSx : gradientButtonStyle),
              width: "100%",
              my: 1,
            }}
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
        backgroundColor: isTreePage ? "transparent" : "#D1B48C", // Warm peanut-brown or transparent on Tree
        borderBottom: isTreePage ? "none" : "4px solid #7D5A50", // No border on Tree
        boxShadow: isTreePage ? "none" : undefined,
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          {/* Make the brand/logo a Home link */}
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
                '&:hover': { textDecoration: "underline" },
              }}
              aria-label="Go to Home"
            >
              BASED NUT 🌰
            </Typography>
          </Link>
        </Box>

        {/* Desktop "LEARN MORE" button */}
        {!isMobile && (
          <Button
            variant="contained"
            href="https://docs.basednut.com/"
            sx={{
              ...(isTreePage ? headerButtonSx : gradientButtonStyle),
              mr: 2,
            }}
          >
            LEARN MORE
          </Button>
        )}

        {/* Prominent Menu trigger: desktop shows labeled button, mobile shows larger icon */}
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
            sx={{
              ...(isTreePage ? headerButtonSx : gradientButtonStyle),
              px: 2.5,
              py: 1,
              borderRadius: 999,
              fontWeight: 800,
              letterSpacing: 1,
            }}
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
          PaperProps={{
            sx: {
              width: 280, // Fixed side-drawer width
              boxSizing: "border-box",
              backgroundColor: "#F5E9DA",
            },
          }}
        >
          {menuItems}
        </SwipeableDrawer>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
