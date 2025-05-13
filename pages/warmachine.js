import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';

const COOLDOWN_PERIOD_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const LOCAL_STORAGE_KEY_LAST_ACTION = 'warmachineLastActionTime';
const MAX_OUTCOMES_HISTORY = 15;

const factions = ["Peanuts", "Almonds", "Walnuts", "Cashews"];
const actions = ["Attack", "Defend", "Rally", "Scheme", "Trade"];

// Initial Faction Stats (client-side fallback or initial structure before API load)
const initialFactionStats = factions.reduce((acc, faction) => {
  acc[faction] = {
    morale: 0, // Will be overwritten by API
    territories: 0, // Renamed from territoriesControlled, will be overwritten by API
    specialAbility: "Loading...", // Will be overwritten by API
  };
  return acc;
}, {});

// Initial map setup - Simple map representation of the 9x9 grid
const initialMap = Array(9).fill().map(() => Array(9).fill('neutral'));

// Utility function to get color for a faction
const getFactionColor = (faction) => {
  switch (faction) {
    case 'Peanuts': return '#FDE8B1'; // Light peanut color
    case 'Almonds': return '#D4A373'; // Almond color
    case 'Walnuts': return '#A47C6F'; // Added color for Walnuts
    case 'Cashews': return '#E7C8A0'; // Cashew color
    default: return '#E2D5C3'; // Neutral territory
  }
};

