// src/views/telemetry-kit/config/pf.config.jsx
import React from 'react';
import { PERFORMANCE, THRESHOLDS, performanceOf } from '../utils';

function derivePFImbalance(row) {
  const r = Number(row.PF_R);
  const y = Number(row.PF_Y);
  const b = Number(row.PF_B);
  const avg = (r + y + b) / 3;
  const maxDev = Math.max(Math.abs(r - avg), Math.abs(y - avg), Math.abs(b - avg));
  const imbPct = avg ? (maxDev / avg) * 100 : 0;

  return {
    ...row,
    PF_AVG: Number.isFinite(avg) ? +avg.toFixed(3) : undefined,
    PF_MAX_DEV: Number.isFinite(maxDev) ? +maxDev.toFixed(3) : undefined,
    PF_IMB_PCT: Number.isFinite(imbPct) ? +imbPct.toFixed(2) : undefined
  };
}

const pfConfig = {
  id: 'pf',
  title: 'Average PF Factor',
  csvUrl: undefined,
  dataUrl: undefined,
  segment: 'pf',

  normalize: (r) => ({
    ts: new Date(String(r.TS ?? r.ts ?? r.timestamp)).getTime(),
    DID: r.DID ?? r.device_id ?? 'UNKNOWN',
    SID: r.SLAVE_ID ?? r.SID ?? 'UNKNOWN',
    panel_name: r.panel_name ?? 'MCC10',
    panel_location: r.panel_location ?? 'Compressor House',
    PF_R: Number(r.R_PF ?? r.PF_R ?? 0),
    PF_Y: Number(r.Y_PF ?? r.PF_Y ?? 0),
    PF_B: Number(r.B_PF ?? r.PF_B ?? 0),
    PF_AVG: Number(r.AVG_PF ?? r.PF_AVG ?? 0)
  }),

  finalize: (row) => {
    const d = derivePFImbalance(row);
    return { ...d, PERFORMANCE: performanceOf({ IMB_PCT: d.PF_IMB_PCT }, THRESHOLDS) };
  },

  columns: [
    { key: 'ts', label: 'TS', type: 'ts', width: 180 },
    { key: 'PF_R', label: 'PF R', type: 'number', align: 'right', mono: true },
    { key: 'PF_Y', label: 'PF Y', type: 'number', align: 'right', mono: true },
    { key: 'PF_B', label: 'PF B', type: 'number', align: 'right', mono: true },
    { key: 'PF_AVG', label: 'Avg PF', type: 'number', align: 'right', mono: true, bold: true },
    { key: 'PF_MAX_DEV', label: 'Max Dev', type: 'number', align: 'right', mono: true },
    { key: 'PF_IMB_PCT', label: 'PF Imb %', type: 'percent', align: 'right', mono: true },
    { key: 'PERFORMANCE', label: 'Performance', type: 'perf', align: 'right' }
  ],

  aggregation: {
    PF_R: 'avg',
    PF_Y: 'avg',
    PF_B: 'avg',
    PF_AVG: 'avg',
    PF_MAX_DEV: 'avg',
    PF_IMB_PCT: 'avg'
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
  exportBase: 'pf'
};

export default pfConfig;
