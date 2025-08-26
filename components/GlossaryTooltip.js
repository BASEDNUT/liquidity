import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Tooltip, IconButton } from '@mui/material';

const TERMS = {
  Bonding: 'Price increases along a bonding curve as supply increases; early buyers pay less, later buyers more.',
  Concentrated: 'Liquidity concentrated over a chosen price range (e.g., Uniswap V3) for higher capital efficiency.',
  Volatile: 'Pool subject to larger price swings due to asset volatility or low liquidity.',
  Liquidity: 'Depth of assets in a pool; deeper liquidity reduces slippage on trades.',
  Arbitrage: 'Taking advantage of price differences across markets to profit and rebalance prices.',
};

export default function GlossaryTooltip({ term, title, size = 'small' }) {
  const content = title || TERMS[term] || 'Definition not available.';
  return (
    <Tooltip title={content} arrow>
      <IconButton size={size} sx={{ ml: 0.5 }} aria-label={`${term} info`}>
        <InfoOutlinedIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}
