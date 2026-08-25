import Head from 'next/head';
import { useState } from 'react';
import { Box, Button, Card, CardContent, Checkbox, Container, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import Layout from '../components/Layout';

const cream = '#f3efe5';
const paper = '#fffdf7';
const ink = '#26231d';
const brown = '#6d4f2e';
const line = '#d9cfbd';
const grievances = ['Price went down', 'Price went up without me', 'Someone said “wen moon”', 'Insufficient NUT exposure', 'Excessive NUT exposure', 'Liquidity-related emotional damage', 'Other weak-handed behavior'];

export default function Complaints() {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState('');
  const [responsible, setResponsible] = useState('The market');
  const [statement, setStatement] = useState('');
  const [stage, setStage] = useState('form');
  const toggle = (item) => setSelected((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  const reset = () => { setName(''); setSelected([]); setSeverity(''); setResponsible('The market'); setStatement(''); setStage('form'); };
  const submit = (event) => { event.preventDefault(); setStage('receipt'); };

  return <Layout><Head><title>NUT Department of Complaints — The Orchard</title><meta name="description" content="A local-only ceremonial complaint desk for emotional liquidity." /></Head>
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 7 }, bgcolor: cream }}><Container maxWidth="md">
      <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: 5, border: `1px solid ${line}`, bgcolor: paper }}>
        <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ece2cd', borderBottom: `1px solid ${line}` }}>
          <Typography variant="overline" sx={{ color: brown, letterSpacing: 2, fontWeight: 800 }}>The Orchard · Bureau of ceremonial resolution</Typography>
          <Typography component="h1" sx={{ mt: 1, fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 0.98, letterSpacing: '-0.06em', fontWeight: 850, color: ink }}>NUT Department of Complaints & Emotional Liquidity</Typography>
          <Typography sx={{ mt: 2, color: '#655d51' }}>Charts may move independently of your expectations, timing, conviction, personal narrative, or group-chat consensus.</Typography>
        </Box>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          {stage === 'form' && <Box component="form" onSubmit={submit}><Stack spacing={3}>
            <TextField label="0. Complainant of record" value={name} inputProps={{ maxLength: 80 }} onChange={(event) => setName(event.target.value)} placeholder="Legal-ish name" />
            <FormControl><FormLabel sx={{ color: ink, fontWeight: 800 }}>1. Nature of grievance</FormLabel><Grid container sx={{ mt: 1 }}>{grievances.map((item) => <Grid key={item} size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Checkbox checked={selected.includes(item)} onChange={() => toggle(item)} />} label={item} /></Grid>)}</Grid></FormControl>
            <FormControl required><FormLabel sx={{ color: ink, fontWeight: 800 }}>2. Severity</FormLabel><RadioGroup value={severity} onChange={(event) => setSeverity(event.target.value)} row><FormControlLabel value="Mildly Salted" control={<Radio />} label="🥜 Mildly Salted" /><FormControlLabel value="Roasted" control={<Radio />} label="🥜🥜 Roasted" /><FormControlLabel value="Absolutely NUTTERED" control={<Radio />} label="🥜🥜🥜 Absolutely NUTTERED" /></RadioGroup></FormControl>
            <FormControl><FormLabel sx={{ color: ink, fontWeight: 800 }}>3. Who is responsible?</FormLabel><RadioGroup value={responsible} onChange={(event) => setResponsible(event.target.value)}>{['The market', 'The bonding curve', 'Arbitrageurs', 'Myself, unfortunately', 'Jeff'].map((item) => <FormControlLabel key={item} value={item} control={<Radio />} label={item} />)}</RadioGroup></FormControl>
            <TextField label="4. Supporting emotional evidence" multiline minRows={4} value={statement} inputProps={{ maxLength: 700 }} onChange={(event) => setStatement(event.target.value)} placeholder="Describe what the market did to you" />
            <Button type="submit" variant="contained" disabled={!severity} sx={{ py: 1.5, bgcolor: brown, '&:hover': { bgcolor: '#50391f' } }}>Submit Formal Grievance →</Button>
            <Typography variant="caption" sx={{ color: '#655d51' }}>This ceremonial form is local-only. Nothing is sent, stored, or submitted.</Typography>
          </Stack></Box>}
          {stage === 'receipt' && <Stack spacing={3} alignItems="flex-start"><Typography variant="h4" fontWeight={850} color={ink}>Your grievance exists now.</Typography><Typography>Complainant of record: <b>{name || 'Anonymous NUT'}</b></Typography><Typography>Primary responsibility assigned to: <b>{responsible}</b>.</Typography><Typography>Current estimated resolution: the next candle.</Typography><Button variant="contained" onClick={() => setStage('ruling')} sx={{ bgcolor: brown, '&:hover': { bgcolor: '#50391f' } }}>Escalate to Peanutoshi</Button><Button onClick={reset}>File Another Complaint</Button></Stack>}
          {stage === 'ruling' && <Grid container spacing={3} alignItems="center"><Grid size={{ xs: 12, md: 5 }}><Box component="img" src="/img/peanut.webp" alt="Peanutoshi issuing a ceremonial ruling" sx={{ width: '100%', borderRadius: 3, border: `1px solid ${line}` }} /></Grid><Grid size={{ xs: 12, md: 7 }}><Stack spacing={2}><Typography variant="h4" fontWeight={850} color={ink}>Peanutoshi has ruled.</Typography><Typography>Peanutoshi reviewed the blockchain and determined that markets remain stubbornly indifferent to individual expectations.</Typography><Typography><b>Recommended treatment:</b> breathe, read the pool, size risk, grow your NUTS.</Typography><Typography variant="caption">Reason code: USER_EXPECTATION ≠ MARKET_STATE</Typography><Button variant="contained" onClick={reset} sx={{ bgcolor: brown, '&:hover': { bgcolor: '#50391f' } }}>Grow Your NUTS</Button></Stack></Grid></Grid>}
        </CardContent>
      </Paper>
    </Container></Box>
  </Layout>;
}
