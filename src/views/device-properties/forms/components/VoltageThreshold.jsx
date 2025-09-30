// VoltageThresholds.jsx
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
import { color } from 'd3';

// IEC defaults (%)
const IEC = { ACC: 10, WARN_MIN: 10, WARN_MAX: 15, CRIT_MIN: 15 };

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const r1 = (x) => Number.parseFloat((Math.round((x + Number.EPSILON) * 10) / 10).toFixed(1));
const r2 = (x) => Number.parseFloat((Math.round((x + Number.EPSILON) * 100) / 100).toFixed(2));

function computeBands(mode, bufferPct) {
  const b = mode === 'iec+buffer' ? bufferPct : 0;
  return {
    accPct: r1(IEC.ACC + b),
    warnMinPct: r1(IEC.WARN_MIN + b),
    warnMaxPct: r1(IEC.WARN_MAX + b),
    critMinPct: r1(IEC.CRIT_MIN + b),
  };
}

function computeAbsolute(nominal, accPct, warnMinPct, warnMaxPct, critMinPct) {
  if (!Number.isFinite(nominal) || nominal <= 0) return null;
  return {
    acceptable: {
      lower: r2(nominal * (1 - accPct / 100)),
      upper: r2(nominal * (1 + accPct / 100)),
    },
    warning: {
      lowerBand: {
        lower: r2(nominal * (1 - warnMaxPct / 100)),
        upper: r2(nominal * (1 - warnMinPct / 100)),
      },
      upperBand: {
        lower: r2(nominal * (1 + warnMinPct / 100)),
        upper: r2(nominal * (1 + warnMaxPct / 100)),
      },
    },
    critical: {
      lowerMax: r2(nominal * (1 - critMinPct / 100)),
      upperMin: r2(nominal * (1 + critMinPct / 100)),
    },
  };
}

/**
 * Props:
 *  - field: { id, label, voltageOptions? (optional) }
 *  - defaultMode?: 'iec' | 'iec+buffer'
 *  - defaultBufferPct?: number
 *  - defaultNominal?: number | ''
 */
const VoltageThresholds = ({
  field,
  defaultMode = 'iec',
  defaultBufferPct = 2.5,
  defaultNominal = '',
}) => {
  // infer titles/labels from field.label
  const base = field?.label || 'Voltage';
  const isLL = /L[\s-]*L/i.test(base);
  const isLN = /L[\s-]*N/i.test(base);

  const sectionTitle =
    isLL ? '3PH L-L Voltage Threshold'
      : isLN ? '3PH L-N Voltage Threshold'
      : `${base} Threshold`;

  const inputLabel =
    isLL ? 'Input L-L Voltage (V)'
      : isLN ? 'Input L-N Voltage (V)'
      : `Input ${base} (V)`;

  // state
  const [mode, setMode] = useState(defaultMode);
  const [bufferPct, setBufferPct] = useState(defaultBufferPct);
  const [nominal, setNominal] = useState(defaultNominal);

  // calculations
  const bands = useMemo(() => computeBands(mode, bufferPct), [mode, bufferPct]);
  const abs = useMemo(
    () => computeAbsolute(nominal, bands.accPct, bands.warnMinPct, bands.warnMaxPct, bands.critMinPct),
    [nominal, bands.accPct, bands.warnMinPct, bands.warnMaxPct, bands.critMinPct]
  );

  // field defs for the two combo inputs
  const modeField = {
    id: `${field.id}_mode`,
    label: sectionTitle,
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

  const voltageOptionsFallback = isLN
    ? [{ label: '230V', value: 230 }]
    : [
        { label: '400V', value: 400 },
        { label: '415V', value: 415 },
        { label: '433V', value: 433 },
      ];

  const voltageField = {
    id: `${field.id}_nominal`,
    label: inputLabel,
    required: true,
    type: 'combo-input',
    unit: 'V',
    buttonOptions: field.voltageOptions || voltageOptionsFallback,
    placeholder: 'Custom',
    helperText: 'Choose preset or enter custom value',
  };

  return (
    <Card variant="outlined" sx={{ p: 1.5 }}>
      <CardContent>
        {/* Mode / Buffer */}
        <ComboInputField
          field={modeField}
          value={mode === 'iec+buffer' ? bufferPct : mode}
          onChange={(_, val) => {
            if (val === 'iec' || val === 'iec+buffer') {
              setMode(val);
            } else {
              // val is buffer number typed in
              const clamped = r1(clamp(Number(val || 0), 0.5, 5));
              setBufferPct(clamped);
            }
          }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Nominal voltage */}
        <ComboInputField
          field={voltageField}
          value={nominal}
          onChange={(_, val) => setNominal(Number(val))}
        />

        {/* Ranges */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'success.light' }}>
              <Typography variant="subtitle2">Acceptable Range</Typography>
              <Typography variant="body2">±{bands.accPct}%</Typography>
              <Typography variant="caption">
                {abs ? ` ${abs.acceptable.lower} – ${abs.acceptable.upper} V` : 'N/A'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'warning.light' }}>
              <Typography variant="subtitle2">Warning Threshold</Typography>
              <Typography variant="body2">
                ±{bands.warnMinPct}% – ±{bands.warnMaxPct}%
              </Typography>
              <Typography variant="caption">
                {abs
                  ? `${abs.warning.lowerBand.lower} – ${abs.warning.lowerBand.upper} V and ${abs.warning.upperBand.lower} – ${abs.warning.upperBand.upper} V`
                  : 'N/A'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'error.light' }}>
              <Typography variant="subtitle2">Critical Threshold</Typography>
              <Typography variant="body2">≥ ±{bands.critMinPct}%</Typography>
              <Typography variant="caption">
                {abs ? `< ${abs.critical.lowerMax} V or > ${abs.critical.upperMin} V` : 'N/A'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default VoltageThresholds;
