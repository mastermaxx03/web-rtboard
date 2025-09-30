// PanelOutgoingSupply.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Stack,
  Divider,
  InputAdornment,
  ButtonGroup
} from '@mui/material';

const MAX_OUTGOINGS = 10;
const BREAKER_TYPES = [
  'VCB (Vacuum Circuit Breaker)',
  'ACB (Air Circuit Breaker)',
  'MCCB (Moulded Case Circuit Breaker)',
  'MCB (Miniature Circuit Breaker)',
  'ELCB (Earth Leakage Circuit Breaker)',
  'RCCB (Residual Current Circuit Breaker)'
];

function clampInt(v, min, max) {
  const n = Number.isFinite(+v) ? Math.trunc(+v) : 0;
  return Math.max(min, Math.min(n, max));
}
function toNum(value) {
  const n = parseFloat(String(value).trim());
  return Number.isFinite(n) ? n : '';
}

/** Simple row with optional small hint line under the label (e.g., “2 A”). */
function Row({ label, required = false, hint, children }) {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={4}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label} {required && <span style={{ color: '#d32f2f' }}>*</span>}
        </Typography>
        {hint ? (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', mt: 0.25, display: 'block' }}
          >
            {hint}
          </Typography>
        ) : null}
      </Grid>
      <Grid item xs={12} sm={8}>
        {children}
      </Grid>
    </Grid>
  );
}

/** Helper to render “Selected: …% of Iᵣ (≈ … A)” for a given “80-85” value and Ir amps. */
function SelectedCaption({ value, irAmps }) {
  if (!value) return null;

  const [rawL, rawH] = String(value).split('-');
  const pLow = Number(rawL);
  const pHigh = rawH != null ? Number(rawH) : pLow;
  const percentText = rawH != null ? `${pLow}–${pHigh}% of Iᵣ` : `${pLow}% of Iᵣ`;

  let ampsText = '';
  if (Number.isFinite(irAmps) && irAmps > 0) {
    const loA = (irAmps * (pLow / 100)).toFixed(2);
    const hiA = (irAmps * (pHigh / 100)).toFixed(2);
    ampsText = ` (≈ ${loA}${rawH != null ? `–${hiA}` : ''} A)`;
  }

  return (
    <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: 'text.secondary' }}>
      Selected: {percentText}{ampsText}
    </Typography>
  );
}

function FeederCard({ index, data, onChange }) {
  const setField = (key, value) => onChange(index, { ...data, [key]: value });

  // Auto compute Ir (Long-Time) = In × Ir Setting
  useEffect(() => {
    const inA = parseFloat(data.cb_in) || 0;
    const irSet = parseFloat(data.cb_ir_setting) || 0;
    const computed = inA > 0 && irSet > 0 ? +(inA * irSet).toFixed(2) : '';
    if (computed !== data.cb_ir_long_time) {
      setField('cb_ir_long_time', computed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.cb_in, data.cb_ir_setting]);

  const irAmps = Number(data.cb_ir_long_time);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        OUTGOING {index + 1}
      </Typography>

      <Stack spacing={2}>
        <Row label="Outgoing Busbar CT Primary">
          <TextField
            value={data.ct_primary ?? ''}
            onChange={(e) => setField('ct_primary', toNum(e.target.value))}
            type="number"
            size="small"
            style={{ width: '700px' }}
            InputProps={{
              inputProps: { min: 0 },
              endAdornment: <InputAdornment position="end">A</InputAdornment>
            }}
          />
        </Row>

        <Row label="Breaker Type" required>
          <Autocomplete
            freeSolo
            options={BREAKER_TYPES}
            value={data.breaker_type ?? ''}
            onChange={(_, v) => setField('breaker_type', v ?? '')}
            onInputChange={(_, v) => setField('breaker_type', v ?? '')}
            style={{ width: '700px' }}
            renderInput={(params) => (
              <TextField {...params} placeholder="VCB/ACB/MCCB/MCB/ELCB/RCCB" size="small" />
            )}
          />
        </Row>

        <Row label="CB Details(Make & Model No)">
          <TextField
            placeholder="Make & Model No"
            value={data.cb_make_model ?? ''}
            onChange={(e) => setField('cb_make_model', e.target.value)}
            size="small"
            style={{ width: '700px' }}
          />
        </Row>

        <Row label="Upload CB Nameplate/Datasheet">
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" component="label" size="small">
              Upload File
              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setField('cb_nameplate_file', f || null);
                }}
              />
            </Button>
            <Typography variant="body2" color="text.secondary" noWrap>
              {data.cb_nameplate_file?.name ?? 'No file selected'}
            </Typography>
          </Stack>
        </Row>

        <Row label={<span> Circuit Breaker – I<sub>n</sub> (Rated Current)</span>}>
          <TextField
            value={data.cb_in ?? ''}
            onChange={(e) => setField('cb_in', toNum(e.target.value))}
            type="number"
            size="small"
            style={{ width: '700px' }}
            InputProps={{
              inputProps: { min: 0 },
              endAdornment: <InputAdornment position="end">A</InputAdornment>
            }}
          />
        </Row>

        <Row label={<span>Circuit Breaker – I<sub>r</sub> Setting (@ × I<sub>n</sub>)</span>}>
          <TextField
            placeholder="e.g., 0.4, 0.6, 0.8, 1.0"
            value={data.cb_ir_setting ?? ''}
            onChange={(e) => {
              let val = parseFloat(e.target.value);
              if (isNaN(val)) val = '';
              else if (val < 0) val = 0;     // clamp min
              else if (val > 1) val = 1;     // clamp max
              setField('cb_ir_setting', val);
            }}
            type="number"
            size="small"
            style={{ width: '700px' }}
            InputProps={{
              inputProps: { min: 0, max: 1, step: 0.1 },
              endAdornment: <InputAdornment position="end">× In</InputAdornment>
            }}
          />
        </Row>


        {/* ======== CHANGED ROW ONLY (display read-only value, like your screenshot) ======== */}
        <Row label={<span>Circuit Breaker – I<sub>r</sub> (Long-Time/Continuous)</span>}>
          <Typography variant="body1">
            {data.cb_ir_long_time ? `${data.cb_ir_long_time} A` : ''}
          </Typography>
        </Row>
        {/* ======== END CHANGED ROW ======== */}

        {/* Warning Threshold - ButtonGroup style */}
        <Row label="Default Warning Threshold">
          <ButtonGroup variant="outlined" fullWidth>
            <Button
              variant={data.warning === '80-85' ? 'contained' : 'outlined'}
              onClick={() => setField('warning', '80-85')}
              style={{ width: '350px' }}
            >
              (80–85)% of Ir
            </Button>
            <Button
              variant={data.warning === '86-90' ? 'contained' : 'outlined'}
              onClick={() => setField('warning', '86-90')}
              style={{ width: '350px' }}
            >
              (86–90)% of Ir
            </Button>
          </ButtonGroup>
          <SelectedCaption value={data.warning} irAmps={irAmps} />
        </Row>

        {/* Critical Threshold - ButtonGroup style */}
        <Row label="Default Critical Threshold">
          <ButtonGroup variant="outlined" fullWidth>
            <Button
              variant={data.critical === '91-94' ? 'contained' : 'outlined'}
              onClick={() => setField('critical', '91-94')}
              style={{ width: '350px' }}
            >
              (91–94)% of Ir
            </Button>
            <Button
              variant={data.critical === '95-98' ? 'contained' : 'outlined'}
              onClick={() => setField('critical', '95-98')}
              style={{ width: '350px' }}
            >
              (95–98)% of Ir
            </Button>
          </ButtonGroup>
          <SelectedCaption value={data.critical} irAmps={irAmps} />
        </Row>
      </Stack>
    </Paper>
  );
}

