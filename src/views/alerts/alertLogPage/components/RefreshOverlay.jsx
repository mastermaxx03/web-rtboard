import React from 'react';
import { Box } from '@mui/material';

/**
 * Full-page overlay shown while refreshing (not on first load).
 * - Backdrop blur(0.1px) to keep background visible but soft
 * - Company logo spins
 */
export default function RefreshOverlay({ show, logoSrc = './assets/esm-rotate-loading.png', size = 100 }) {
  if (!show) return null;

  return (
    <Box
      aria-label="Refreshing data"
      role="status"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000, // above page chrome/KPI
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // subtle frosted glass
        backgroundColor: 'rgba(245,247,251,0.55)',
        backdropFilter: 'blur(0.1px)',
        WebkitBackdropFilter: 'blur(0.1px)',
        transition: 'opacity 160ms ease',
        pointerEvents: 'auto'
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          animation: 'spin 1.25s linear infinite',
          '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(540deg)' } }
        }}
      >
        <img
          src={logoSrc}
          alt="Loading"
          style={{ width: '100%', height: '100%', display: 'block', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.15))' }}
        />
      </Box>
    </Box>
  );
}
