import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import { useLobby } from '../context/LobbyContext';

const RaceHud = () => {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const { snapshot, playerId } = useLobby();
  const [finishers, setFinishers] = useState<string[]>([]);

  useEffect(() => {
    if (!snapshot?.raceActive && finishers.length) {
      return;
    }
    if (!snapshot?.raceActive && !finishers.length) {
      const winners = snapshot?.players
        ?.filter((player) => player.position >= 1)
        .map((player) => player.displayName);
      if (winners && winners.length) {
        setFinishers(winners);
      }
    }
  }, [snapshot, finishers.length]);

  const orderedPlayers = useMemo(
    () => snapshot?.players.sort((a, b) => b.position - a.position) ?? [],
    [snapshot?.players]
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 10,
        background: 'radial-gradient(circle at 20% 20%, rgba(77,208,225,0.2), rgba(3,7,18,0.95))'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 6 }}>
          Heatwave Heights - Street Pursuit
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(148,163,184,0.2)' }}>
              <Typography variant="h5" gutterBottom>
                Positioning
              </Typography>
              {orderedPlayers.map((player, index) => (
                <Box key={player.playerId} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: playerId === player.playerId ? 'secondary.main' : 'inherit' }}>
                    #{index + 1} {player.displayName}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, player.position * 100)}
                    sx={{ height: 12, borderRadius: 2, backgroundColor: 'rgba(15,23,42,0.6)' }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, background: 'rgba(10,16,30,0.9)', border: '1px solid rgba(77,208,225,0.3)' }}>
              <Typography variant="h6" gutterBottom>
                Race Feed
              </Typography>
              {finishers.length ? (
                <Box>
                  <Typography variant="subtitle1">Finish Order</Typography>
                  {finishers.map((driver, index) => (
                    <Typography key={driver} variant="body1">
                      {index + 1}. {driver}
                    </Typography>
                  ))}
                  <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/')}>Return to Menu</Button>
                </Box>
              ) : (
                <Typography variant="body2">Keep the pedal down, you're still in the heat!</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RaceHud;
