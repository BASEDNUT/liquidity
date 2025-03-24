import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import FilterTokens from '../components/FilterTokens';
import TokenCard from '../components/TokenCard';
import { fetchTokens } from '../utils/fetchTokens';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { styled, keyframes } from '@mui/system'; // <-- add keyframes & styled

// Define keyframes for an “explosion”
const explode = keyframes`
  0% {
    transform: scale(0.1);
    opacity: 1;
  }
  75% {
    transform: scale(2);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// Styled component for emoji effect
const FireworkEmoji = styled('div')(({ top, left }) => ({
  position: 'absolute',
  pointerEvents: 'none',
  fontSize: '2rem',
  animation: `${explode} 0.5s ease-out forwards`,
  top: top || 0,
  left: left || 0,
}));

const TokensPage = () => {
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [fireworks, setFireworks] = useState([]); // store flying emojis

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTokens();
      if (!data || !data.trunk || !data.branches || !data.nestedTokens || !data.soil) {
        setTokens([]);
        setFilteredTokens([]);
        setLoading(false);
        return;
      }

      const tokenList = [
        { ...data.trunk, id: 'trunk', category: 'Trunk' },
        ...data.branches.map((item, index) => ({ ...item, id: `branch-${index}`, category: 'Branch' })),
        ...data.nestedTokens.map((item, index) => ({ ...item, id: `nested-${index}`, category: 'Nested' })),
        ...data.soil.map((item, index) => ({ ...item, id: `soil-${index}`, category: 'Soil' }))
      ];
      setTokens(tokenList);
      setFilteredTokens(tokenList);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === 'All') {
      setFilteredTokens(tokens);
    } else {
      setFilteredTokens(tokens.filter(token => token.category === filter));
    }
  };

  // Trigger animation on hover
  const handleMouseEnter = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setFireworks(prev => [...prev, { id: Date.now(), x, y }]);
  };

  // Clean up the finished animations
  const removeFirework = (id) => {
    setFireworks(prev => prev.filter(item => item.id !== id));
  };

  return (
    <>
      <Header />
      <div>
        <Head>
          <title>Explore Tokens</title>
        </Head>
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4,
            px: { xs: 2, sm: 4 },
            maxWidth: 'lg',
            position: 'relative', // Ensure fireworks are positioned correctly
          }}
        >
          {/* Render any active firework emojis */}
          {fireworks.map(({ id, x, y }) => (
            <FireworkEmoji
              key={id}
              top={y}
              left={x}
              onAnimationEnd={() => removeFirework(id)}
            >
              🎉
            </FireworkEmoji>
          ))}
          <Box 
            sx={{ 
              width: '100%', 
              textAlign: 'center', 
              mb: 3 
            }}
          >
            <Image 
              src="/img/based-nuts-hero.png" 
              alt="Based Nut's - The Orchard" 
              layout="responsive" 
              width={800}  
              height={600} 
              priority={true} 
            />
          </Box>
          <Typography variant="h4" gutterBottom>
            Explore Tokens
          </Typography>
          <FilterTokens 
            activeFilter={activeFilter} 
            onFilterChange={handleFilterChange}
          />
          {loading ? (
            <CircularProgress sx={{ mt: 4 }} />
          ) : (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {filteredTokens.map(token => (
                <Grid item xs={12} sm={6} md={4} key={token.id}>
                  {/* Attach mouse enter handler */}
                  <Box onMouseEnter={handleMouseEnter}>
                    <TokenCard token={token} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default TokensPage;
