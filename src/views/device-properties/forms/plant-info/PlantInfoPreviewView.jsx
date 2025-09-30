import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid, Divider, Button, Chip, Stack } from '@mui/material';

// print-only CSS scoped locally
const PRINT_CSS = `
@page { size: A4 portrait; margin: 16mm; }
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body * { visibility: hidden !important; }
  .plant-prev-root, .plant-prev-root * { visibility: visible !important; }
  .plant-prev-root { position: absolute; inset: 0; margin:0!important; padding:0!important; background:#fff!important; }
  .plant-prev-noprint { display: none !important; }
  .plant-prev-card { break-inside: avoid; page-break-inside: avoid; box-shadow: none !important; border:1px solid #e0e0e0 !important; }
  .plant-prev-card + .plant-prev-card { margin-top: 12px !important; }
}
`;

const isEmpty = (v) =>
  v == null ||
  v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

function Row({ label, value }) {
  return (
    <Grid container spacing={1} sx={{ py: 0.5 }}>
      <Grid item xs={5} md={4}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={7} md={8}>
        {typeof value === 'string' || typeof value === 'number' ? <Typography variant="body2">{String(value)}</Typography> : value}
      </Grid>
    </Grid>
  );
}

const asLabel = (field, raw) => {
  if (isEmpty(raw)) return '—';
  if (field.type === 'dropdown') {
    const opt = field.options?.find((o) => o.value === raw);
    return opt?.label ?? raw;
  }
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'object') return JSON.stringify(raw);
  return raw;
};

// pretty formatters for known compound fields
const AddressView = (addr) =>
  isEmpty(addr) ? (
    '—'
  ) : (
    <Typography variant="body2">
      {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(', ')}
    </Typography>
  );

const ShiftsView = (rows = []) =>
  rows.length ? (
    <Box sx={{ display: 'grid', gap: 0.25 }}>
      {rows.map((r, i) => (
        <Typography key={i} variant="body2">
          • {r.label || `Shift ${i + 1}`}: {r.start || '—'}–{r.end || '—'}
        </Typography>
      ))}
    </Box>
  ) : (
    '—'
  );

const ZonesView = (zones = []) =>
  zones.length ? (
    <Box sx={{ display: 'grid', gap: 0.25 }}>
      {zones.map((z) => (
        <Typography key={z.key} variant="body2">
          • {z.label || z.key} — {z.rate ? `${z.rate} ₹/kWh` : 'rate: —'};{' '}
          {(z.slots || []).length ? (z.slots || []).map((s) => `${s.start || '—'}–${s.end || '—'}`).join(', ') : 'no slots'}
        </Typography>
      ))}
    </Box>
  ) : (
    '—'
  );

/**
 * sections: [{label, fields:[{id,label,type,...}]}]  (all steps before Preview)
 * values:   full form state
 */
export default function PlantInfoPreviewView({ sections = [], values = {} }) {
  const cards = useMemo(() => {
    return (sections || []).map((sec, idx) => {
      const rows = (sec.fields || [])
        .filter((f) => f && !['header', 'preview'].includes(f.type))
        .map((f) => {
          if (f.dependsOn) {
            const { field, equals } = f.dependsOn;
            if (values[field] !== equals) return null;
          }

          // pretty print for common complex fields/ids
          if (f.id === 'address_package') {
            return <Row key="address_package" label={f.label || 'Address'} value={AddressView(values[f.id])} />;
          }
          if (f.id === 'shift_block') {
            return <Row key="shift_block" label={f.label || 'Shifts'} value={ShiftsView(values[f.id])} />;
          }
          if (f.id === 'tod_zones') {
            return <Row key="tod_zones" label={f.label || 'ToD Zones'} value={ZonesView(values[f.id])} />;
          }

          return <Row key={f.id || f.label} label={f.label || f.id} value={asLabel(f, values[f.id])} />;
        })
        .filter(Boolean);

      return { idx, title: sec.label || `Section ${idx + 1}`, rows };
    });
  }, [sections, values]);

  return (
    <>
      <style>{PRINT_CSS}</style>

      <Box className="plant-prev-root" sx={{ display: 'grid', gap: 2 }}>
        {cards.map(({ idx, title, rows }) => (
          <Paper key={idx} variant="outlined" sx={{ p: 2 }} className="plant-prev-card">
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 1 }} />
            {rows.length ? rows : <Chip label="No data in this section yet" size="small" />}
          </Paper>
        ))}

        {/* actions – not printed */}
        <Box className="plant-prev-noprint" sx={{ display: 'flex', gap: 1, mt: 1 }}>
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
