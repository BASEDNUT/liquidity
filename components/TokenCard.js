import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { styled, keyframes } from '@mui/system';

const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(3deg); }
  40% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
  80% { transform: rotate(-2deg); }
`;

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

const EmojiSplash = styled('div')(({ top, left, splashType }) => ({
  position: 'absolute',
  fontSize: '1.5rem',
  pointerEvents: 'none',
  top,
  left,
  animation: splashType === 'rain'
    ? `${rainDown} 0.3s ease-out forwards`
    : `${splashUp} 0.3s ease-out forwards`,
}));

const ShowerHeadCursor = styled('div')(({ top, left }) => ({
  position: 'absolute',
  fontSize: '2rem',
  pointerEvents: 'none',
  top,
  left,
  transform: 'translate(-50%, -50%)',
}));

const TokenCard = ({ token }) => {
  const [splashes, setSplashes] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const rainInterval = useRef(null);
  const splashInterval = useRef(null);
  const cardRef = useRef(null);
  const cursorRef = useRef({ x: -100, y: -100 });

  const generateRain = () => {
    const newSplashes = Array.from({ length: 3 }).map(() => ({
      id: Date.now() + Math.random(),
      top: '0%',
      left: `${Math.random() * 80 + 10}%`,
      emoji: '💧',
      splashType: 'rain',
    }));
    setSplashes(prev => [...prev, ...newSplashes]);
    setTimeout(() => {
      setSplashes(prev => prev.filter(splash => Date.now() - splash.id < 300));
    }, 300);
  };

  const generateSplash = (x, y) => {
    const splash = {
      id: Date.now() + Math.random(),
      top: `${y}px`,
      left: `${x}px`,
      emoji: '💦',
      splashType: 'splash',
    };
    setSplashes(prev => [...prev, splash]);
    setTimeout(() => {
      setSplashes(prev => prev.filter(s => Date.now() - s.id < 300));
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

  return (
    <Card
      ref={cardRef}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      onMouseMove={handleCardMouseMove}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FAF3E6 0%, #F2E4CE 100%)',
        border: '3px double #D1B48C',
        borderRadius: '30px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          borderColor: '#C49260',
        },
      }}
    >
      <CardContent sx={{ padding: '24px' }}>
        <Link href={`/token/${token.id}`} passHref legacyBehavior>
          <a aria-label={`View details for token ${token.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ fontSize: '48px', mb: 1 }} aria-hidden="true">
              {token.icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7D5A50', mb: 1 }}>
              {token.name}
            </Typography>
            <Typography variant="body1" sx={{ color: '#7D5A50', mb: 1 }}>
              {token.role}
            </Typography>
          </a>
        </Link>
      </CardContent>
      <Box
        component="nav"
        sx={{
          px: 2,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
  <Button
          variant="contained"
          size="small"
          href={token.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            background: 'linear-gradient(45deg, #7D5A50, #A67C52)',
            textTransform: 'none',
            height: '42px',
            width: '100%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            transition: 'background 0.3s ease, transform 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(45deg, #6C4A3C, #8A623F)',
              animation: `${wiggle} 0.4s ease-in-out`,
              transform: 'translateY(-2px)',
            },
          }}
        >
          VIEW CONTRACT
        </Button>
      </Box>
      {/* Render all active splashes */}
      {splashes.map(splash => (
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
};

export default TokenCard;
