import React, { useMemo } from 'react';
import { Grid, Typography, TextField, InputAdornment, Box, Button, Divider } from '@mui/material';
import { computeImbalanceBands, clamp, r1 } from '../htCalculations';

/**
 * Phase Imbalance block:
 * - Same layout as ThresholdsBlock (title at left, IEC/Buffer controls at right)
 * - No voltage input row
 * - Tiles show % bands: ≤X%, X–Y%, >Z%
 */
export default function ImbalanceBlock({ title = 'Phase Imbalance (applies to L-L & L-N)', fieldPrefix = 'vi', values = {}, onChange }) {
  const mode = values[`${fieldPrefix}_mode`] ?? 'iec';
  const buffer = values[`${fieldPrefix}_buffer_pct`] ?? 0;

  const bands = useMemo(() => computeImbalanceBands(mode, buffer), [mode, buffer]);

  const set = (k, v) => onChange?.(k, v);

  const pushDisplays = (m = mode, b = buffer) => {
    const bb = computeImbalanceBands(m, b);
    set(`acceptable_range_Vdisplay`, bb.accDisplay);
    set(`warning_threshold_Vdisplay`, bb.warnDisplay);
    set(`critical_threshold_Vdisplay`, bb.critDisplay);
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
              Acceptable Range (Voltage Imbalance)
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
              Warning Threshold (Voltage Imbalance)
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
              Critical Threshold (Voltage Imbalance)
            </Typography>
            <Typography variant="body2">{bands.critDisplay}</Typography>
            {/* <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              Calculated Range: {bands.critDisplay}
            </Typography> */}
          </Box>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: 'text.secondary' }}>
        Values shown are band definitions expressed in %. These apply to L - L.
      </Typography>
    </Box>
  );
}
