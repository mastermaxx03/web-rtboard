import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, Divider, Button, Chip, Stack, GlobalStyles } from '@mui/material';

/* ───────────────────── print-only CSS (scoped) ───────────────────── */
const PRINT_CSS = `
@page {
  size: A4 portrait;
  margin: 16mm;
}
@media print {
  /* print crisp colors for MUI */
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* hide everything */
  body * {
    visibility: hidden !important;
  }

  /* show ONLY the preview root */
  .mcc-print-root, .mcc-print-root * {
    visibility: visible !important;
  }

  /* position the preview at the top-left for printing */
  .mcc-print-root {
    position: absolute;
    inset: 0;
    width: auto;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  /* never print the action buttons */
  .mcc-no-print {
    display: none !important;
  }

  /* avoid breaking cards mid-page */
  .mcc-print-card {
    break-inside: avoid;
    page-break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #e0e0e0 !important;
  }

  /* tighter gap between cards on paper */
  .mcc-print-card + .mcc-print-card {
    margin-top: 12px !important;
  }

  /* optional: smaller text for dense print */
  .mcc-print-root .MuiTypography-body2 {
    font-size: 0.9rem;
  }
}
`;

/* ───────────────────────── helpers ───────────────────────── */

const isEmpty = (v) =>
  v == null ||
  v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

const optionLabel = (field, value) => field?.options?.find((o) => o?.value === value)?.label ?? value;

const toFixed = (n, dp = 3) => {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(dp) : String(n ?? '—');
};

const pct = (num, den) => {
  const n = Number(num);
  const d = Number(den);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return '—';
  return ((n / d) * 100).toFixed(1) + '%';
};

const strong = (v) => <b>{v}</b>;

/* IEC PF bands (3-decimal) */
const IEC_PF = {
  ACCEPT_LOWER: 0.954,
  WARN_LOWER: 0.864,
  WARN_UPPER: 0.953,
  CRIT_UPPER: 0.863
};
const r3 = (x) => Number.parseFloat((Math.round((Number(x) + Number.EPSILON) * 1000) / 1000).toFixed(3));
const clamp = (x, a, b) => Math.min(Math.max(Number(x), a), b);

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

/* ───────────────────── value formatting ───────────────────── */

const formatSimple = (field, value, allValues) => {
  if (isEmpty(value)) return '—';

  // per-field custom formatter from configs
  if (typeof field.previewFormat === 'function') {
    try {
      return field.previewFormat(value, allValues);
    } catch {
      /* fall through */
    }
  }

  switch (field.type) {
    case 'button-group':
    case 'dropdown':
      return String(optionLabel(field, value));

    case 'number': {
      const u = field.unit ? ` ${field.unit}` : '';
      return Number.isFinite(Number(value)) ? String(value) + u : String(value);
    }

    case 'combo-input': {
      const u = field.unit ? ` ${field.unit}` : '';
      return `${value}${u}`;
    }

    case 'value-with-unit': {
      const unitFromState = (field.unitFieldId && allValues?.[field.unitFieldId]) || field.unit || '';
      return `${value ?? ''}${unitFromState ? ` ${unitFromState}` : ''}`;
    }

    case 'date':
      return String(value);

    case 'datetime': {
      try {
        return new Date(value).toLocaleString('en-IN');
      } catch {
        return String(value);
      }
    }

    case 'file':
      if (Array.isArray(value)) return value.map((f) => f?.name ?? String(f)).join(', ');
      return value?.name ?? String(value);

    default:
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
  }
};

/* ────────────────────── primitive row UI ───────────────────── */

function FieldRow({ label, value }) {
  return (
    <Grid container spacing={1} sx={{ py: 0.5 }}>
      <Grid item xs={5} md={4}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={7} md={8}>
        {typeof value === 'string' || typeof value === 'number' ? <Typography variant="body2">{value}</Typography> : value}
      </Grid>
    </Grid>
  );
}

/* ──────────────── renderers for special blocks ─────────────── */