export default function WarMachinePage() {
  const [outcomes, setOutcomes] = useState([]);
  const [factionStats, setFactionStats] = useState(initialFactionStats);
  const [isLoading, setIsLoading] = useState(false); // For general loading like submit
  const [isStateLoading, setIsStateLoading] = useState(true); // For initial state load
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedFaction, setSelectedFaction] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [error, setError] = useState('');
  const [map, setMap] = useState(initialMap);

  // Check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn("localStorage is not available:", e);
      return false;
    }
  };

  const localStorageAvailable = React.useMemo(() => isLocalStorageAvailable(), []);

  // Load initial game state from API on mount
  useEffect(() => {
    const fetchInitialState = async () => {
      setIsStateLoading(true);
      try {
        const response = await fetch('/api/getWarmachineState');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch game state');
        }
        const data = await response.json();
        setOutcomes(data.outcomes || []);
        // Ensure factionStats on the client matches the factions array
        const receivedStats = data.factionStats || {};
        const updatedClientStats = factions.reduce((acc, factionName) => {
            acc[factionName] = receivedStats[factionName] || {
                morale: 0, 
                territories: 0, 
                specialAbility: "N/A"
            };
            return acc;
        }, {});
        setFactionStats(updatedClientStats);

      } catch (e) {
        console.error("Failed to load initial game state from API:", e);
        setError(`Failed to load game state: ${e.message}. Some features might be unavailable.`);
        // Keep client-side initialFactionStats as a fallback
        setFactionStats(initialFactionStats);
        setOutcomes([]);
      } finally {
        setIsStateLoading(false);
      }
    };
    fetchInitialState();
  }, []); // Runs once on mount

  // Simulate map updates based on outcomes
  useEffect(() => {
    const newMap = initialMap.map(row => [...row]);
    // Simplified: last 5 outcomes influence the map for visual flair
    outcomes.slice(0, 5).forEach((outcome) => {
      if (outcome.faction && factions.includes(outcome.faction)) {
        const r = Math.abs(outcome.faction.charCodeAt(0) + (outcome.action?.charCodeAt(0) || 0)) % 9;
        const c = Math.abs(outcome.faction.charCodeAt(0) - (outcome.action?.charCodeAt(0) || 0)) % 9;
        if (newMap[r] && newMap[r][c] !== undefined) { // Check if r and c are valid indices
          newMap[r][c] = outcome.faction;
        }
      }
    });
    setMap(newMap);
    // Territory counts in factionStats table are now directly from server, no client-side recalculation needed here.
  }, [outcomes]); // Removed 'factions' dependency as it's stable

  const updateCooldown = useCallback(() => {
    if (localStorageAvailable) {
      try {
        const lastActionTime = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_ACTION);
        if (lastActionTime) {
          const timePassed = Date.now() - parseInt(lastActionTime, 10);
          const newTimeLeft = Math.max(0, COOLDOWN_PERIOD_MS - timePassed);
          setTimeLeft(newTimeLeft);
        } else {
          setTimeLeft(0);
        }
      } catch (e) {
        console.warn("Error accessing localStorage in updateCooldown:", e);
        setTimeLeft(0);  // Ensure button is enabled if localStorage fails
      }
    } else {
      // If localStorage isn't available, don't enforce cooldown
      setTimeLeft(0);
    }
  }, [localStorageAvailable]);

  useEffect(() => {
    updateCooldown();
    const intervalId = setInterval(updateCooldown, 1000); // Update every second
    return () => clearInterval(intervalId);
  }, [updateCooldown]);

  const handleSubmit = async () => {
    if (timeLeft > 0 || !selectedFaction || !selectedAction) {
      if (timeLeft > 0) setError(`Action on cooldown. Please wait ${Math.ceil(timeLeft / 1000 / 60)} minutes.`);
      if (!selectedFaction) setError("Please select a faction.");
      if (!selectedAction) setError("Please select an action.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/warmachineAction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faction: selectedFaction,
          action: selectedAction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to perform action due to a server error.');
      }

      const newOutcome = {
        timestamp: new Date().toLocaleString(),
        faction: selectedFaction,
        action: selectedAction,
        narrative: data.narrative || "Peanutoshi has gone silent...",
        effects: data.effects || "No visible effects",
        imageUrl: data.imageUrl, // Image URL from API response
      };

      // Update outcomes: add new one to the beginning, limit history
      setOutcomes(prev => [newOutcome, ...prev.slice(0, MAX_OUTCOMES_HISTORY - 1)]);
      
      // Update faction stats with the data from the API response
      if (data.updatedFactionStats) {
        // Ensure client-side factionStats structure is maintained for all factions
        const receivedStats = data.updatedFactionStats;
        const updatedClientStats = factions.reduce((acc, factionName) => {
            acc[factionName] = receivedStats[factionName] || (factionStats[factionName] || {
                morale: 0, 
                territories: 0, 
                specialAbility: "N/A"
            });
            return acc;
        }, {});
        setFactionStats(updatedClientStats);
      } else {
        // Fallback or error if updatedFactionStats is not in response
        console.warn("updatedFactionStats not received from API. Stats may be stale.");
      }

      if (localStorageAvailable) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_LAST_ACTION, Date.now().toString());
        } catch (e) {
          console.warn("Failed to save action timestamp to localStorage:", e);
        }
      }
      
      setTimeLeft(COOLDOWN_PERIOD_MS); // Reset cooldown even if localStorage fails
      // Optionally clear selections after successful submission
      // setSelectedFaction('');
      // setSelectedAction('');

    } catch (err) {
      console.error('Action failed:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Nut War Battlefield | BASED NUT</title>
        <meta name="description" content="Engage in the Nut War, led by Peanutoshi Nutkamoto. Choose your faction and action, and witness the chaotic outcomes." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            🥜 Nut War Battlefield 💣
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
            The fate of the Nutverse is in your hands! Choose wisely, or don&apos;t... Peanutoshi loves chaos.
          </Typography>

          {isStateLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3}}><CircularProgress /><Typography sx={{ml:2}}>Loading Game State...</Typography></Box>
          ) : (
            <>
              {/* Faction Stats Display */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                  Faction Standings
                </Typography>
                <TableContainer component={Paper} elevation={2}>
                  <Table size="small" aria-label="faction stats table">
                    <TableHead sx={{ backgroundColor: 'primary.light' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Faction</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Morale</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Territories</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Special Ability</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {factions.map((factionName) => (
                        <TableRow key={factionName} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                            {factionName}
                          </TableCell>
                          <TableCell align="right">{factionStats[factionName]?.morale || 0}</TableCell>
                          <TableCell align="right">{factionStats[factionName]?.territories || 0}</TableCell>
                          <TableCell>{factionStats[factionName]?.specialAbility || 'None'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Map Visualization */}
              <Box 
                sx={{ 
                  width: '100%', 
                  maxWidth: '400px', 
                  height: '200px', 
                  margin: '0 auto 24px auto',
                  border: '3px solid #7D5A50', 
                  borderRadius: 2,
                  backgroundColor: '#F4E3CF',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(9, 1fr)',
                  gridTemplateRows: 'repeat(9, 1fr)',
                  gap: '2px',
                  p: 1,
                  boxShadow: 2
                }}
                aria-label="Nut War Battlefield Map"
              >
                {map.map((row, rowIndex) => (
                  row.map((cell, colIndex) => (
                    <Box 
                      key={`${rowIndex}-${colIndex}`} 
                      sx={{
                        backgroundColor: getFactionColor(cell),
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 1
                        }
                      }}
                      title={`Tile ${String.fromCharCode(65 + rowIndex)}${colIndex + 1}: ${cell !== 'neutral' ? `Controlled by ${cell}` : 'Neutral Territory'}`}
                    />
                  ))
                ))}
              </Box>

              {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}

              <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="faction-select-label">Select Faction</InputLabel>
                    <Select
                      labelId="faction-select-label"
                      id="faction-select"
                      value={selectedFaction}
                      label="Select Faction"
                      onChange={(e) => setSelectedFaction(e.target.value)}
                    >
                      <MenuItem value=""><em>-- Select Faction --</em></MenuItem>
                      {factions.map(faction => (
                        <MenuItem key={faction} value={faction}>{faction}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="action-select-label">Select Action</InputLabel>
                    <Select
                      labelId="action-select-label"
                      id="action-select"
                      value={selectedAction}
                      label="Select Action"
                      onChange={(e) => setSelectedAction(e.target.value)}
                    >
                      <MenuItem value=""><em>-- Select Action --</em></MenuItem>
                      {actions.map(action => (
                        <MenuItem key={action} value={action}>{action}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                disabled={isLoading || timeLeft > 0 || !selectedFaction || !selectedAction}
                sx={{ 
                  minWidth: { xs: '100%', sm: '200px' }, 
                  height: '56px', 
                  mb: 2,
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  background: "linear-gradient(45deg, #7D5A50, #A67C52)",
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Engage in Battle!'}
              </Button>

              {timeLeft > 0 && (
                <Typography variant="h6" sx={{ color: 'secondary.main', mb: 2, fontWeight: 'medium' }}>
                  Next action in: {Math.floor(timeLeft / 1000 / 60)}m {Math.ceil((timeLeft / 1000) % 60)}s
                </Typography>
              )}
            </>
          )}
        </Paper>

        <Typography variant="h5" component="h2" sx={{ mt: 5, mb: 3, textAlign: 'center', fontWeight: 'bold', color: 'text.primary' }}>
          📜 War Chronicle 📜
        </Typography>
        {isStateLoading && outcomes.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3}}><CircularProgress /><Typography sx={{ml:2}}>Loading Chronicle...</Typography></Box>
        ) : outcomes.length === 0 && !isLoading ? (
          <Typography sx={{textAlign: 'center', fontStyle: 'italic', color: 'text.secondary'}}>No actions recorded yet. Be the first to shape history!</Typography>
        ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2}}>
          <Table aria-label="war outcomes history" sx={{ minWidth: { xs: '100%', md: 650 } }}>
            <TableHead sx={{ backgroundColor: 'grey.200' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell'} }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Faction</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Narrative</TableCell>
                <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell'} }}>Effects</TableCell>
                {outcomes.some(o => o.imageUrl) && <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell'} }}>Scene</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {outcomes.map((outcome, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }, '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell'} }}>{outcome.timestamp}</TableCell>
                  <TableCell>{outcome.faction}</TableCell>
                  <TableCell>{outcome.action}</TableCell>
                  <TableCell>{outcome.narrative}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell'} }}>{outcome.effects}</TableCell>
                  {outcomes.some(o => o.imageUrl) && (
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell'} }}>
                      {outcome.imageUrl ? <img src={outcome.imageUrl} alt={`Scene of ${outcome.narrative.substring(0, 50)}...`} style={{maxWidth: '80px', maxHeight: '80px', borderRadius: '4px', objectFit: 'cover', cursor: 'pointer'}} onClick={() => window.open(outcome.imageUrl, '_blank')} /> : '-'}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Container>
      <Footer />
    </>
  );
}
