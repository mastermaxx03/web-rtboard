// src/components/FrequencyThresholds.jsx
import React, { useMemo, useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const BUTTON_W = 160;   // same as other preset buttons
const BUTTON_H = 44;

const BORDER_BOX_SX = {
  p: 1.25,
  borderRadius: 2,
  minHeight: 88,
  border: (theme) => `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const FrequencyThresholds = ({
  field,
  value,
  onChange,
  defaultNominal = 50,
  warningDelta = 1.0,
  criticalDelta = 1.5,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [nominal, setNominal] = useState(
    typeof value === 'number' ? value : defaultNominal
  );

  // Derived warning/critical ranges
  const { warningLow, warningHigh, criticalLow, criticalHigh, warningText, criticalText } =
    useMemo(() => {
      const wLow = (nominal - warningDelta).toFixed(1);
      const wHigh = (nominal + warningDelta).toFixed(1);
      const cLow = (nominal - criticalDelta).toFixed(1);
      const cHigh = (nominal + criticalDelta).toFixed(1);
      return {
        warningLow: wLow,
        warningHigh: wHigh,
        criticalLow: cLow,
        criticalHigh: cHigh,
        warningText: `${wLow} Hz to ${wHigh} Hz`,
        criticalText: `${cLow} Hz to ${cHigh} Hz`,
      };
    }, [nominal, warningDelta, criticalDelta]);

  // Push changes to parent form
  useEffect(() => {
    if (!onChange) return;
    onChange(field.id, nominal);
    if (field.warningFieldId) onChange(field.warningFieldId, warningText);
    if (field.criticalFieldId) onChange(field.criticalFieldId, criticalText);
  }, [nominal, warningText, criticalText, field, onChange]);

  const handleSelect = (n) => setNominal(n);

  return (
    <Card variant="outlined" sx={{ p: 1.5 }}>
      <CardContent>
        {/* Title */}
        

        <Grid container spacing={2} alignItems="center">
          {/* Label */}
          <Grid item xs={12} md={5}>
            <Typography sx={{ fontWeight: 500 }}>
              {field.label || 'Nominal Frequency'}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                gap: 1,
                flexWrap: isMobile ? 'wrap' : 'nowrap',
              }}
            >
              <Button
                variant={nominal === 50 ? 'contained' : 'outlined'}
                onClick={() => handleSelect(50)}
                sx={{
                  textTransform: 'none',
                  width: BUTTON_W,
                  height: BUTTON_H,
                  borderRadius: 1,
                }}
              >
                50.0 Hz
              </Button>
              <Button
                variant={nominal === 60 ? 'contained' : 'outlined'}
                onClick={() => handleSelect(60)}
                sx={{
                  textTransform: 'none',
                  width: BUTTON_W,
                  height: BUTTON_H,
                  borderRadius: 1,
                }}
              >
                60.0 Hz
              </Button>
            </Box>
          </Grid>

          {/* Warning & Critical Threshold Boxes */}
          <Grid item xs={12} md={6}>
            <Box sx={{ ...BORDER_BOX_SX, bgcolor: 'warning.light' }}>
              <Typography variant="subtitle2">Warning Threshold</Typography>
              <Typography variant="body2">
                {warningLow} Hz – {warningHigh} Hz
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ±{warningDelta.toFixed(1)} Hz from nominal ({nominal.toFixed(1)} Hz)
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ ...BORDER_BOX_SX, bgcolor: 'error.light' }}>
              <Typography variant="subtitle2">Critical Threshold</Typography>
              <Typography variant="body2">
                {criticalLow} Hz – {criticalHigh} Hz
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ±{criticalDelta.toFixed(1)} Hz from nominal ({nominal.toFixed(1)} Hz)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FrequencyThresholds;
