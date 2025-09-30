import React, { useMemo } from 'react';
import { Grid, Typography, TextField, InputAdornment, Box, Button, Divider } from '@mui/material';
import { computeImbalanceBands, clamp, r1 } from '../ltCalculations';

/**
 * Current Imbalance block — same format as your ImbalanceBlock sample.
 * Title at left, IEC / IEC+Buffer + Buffer input at right, and three tiles below.
 * Writes mode/buffer + display strings via onChange (optional).
 */
export default function CurrentImbalanceBlock({
  title = 'Current Imbalance (%)',
  values = {},
  onChange,
}) {
  const mode   = values.current_imbalance_mode ?? 'iec';     // 'iec' | 'iec+buffer'
  const buffer = values.current_imbalance_buffer_pct ?? 0;   // 0 – 5.0 (%)

  const bands = useMemo(() => computeImbalanceBands(mode, buffer), [mode, buffer]);

  const set = (k, v) => onChange?.(k, v);

  const pushDisplays = (m = mode, b = buffer) => {
    const bb = computeImbalanceBands(m, b);
    set('current_imbalance_acc_display',  bb.accDisplay);
    set('current_imbalance_warn_display', bb.warnDisplay);
    set('current_imbalance_crit_display', bb.critDisplay);
  };

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
                set('current_imbalance_mode', 'iec');
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
                set('current_imbalance_mode', 'iec+buffer');
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
                const v = r1(clamp(Number(e.target.value || 0), 0, 5));
                set('current_imbalance_buffer_pct', v);
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
              Acceptable Range (Current Imbalance)
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
              Warning Threshold (Current Imbalance)
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
              Critical Threshold (Current Imbalance)
            </Typography>
            <Typography variant="body2">{bands.critDisplay}</Typography>
            {/* <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              Calculated Range: {bands.critDisplay}
            </Typography> */}
          </Box>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: 'text.secondary' }}>
        Values shown are band definitions expressed in %.
      </Typography>
    </Box>
  );
}
