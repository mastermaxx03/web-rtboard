// src/views/telemetry/llVoltage/utils.js

/** -----------------------------------------------------------------------
 *  TIME + FORMATTING (UTC-SAFE)
 *  The CSV timestamps are UTC ("2025-09-01 00:00:00+00:00").
 *  Previously we used toLocaleString() without a fixed zone, which shifted
 *  timestamps into the browser's local TZ (e.g., IST -> +5:30).
 *  We now format ALL displayed timestamps in UTC so 00:00:00 appears exactly.
 *  --------------------------------------------------------------------- */
export const fmtUTC = (d) => (d ? new Date(d).toLocaleString(undefined, { timeZone: 'UTC' }) : '');

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'mm/dd/yyyy');

/** alias used by tables (kept same name as your alert code uses `fmt`) */
export const fmt = fmtUTC;

/** -----------------------------------------------------------------------
 *  PERFORMANCE GRADING
 *  You can tweak imbalance % thresholds here.
 *  --------------------------------------------------------------------- */
export const PERFORMANCE = {
  ACCEPTABLE: 'ACCEPTABLE',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL'
};

// Adjust to taste
export const THRESHOLDS = {
  acceptableMaxImbPct: 2, // <=2% is ACCEPTABLE
  warningMaxImbPct: 5 // <=5% is WARNING, else CRITICAL
};

/** Add VAVG / MAX_DEV / IMB_PCT to a raw row */
export function deriveLL(r) {
  const VRY = Number(r.VRY);
  const VYB = Number(r.VYB);
  const VBR = Number(r.VBR);
  const VAVG = (VRY + VYB + VBR) / 3;
  const MAX_DEV = Math.max(Math.abs(VRY - VAVG), Math.abs(VYB - VAVG), Math.abs(VBR - VAVG));
  const IMB_PCT = VAVG ? (MAX_DEV / VAVG) * 100 : 0;

  return {
    ...r,
    VAVG: +VAVG.toFixed(2),
    MAX_DEV: +MAX_DEV.toFixed(2),
    IMB_PCT: +IMB_PCT.toFixed(2)
  };
}

/** Map a row to a performance bucket (by IMB_PCT) */
export function performanceOf(row) {
  const p = row.IMB_PCT;
  if (p <= THRESHOLDS.acceptableMaxImbPct) return PERFORMANCE.ACCEPTABLE;
  if (p <= THRESHOLDS.warningMaxImbPct) return PERFORMANCE.WARNING;
  return PERFORMANCE.CRITICAL;
}

/** -----------------------------------------------------------------------
 *  AGGREGATION
 *  If `minutes` is falsy/<=0 -> RT (1s rows). Otherwise average per bucket.
 *  IMPORTANT: All bucketing is done in UTC using epoch ms so day boundaries
 *  match the CSV’s UTC day.
 *  --------------------------------------------------------------------- */
export function aggregate(rows, minutes) {
  if (!minutes || minutes <= 0) {
    return rows.map(deriveLL).map((x) => ({ ...x, PERFORMANCE: performanceOf(x) }));
  }

  const bucketMs = minutes * 60 * 1000;
  const map = new Map();

  for (const r of rows) {
    // t is epoch (UTC). Math stays in UTC -> no shifts.
    const t = new Date(r.ts).getTime();
    const bucketStart = Math.floor(t / bucketMs) * bucketMs;
    const key = `${bucketStart}|${r.DID}|${r.SID}`;

    const cur = map.get(key) || {
      ts: bucketStart, // keep epoch ms for stable UTC formatting later
      DID: r.DID,
      SID: r.SID,
      panel_name: r.panel_name,
      panel_location: r.panel_location,
      VRY: 0,
      VYB: 0,
      VBR: 0,
      _n: 0
    };

    cur.VRY += Number(r.VRY);
    cur.VYB += Number(r.VYB);
    cur.VBR += Number(r.VBR);
    cur._n += 1;
    map.set(key, cur);
  }

  const out = [];
  map.forEach((acc) => {
    const n = Math.max(1, acc._n);
    const row = {
      ts: acc.ts, // epoch
      DID: acc.DID,
      SID: acc.SID,
      panel_name: acc.panel_name,
      panel_location: acc.panel_location,
      VRY: +(acc.VRY / n).toFixed(2),
      VYB: +(acc.VYB / n).toFixed(2),
      VBR: +(acc.VBR / n).toFixed(2)
    };
    const d = deriveLL(row);
    out.push({ ...d, PERFORMANCE: performanceOf(d) });
  });

  // Ascending time
  out.sort((a, b) => Number(a.ts) - Number(b.ts));
  return out;
}

/** -----------------------------------------------------------------------
 *  EXPORTS
 *  CSV/XLSX use UTC timestamp formatting to match what you see in the table.
 *  --------------------------------------------------------------------- */
export function exportCSV(rows, filename = 'll_voltage.csv') {
  const headers = ['TS', 'DID', 'SID', 'Panel Name', 'Location', 'VRY', 'VYB', 'VBR', 'VAVG', 'MAX_DEV', 'IMB_PCT', 'Performance'];

  const lines = rows.map((r) =>
    [fmtUTC(r.ts), r.DID, r.SID, r.panel_name, r.panel_location, r.VRY, r.VYB, r.VBR, r.VAVG, r.MAX_DEV, r.IMB_PCT, r.PERFORMANCE]
      .map((x) => `"${String(x).replace(/"/g, '""')}"`)
      .join(',')
  );

  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportXLSX(rows, filename = 'll_voltage.xlsx') {
  try {
    const XLSX = (await import('xlsx')).default;
    const normalized = rows.map((r) => ({ ...r, TS: fmtUTC(r.ts) }));
    const sheet = XLSX.utils.json_to_sheet(normalized);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'LL Voltage');
    XLSX.writeFile(wb, filename);
  } catch {
    // Fallback if xlsx isn't available in the environment
    exportCSV(rows, filename.replace(/\.xlsx$/, '.csv'));
  }
}
