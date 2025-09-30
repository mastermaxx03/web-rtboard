import React from 'react';
import { Box, Stack, Typography, Chip } from '@mui/material';
import ElectricalServicesOutlinedIcon from '@mui/icons-material/ElectricalServicesOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';

export default function FormTypeHeader({ type = 'HT', deviceId, sx }) {
  const MAP = {
    LT:  { label: 'LT Device Properties',  Icon: ElectricalServicesOutlinedIcon, chip: 'LT Form' },
    HT:  { label: 'HT Device Properties',  Icon: BoltOutlinedIcon,                chip: 'HT Form' },
    MCC: { label: 'MCC Device Properties', Icon: HandymanOutlinedIcon,            chip: 'MCC Form' }
  };

  const { label, Icon, chip } = MAP[type] || MAP.HT;

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Icon fontSize="large" color="primary" />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            letterSpacing: 0.2,
            lineHeight: 1.15,
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          {label}
        </Typography>
      </Stack>

      {deviceId ? (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
          Device ID: {deviceId}
        </Typography>
      ) : null}
    </Box>
  );
}
