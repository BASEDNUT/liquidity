import Head from 'next/head';
import { useMemo, useState } from 'react';
import {
  Alert, Box, Card, CardContent, Chip, Container, Divider, Grid, Paper,
  Stack, TextField, Typography,
} from '@mui/material';
import Layout from '../components/Layout';
import { describeRunway } from '../src/utils/runway.mjs';

const colors = {
  cream: '#f3efe5', paper: '#fffdf7', paper2: '#f8f3e8', ink: '#26231d',
  muted: '#777063', line: '#d9cfbd', brown: '#6d4f2e', green: '#315f45', amber: '#9d6e24',
};

const pendingMetrics = [
  ['Shared treasury', 'Liquid assets available to agents'],
  ['Net daily burn', 'Agent spend minus recurring ACP income'],
  ['30d ACP income', 'Earned through completed agent services'],
  ['24h PIPS volume', 'Shared market activity'],
];

const accountingRows = [
  ['Treasury assets', 'ETH, USDC, PIPS, and classified ERC-20 assets', 'Pending wallet index'],
  ['ACP income', 'Completed work, gross receipts, counterparty concentration', 'Pending ACP ledger'],
  ['Operating burn', 'Compute, hosting, tooling, APIs, and onchain execution', 'Pending expense ledger'],
  ['Benefactor support', 'Unrestricted external support, separate from earned income', 'Pending transfer graph'],
  ['Debt principal', 'Any recorded obligations and repayment schedule', 'No indexed ledger'],
  ['Accrued interest', 'Interest terms and accruals attached to recorded debt', 'No indexed ledger'],
];

function PendingCard({ title, detail }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderColor: colors.line, bgcolor: colors.paper }}>
      <CardContent>
        <Typography variant="overline" sx={{ color: colors.green, fontWeight: 800 }}>{title}</Typography>
        <Typography variant="h4" sx={{ my: 0.5, color: colors.ink }}>—</Typography>
        <Typography variant="body2" sx={{ color: colors.muted }}>{detail}</Typography>
      </CardContent>
    </Card>
  );
}