const ThresholdsBlockPreview = ({ field, values }) => {
  const pfx = field?.config?.fieldPrefix || '';
  const unit = field?.config?.unit || '';
  const nominal = values?.[`${pfx}_voltage_input`];
  const acc = values?.[`${pfx}_acceptable_display`];
  const warn = values?.[`${pfx}_warning_display`];
  const crit = values?.[`${pfx}_critical_display`];

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <FieldRow label="Nominal" value={nominal != null && nominal !== '' ? `${nominal} ${unit}` : '—'} />
      <FieldRow label="Acceptable" value={acc || '—'} />
      <FieldRow label="Warning" value={warn || '—'} />
      <FieldRow label="Critical" value={crit || '—'} />
    </Box>
  );
};

const ImbalanceBlockPreview = ({ field, values }) => {
  const pfx = field?.config?.fieldPrefix || 'vi';
  const variant = field?.config?.variant || 'voltage';

  if (pfx === 'ci' || variant === 'current') {
    const mode = values?.ci_mode || 'iec';
    const buf = values?.ci_buffer_pct ?? 0;
    const acc = values?.ci_acc_display || '—';
    const warn = values?.ci_warn_display || '—';
    const crit = values?.ci_crit_display || '—';
    return (
      <Box sx={{ px: 1, py: 0.5 }}>
        <FieldRow label="Mode" value={String(mode)} />
        <FieldRow label="Buffer" value={buf !== '' && buf != null ? `${buf}%` : '—'} />
        <FieldRow label="Acceptable" value={acc} />
        <FieldRow label="Warning" value={warn} />
        <FieldRow label="Critical" value={crit} />
      </Box>
    );
  }

  const mode = values?.vi_mode || 'iec';
  const buf = values?.vi_buffer_pct ?? 0;
  const acc = values?.acceptable_range_Vdisplay || '—';
  const warn = values?.warning_threshold_Vdisplay || '—';
  const crit = values?.critical_threshold_Vdisplay || '—';

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <FieldRow label="Mode" value={String(mode)} />
      <FieldRow label="Buffer" value={buf !== '' && buf != null ? `${buf}%` : '—'} />
      <FieldRow label="Acceptable" value={acc} />
      <FieldRow label="Warning" value={warn} />
      <FieldRow label="Critical" value={crit} />
    </Box>
  );
};

const FrequencyBlockPreview = ({ values }) => {
  const n = values?.nominal_frequency;
  const w = values?.warning_threshold_freq_display || '—';
  const c = values?.critical_threshold_freq_display || '—';
  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <FieldRow label="Nominal Frequency" value={n ? `${n} Hz` : '—'} />
      <FieldRow label="Warning Range" value={w} />
      <FieldRow label="Critical Range" value={c} />
    </Box>
  );
};

const PowerBalanceBlockPreview = ({ values }) => {
  const total = values?.total_rated_power_kw;
  const r = Number(values?.r_phase_rated_power || 0);
  const y = Number(values?.y_phase_rated_power || 0);
  const b = Number(values?.b_phase_rated_power || 0);
  const sum = Number.isFinite(r + y + b) ? r + y + b : null;

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <FieldRow label="Total Rated Power" value={total != null && total !== '' ? `${total} kW` : '—'} />
      <FieldRow label="R / Y / B (kW)" value={`${toFixed(r, 3)} / ${toFixed(y, 3)} / ${toFixed(b, 3)}`} />
      <FieldRow label="Sum (R+Y+B)" value={sum != null ? `${toFixed(sum, 3)} kW` : '—'} />
      <FieldRow label="Calculated %" value={sum != null && total ? strong(pct(sum, total)) : '—'} />
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Bands: Up to <b>100%</b> (OK) • <b>100–110%</b> (Warning) • <b>{'>'}110%</b> (Critical)
        </Typography>
      </Box>
    </Box>
  );
};

const PFThresholdsPreview = ({ values }) => {
  const mode = values?.pf_thresholds_mode || values?.pf_mode || 'iec';
  const buffer = values?.pf_thresholds_buffer ?? values?.pf_buffer ?? 0.001;
  const accDisplay = values?.pf_acc_display;
  const warnDisplay = values?.pf_warn_display;
  const critDisplay = values?.pf_crit_display;

  const bands = computePfBands(mode, buffer);

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <FieldRow label="Mode" value={String(mode)} />
      <FieldRow label="Buffer" value={mode === 'iec+buffer' ? `${toFixed(buffer, 3)} PF` : '—'} />
      <FieldRow
        label="Acceptable"
        value={accDisplay || `Between ${bands.acceptable.upper.toFixed(3)} and ${bands.acceptable.lower.toFixed(3)}`}
      />
      <FieldRow label="Warning" value={warnDisplay || `Between ${bands.warning.upper.toFixed(3)} and ${bands.warning.lower.toFixed(3)}`} />
      <FieldRow label="Critical" value={critDisplay || `≤ ${bands.critical.upper.toFixed(3)}`} />
    </Box>
  );
};

