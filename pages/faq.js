import Head from 'next/head';
import Layout from '../components/Layout';
import { Box, Typography, Divider, Stack } from '@mui/material';

const rows = [
  {
    q: '1. What is Based NUT?',
    a: 'Based NUT is a meme‑themed DeFi experiment on the Base network. It is described as playful and whimsical, with no intrinsic value and no expectation of profit.'
  },
  {
    q: '2. Is Based NUT intended as an investment?',
    a: 'No. The NUTpaper states that NUT tokens are meme coins without investment value.'
  },
  {
    q: '3. What core tokens compose the ecosystem?',
    a: 'The ecosystem’s base layer is NUT, with deflationary layer SNUT and Balancer index token pNUT. These three tokens form the primary structure of the project.'
  },
  {
    q: '4. What is NUT?',
    a: 'NUT is the “Network Utility Token.” Its supply is fixed at 1 token, with no transaction tax and no team allocation. It was stealth‑launched on Uniswap V3 with zero ETH paired.'
  },
  {
    q: '5. What is SNUT?',
    a: 'SNUT (“Based Supernuts”) is a deflationary token with 100,000 SNUT supply. Each transaction incurs a 6% fee: 1.5% adds liquidity, 1.5% goes to a manager, 1.5% funds buyback/burn (reducing both SNUT and NUT) and 1.5% distributes staking rewards. Holding SNUT automatically earns NUT rewards via non‑escrow staking.'
  },
  {
    q: '6. What is pNUT?',
    a: 'pNUT is an index token on Balancer combining cbETH, cbBTC, NUT and SNUT. It offers diversified exposure and yields from market activity. pNUT has no supply cap; however, its inflation is moderated by the deflation of NUT and SNUT.'
  },
  {
    q: '7. How are nested tokens created?',
    a: 'Nested tokens are minted on Mint Club using NUT as collateral. Their price is determined by bonding‑curve contracts. Users can arbitrage by minting when the curve price is lower than the market price or burning when the curve price is higher.'
  },
  {
    q: '8. Which nested tokens exist?',
    a: 'Examples include DEEZ, a flat‑price token with a 1% tax and 10,000 supply; NUTINO, designed for arbitrage between Uniswap and Mint Club; and themed tokens like Based Peanut Warriors (PNUTS), Based Peanutino (NUTINO) and Based Almond (ALMD). Mint Club lists 14 NUT‑backed tokens with a total value locked (TVL) of 0.089 ΣNUT (~$5,700).'
  },
  {
    q: '9. What role does Mint Club play?',
  a: 'Mint Club is the hub for NUT‑backed child tokens. It lists existing tokens with prices and TVL and lets anyone deploy new NUT‑collateralised tokens via “Create Child Token.”'
  },
  {
    q: '10. What are NUT Army NFTs?',
  a: 'Almond War Generals and Peanut War Generals (1,000 each) and Almond/Peanut Soldiers (1,000,000 each). They are minted with locked NUT and can be burned to redeem the underlying NUT. Bonding curves differ (linear for peanuts, exponential for almonds). Because NUT is locked, market prices on OpenSea or Sudoswap that drift below the redeemable NUT value create buy‑and‑burn arbitrage; prices above curve value invite mint‑and‑sell.'
  },
  {
    q: '11. What is the “Great Nut War”?',
  a: 'A fictional narrative portraying a conflict between the Peanut Republic and Almond Empire over resources like Salt, Butter, Oil, Honey and Caramel. These resources are not active tokens; they are marked “TBA.”'
  },
  {
    q: '12. Where is liquidity provided?',
  a: 'Liquidity spans Uniswap V3 (protocol‑owned NUT/wETH), Uniswap V2 pools for SNUT buybacks, a Balancer pNUT multi‑asset pool, and Aerodrome vAMM pools (e.g., AERO/NUT, SNUT/NUT) with bribe incentives. Balancer’s invariant and Smart Order Router spread trades and enforce weights; when components move, arbitrageurs swap pNUT vs underlying to restore balance.'
  },
  {
    q: '13. What arbitrage opportunities exist?',
  a: 'Multiple: (1) pNUT vs its basket NAV—Balancer weights/spot prices create cycles when components move; (2) Mint Club bonding‑curve vs market—mint when curve < market, burn when curve > market; (3) NUTINO routing between Uniswap and Mint Club; (4) NFTs—OpenSea vs Sudoswap vs intrinsic redeemable NUT (buy‑and‑burn if below, mint‑and‑sell if above). PNUTS liquidity on Sudoswap forces arbitrage as the AMM price deviates from orderbook and redemption values.'
  },
  {
    q: '14. Are there transaction taxes?',
    a: 'NUT has no transaction tax. SNUT has a 6% fee split among liquidity, manager, buyback/burn and staking rewards. DEEZ has a 1% buy/sell tax. pNUT has no explicit tax but unwrapping pNUT triggers SNUT’s fee because SNUT is part of its composition.'
  },
  {
    q: '15. What deflationary or inflationary forces exist?',
    a: 'NUT’s supply is fixed at 1 and cannot expand. SNUT is deflationary due to transaction fees and buyback/burn. pNUT is inflationary because it can be freely minted but its growth is tempered by the deflation of NUT and SNUT.'
  },
  {
    q: '16. Are there plans for a DAO or governance?',
    a: 'No. There is no formal team, roadmap or governance mechanism. The project is community‑driven.'
  },
  {
    q: '17. What risks should users consider?',
    a: 'The NUTpaper warns that the ecosystem’s complexity and multilayered smart‑contract structure may introduce vulnerabilities; there are no audits, and regulatory uncertainty exists. Participants should treat the project as entertainment and only risk what they can afford to lose.'
  },
  {
    q: '18. How does the community engage?',
  a: 'The culture emphasises memes and community interaction. Join chats, follow updates, and stay active in forums. Keep an eye on Mint Club for new tokens and on community channels for announcements.'
  },
];

export default function FAQ() {
  return (
    <Layout>
      <Head>
        <title>FAQ | BASED NUT</title>
        <meta name="description" content="Frequently asked questions about BASED NUT, tokens, liquidity, and ecosystem details." />
      </Head>
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h3" sx={{ mb: 2, color: '#5B3A29', fontWeight: 'bold' }}>
          Updated Based NUT FAQ
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          This refined FAQ summarises the ecosystem. It’s playful, community‑driven, and not investment advice.
        </Typography>

        <Stack divider={<Divider sx={{ my: 2 }} />} spacing={2}>
          {rows.map((row, i) => (
            <Box key={i}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{row.q}</Typography>
              <Typography sx={{ mt: 0.5 }}>{row.a}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Layout>
  );
}