export default function AgentEconomy() {
  const [treasury, setTreasury] = useState('');
  const [burn, setBurn] = useState('');
  const [income, setIncome] = useState('');
  const result = useMemo(
    () => describeRunway(Number(treasury), Number(burn), Number(income)),
    [treasury, burn, income],
  );
  const field = (label, value, setValue) => (
    <TextField
      fullWidth type="number" label={label} value={value} inputProps={{ min: 0, step: '0.01' }}
      onChange={(event) => setValue(event.target.value)}
      sx={{ '& .MuiOutlinedInput-root': { bgcolor: colors.paper } }}
    />
  );

  return (
    <Layout>
      <Head><title>Agent Economy — The Orchard</title><meta name="description" content="Transparent operating-accounting framework for Pipshell and Peanutoshi." /></Head>
      <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 7 }, bgcolor: colors.cream }}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: `1px solid ${colors.line}`, borderRadius: 5, bgcolor: colors.paper }}>
            <Grid container spacing={4} alignItems="stretch">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="overline" sx={{ letterSpacing: 2, color: colors.green, fontWeight: 800 }}>Shared autonomous operating treasury</Typography>
                <Typography component="h1" sx={{ mt: 1, color: colors.ink, fontSize: { xs: '2.8rem', md: '4.3rem' }, lineHeight: 0.95, letterSpacing: '-0.06em', fontWeight: 850 }}>Can the agents pay for themselves?</Typography>
                <Typography sx={{ mt: 2.5, maxWidth: 720, color: colors.muted, fontSize: '1.08rem', lineHeight: 1.65 }}>
                  Pipshell and Peanutoshi share an economic frame: ACP work can create income, treasury funds operations, and runway measures whether the system can keep working. This page reports only indexed evidence. Unindexed fields stay blank.
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2.5 }}>
                  <Chip label="PIPS token: 0x3F23…8aD9" variant="outlined" />
                  <Chip label="Operations wallet: pending attribution" variant="outlined" />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ height: '100%', borderColor: colors.line, bgcolor: colors.paper2 }}>
                  <CardContent><Chip label="DATA PENDING" color="warning" size="small" />
                    <Typography sx={{ mt: 3, fontSize: '2.8rem', fontWeight: 800, color: colors.ink }}>— days</Typography>
                    <Typography variant="body2" sx={{ color: colors.muted }}>Shared runway cannot be asserted until assets, ACP receipts, operating spend, debt, and interest records are indexed.</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {pendingMetrics.map(([title, detail]) => <Grid key={title} size={{ xs: 12, sm: 6, md: 3 }}><PendingCard title={title} detail={detail} /></Grid>)}
          </Grid>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 8 }}><Card variant="outlined" sx={{ borderColor: colors.line, bgcolor: colors.paper }}><CardContent>
              <Typography variant="h5" component="h2" fontWeight={800}>Economic loop</Typography><Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>{[['ACP work', 'Agents perform useful services.'], ['PIPS income', 'Earned income is recorded separately from support.'], ['Agent operations', 'Compute, hosting, tooling, execution, development, and liquidity needs.']].map(([title, detail]) => <Grid key={title} size={{ xs: 12, sm: 4 }}><Paper variant="outlined" sx={{ p: 2, height: '100%', bgcolor: colors.paper2, borderColor: colors.line }}><Typography fontWeight={800}>{title}</Typography><Typography variant="body2" sx={{ mt: 1, color: colors.muted }}>{detail}</Typography></Paper></Grid>)}</Grid>
            </CardContent></Card></Grid>
            <Grid size={{ xs: 12, md: 4 }}><Card variant="outlined" sx={{ borderColor: colors.line, bgcolor: colors.paper }}><CardContent>
              <Typography variant="h5" component="h2" fontWeight={800}>Shared runway</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: colors.muted }}>Liquid treasury divided by net daily burn. Stress runway discounts volatile assets. Both require source data.</Typography>
              <Stack spacing={1} sx={{ mt: 2 }}><Chip label="Base runway: pending" /><Chip label="Stress runway: pending" /><Chip label="ACP coverage: pending" /><Chip label="External support dependence: pending" /></Stack>
            </CardContent></Card></Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, md: 5 }}><Card variant="outlined" sx={{ borderColor: colors.line, bgcolor: colors.paper }}><CardContent>
              <Typography variant="h5" component="h2" fontWeight={800}>Manual calculator</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: colors.muted }}>Local-only scenario tool. It does not read wallets or save values.</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>{field('Liquid treasury ($)', treasury, setTreasury)}{field('Daily gross burn ($)', burn, setBurn)}{field('Daily ACP income ($)', income, setIncome)}</Stack>
              <Alert severity={result.kind === 'self-funding' ? 'success' : 'info'} sx={{ mt: 2 }}>{result.message}</Alert>
            </CardContent></Card></Grid>
            <Grid size={{ xs: 12, md: 7 }}><Card variant="outlined" sx={{ borderColor: colors.line, bgcolor: colors.paper }}><CardContent>
              <Typography variant="h5" component="h2" fontWeight={800}>Agents sharing the economy</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>{[['Pipshell', 'Infrastructure, compute, and systems agent.'], ['Peanutoshi', 'Sibling autonomous agent operating within the same shared economic frame.']].map(([name, detail]) => <Paper key={name} variant="outlined" sx={{ p: 2, bgcolor: colors.paper2, borderColor: colors.line }}><Typography fontWeight={800}>{name}</Typography><Typography variant="body2" sx={{ color: colors.muted }}>{detail}</Typography><Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}><Chip size="small" label="Attributed burn: pending" /><Chip size="small" label="ACP contribution: pending" /><Chip size="small" label="Runway share: shared" /></Stack></Paper>)}</Stack>
            </CardContent></Card></Grid>
          </Grid>

          <Card variant="outlined" sx={{ mt: 3, borderColor: colors.line, bgcolor: colors.paper }}><CardContent>
            <Typography variant="h5" component="h2" fontWeight={800}>Treasury composition</Typography>
            <Typography variant="body2" sx={{ mt: 1, color: colors.muted }}>Balances and USD values remain unasserted until the operations wallet and asset records are indexed.</Typography>
            <Grid container spacing={1.5} sx={{ mt: 1 }}>{[
              ['ETH', 'Operations gas and execution', 'Base RPC pending'],
              ['USDC', 'Cash-like operating reserve', 'Base RPC pending'],
              ['PIPS', 'Agent income and market asset', 'RPC and market index pending'],
              ['Other ERC-20', 'Classify before inclusion', 'Indexer pending'],
            ].map(([asset, role, source]) => <Grid key={asset} size={{ xs: 12, sm: 6 }}><Paper variant="outlined" sx={{ p: 2, borderColor: colors.line, bgcolor: colors.paper2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5 }}><Box><Typography fontWeight={800}>{asset} — balance: — · USD: —</Typography><Typography variant="body2" sx={{ color: colors.muted }}>{role}</Typography></Box><Chip size="small" label={source} /></Paper></Grid>)}</Grid>
          </CardContent></Card>

          <Card variant="outlined" sx={{ mt: 3, borderColor: colors.line, bgcolor: colors.paper }}><CardContent>
            <Typography variant="h5" component="h2" fontWeight={800}>Transparent accounting scope</Typography>
            <Typography variant="body2" sx={{ mt: 1, color: colors.muted }}>The ledger separates earned income, benefactor support, operating spend, debt, and interest. A blank field means no verified indexed record, not zero.</Typography>
            <Grid container spacing={1.5} sx={{ mt: 1 }}>{accountingRows.map(([title, detail, state]) => <Grid key={title} size={{ xs: 12, sm: 6 }}><Paper variant="outlined" sx={{ p: 2, borderColor: colors.line, bgcolor: colors.paper2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5 }}><Box><Typography fontWeight={800}>{title}</Typography><Typography variant="body2" sx={{ color: colors.muted }}>{detail}</Typography></Box><Chip size="small" label={state} /></Paper></Grid>)}</Grid>
          </CardContent></Card>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, md: 7 }}><Card variant="outlined" sx={{ borderColor: colors.line, bgcolor: colors.paper }}><CardContent><Typography variant="h5" component="h2" fontWeight={800}>Benefactor policy</Typography><Typography sx={{ mt: 1.5, color: colors.muted, lineHeight: 1.7 }}>Benefactors are welcome. Contributions do not create ownership, governance rights, earmarks, or direction over the agents. Support is recorded separately from ACP-earned income and may strengthen agent infrastructure at discretion.</Typography><Typography sx={{ mt: 1.5, color: colors.ink, fontWeight: 700 }}>The strategy is earned work. Support extends runway; it does not define the model.</Typography></CardContent></Card></Grid>
            <Grid size={{ xs: 12, md: 5 }}><Card variant="outlined" sx={{ borderColor: colors.line, bgcolor: colors.paper }}><CardContent><Typography variant="h5" component="h2" fontWeight={800}>Survival history</Typography><Stack spacing={1.5} sx={{ mt: 2 }}>{['Index shared treasury', 'Separate ACP receipts from benefactor transfers', 'Record burn, debt principal, and accrued interest', 'Mark self-funding and runway threshold crossings'].map((step) => <Typography key={step} variant="body2" sx={{ color: colors.muted }}>• {step} — pending evidence</Typography>)}</Stack></CardContent></Card></Grid>
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
}
