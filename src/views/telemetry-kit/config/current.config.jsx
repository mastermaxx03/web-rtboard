// src/views/telemetry-kit/config/current.config.js
import { PERFORMANCE, THRESHOLDS, performanceOf } from '../utils';

function deriveCurrent(row) {
  const IR = Number(row.IR);
  const IY = Number(row.IY);
  const IB = Number(row.IB);

  const IAVG = (IR + IY + IB) / 3;

  const devR = Math.abs(IR - IAVG);
  const devY = Math.abs(IY - IAVG);
  const devB = Math.abs(IB - IAVG);

  const MAX_DEV = Math.max(devR, devY, devB);
  const IMB_PCT = IAVG ? (MAX_DEV / IAVG) * 100 : 0;

  return {
    ...row,
    IAVG: +IAVG.toFixed(2),
    MAX_DEV: +MAX_DEV.toFixed(2),
    IMB_PCT: +IMB_PCT.toFixed(2),
    PERFORMANCE: performanceOf({ IMB_PCT }, THRESHOLDS)
  };
}

const currentConfig = {
  id: 'current',
  title: '3-Phase Current',
  csvUrl: undefined, // using JSON now
  segment: 'current',

  normalize: (r) => ({
    ts: new Date(String(r.TS ?? r.ts ?? r.timestamp)).getTime(),
    DID: r.DID ?? 'UNKNOWN',
    SID: r.SLAVE_ID ?? r.SID ?? 'UNKNOWN',
    panel_name: r.panel_name ?? 'MCC10',
    panel_location: r.panel_location ?? 'Compressor House',
    IR: Number(r.IR ?? 0),
    IY: Number(r.IY ?? 0),
    IB: Number(r.IB ?? 0)
  }),

  finalize: (row) => deriveCurrent(row),

  columns: [
    { key: 'ts', label: 'TS', type: 'ts', width: 180 },
    { key: 'IR', label: 'IR', type: 'number', mono: true, align: 'right' },
    { key: 'IY', label: 'IY', type: 'number', mono: true, align: 'right' },
    { key: 'IB', label: 'IB', type: 'number', mono: true, align: 'right' },
    { key: 'IAVG', label: 'I AVG', type: 'number', mono: true, align: 'right', bold: true },
    { key: 'MAX_DEV', label: 'Max Dev', type: 'number', mono: true, align: 'right' },
    { key: 'IMB_PCT', label: 'Max Dev %', type: 'percent', mono: true, align: 'right' },
    { key: 'PERFORMANCE', label: 'Performance', type: 'perf', align: 'right' }
  ],

  aggregation: {
    IR: 'avg',
    IY: 'avg',
    IB: 'avg',
    IAVG: 'avg',
    MAX_DEV: 'avg',
    IMB_PCT: 'avg'
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

  exportBase: 'current'
};

export default currentConfig;
