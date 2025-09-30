// A compact, MCC-like stepper. No global styles, no external deps beyond MUI.

import React from 'react';
import { Stepper, Step, StepLabel, StepConnector, Box, Tooltip, styled } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

// ───────────────── styled bits ─────────────────
const Connector = styled(StepConnector)(({ theme }) => ({
  [`& .${StepConnector.line}`]: {
    height: 2,
    border: 0,
    borderRadius: 1,
    background: theme.palette.mode === 'light' ? 'linear-gradient(90deg, #e5e9f2 0%, #e5e9f2 100%)' : theme.palette.divider
  }
}));

const Dot = styled('div')(({ theme, state }) => {
  const blue = theme.palette.primary.main;
  const gray = theme.palette.grey[300];
  const darkText = theme.palette.mode === 'light' ? '#0b2237' : theme.palette.grey[100];

  const base = {
    width: 38,
    height: 38,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: 0.2,
    boxShadow: state === 'active' ? '0 2px 8px rgba(30,167,253,0.35)' : 'inset 0 0 0 1px rgba(0,0,0,0.06)',
    transition: 'all 140ms ease'
  };

  if (state === 'completed') {
    return {
      ...base,
      color: '#fff',
      background: 'linear-gradient(180deg, #34c759 0%, #20b14a 100%)'
    };
  }
  if (state === 'active') {
    return {
      ...base,
      color: '#fff',
      background: `linear-gradient(180deg, ${blue} 0%, ${theme.palette.primary.dark} 100%)`
    };
  }
  return {
    ...base,
    color: darkText,
    background: `linear-gradient(180deg, #f6f9ff 0%, ${theme.palette.grey[200]} 100%)`
  };
});

const Label = styled('div')(({ theme, active }) => ({
  marginTop: 6,
  fontSize: 12,
  fontWeight: 700,
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  textAlign: 'center',
  whiteSpace: 'nowrap'
}));

// ───────────────── component ─────────────────
function Bubble({ index, active, completed, icon }) {
  const state = completed ? 'completed' : active ? 'active' : 'idle';
  return (
    <Box sx={{ position: 'relative' }}>
      <Dot state={state}>{completed ? <CheckIcon fontSize="small" /> : (icon ?? index + 1)}</Dot>
    </Box>
  );
}

/**
 * props:
 *  - steps: [{ label, shortLabel?, icon? }]
 *  - activeStep: number
 *  - onStepClick?: (index:number)=>void
 */
export default function CompactStepper({ steps = [], activeStep = 0, onStepClick }) {
  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep}
      connector={<Connector />}
      sx={{
        mb: 2,
        '& .MuiStep-root': { px: { xs: 0.5, sm: 1 } },
        '& .MuiStepLabel-label': { display: 'none' }
      }}
    >
      {steps.map((s, i) => {
        const active = i === activeStep;
        const completed = i < activeStep;
        const handle = onStepClick ? () => onStepClick(i) : undefined;
        return (
          <Step key={s.label || i} completed={completed} onClick={handle} sx={{ cursor: onStepClick ? 'pointer' : 'default' }}>
            <StepLabel icon={<Bubble index={i} active={active} completed={completed} icon={s.icon} />} />
            <Tooltip title={s.label} placement="top">
              <Label active={active}>{s.shortLabel || s.label}</Label>
            </Tooltip>
          </Step>
        );
      })}
    </Stepper>
  );
}
