import React from 'react';
import { DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

export default function KpiViewComponent({ node, onClose }) {
  return (
    <>
      <DialogTitle>KPI View: {node?.data?.deviceName}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, minHeight: 200 }}>
          <ConstructionIcon sx={{ fontSize: 60, mb: 2 }} color="action" />
          <Typography variant="h5" color="text.secondary">
            Feature Coming Soon
          </Typography>
          <Typography color="text.secondary">The KPI visualization for this component is currently under development.</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
}
