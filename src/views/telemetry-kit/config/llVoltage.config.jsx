import React from 'react';
import { PERFORMANCE, THRESHOLDS, deriveLL, performanceOf } from '../utils';

const llVoltageConfig = {
  id: 'llVoltage',
  title: '3-Phase L-L Voltage',
  csvUrl: undefined,
  segment: 'voltage',

  normalize: (r) => ({
    ts: new Date(String(r.TS ?? r.ts ?? r.timestamp)).getTime(),
    DID: r.DID ?? r.device_id ?? 'UNKNOWN',
    SID: r.SLAVE_ID ?? r.SID ?? 'UNKNOWN',
    panel_name: r.panel_name ?? 'MCC10',
    panel_location: r.panel_location ?? 'Compressor House',
    VRY: Number(r.VRY ?? r.V_RY ?? r.LL_RY),
    VYB: Number(r.VYB ?? r.V_YB ?? r.LL_YB),
    // API sometimes sends VRB (not VBR); keep both:
    VBR: Number(r.VBR ?? r.VRB ?? r.V_BR ?? r.LL_BR),
    // prefer backend average if present
    AVG_VLL: Number(r.AVG_VLL)
  }),

  finalize: (row) => {
    const d = deriveLL(row);
    // if backend provided average, use it
    if (Number.isFinite(row.AVG_VLL)) d.VAVG = Number(row.AVG_VLL);
    return { ...d, PERFORMANCE: performanceOf(d, THRESHOLDS) };
  },

  columns: [
    { key: 'ts', label: 'TS', type: 'ts', width: 180 },
    { key: 'VRY', label: 'VRY', type: 'number', mono: true, align: 'right' },
    { key: 'VYB', label: 'VYB', type: 'number', mono: true, align: 'right' },
    { key: 'VBR', label: 'VBR', type: 'number', mono: true, align: 'right' },
    { key: 'VAVG', label: 'VAVG', type: 'number', mono: true, align: 'right', bold: true },
    { key: 'MAX_DEV', label: 'Max Dev', type: 'number', mono: true, align: 'right' },
    { key: 'IMB_PCT', label: 'Vol Imb %', type: 'percent', mono: true, align: 'right' },
    { key: 'PERFORMANCE', label: 'Performance', type: 'perf', align: 'right' }
  ],

  aggregation: {
    VRY: 'avg',
    VYB: 'avg',
    VBR: 'avg',
    VAVG: 'avg',
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
  exportBase: 'll_voltage'
};

export default llVoltageConfig;
