import { Box, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { useLobby } from '../context/LobbyContext';

const Garage = () => {
  const { cars } = useLobby();
  return (
    <Box sx={{ minHeight: '100vh', py: 8, background: 'radial-gradient(circle at top, rgba(255,145,0,0.4), rgba(3,7,18,0.95))' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 700 }}>
          Blacklist Garage
        </Typography>
        <Grid container spacing={4}>
          {cars.map((car) => (
            <Grid item xs={12} md={4} key={car.id}>
              <Card sx={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(77,208,225,0.2)' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {car.name}
                  </Typography>
                  <Typography variant="subtitle1">Class: {car.car_class.toUpperCase()}</Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Acceleration: {(car.acceleration * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2">Top Speed: {(car.top_speed * 100).toFixed(0)}%</Typography>
                  <Typography variant="body2">Handling: {(car.handling * 100).toFixed(0)}%</Typography>
                  <Typography variant="body2">Nitro: {(car.nitro * 100).toFixed(0)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Garage;
