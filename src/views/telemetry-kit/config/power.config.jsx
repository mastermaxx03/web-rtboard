// src/views/telemetry-kit/config/power.config.jsx
import { THRESHOLDS, performanceOf, parseTSUtc } from '../utils';

function imbPct(a, b, c) {
  const A = Number(a),
    B = Number(b),
    C = Number(c);
  const avg = (A + B + C) / 3;
  if (!isFinite(avg) || avg === 0) return 0;
  const maxDev = Math.max(Math.abs(A - avg), Math.abs(B - avg), Math.abs(C - avg));
  return +((maxDev / avg) * 100).toFixed(2);
}
function worst(percs) {
  let out = 'ACCEPTABLE';
  for (const p of percs) {
    const s = performanceOf({ IMB_PCT: p }, THRESHOLDS);
    if (s === 'CRITICAL') return 'CRITICAL';
    if (s === 'WARNING') out = 'WARNING';
  }
  return out;
}

const powerConfig = {
  id: 'power',
  title: 'Power Consumption',
  csvUrl: undefined,
  // Works with either segment=all or separate segments; keep simple:
  segment: 'all',

  normalize: (r) => {
    const ts = parseTSUtc(r.TS ?? r.ts ?? r.timestamp);
    const DID = r.DID ?? r.device_id ?? 'UNKNOWN';
    const SID = String(r.SLAVE_ID ?? r.SID ?? 'UNKNOWN');
    const panel_name = r.panel_name ?? 'MCC10';
    const panel_location = r.panel_location ?? 'Compressor House';

    const kW_R = Number(r.R_KW),
      kW_Y = Number(r.Y_KW),
      kW_B = Number(r.B_KW);
    const kVA_R = Number(r.R_KVA),
      kVA_Y = Number(r.Y_KVA),
      kVA_B = Number(r.B_KVA);
    const kVAr_R = Number(r.R_KVAR),
      kVAr_Y = Number(r.Y_KVAR),
      kVAr_B = Number(r.B_KVAR);

    const kW_TOTAL = [kW_R, kW_Y, kW_B].every(Number.isFinite) ? +(kW_R + kW_Y + kW_B).toFixed(2) : undefined;
    const kVA_TOTAL = [kVA_R, kVA_Y, kVA_B].every(Number.isFinite) ? +(kVA_R + kVA_Y + kVA_B).toFixed(2) : undefined;
    const kVAr_TOTAL = [kVAr_R, kVAr_Y, kVAr_B].every(Number.isFinite) ? +(kVAr_R + kVAr_Y + kVAr_B).toFixed(2) : undefined;

    const kW_IMB_PCT = imbPct(kW_R, kW_Y, kW_B);
    const kVA_IMB_PCT = imbPct(kVA_R, kVA_Y, kVA_B);
    const kVAr_IMB_PCT = imbPct(kVAr_R, kVAr_Y, kVAr_B);

    return {
      ts,
      DID,
      SID,
      panel_name,
      panel_location,
      kW_R,
      kW_Y,
      kW_B,
      kW_TOTAL,
      kW_IMB_PCT,
      kVA_R,
      kVA_Y,
      kVA_B,
      kVA_TOTAL,
      kVA_IMB_PCT,
      kVAr_R,
      kVAr_Y,
      kVAr_B,
      kVAr_TOTAL,
      kVAr_IMB_PCT,
      PERFORMANCE: worst([kW_IMB_PCT, kVA_IMB_PCT, kVAr_IMB_PCT])
    };
  },

  finalize: (row) => row,

  columns: [
    { key: 'ts', label: 'TS', type: 'ts', width: 150 },
    { key: 'kW_R', label: 'kW R', type: 'number', align: 'right', mono: true },
    { key: 'kW_Y', label: 'kW Y', type: 'number', align: 'right', mono: true },
    { key: 'kW_B', label: 'kW B', type: 'number', align: 'right', mono: true },
    { key: 'kW_TOTAL', label: 'kW Total', type: 'number', align: 'right', mono: true, bold: true },
    { key: 'kW_IMB_PCT', label: 'kW Imb %', type: 'percent', align: 'right', mono: true },

    { key: 'kVA_R', label: 'kVA R', type: 'number', align: 'right', mono: true },
    { key: 'kVA_Y', label: 'kVA Y', type: 'number', align: 'right', mono: true },
    { key: 'kVA_B', label: 'kVA B', type: 'number', align: 'right', mono: true },
    { key: 'kVA_TOTAL', label: 'kVA Total', type: 'number', align: 'right', mono: true, bold: true },
    { key: 'kVA_IMB_PCT', label: 'kVA Imb %', type: 'percent', align: 'right', mono: true },

    { key: 'kVAr_R', label: 'kVAr R', type: 'number', align: 'right', mono: true },
    { key: 'kVAr_Y', label: 'kVAr Y', type: 'number', align: 'right', mono: true },
    { key: 'kVAr_B', label: 'kVAr B', type: 'number', align: 'right', mono: true },
    { key: 'kVAr_TOTAL', label: 'kVAr Total', type: 'number', align: 'right', mono: true, bold: true },
    { key: 'kVAr_IMB_PCT', label: 'kVAr Imb %', type: 'percent', align: 'right', mono: true },

    { key: 'PERFORMANCE', label: 'Performance', type: 'perf', align: 'right' }
  ],

  aggregation: {
    kW_R: 'avg',
    kW_Y: 'avg',
    kW_B: 'avg',
    kW_TOTAL: 'avg',
    kW_IMB_PCT: 'avg',
    kVA_R: 'avg',
    kVA_Y: 'avg',
    kVA_B: 'avg',
    kVA_TOTAL: 'avg',
    kVA_IMB_PCT: 'avg',
    kVAr_R: 'avg',
    kVAr_Y: 'avg',
    kVAr_B: 'avg',
    kVAr_TOTAL: 'avg',
    kVAr_IMB_PCT: 'avg'
  },

  pageSizes: [10, 25, 50, 100, 250],
  aggWindows: [
    { key: 0, label: 'RT Data' },
    { key: 15, label: 'Average of 15 min' },
    { key: 30, label: 'Average of 30 min' },
    { key: 60, label: 'Average of 1 hr' },
    { key: 240, label: 'Average of 4 hr' },
    { key: 480, label: 'Average of 8 hr' },
    { key: 1440, label: 'Average of 24 hr' }
  ],
  exportBase: 'power'
};

export default powerConfig;
