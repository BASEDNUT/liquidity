import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
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
  position: 'relative',
  fontSize: '48px',
  lineHeight: 1,
  animation: `${float} 3s ease-in-out infinite`,
});

const Aura = styled('div')(({ color = '#FFB86B' }) => ({
  position: 'absolute',
  top: '-8px',
  left: '-8px',
  right: '-8px',
  bottom: '-8px',
  borderRadius: '999px',
  background: `radial-gradient(50% 50% at 50% 50%, ${color}55 0%, transparent 70%)`,
  filter: 'blur(8px)',
  animation: `${pulse} 2.6s ease-in-out infinite`,
  zIndex: 0,
}));

const FloatingEmoji = styled('div')(({ left, top, delay }) => ({
  position: 'absolute',
  left,
  top,
  opacity: 0.14,
  fontSize: '28px',
  pointerEvents: 'none',
  animation: `${float} 4.5s ease-in-out ${delay} infinite`,
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
        background: 'linear-gradient(135deg, #FFF7EA 0%, #FFEED6 100%)',
        border: '1px solid #E8DCC8',
        borderRadius: '30px',
        boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          borderColor: '#E2CDAE',
        },
      }}
    >
      {/* Soft header tint */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 76, background: 'linear-gradient(180deg, #FFF3DD 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none' }} />

      <CardContent sx={{ padding: '24px', position: 'relative', zIndex: 1 }}>
        <Link href={`/token/${token.id}`} aria-label={`View details for token ${token.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <FloatyIcon sx={{ mb: 1 }} aria-hidden="true">
              <Aura />
              <span style={{ position: 'relative', zIndex: 1 }}>{token.icon}</span>
            </FloatyIcon>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7D5A50', mb: 1 }}>
              {token.name}
            </Typography>
            <Typography variant="body1" sx={{ color: '#7D5A50', mb: 1 }}>
              {token.role}
            </Typography>
            {/* Price: all sources with labels */}
            <Typography variant="body2" sx={{ color: '#8B5A2B', mb: 0.5, fontSize: '0.85rem' }}>
              Price:{' '}
              {(() => {
                const parts = [];
                const fmt = (v) => { if (v == null || isNaN(v)) return null; return v >= 1 ? v.toFixed(4) : v.toFixed(6); };
                const fmtTime = (iso) => { try { const d = new Date(iso); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); } catch { return ''; } };
                if (token.marketData?.geckoTerminal?.price_usd != null) { const t = fmtTime(token.marketData.geckoTerminal.lastCheckedAt); parts.push(<React.Fragment key="gt"><strong>${fmt(token.marketData.geckoTerminal.price_usd)}</strong>{' '}<small style={{ color: '#A0522D', fontWeight: 'bold' }}>(GT{t ? ` ${t}` : ''})</small></React.Fragment>); }
                if (token.marketData?.dexScreener?.priceUsd != null) { const t = fmtTime(token.marketData.dexScreener.lastCheckedAt); parts.push(<React.Fragment key="ds">{' | '}<strong>${fmt(token.marketData.dexScreener.priceUsd)}</strong>{' '}<small style={{ color: '#A0522D', fontWeight: 'bold' }}>(DS{t ? ` ${t}` : ''})</small></React.Fragment>); }
                if (token.marketData?.coinGecko?.price_usd != null) { const t = fmtTime(token.marketData.coinGecko.lastCheckedAt); parts.push(<React.Fragment key="cg">{' | '}<strong>${fmt(token.marketData.coinGecko.price_usd)}</strong>{' '}<small style={{ color: '#A0522D', fontWeight: 'bold' }}>(CG{t ? ` ${t}` : ''})</small></React.Fragment>); }
                if (token.marketData?.balancer?.bptPrice != null) { const t = fmtTime(token.marketData.balancer.lastCheckedAt); parts.push(<React.Fragment key="bal">{' | '}<strong>${fmt(token.marketData.balancer.bptPrice)}</strong>{' '}<small style={{ color: '#A0522D', fontWeight: 'bold' }}>(BAL{t ? ` ${t}` : ''})</small></React.Fragment>); }
                if (parts.length === 0) {
                  const name = (token.name || '').toLowerCase();
                  const tags = (token.tags || []).join(' ').toLowerCase();
                  if (name === 'pnut' || tags.includes('index') || tags.includes('balancer')) return <strong>Index Token (Balancer)</strong>;
                  if (tags.includes('bonding curve') || tags.includes('mintclub') || name === 'nutino' || name === 'salt') return <strong>Bonding Curve Token (MintClub)</strong>;
                  return <strong>Not available</strong>;
                }
                return parts;
              })()}
            </Typography>
            {/* Category and Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {token.category && <Chip size="small" label={token.category} />}
              {(token.tags || []).slice(0, 4).map((t, i) => (
                <Chip key={i} size="small" label={t} variant="outlined" />
              ))}
            </Box>
          </Link>
      </CardContent>
      <Box
        component="nav"
        sx={{
          px: 2,
          pb: 2,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 1.25,
        }}
      >
        <Link href={`/token/${token.id}`} aria-label={`Open profile for token ${token.name}`} style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              size="medium"
              sx={{
                background: 'linear-gradient(180deg, #8B6A5F 0%, #6F5249 100%)',
                border: '1px solid #5E463E',
                textTransform: 'none',
                height: 46,
                width: '100%',
                color: '#fff',
                borderRadius: '14px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 10px 18px rgba(0,0,0,0.16)',
                letterSpacing: 0.3,
                fontWeight: 800,
                transition: 'transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  animation: `${wiggle} 0.4s ease-in-out`,
                  transform: 'translateY(-2px)',
                  filter: 'brightness(1.04)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 12px 22px rgba(0,0,0,0.2)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                  filter: 'brightness(0.98)',
                  boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.16)',
                }
              }}
            >
              DETAILS
            </Button>
          </Link>
        {/* Action buttons: Trade | Liquidity | Explorer */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.75 }}>
          {(() => {
            const firstPool = token.pools?.[0];
            const tradeUrl = firstPool?.dexscreenerUrl || firstPool?.url || `https://basescan.org/token/${token.address}`;
            const liqUrl = firstPool?.dexscreenerUrl || firstPool?.url || `https://basescan.org/token/${token.address}`;
            const explorerUrl = `https://basescan.org/token/${token.address}`;
            const actionBtnSx = {
              textTransform: 'none',
              borderColor: '#8B6A5F',
              color: '#5B3A29',
              borderRadius: '10px',
              height: 36,
              fontSize: '0.75rem',
              backgroundColor: 'rgba(139,106,95,0.06)',
              borderWidth: 1.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(139,106,95,0.12)',
                borderColor: '#6B3D20',
              },
            };
            return (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  href={tradeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={actionBtnSx}
                >
                  🔄 Trade
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  href={liqUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={actionBtnSx}
                >
                  💧 Liquidity
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={actionBtnSx}
                >
                  🔍 Explorer
                </Button>
              </>
            );
          })()}
        </Box>
      </Box>
      {/* Soft floating background emojis using existing icon */}
      {token.icon && (
        [
          { left: '8%', top: '14%', delay: '0.2s' },
          { left: '78%', top: '22%', delay: '0.8s' },
          { left: '64%', top: '68%', delay: '0.4s' },
        ].map((f, i) => (
          <FloatingEmoji key={i} left={f.left} top={f.top} delay={f.delay}>
            {token.icon}
          </FloatingEmoji>
        ))
      )}
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
