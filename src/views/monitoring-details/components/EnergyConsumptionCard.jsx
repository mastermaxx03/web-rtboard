import React from 'react';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

const EnergyConsumptionCard = () => {
  return (
    <Card sx={{ width: 350, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 5, margin: '6px', padding: 1 }}>
      <CardHeader
        title="Energy Consumption"
        action={
          <Typography variant="caption">
            <HistoryIcon color="inherit" />
          </Typography>
        }
        sx={{ pb: 0, pl: 1, pr: 2, pt: 1 }}
      />

      <CardContent sx={{ textAlign: 'center', pt: 4, pb: '10px !important' }}>
        <Typography variant="h2" fontWeight="bold" mb={1}>
          2378.4 kWh
        </Typography>
        <br />
        <Box display="flex" justifyContent="space-between">
          <Typography fontSize={18} variant="caption">
            964.7 kWh
          </Typography>
          <Typography fontSize={18} variant="caption">
            |
          </Typography>
          <Typography fontSize={18} variant="caption">
            1413.8 kWh
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EnergyConsumptionCard;