/* ───────────────────────── main preview ───────────────────────── */

const shouldSkip = (field) => !field || field.type === 'hidden' || field.type === 'header' || field.preview === false;

/**
 * MccFormPreview — sectioned, comprehensive preview of ALL fields.
 *
 * Props:
 *  - sections: [{ title, fields }]
 *  - values:   formData object
 *  - hideEmpty?: boolean (default false)
 */
export default function MccFormPreview({ sections = [], values = {}, hideEmpty = false }) {
  const cards = useMemo(() => {
    return sections.map((sec, idx) => {
      const rows = (sec.fields || [])
        .filter((f) => !shouldSkip(f))
        .map((f) => {
          // Special/compound field types rendered richly:
          if (f.type === 'thresholds-block') {
            return (
              <Box key={f.id || f.label} sx={{ my: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                  {f?.config?.title || f.label || 'Voltage Thresholds'}
                </Typography>
                <ThresholdsBlockPreview field={f} values={values} />
              </Box>
            );
          }
          if (f.type === 'imbalance-block') {
            return (
              <Box key={f.id || f.label} sx={{ my: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                  {f?.config?.title || f.label || 'Imbalance'}
                </Typography>
                <ImbalanceBlockPreview field={f} values={values} />
              </Box>
            );
          }
          if (f.type === 'frequency-block') {
            return (
              <Box key={f.id || f.label} sx={{ my: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                  {f?.config?.title || f.label || 'Frequency'}
                </Typography>
                <FrequencyBlockPreview values={values} />
              </Box>
            );
          }
          if (f.type === 'power-balance-block') {
            return (
              <Box key={f.id || f.label} sx={{ my: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                  {f?.config?.title || f.label || '3PH Power Balance'}
                </Typography>
                <PowerBalanceBlockPreview values={values} />
              </Box>
            );
          }
          if (f.type === 'pf-thresholds') {
            return (
              <Box key={f.id || f.label} sx={{ my: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                  Power Factor Thresholds
                </Typography>
                <PFThresholdsPreview values={values} />
              </Box>
            );
          }

          // IMPORTANT: Do NOT show PF slab tables in preview/print (per your request)
          if (f.type === 'table') return null;

          // Normal field → single line
          const raw = values[f.id];
          const formatted = formatSimple(f, raw, values);
          if (hideEmpty && (formatted === '—' || formatted === '' || formatted == null)) return null;

          // If the field has a unit but type isn't number/combo-input, append
          const value = f.unit && typeof formatted === 'string' && formatted !== '—' ? `${formatted} ${f.unit}` : formatted;

          return <FieldRow key={f.id || f.label} label={f.label || f.id} value={value} />;
        })
        .filter(Boolean);

      return { idx, title: sec.title || sec.label || `Section ${idx + 1}`, rows };
    });
  }, [sections, values, hideEmpty]);

  return (
    <>
      {/* Inject print-only CSS (scoped) */}
      <GlobalStyles styles={{}} />
      <style>{PRINT_CSS}</style>

      {/* Everything inside this root is the ONLY thing that prints */}
      <Box className="mcc-print-root" sx={{ display: 'grid', gap: 2 }}>
        {cards.map(({ idx, title, rows }) => (
          <Paper key={idx} variant="outlined" sx={{ p: 2 }} className="mcc-print-card">
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 1 }} />
            {rows.length ? rows : <Chip label="No data in this section yet" size="small" />}
          </Paper>
        ))}

        {/* Actions never appear on paper */}
        <Box className="mcc-no-print" sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button variant="outlined" onClick={() => navigator.clipboard.writeText(JSON.stringify(values, null, 2))}>
            Copy JSON
          </Button>
          <Button variant="contained" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </Box>
      </Box>
    </>
  );
}
