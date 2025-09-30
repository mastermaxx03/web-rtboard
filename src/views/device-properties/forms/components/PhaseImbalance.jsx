// PhaseImbalanceThresholds.jsx
import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Box,
} from '@mui/material';

import ComboInputField from './ComboInputField';

// IEC defaults for phase imbalance (%)
const IEC = { ACC: 2, WARN_MIN: 2, WARN_MAX: 4, CRIT_MIN: 4 };

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const r1 = (x) =>
  Number.parseFloat((Math.round((x + Number.EPSILON) * 10) / 10).toFixed(1));

function computeBands(mode, bufferPct) {
  const b = mode === 'iec+buffer' ? bufferPct : 0;
  return {
    accPct: r1(IEC.ACC + b),
    warnMinPct: r1(IEC.WARN_MIN + b),
    warnMaxPct: r1(IEC.WARN_MAX + b),
    critMinPct: r1(IEC.CRIT_MIN + b),
  };
}

const PhaseImbalanceThresholds = ({
  title = 'Phase Imbalance Thresholds',
  defaultMode = 'iec',
  defaultBufferPct = 0.5,
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [bufferPct, setBufferPct] = useState(defaultBufferPct);

  const bands = useMemo(() => computeBands(mode, bufferPct), [mode, bufferPct]);

  // field definition for IEC mode/buffer
  const modeField = {
    id: 'imbalance_mode',
    label: title,
    type: 'combo-input',
    defaultValue: 'iec',
    inputProps: { min: 0.5, max: 5.0, step: 0.1 },
    buttonOptions: [
      { label: 'IEC Standard', value: 'iec' },
      { label: 'IEC Standard + Buffer', value: 'iec+buffer' },
    ],
    unit: '%',
    placeholder: 'Buffer',
    helperText: 'Allowed: 0.5 – 5.0 (%)',
  };

  return (
    <Card variant="outlined" sx={{ p: 1.5 }}>
      <CardContent>
        {/* IEC / Buffer selector */}
        <ComboInputField
          field={modeField}
          value={mode === 'iec+buffer' ? bufferPct : mode}
          onChange={(_, val) => {
            if (val === 'iec' || val === 'iec+buffer') {
              setMode(val);
            } else {
              // buffer custom % typed
              setBufferPct(r1(clamp(Number(val || 0), 0.5, 5)));
            }
          }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Threshold display cards */}
        <Grid container spacing={2}>
          {/* Acceptable */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light' }}>
              <Typography variant="subtitle2">Acceptable Range</Typography>
              <Typography variant="body2">≤ {bands.accPct}%</Typography>
              {/* <Typography variant="caption" display="block">
                Calculated Range: ≤ {bands.accPct}%
              </Typography> */}
            </Box>
          </Grid>

          {/* Warning */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light' }}>
              <Typography variant="subtitle2">Warning Threshold</Typography>
              <Typography variant="body2">
                {bands.warnMinPct}% – {bands.warnMaxPct}%
              </Typography>
              {/* <Typography variant="caption" display="block">
                Calculated Range: {bands.warnMinPct}% – {bands.warnMaxPct}%
              </Typography> */}
            </Box>
          </Grid>

          {/* Critical */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.light' }}>
              <Typography variant="subtitle2">Critical Threshold</Typography>
              <Typography variant="body2">&gt; {bands.critMinPct}%</Typography>
              {/* <Typography variant="caption" display="block">
                Calculated Range: &gt; {bands.critMinPct}%
              </Typography> */}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PhaseImbalanceThresholds;
