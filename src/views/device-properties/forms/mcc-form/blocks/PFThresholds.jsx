import React, { useMemo } from 'react';
import { Grid, Typography, TextField, InputAdornment, Box, Button, Divider } from '@mui/material';

/* ───────────────────────── helpers ───────────────────────── */

// IEC base bands (rounded to 3 decimals)
const IEC_PF = {
  ACCEPT_LOWER: 0.954,
  WARN_LOWER: 0.864,
  WARN_UPPER: 0.953,
  CRIT_UPPER: 0.863
};

const clamp = (x, a, b) => Math.min(Math.max(Number(x), a), b);
const r3 = (x) => Number.parseFloat((Math.round((Number(x) + Number.EPSILON) * 1000) / 1000).toFixed(3));

const computePfBands = (mode = 'iec', buffer = 0.001) => {
  const b = mode === 'iec+buffer' ? clamp(buffer, 0.001, 0.005) : 0;
  const acceptLower = r3(IEC_PF.ACCEPT_LOWER + b);
  const warnLower = r3(IEC_PF.WARN_LOWER + b);
  const warnUpper = r3(IEC_PF.WARN_UPPER + b);
  const critUpper = r3(IEC_PF.CRIT_UPPER + b);

  return {
    acceptable: { lower: acceptLower, upper: 1.0 },
    warning: { lower: warnLower, upper: warnUpper },
    critical: { upper: critUpper } // PF ≤ critUpper
  };
};

/* ───────────────────────── component ───────────────────────── */

/**
 * PFThresholds — styled like ImbalanceBlock (IEC / IEC+Buffer, buffer input, three tiles)
 *
 * Props:
 *  - values: formData
 *  - onChange: (key, value) => void   // Page already passes this
 *
 * Stored keys in formData:
 *  - pf_mode: 'iec' | 'iec+buffer'
 *  - pf_buffer: number (0.001–0.005)
 *  - pf_acc_display / pf_warn_display / pf_crit_display: strings for preview/print
 *  (For compatibility we also mirror pf_thresholds_mode / pf_thresholds_buffer.)
 */
export default function PFThresholds({ values = {}, onChange }) {
  const mode = values.pf_mode ?? values.pf_thresholds_mode ?? 'iec';
  const buffer = values.pf_buffer ?? values.pf_thresholds_buffer ?? 0.001;

  const bands = useMemo(() => computePfBands(mode, buffer), [mode, buffer]);

  const set = (k, v) => onChange?.(k, v);

  const pushDisplays = (m = mode, b = buffer) => {
    const bb = computePfBands(m, b);
    set('pf_acc_display', `Between ${bb.acceptable.upper.toFixed(3)} and ${bb.acceptable.lower.toFixed(3)}`);
    set('pf_warn_display', `Between ${bb.warning.upper.toFixed(3)} and ${bb.warning.lower.toFixed(3)}`);
    set('pf_crit_display', `≤ ${bb.critical.upper.toFixed(3)}`);
  };

  return (
    <Box sx={{ borderRadius: 2, border: '1px solid #e4e6eb', p: 2 }}>
      {/* Row — label + controls (matches ImbalanceBlock styling) */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1.25 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Power Factor Thresholds
          </Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <Button
              fullWidth
              variant={mode === 'iec' ? 'contained' : 'outlined'}
              onClick={() => {
                set('pf_mode', 'iec');
                set('pf_thresholds_mode', 'iec'); // mirror for safety
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
                set('pf_mode', 'iec+buffer');
                set('pf_thresholds_mode', 'iec+buffer'); // mirror
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
                const v = r3(clamp(e.target.value, 0.001, 0.005));
                set('pf_buffer', v);
                set('pf_thresholds_buffer', v); // mirror
                pushDisplays(mode, v);
              }}
              onWheel={(e) => e.currentTarget.blur()} // avoid mouse-wheel value jumps
              disabled={mode !== 'iec+buffer'}
              helperText="Allowed: 0.001 – 0.005 (PF, 3 decimals)"
              InputProps={{ endAdornment: <InputAdornment position="end">PF</InputAdornment> }}
              inputProps={{ step: 0.001, min: 0.001, max: 0.005 }}
            />
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* Tiles — same palette as ImbalanceBlock */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Acceptable Range
            </Typography>
            <Typography variant="body2">
              {`Between ${bands.acceptable.upper.toFixed(3)} and ${bands.acceptable.lower.toFixed(3)}`}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Warning Threshold
            </Typography>
            <Typography variant="body2">{`Between ${bands.warning.upper.toFixed(3)} and ${bands.warning.lower.toFixed(3)}`}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Critical Threshold
            </Typography>
            <Typography variant="body2">{`≤ ${bands.critical.upper.toFixed(3)}`}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: 'text.secondary' }}>
        Bands are rounded to 3 decimals. In “IEC Std + Buffer”, all IEC limits are shifted upward by the buffer.
      </Typography>
    </Box>
  );
}
