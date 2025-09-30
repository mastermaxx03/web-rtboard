import React, { useMemo, useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Typography, TextField, InputAdornment, Divider, Button } from '@mui/material';

/* ---------- helpers ---------- */
const IEC_BASE = { ACCEPT_LOWER: 0.954, WARN_LOWER: 0.864, WARN_UPPER: 0.953, CRIT_UPPER: 0.863 };
const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const r3 = (x) => Number.parseFloat((Math.round((x + Number.EPSILON) * 1000) / 1000).toFixed(3));

function computeBands(mode, buffer) {
  const b = mode === 'iec+buffer' ? buffer : 0;
  return {
    acceptable: { lower: r3(IEC_BASE.ACCEPT_LOWER + b), upper: 1.0 },
    warning:    { lower: r3(IEC_BASE.WARN_LOWER + b),  upper: r3(IEC_BASE.WARN_UPPER + b) },
    critical:   { upper: r3(IEC_BASE.CRIT_UPPER + b) },
  };
}

/* ---------- component ---------- */
export default function PFThresholds({
  defaultMode   = 'iec',
  defaultBuffer = 0.001,
  readOnly      = false,
  onChange,
  buttonHeight  = 40,
  inputHeight   = 40,
}) {
  const [mode, setMode] = useState(defaultMode);
  const [buffer, setBuffer] = useState(defaultBuffer);

  const bands = useMemo(() => computeBands(mode, buffer), [mode, buffer]);

  useEffect(() => {
    onChange?.({
      mode,
      buffer: r3(buffer),
      acceptable: {
        lower: bands.acceptable.lower,
        upper: bands.acceptable.upper,
        display: `Between ${bands.acceptable.upper.toFixed(3)} and ${bands.acceptable.lower.toFixed(3)}`
      },
      warning: {
        lower: bands.warning.lower,
        upper: bands.warning.upper,
        display: `Between ${bands.warning.upper.toFixed(3)} and ${bands.warning.lower.toFixed(3)}`
      },
      critical: { upper: bands.critical.upper, display: `≤ ${bands.critical.upper.toFixed(3)}` }
    });
  }, [mode, buffer, bands, onChange]);

  const handleBuffer = (e) => {
    const n = Number(e.target.value);
    setBuffer(r3(clamp(Number.isNaN(n) ? 0.001 : n, 0.001, 0.005)));
  };

  const btnCommon = {
    flex: 1,
    height: buttonHeight,
    minHeight: buttonHeight,
    textTransform: 'none',
    fontWeight: 700,
    boxShadow: 'none',
  };

  return (
    <Card variant="outlined" sx={{ p: 1.5 }}>
      <CardContent sx={{ pt: 1.5, pb: 1.5 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Power Factor Thresholds
            </Typography>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 0 }}>
                <Button
                  onClick={() => setMode('iec')}
                  disableElevation
                  sx={{
                    ...btnCommon,
                    border: '1px solid #B9E2FF',
                    borderRightWidth: 0,
                    borderRadius: '6px 0 0 6px',
                    color: mode === 'iec' ? '#fff' : '#1EA7FD',
                    backgroundColor: mode === 'iec' ? '#1EA7FD' : '#fff',
                    '&:hover': { backgroundColor: mode === 'iec' ? '#1B90E4' : 'rgba(30,167,253,0.08)' },
                  }}
                >
                  IEC Std
                </Button>

                <Button
                  onClick={() => setMode('iec+buffer')}
                  disableElevation
                  sx={{
                    ...btnCommon,
                    border: '1px solid #B9E2FF',
                    borderLeftWidth: 0,
                    borderRadius: '0 6px 6px 0',
                    color: mode === 'iec+buffer' ? '#fff' : '#1EA7FD',
                    backgroundColor: mode === 'iec+buffer' ? '#1EA7FD' : '#fff',
                    '&:hover': { backgroundColor: mode === 'iec+buffer' ? '#1B90E4' : 'rgba(30,167,253,0.08)' },
                  }}
                >
                  IEC Std + Buffer
                </Button>
              </Box>

              <TextField
                size="small"
                type="number"
                label="Buffer"
                value={buffer}
                onChange={handleBuffer}
                disabled={readOnly || mode !== 'iec+buffer'}
                inputProps={{ min: 0.001, max: 0.005, step: 0.001 }}
                fullWidth
                helperText="Allowed: 0.001 – 0.005 (3 decimals)"
                InputProps={{ endAdornment: <InputAdornment position="end">PF</InputAdornment> }}
                sx={{
                  '& .MuiOutlinedInput-root': { height: inputHeight },
                  '& .MuiOutlinedInput-input': { py: 0, height: inputHeight, lineHeight: `${inputHeight}px` },
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Acceptable Range</Typography>
              <Typography variant="body2">
                Between <b>{bands.acceptable.upper.toFixed(3)}</b> and <b>{bands.acceptable.lower.toFixed(3)}</b>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Warning Threshold</Typography>
              <Typography variant="body2">
                Between <b>{bands.warning.upper.toFixed(3)}</b> and <b>{bands.warning.lower.toFixed(3)}</b>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Critical Threshold</Typography>
              <Typography variant="body2">≤ <b>{bands.critical.upper.toFixed(3)}</b></Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
          Bands are rounded to 3 decimals. In “IEC + Buffer”, all IEC limits are shifted upward by the buffer.
        </Typography>
      </CardContent>
    </Card>
  );
}
