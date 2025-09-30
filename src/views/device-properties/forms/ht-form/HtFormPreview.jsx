// FormPreview.jsx
import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, Divider, Button, Chip, Tooltip, Stack } from '@mui/material';
import { GlobalStyles } from '@mui/material';

/* ----------------- helpers ----------------- */
const isEmpty = (v) =>
  v == null ||
  v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

const optionLabel = (field, value) => field?.options?.find((o) => o?.value === value)?.label ?? value;

const toFixed = (n, d = 2) => {
  const x = Number.parseFloat(n);
  return Number.isFinite(x) ? x.toFixed(d) : '—';
};

/* ---- detect if a section contains fields of a prefix (ll_ / ln_) ---- */
const sectionHasPrefix = (sec, prefix) => (sec?.fields || []).some((f) => f && typeof f.id === 'string' && f.id.startsWith(`${prefix}_`));

/* ---- detect if values have a voltage-threshold set for a prefix ---- */
const hasVoltageThresholds = (values, prefix) =>
  Boolean(values?.[`${prefix}_acceptable_display`] || values?.[`${prefix}_warning_display`] || values?.[`${prefix}_critical_display`]);

/* ----------------- preview tiles ----------------- */
function VoltageThresholdsPreview({ prefix = 'll', unit = 'V', values = {} }) {
  if (!hasVoltageThresholds(values, prefix)) return null;

  const accText = values[`${prefix}_acceptable_display`]; // e.g., "Up to ±10%"
  const warnText = values[`${prefix}_warning_display`]; // e.g., "Between ±10% and ±15%"
  const critText = values[`${prefix}_critical_display`]; // e.g., "Above ±15%"

  const accLo = values[`${prefix}_acceptable_lower`];
  const accUp = values[`${prefix}_acceptable_upper`];

  const wLo1 = values[`${prefix}_warning_lower_1`];
  const wUp1 = values[`${prefix}_warning_upper_1`];
  const wLo2 = values[`${prefix}_warning_lower_2`];
  const wUp2 = values[`${prefix}_warning_upper_2`];

  const cLoMax = values[`${prefix}_critical_lower_max`];
  const cUpMin = values[`${prefix}_critical_upper_min`];

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={4}>
        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'success.light', border: '1px solid', borderColor: 'success.main' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'success.dark' }}>
            Acceptable Range
          </Typography>
          <Typography variant="body2">{accText || '—'}</Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9, mt: 0.25 }}>
            {accLo != null && accUp != null ? (
              <>
                Calculated: <b>{toFixed(accLo)}</b>–<b>{toFixed(accUp)}</b> {unit}
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
        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'warning.dark' }}>
            Warning Threshold
          </Typography>
          <Typography variant="body2">{warnText || '—'}</Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9, mt: 0.25 }}>
            {wLo1 != null && wUp1 != null && wLo2 != null && wUp2 != null ? (
              <>
                Calculated: <b>{toFixed(wLo1)}</b>–<b>{toFixed(wUp1)}</b> {unit} &nbsp;and&nbsp;
                <b>{toFixed(wLo2)}</b>–<b>{toFixed(wUp2)}</b> {unit}
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
        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'error.light', border: '1px solid', borderColor: 'error.main' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'error.dark' }}>
            Critical Threshold
          </Typography>
          <Typography variant="body2">{critText || '—'}</Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9, mt: 0.25 }}>
            {cLoMax != null && cUpMin != null ? (
              <>
                Calculated: &lt; <b>{toFixed(cLoMax)}</b> {unit} or &gt; <b>{toFixed(cUpMin)}</b> {unit}
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
  );
}

function VImbalancePreview({ values = {} }) {
  const acc = values.acceptable_range_Vdisplay;
  const wrn = values.warning_threshold_Vdisplay;
  const crt = values.critical_threshold_Vdisplay;
  if (!acc && !wrn && !crt) return null;

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={4}>
        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'success.light', border: '1px solid', borderColor: 'success.main' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'success.dark' }}>
            Acceptable (Voltage Imbalance)
          </Typography>
          <Typography variant="body2">{acc || '—'}</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'warning.dark' }}>
            Warning (Voltage Imbalance)
          </Typography>
          <Typography variant="body2">{wrn || '—'}</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'error.light', border: '1px solid', borderColor: 'error.main' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'error.dark' }}>
            Critical (Voltage Imbalance)
          </Typography>
          <Typography variant="body2">{crt || '—'}</Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

/* ----------------- generic field formatting ----------------- */
const formatValue = (field, value) => {
  if (isEmpty(value)) return '—';

  // per-field custom formatter (from config)
  if (typeof field?.previewFormat === 'function') {
    try {
      return field.previewFormat(value);
    } catch {
      /* fall through */
    }
  }

  switch (field?.type) {
    case 'button-group':
    case 'dropdown': {
      const lbl = optionLabel(field, value);
      return React.isValidElement(lbl) ? lbl : String(lbl ?? '');
    }

    case 'number':
      return Number.isFinite(Number(value)) ? String(value) : String(value);

    case 'date':
      return String(value);

    case 'datetime':
      try {
        return new Date(value).toLocaleString('en-IN');
      } catch {
        return String(value);
      }

    case 'file':
      if (Array.isArray(value)) return value.map((f) => f?.name ?? String(f)).join(', ');
      return value?.name ?? String(value);

    case 'dynamic-list':
    case 'dynamic-object-list':
      if (Array.isArray(value)) {
        return value
          .map((item) =>
            typeof item === 'object'
              ? Object.entries(item)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ')
              : String(item)
          )
          .join('  •  ');
      }
      return String(value);

    default:
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object') return JSON.stringify(value, null, 2);
      return String(value);
  }
};

