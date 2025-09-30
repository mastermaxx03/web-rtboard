// src/views/telemetry-kit/config/harmonics.config.jsx
import { PERFORMANCE } from '../utils';
import { parseTSUtc } from '../utils';

function avg3(a, b, c) {
  const n = [a, b, c].map(Number).filter(Number.isFinite);
  if (!n.length) return undefined;
  return +(n.reduce((s, x) => s + x, 0) / n.length).toFixed(2);
}

const harmonicsConfig = {
  id: 'harmonics',
  title: 'Harmonics (THD)',
  csvUrl: undefined,

  // allow API that uses either "all" or "thd"
  segments: ['all'],

  normalize: (r) => {
    const THD_V = Number(r.THD_V) || avg3(r.R_THD_V, r.Y_THD_V, r.B_THD_V);
    const THD_I = Number(r.THD_I) || avg3(r.R_THD_I, r.Y_THD_I, r.B_THD_I);
    return {
      // ✅ robust UTC parsing for both "...Z" and "...+00:00"
      ts: parseTSUtc(r.TS ?? r.ts ?? r.timestamp),

      DID: r.DID ?? r.device_id ?? 'UNKNOWN',
      SID: r.SLAVE_ID ?? r.SID ?? 'UNKNOWN',
      panel_name: r.panel_name ?? 'MCC10',
      panel_location: r.panel_location ?? 'Compressor House',
      THD_V,
      THD_I
    };
  },

  finalize: (row) => ({ ...row, PERFORMANCE: PERFORMANCE.ACCEPTABLE }),

  columns: [
    { key: 'ts', label: 'TS', type: 'ts', width: 180 },
    { key: 'THD_V', label: 'THD-V %', type: 'percent', mono: true, align: 'right' },
    { key: 'THD_I', label: 'THD-I %', type: 'percent', mono: true, align: 'right' },
    { key: 'PERFORMANCE', label: 'Performance', type: 'perf', align: 'right' }
  ],

  aggregation: { THD_V: 'avg', THD_I: 'avg' },
  pageSizes: [10, 25, 50, 100, 250],
  aggWindows: [
    { key: 0, label: 'RT Data (1s)' },
    { key: 15, label: 'Average of 15 min' },
    { key: 30, label: 'Average of 30 min' },
    { key: 60, label: 'Average of 1 hr' },
    { key: 240, label: 'Average of 4 hr' },
    { key: 480, label: 'Average of 8 hr' },
    { key: 1440, label: 'Average of 24 hr' }
  ],
  exportBase: 'harmonics'
};

export default harmonicsConfig;
