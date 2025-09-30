// src/views/device-properties/forms/mcc-form/blocks/ImbalanceBlock.jsx
import React, { useMemo } from 'react';
import { Grid, Typography, TextField, InputAdornment, Box, Button, Divider } from '@mui/material';
import { computeImbalanceBands, computeCurrentImbalanceBands, clamp, r1 } from '../mccCalculations';

/**
 * Imbalance block (reused for Phase & Current):
 * - variant: 'voltage' | 'current'  (default 'voltage')
 * - fieldPrefix controls where mode/buffer live (default 'vi')
 * - Only the 'voltage' variant pushes global V-display fields (to avoid
 *   clobbering Section-2 when we render the current variant in Section-3).
 */
export default function ImbalanceBlock({
  title = 'Phase Imbalance (applies to L-L & L-N)',
  fieldPrefix = 'vi',
  variant = 'voltage',
  values = {},
  onChange
}) {
  const mode = values[`${fieldPrefix}_mode`] ?? 'iec';
  const buffer = values[`${fieldPrefix}_buffer_pct`] ?? 0;

  // Pick the right calculator based on variant
  const bands = useMemo(
    () => (variant === 'current' ? computeCurrentImbalanceBands(mode, buffer) : computeImbalanceBands(mode, buffer)),
    [variant, mode, buffer]
  );

  const set = (k, v) => onChange?.(k, v);

  // Only Phase/Voltage variant updates the Section-2 “Vdisplay” helper fields
  const pushDisplays = (m = mode, b = buffer) => {
    if (variant !== 'voltage') return;
    const bb = computeImbalanceBands(m, b);
    set(`acceptable_range_Vdisplay`, bb.accDisplay);
    set(`warning_threshold_Vdisplay`, bb.warnDisplay);
    set(`critical_threshold_Vdisplay`, bb.critDisplay);
  };

  // Text labels switch based on variant
  const subLabel = variant === 'current' ? 'Current Imbalance' : 'Voltage Imbalance';

  return (
    <Box sx={{ borderRadius: 2, border: '1px solid #e4e6eb', p: 2 }}>
      {/* Row — label + controls */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1.25 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <Button
              fullWidth
              variant={mode === 'iec' ? 'contained' : 'outlined'}
              onClick={() => {
                set(`${fieldPrefix}_mode`, 'iec');
                pushDisplays('iec', buffer);
              }}
              sx={{ textTransform: 'none', height: 40, fontWeight: mode === 'iec' ? 700 : 600 }}
            >
              IEC Std
            </Button>

            <Button
              fullWidth
              variant={mode === 'iec+buffer' ? 'contained' : 'outlined'}
              onClick={() => {
                set(`${fieldPrefix}_mode`, 'iec+buffer');
                pushDisplays('iec+buffer', buffer);
              }}
              sx={{ textTransform: 'none', height: 40, fontWeight: mode === 'iec+buffer' ? 700 : 600 }}
            >
              IEC Std + Buffer
            </Button>

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Buffer"
              value={buffer}
              onChange={(e) => {
                const v = r1(clamp(e.target.value, 0, 5));
                set(`${fieldPrefix}_buffer_pct`, v);
                pushDisplays(mode, v);
              }}
              disabled={mode !== 'iec+buffer'}
              helperText="0 – 5.0 %"
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              inputProps={{ step: 0.1, min: 0, max: 5 }}
            />
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* Tiles */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              {`Acceptable Range (${subLabel})`}
            </Typography>
            <Typography variant="body2">{bands.accDisplay}</Typography>
            {/* <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              Calculated Range: {bands.accDisplay}
            </Typography> */}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              {`Warning Threshold (${subLabel})`}
            </Typography>
            <Typography variant="body2">{bands.warnDisplay}</Typography>
            {/* <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              Calculated Range: {bands.warnDisplay}
            </Typography> */}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              {`Critical Threshold (${subLabel})`}
            </Typography>
            <Typography variant="body2">{bands.critDisplay}</Typography>
            {/* <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              Calculated Range: {bands.critDisplay}
            </Typography> */}
          </Box>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: 'text.secondary' }}>
        Values shown are band definitions expressed in %. Buffer (if used) shifts all IEC limits by the buffer.
      </Typography>
    </Box>
  );
}
