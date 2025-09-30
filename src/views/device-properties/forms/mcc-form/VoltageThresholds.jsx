import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography, TextField, InputAdornment, Divider, Box, Button } from '@mui/material';

// IEC base limits (percent)
const IEC = { ACC: 10, WARN_MIN: 10, WARN_MAX: 15, CRIT_MIN: 15 };

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const r1 = (x) => Number.parseFloat((Math.round((x + Number.EPSILON) * 10) / 10).toFixed(1));
const r2 = (x) => Number.parseFloat((Math.round((x + Number.EPSILON) * 100) / 100).toFixed(2));

function computeBands(mode, bufferPct) {
  const b = mode === 'iec+buffer' ? bufferPct : 0;
  const acc = r1(IEC.ACC + b);
  const wMin = r1(IEC.WARN_MIN + b);
  const wMax = r1(IEC.WARN_MAX + b);
  const cMin = r1(IEC.CRIT_MIN + b);

  return {
    accPct: acc,
    warnMinPct: wMin,
    warnMaxPct: wMax,
    critMinPct: cMin,
    accDisplay: `Up to ±${acc}%`,
    warnDisplay: `Between ±${wMin}% and ±${wMax}%`,
    critDisplay: `Above ±${cMin}%`
  };
}

function computeAbsolute(nominal, accPct, warnMinPct, warnMaxPct, critMinPct) {
  if (!Number.isFinite(nominal) || nominal <= 0) return null;

  const accLower = r2(nominal * (1 - accPct / 100));
  const accUpper = r2(nominal * (1 + accPct / 100));

  const warnLowerBand = {
    lower: r2(nominal * (1 - warnMaxPct / 100)),
    upper: r2(nominal * (1 - warnMinPct / 100))
  };
  const warnUpperBand = {
    lower: r2(nominal * (1 + warnMinPct / 100)),
    upper: r2(nominal * (1 + warnMaxPct / 100))
  };

  const critLowerMax = r2(nominal * (1 - critMinPct / 100));
  const critUpperMin = r2(nominal * (1 + critMinPct / 100));

  return {
    acceptable: { lower: accLower, upper: accUpper },
    warning: { lowerBand: warnLowerBand, upperBand: warnUpperBand },
    critical: { lowerMax: critLowerMax, upperMin: critUpperMin }
  };
}

/**
 * L-L Voltage thresholds widget
 * - Row 1: "Input L-L Voltage (V)"   [Custom input | 400V | 415V | 433V]
 * - Row 2: "3PH L-L Voltage Thresholds" label at left (same width) and 3 equal controls at right
 * - Row 3: Acceptable / Warning / Critical cards
 */
