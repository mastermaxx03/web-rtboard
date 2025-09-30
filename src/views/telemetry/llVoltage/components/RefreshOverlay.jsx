import React from 'react';
import { Box } from '@mui/material';
import logo from '../assets/esm-rotate-loading.png';

export default function RefreshOverlay({ show, size = 100 }) {
  if (!show) return null;
  return (
    <Box
      aria-label="Refreshing data"
      role="status"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(245,247,251,0.55)',
        backdropFilter: 'blur(0.1px)',
        WebkitBackdropFilter: 'blur(0.1px)'
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          animation: 'spin 2s linear infinite',
          '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(540deg)' } }
        }}
      >
        <img
          src={logo}
          alt="Loading"
          style={{ width: '100%', height: '100%', display: 'block', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.15))' }}
        />
      </Box>
    </Box>
  );
}