export default function PanelOutgoingSupply({
  title = 'Panel Outgoing Supply Monitoring',
  initialCount = 0,
  initialFeeders,
  onChange
}) {
  const [count, setCount] = useState(clampInt(initialCount, 0, MAX_OUTGOINGS));

  const makeBlank = useCallback(
    () => ({
      ct_primary: '',
      breaker_type: '',
      cb_make_model: '',
      cb_nameplate_file: null,
      cb_in: '',
      cb_ir_setting: '',
      cb_ir_long_time: '',
      warning: '',
      critical: ''
    }),
    []
  );

  const [feeders, setFeeders] = useState(() => {
    const base = Array.from({ length: count }, () => makeBlank());
    if (Array.isArray(initialFeeders) && initialFeeders.length) {
      return base.map((row, i) => ({ ...row, ...(initialFeeders[i] || {}) }));
    }
    return base;
  });

  // Keep feeders array size in sync with `count`
  useEffect(() => {
    setFeeders((prev) => {
      const n = clampInt(count, 0, MAX_OUTGOINGS);
      if (prev.length === n) return prev;
      if (prev.length < n) {
        return prev.concat(Array.from({ length: n - prev.length }, () => makeBlank()));
      }
      return prev.slice(0, n);
    });
  }, [count, makeBlank]);

  // Emit payload up
  useEffect(() => {
    if (!onChange) return;
    onChange({ outgoing_count: count, outgoings: feeders });
  }, [count, feeders, onChange]);

  const disabledAdd = count >= MAX_OUTGOINGS;

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Number of Outgoing Feeders"
            type="number"
            size="small"
            fullWidth
            value={count}
            onChange={(e) => setCount(clampInt(e.target.value, 0, MAX_OUTGOINGS))}
            inputProps={{ min: 0, max: MAX_OUTGOINGS, step: 1 }}
            helperText={`Max ${MAX_OUTGOINGS}`}
          />
        </Grid>
        <Grid item xs={12} sm="auto">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCount((c) => clampInt(c - 1, 0, MAX_OUTGOINGS))}
              disabled={count <= 0}
            >
              - Remove
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setCount((c) => clampInt(c + 1, 0, MAX_OUTGOINGS))}
              disabled={disabledAdd}
            >
              + Add
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {count === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Set <b>Number of Outgoing Feeders</b> (max {MAX_OUTGOINGS}) to generate subsections.
        </Typography>
      ) : (
        <Stack spacing={2}>
          <Divider />
          {feeders.map((row, i) => (
            <FeederCard
              key={i}
              index={i}
              data={row}
              onChange={(idx, nextRow) =>
                setFeeders((prev) => prev.map((r, k) => (k === idx ? nextRow : r)))
              }
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
