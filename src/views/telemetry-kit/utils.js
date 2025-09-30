/* utils.js — time, numbers, performance, aggregation, dynamic exports (UTC-safe) */

export function parseTSUtc(ts) {
  if (ts == null) return NaN;
  if (typeof ts === 'number') return ts;
  const s = String(ts).trim();
  if (!s) return NaN;

  // "YYYY-MM-DD HH:mm:ss" (no TZ) => treat as UTC
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(s)) {
    return Date.parse(s.replace(' ', 'T') + 'Z');
  }
  // "YYYY-MM-DD" => midnight UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return Date.parse(s + 'T00:00:00Z');
  }
  // ISO with Z / +00:00 etc.
  return Date.parse(s);
}

/* ---- Time formatters ---- */

// Keep for files/exports (always UTC)
export const fmtUTC = (d) => {
  const ms = Number(d);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toLocaleString(undefined, {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// NEW: Local-time formatter for on-screen tables
export const fmtLocal = (d) => {
  const ms = Number(d);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toLocaleString(undefined, {
    // user’s local timezone
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// Use LOCAL for UI (tables). Exports still call fmtUTC explicitly.
export const fmt = fmtLocal;

export const n2 = (v) => (v === null || v === undefined || Number.isNaN(+v) ? '' : Number(v).toFixed(2));
export const n2pct = (v) => (v === null || v === undefined || Number.isNaN(+v) ? '' : `${Number(v).toFixed(2)} %`);

export const PERFORMANCE = { ACCEPTABLE: 'ACCEPTABLE', WARNING: 'WARNING', CRITICAL: 'CRITICAL' };
export const THRESHOLDS = { acceptableMaxImbPct: 2, warningMaxImbPct: 5 };
export const DEFAULT_THRESHOLDS = THRESHOLDS;

export function deriveImbalance(row, keys) {
  const [a, b, c] = keys.map((k) => Number(row[k]));
  const VAVG = (a + b + c) / 3;
  const MAX_DEV = Math.max(Math.abs(a - VAVG), Math.abs(b - VAVG), Math.abs(c - VAVG));
  const IMB_PCT = VAVG ? (MAX_DEV / VAVG) * 100 : 0;
  return { ...row, VAVG: +VAVG.toFixed(2), MAX_DEV: +MAX_DEV.toFixed(2), IMB_PCT: +IMB_PCT.toFixed(2) };
}
export function deriveLL(r) {
  return deriveImbalance(r, ['VRY', 'VYB', 'VBR']);
}

export function performanceOf(row, thresholds = THRESHOLDS) {
  const p = Number(row.IMB_PCT) || 0;
  if (p <= thresholds.acceptableMaxImbPct) return PERFORMANCE.ACCEPTABLE;
  if (p <= thresholds.warningMaxImbPct) return PERFORMANCE.WARNING;
  return PERFORMANCE.CRITICAL;
}

const NON_NUMERIC_KEYS = new Set(['ts', 'DID', 'SID', 'panel_name', 'panel_location', 'PERFORMANCE']);

export function aggregate(rows, minutes, strategy = 'avg') {
  if (!minutes || minutes <= 0) {
    return rows.slice().sort((a, b) => Number(a.ts) - Number(b.ts));
  }
  const bucketMs = minutes * 60 * 1000;
  const map = new Map();

  for (const r of rows) {
    const t = Number(r.ts);
    const bucketStart = Math.floor(t / bucketMs) * bucketMs;
    const key = `${bucketStart}|${r.DID}|${r.SID}`;

    if (!map.has(key)) {
      map.set(key, {
        ts: bucketStart,
        DID: r.DID,
        SID: r.SID,
        panel_name: r.panel_name,
        panel_location: r.panel_location,
        _n: 0
      });
    }
    const acc = map.get(key);
    acc._n += 1;

    for (const k of Object.keys(r)) {
      if (NON_NUMERIC_KEYS.has(k)) continue;
      const v = Number(r[k]);
      if (!Number.isFinite(v)) continue;
      acc[k] = (acc[k] || 0) + v;
    }
  }

  const out = [];
  map.forEach((acc) => {
    const n = Math.max(1, acc._n);
    const row = {
      ts: acc.ts,
      DID: acc.DID,
      SID: acc.SID,
      panel_name: acc.panel_name,
      panel_location: acc.panel_location
    };
    for (const k of Object.keys(acc)) {
      if (NON_NUMERIC_KEYS.has(k) || k === '_n') continue;
      const raw = acc[k];
      const v = strategy === 'sum' ? raw : raw / n;
      row[k] = +Number(v).toFixed(2);
    }
    out.push(row);
  });
  out.sort((a, b) => Number(a.ts) - Number(b.ts));
  return out;
}
export { aggregate as aggregateGeneric };

/* -------------------------- Dynamic export helpers -------------------------- */

function formatByType(type, v) {
  switch (type) {
    case 'ts':
      return fmtUTC(v); // exports stay UTC
    case 'percent':
      return n2pct(v);
    case 'number':
      return n2(v);
    case 'perf':
      return v ?? '';
    default:
      return v ?? '';
  }
}

/**
 * Build a flat object for export using a columns definition.
 * Always prefixes identity columns: TS, DID, SID, Panel, Location.
 */
function projectRow(columns, r) {
  const out = {
    TS: fmtUTC(r.ts), // exports stay UTC
    DID: r.DID,
    SID: r.SID,
    'Panel Name': r.panel_name,
    Location: r.panel_location
  };
  columns.forEach((c) => {
    if (c.key === 'ts') return;
    out[c.label || c.key] = formatByType(c.type, r[c.key]);
  });
  return out;
}

export function exportGenericCSV(columns, rows, filename = 'telemetry.csv') {
  const data = rows.map((r) => projectRow(columns, r));
  const headers = Object.keys(data[0] || {});

  const lines = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => {
          const cell = row[h] ?? '';
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(',')
    )
  ];
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportGenericXLSX(columns, rows, filename = 'telemetry.xlsx') {
  try {
    const XLSX = (await import('xlsx')).default;
    const data = rows.map((r) => projectRow(columns, r));
    const sheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Telemetry');
    XLSX.writeFile(wb, filename);
  } catch {
    exportGenericCSV(columns, rows, filename.replace(/\.xlsx$/i, '.csv'));
  }
}

/* Backwards compatibility (old callers) */
export const exportCSV = exportGenericCSV;
export const exportXLSX = exportGenericXLSX;
