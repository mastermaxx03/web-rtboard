// src/views/telemetry-kit/config/frequency.config.jsx
import { PERFORMANCE } from '../utils';

/** Derive min, max, avg, absolute deviation and max deviation % for frequency */
function deriveFrequency(row) {
  const f = Number(row.FREQ);
  if (!Number.isFinite(f)) return row;

  // Keep rolling aggregates if needed
  return { ...row, FREQ: +f.toFixed(2) };
}

function finalizeFreq(row, thresholds = { warnDev: 1, critDev: 3 }) {
  const f = Number(row.FREQ);
  const avg = f; // single value per row, actual avg comes from aggregation
  const dev = Math.abs(f - 50); // deviation from nominal 50 Hz
  const devPct = (dev / 50) * 100;

  let perf = PERFORMANCE.ACCEPTABLE;
  if (devPct >= thresholds.critDev) perf = PERFORMANCE.CRITICAL;
  else if (devPct >= thresholds.warnDev) perf = PERFORMANCE.WARNING;

  return {
    ...row,
    FREQ_AVG: +avg.toFixed(2),
    FREQ_DEV: +dev.toFixed(2),
    FREQ_DEV_PCT: +devPct.toFixed(2),
    PERFORMANCE: perf
  };
}

const frequencyConfig = {
  id: 'frequency',
  title: 'System Frequency',
  csvUrl: undefined,
  dataUrl: undefined,
  segment: 'frequency',

  normalize: (r) => ({
    ts: new Date(String(r.TS ?? r.ts ?? r.timestamp)).getTime(),
    DID: r.DID ?? r.device_id ?? 'UNKNOWN',
    SID: r.SLAVE_ID ?? r.SID ?? 'UNKNOWN',
    panel_name: r.panel_name ?? 'MCC10',
    panel_location: r.panel_location ?? 'Compressor House',
    FREQ: Number(r.FREQUENCY ?? r.FREQ)
  }),

  finalize: (row) => finalizeFreq(deriveFrequency(row)),

  columns: [
    { key: 'ts', label: 'TS', type: 'ts', width: 180 },
    { key: 'FREQ', label: 'Freq (Hz)', type: 'number', align: 'right', mono: true, bold: true },
    { key: 'FREQ_AVG', label: 'Avg (Hz)', type: 'number', align: 'right', mono: true },
    { key: 'FREQ_DEV', label: 'Abs Dev (Hz)', type: 'number', align: 'right', mono: true },
    { key: 'FREQ_DEV_PCT', label: 'Dev %', type: 'percent', align: 'right', mono: true },
    { key: 'PERFORMANCE', label: 'Performance', type: 'perf', align: 'right' }
  ],

  aggregation: {
    FREQ: 'avg',
    FREQ_AVG: 'avg',
    FREQ_DEV: 'avg',
    FREQ_DEV_PCT: 'avg'
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

  exportBase: 'frequency'
};

export default frequencyConfig;