const VoltageThresholds = ({
  defaultNominal = 400,
  defaultMode = 'iec',
  defaultBufferPct = 0,
  title = '3PH L-L Voltage Thresholds',
  onChange
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [bufferPct, setBufferPct] = useState(defaultBufferPct);

  // Nominal — same UX as Section 1 "Machine Rated Voltage"
  const isPreset = [400, 415, 433].includes(defaultNominal);
  const [nominalCustom, setNominalCustom] = useState(isPreset ? '' : defaultNominal || '');
  const [nominalPreset, setNominalPreset] = useState(isPreset ? defaultNominal : 400);
  const nominal = nominalCustom !== '' ? Number(nominalCustom) : nominalPreset;

  const bands = useMemo(() => computeBands(mode, bufferPct), [mode, bufferPct]);
  const abs = useMemo(
    () => computeAbsolute(nominal, bands.accPct, bands.warnMinPct, bands.warnMaxPct, bands.critMinPct),
    [nominal, bands.accPct, bands.warnMinPct, bands.warnMaxPct, bands.critMinPct]
  );

  // Push values back to parent
  useEffect(() => {
    if (!onChange) return;
    onChange({
      kind: 'voltage-ll',
      mode,
      bufferPct,
      nominal,
      acceptable: { pct: bands.accPct, display: bands.accDisplay, abs: abs?.acceptable || null },
      warning: { minPct: bands.warnMinPct, maxPct: bands.warnMaxPct, display: bands.warnDisplay, abs: abs?.warning || null },
      critical: { minPct: bands.critMinPct, display: bands.critDisplay, abs: abs?.critical || null }
    });
  }, [onChange, mode, bufferPct, nominal, bands, abs]);

  return (
    <Card variant="outlined" sx={{ p: 1.5 }}>
      <CardContent sx={{ pt: 1.5, pb: 1.5 }}>
        {/* Row 1 — Input L-L Voltage (V) */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
          <Grid item xs={12} md={3.5}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Input L-L Voltage (V) <span style={{ color: 'red' }}>*</span>
            </Typography>
          </Grid>

          <Grid item xs={12} md={8.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1.25fr repeat(3, 1fr)', gap: 1 }}>
              <TextField
                size="small"
                type="number"
                placeholder="Voltage (V)"
                value={nominalCustom}
                onChange={(e) => setNominalCustom(e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">V</InputAdornment> }}
                inputProps={{ min: 50, max: 1000, step: 1 }}
              />
              {[400, 415, 433].map((v) => {
                const active = nominalCustom === '' && nominalPreset === v;
                return (
                  <Button
                    key={v}
                    fullWidth
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => {
                      setNominalCustom('');
                      setNominalPreset(v);
                    }}
                    sx={{ textTransform: 'none', fontWeight: active ? 700 : 500, height: 40 }}
                  >
                    {v}V
                  </Button>
                );
              })}
            </Box>
          </Grid>
        </Grid>

        {/* Row 2 — label (left) + three equal controls (right) */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Grid item xs={12} md={3.5}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Grid>

          <Grid item xs={12} md={8.5} mt={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              <Button
                fullWidth
                variant={mode === 'iec' ? 'contained' : 'outlined'}
                onClick={() => setMode('iec')}
                sx={{ textTransform: 'none', height: 40, fontWeight: mode === 'iec' ? 700 : 600 }}
              >
                IEC Std
              </Button>

              <Button
                fullWidth
                variant={mode === 'iec+buffer' ? 'contained' : 'outlined'}
                onClick={() => setMode('iec+buffer')}
                sx={{ textTransform: 'none', height: 40, fontWeight: mode === 'iec+buffer' ? 700 : 600 }}
              >
                IEC Std + Buffer
              </Button>

              <TextField
                fullWidth
                size="small"
                type="number"
                label="Buffer"
                value={bufferPct}
                onChange={(e) => setBufferPct(r1(clamp(Number(e.target.value || 0), 0, 5)))}
                disabled={mode !== 'iec+buffer'}
                helperText="0 – 5.0 %"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                inputProps={{ step: 0.1, min: 0, max: 5 }}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Row 3 — three equal-width tiles */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                Acceptable Range
              </Typography>
              <Typography variant="body2">{bands.accDisplay}</Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                {abs ? (
                  <>
                    Calculated: <b>{abs.acceptable.lower}</b> V – <b>{abs.acceptable.upper}</b> V
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
              <Typography variant="body2">{bands.warnDisplay}</Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                {abs ? (
                  <>
                    Calculated: <b>{abs.warning.lowerBand.lower}</b>–<b>{abs.warning.lowerBand.upper}</b> V &nbsp;and&nbsp;
                    <b>{abs.warning.upperBand.lower}</b>–<b>{abs.warning.upperBand.upper}</b> V
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
              <Typography variant="body2">{bands.critDisplay}</Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                {abs ? (
                  <>
                    Calculated: &lt; <b>{abs.critical.lowerMax}</b> V or &gt; <b>{abs.critical.upperMin}</b> V
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

        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
          Bands are rounded to 1 decimal (for %) and 2 decimals (for V). In “IEC Std + Buffer”, all IEC limits are shifted by the buffer.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default VoltageThresholds;