const shouldSkip = (field) =>
  !field || field.type === 'hidden' || field.type === 'header' || field.type === 'table' || field.preview === false;

function FieldRow({ label, value, zebra }) {
  const isNode = React.isValidElement(value);
  return (
    <Grid
      container
      spacing={1.5}
      sx={{
        py: 0.75,
        px: 1,
        borderRadius: 1,
        ...(zebra ? { bgcolor: 'rgba(0,0,0,0.02)' } : null)
      }}
    >
      <Grid item xs={12} md={4}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        {isNode ? (
          value
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {value}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}

/* ----------------- main component ----------------- */
export default function HtFormPreview({
  sections = [], // [{ title, fields }]
  values = {}, // formData
  onEdit, // (stepIndex) => void
  hideEmpty = false,
  header // { title, subtitle, metaRight }
}) {
  const cards = useMemo(() => {
    return (sections || []).map((sec, idx) => {
      const fields = (sec?.fields || []).filter(Boolean);

      // Detect volt/imbalance blocks (you already have addLL/addLN/addVI)
      const addLL = sectionHasPrefix(sec, 'll') && hasVoltageThresholds(values, 'll');
      const addLN = sectionHasPrefix(sec, 'ln') && hasVoltageThresholds(values, 'ln');
      const addVI = fields.some(
        (f) =>
          f && (f.id === 'acceptable_range_Vdisplay' || f.id === 'warning_threshold_Vdisplay' || f.id === 'critical_threshold_Vdisplay')
      );

      // Detect outgoing-supply field/value (handles both shapes)
      const outgoingField = fields.find((f) => f.id === 'outgoing_count' || f.type === 'panel-outgoing-supply');
      let outgoingPayload = null;
      if (outgoingField) {
        const v = values[outgoingField.id];
        if (v && typeof v === 'object' && Array.isArray(v.outgoings)) {
          outgoingPayload = v; // { outgoing_count, outgoings }
        } else if (values.outgoing_count || Array.isArray(values.outgoings)) {
          outgoingPayload = {
            outgoing_count: values.outgoing_count ?? 0,
            outgoings: values.outgoings ?? []
          };
        }
      }

      const rows = fields
        .filter((f) => !shouldSkip(f))
        .map((f, i) => {
          const id = f.id || '';

          // Skip raw fields we render as blocks
          if (
            id === 'acceptable_range_Vdisplay' ||
            id === 'warning_threshold_Vdisplay' ||
            id === 'critical_threshold_Vdisplay' ||
            id.startsWith('ll_') ||
            id.startsWith('ln_') ||
            id === 'outgoing_count' ||
            id === 'outgoings'
          ) {
            return null;
          }

          const raw = values[id];
          const formatted = formatValue(f, raw);
          if (hideEmpty && (formatted === '—' || formatted === '' || formatted == null)) return null;
          return <FieldRow key={id || f.label || i} label={f.label || id} value={formatted} zebra={i % 2 === 1} />;
        })
        .filter(Boolean);

      return {
        idx,
        title: sec.title || sec.shortLabel || sec.label || `Section ${idx + 1}`,
        rows,
        addLL,
        addLN,
        addVI,
        outgoingPayload
      };
    });
  }, [sections, values, hideEmpty]);

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {header && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, boxShadow: 'none' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {header.title}
              </Typography>
              {header.subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {header.subtitle}
                </Typography>
              )}
            </Box>
            {header.metaRight}
          </Stack>
        </Paper>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {cards.map(({ idx, title, rows, addLL, addLN, addVI, outgoingPayload }) => (
          <Paper
            key={idx}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: 'none',
              breakInside: 'avoid',
              WebkitColumnBreakInside: 'avoid',
              pageBreakInside: 'avoid'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              {/* {typeof onEdit === 'function' && (
                <Tooltip title="Jump to edit section" className="no-print">
                  <Button size="small" variant="text" onClick={() => onEdit(idx)}>Edit</Button>
                </Tooltip>
              )} */}
            </Box>

            <Divider sx={{ mb: 1 }} />

            {/* Special summary tiles */}
            {addLL && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  3PH L-L Voltage Thresholds
                </Typography>
                <VoltageThresholdsPreview prefix="ll" unit="V" values={values} />
              </Box>
            )}

            {addLN && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  3PH L-N Voltage Thresholds
                </Typography>
                <VoltageThresholdsPreview prefix="ln" unit="V" values={values} />
              </Box>
            )}

            {addVI && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Voltage Imbalance
                </Typography>
                <VImbalancePreview values={values} />
              </Box>
            )}

            {outgoingPayload && (
              <Box sx={{ mb: 1.5 }}>
                <OutgoingsPreview payload={outgoingPayload} />
              </Box>
            )}

            {rows.length ? rows : <Chip label="No data in this section yet" size="small" />}
          </Paper>
        ))}
      </Box>

      {/* actions (hidden in print) */}
      <Box className="no-print" sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button variant="outlined" onClick={() => navigator.clipboard.writeText(JSON.stringify(values, null, 2))}>
          Copy JSON
        </Button>
        <Button variant="contained" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </Box>

      {/* print-only CSS */}
      <GlobalStyles
        styles={{
          '@media print': {
            '@page': { size: 'auto', margin: '14mm' },
            // hide app chrome + any element with .no-print
            'nav, aside, .MuiDrawer-root, .MuiAppBar-root, .no-print': { display: 'none !important' },
            // show only the preview area
            'body *': { visibility: 'hidden' },
            '.print-area, .print-area *': { visibility: 'visible' },
            '.print-area': { position: 'absolute', left: 0, top: 0, width: '100%', margin: 0, padding: 0 },
            'html, body': { background: '#fff' },
            '#root': { margin: 0, padding: 0 }
          }
        }}
      />
    </Box>
  );
}