import React, { useMemo } from 'react';
import { Grid, Typography, TextField, InputAdornment, Box, Button, Divider } from '@mui/material';
import { computeIecVoltageBands, computeAbsoluteVoltageBands, clamp, r1 } from '../htCalculations';

export default function ThresholdsBlock({
  title = '3PH Voltage Thresholds',
  fieldPrefix = 'll',
  unit = 'V',
  presets = [400, 415, 433],
  values = {},
  onChange
}) {
  const baseV = values[`${fieldPrefix}_voltage_input`] ?? '';
  const mode = values[`${fieldPrefix}_mode`] ?? 'iec';
  const buffer = values[`${fieldPrefix}_buffer_pct`] ?? 0;

  const bands = useMemo(() => computeIecVoltageBands(mode, buffer), [mode, buffer]);
  const abs = useMemo(
    () => computeAbsoluteVoltageBands(baseV, bands.accPct, bands.warnMinPct, bands.warnMaxPct, bands.critMinPct),
    [baseV, bands.accPct, bands.warnMinPct, bands.warnMaxPct, bands.critMinPct]
  );

  const set = (k, v) => onChange?.(k, v);

  const pushAll = (nextBase = baseV, nextMode = mode, nextBuf = buffer) => {
    const b = computeIecVoltageBands(nextMode, nextBuf);
    const a = computeAbsoluteVoltageBands(nextBase, b.accPct, b.warnMinPct, b.warnMaxPct, b.critMinPct);

    set(`${fieldPrefix}_acceptable_display`, b.accDisplay);
    set(`${fieldPrefix}_warning_display`, b.warnDisplay);
    set(`${fieldPrefix}_critical_display`, b.critDisplay);

    set(`${fieldPrefix}_acceptable_lower`, a?.acceptable?.lower ?? null);
    set(`${fieldPrefix}_acceptable_upper`, a?.acceptable?.upper ?? null);

    set(`${fieldPrefix}_warning_lower_1`, a?.warning?.lowerBand?.lower ?? null);
    set(`${fieldPrefix}_warning_upper_1`, a?.warning?.lowerBand?.upper ?? null);
    set(`${fieldPrefix}_warning_lower_2`, a?.warning?.upperBand?.lower ?? null);
    set(`${fieldPrefix}_warning_upper_2`, a?.warning?.upperBand?.upper ?? null);

    set(`${fieldPrefix}_critical_lower_max`, a?.critical?.lowerMax ?? null);
    set(`${fieldPrefix}_critical_upper_min`, a?.critical?.upperMin ?? null);
  };

  return (
    <Box sx={{ borderRadius: 2, border: '1px solid #e4e6eb', p: 2 }}>
      {/* Presets only (custom input removed) */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1.25 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {`Select ${fieldPrefix.toUpperCase()} Voltage (${unit})`} <span style={{ color: 'red' }}>*</span>
          </Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            {presets.map((v) => {
              const active = baseV === v;
              return (
                <Button
                  key={v}
                  fullWidth
                  variant={active ? 'contained' : 'outlined'}
                  onClick={() => {
                    set(`${fieldPrefix}_voltage_input`, v);
                    pushAll(v, mode, buffer);
                  }}
                  sx={{ textTransform: 'none', fontWeight: active ? 700 : 500, height: 40 }}
                >
                  {v}{unit}
                </Button>
              );
            })}
          </Box>
        </Grid>
      </Grid>

      {/* Mode + buffer */}
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
                pushAll(baseV, 'iec', buffer);
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
                pushAll(baseV, 'iec+buffer', buffer);
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
                pushAll(baseV, mode, v);
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
              Acceptable Range
            </Typography>
            <Typography variant="body2">{`Up to ±${bands.accPct}%`}</Typography>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              {abs ? (
                <>
                  Calculated: <b>{abs.acceptable.lower}</b> {unit} – <b>{abs.acceptable.upper}</b> {unit}
                </>
              ) : (
                <>
                  Calculated: <i>N/A</i>
                </>
              )}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Warning Threshold
            </Typography>
            <Typography variant="body2">{`Between ±${bands.warnMinPct}% and ±${bands.warnMaxPct}%`}</Typography>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              {abs ? (
                <>
                  Calculated: <b>{abs.warning.lowerBand.lower}</b>–<b>{abs.warning.lowerBand.upper}</b> {unit} &nbsp;and&nbsp;
                  <b>{abs.warning.upperBand.lower}</b>–<b>{abs.warning.upperBand.upper}</b> {unit}
                </>
              ) : (
                <>
                  Calculated: <i>N/A</i>
                </>
              )}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Critical Threshold
            </Typography>
            <Typography variant="body2">{`Above ±${bands.critMinPct}%`}</Typography>
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
              {abs ? (
                <>
                  Calculated: &lt; <b>{abs.critical.lowerMax}</b> {unit} or &gt; <b>{abs.critical.upperMin}</b> {unit}
                </>
              ) : (
                <>
                  Calculated: <i>N/A</i>
                </>
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: 'text.secondary' }}>
        Bands are rounded to 1 decimal (for %) and 2 decimals (for {unit}). In “IEC Std + Buffer”, all IEC limits are shifted by the buffer.
      </Typography>

      {/* --- ADDED AT END --- */}
      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.75 }}>
            Auxiliary DC Power Supply Voltage <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            required
            size="small"
            type="number"
            placeholder="Enter DC voltage"
            value={values.aux_dc_voltage ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? '' : Number(e.target.value);
              set('aux_dc_voltage', v);
            }}
            InputProps={{ endAdornment: <InputAdornment position="end">V (DC)</InputAdornment> }}
            inputProps={{ min: 1, step: 1 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.75 }}>
            Rated Ampere-Hour Combined Battery Capacity
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder="Enter capacity"
            value={values.battery_capacity_ah ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? '' : Number(e.target.value);
              set('battery_capacity_ah', v);
            }}
            InputProps={{ endAdornment: <InputAdornment position="end">Ah</InputAdornment> }}
            inputProps={{ min: 0, step: 1 }}
          />
        </Grid>
      </Grid>
      {/* --- END ADDED --- */}
    </Box>
  );
}
