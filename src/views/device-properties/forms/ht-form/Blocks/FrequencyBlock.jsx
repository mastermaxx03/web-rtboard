import React, { useMemo } from 'react';
import { Grid, Typography, TextField, Box, Button, Divider } from '@mui/material';
import { computeFrequencyThresholds } from '../htCalculations';

/**
 * Frequency block (reusable; NO buffer)
 * - Row 1: "Nominal Frequency (Hz)" + presets (50.0 / 60.0)
 * - Tiles: Warning (±1.0%), Critical (±3.0%)
 */
export default function FrequencyBlock({
  title = 'Frequency',
  fieldId = 'nominal_frequency',
  presets = [50.0, 60.0],
  step = 0.1,
  values = {},
  onChange
}) {
  const nominal = values[fieldId] ?? '';
  const set = (k, v) => onChange?.(k, v);

  const freq = nominal === '' ? NaN : Number(nominal);
  const calc = useMemo(() => computeFrequencyThresholds(freq), [freq]);

  // Toggle this to true if you ever want the numeric input back
  const SHOW_INPUT = false;

  return (
    <Box sx={{ borderRadius: 2, border: '1px solid #e4e6eb', p: 2 }}>
      {/* Row 1 — Nominal presets (no buffer) */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1.25 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Nominal Frequency (Hz) <span style={{ color: 'red' }}>*</span>
          </Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: SHOW_INPUT ? '1.25fr repeat(2, 1fr)' : 'repeat(2, 1fr)',
              gap: 1
            }}
          >
            {SHOW_INPUT && (
              <TextField
                size="small"
                type="number"
                placeholder="e.g., 50.0"
                value={nominal ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  set(fieldId, v);
                }}
                inputProps={{ step, min: 40, max: 70 }}
              />
            )}

            {presets.map((v) => {
              const active = nominal === v || Number(nominal) === v;
              return (
                <Button
                  key={v}
                  fullWidth
                  variant={active ? 'contained' : 'outlined'}
                  onClick={() => set(fieldId, v)}
                  sx={{ textTransform: 'none', fontWeight: active ? 700 : 500, height: 40 }}
                >
                  {v.toFixed(1)} Hz
                </Button>
              );
            })}
          </Box>
        </Grid>
      </Grid>

      {/* Row 2 — Title only (parity with other blocks) */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1.25 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12} md={8} />
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* Tiles */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Warning Thresholds
            </Typography>
            <Typography variant="body2">{calc.warning_threshold_freq_display || 'N/A'}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Critical Thresholds
            </Typography>
            <Typography variant="body2">{calc.critical_threshold_freq_display || 'N/A'}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: 'text.secondary' }}>
        Ranges are ±1.0% (Warning) and ±3.0% (Critical) of the nominal frequency.
      </Typography>
    </Box>
  );
}