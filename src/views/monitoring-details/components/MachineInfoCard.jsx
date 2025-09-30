import React from 'react';
import { Card, CardContent, CardMedia, Typography, Stack, Box, Chip } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PowerOffIcon from '@mui/icons-material/PowerOff';

const MachineInfoCard = ({
  imageUrl = 'https://via.placeholder.com/150',
  panelName = 'Panel A1',
  rating = '20 kW',
  isCloudConnected = true,
  isPoweredOn = true
}) => {
  return (
    <Card sx={{ display: 'flex', width: 350, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 5, margin: '6px' }}>
      <CardMedia component="img" sx={{ width: 120, objectFit: 'cover' }} image={imageUrl} alt="Panel" />

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h3">{panelName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Rating: {rating}
          </Typography>

          <Stack direction="row" spacing={1} mt={1}>
            <Chip
              icon={isCloudConnected ? <CloudIcon color="primary" /> : <CloudOffIcon color="error" />}
              label={isCloudConnected ? 'Connected' : 'Disconnected'}
              variant="outlined"
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={1} mt={1}>
            <Chip
              icon={isPoweredOn ? <PowerSettingsNewIcon color="success" /> : <PowerOffIcon color="error" />}
              label={isPoweredOn ? 'ON' : 'OFF'}
              variant="outlined"
              size="small"
            />
          </Stack>
        </CardContent>
      </Box>
    </Card>
  );
};

export default MachineInfoCard;
