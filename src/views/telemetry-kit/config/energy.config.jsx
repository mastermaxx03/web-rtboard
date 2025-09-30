// src/views/telemetry-kit/config/energy.config.jsx
import { PERFORMANCE } from '../utils';

const energyConfig = {
  id: 'energy',
  title: 'Energy Consumption',
  csvUrl: undefined,
  dataUrl: undefined,
  segment: 'thd',

  normalize: (r) => {
    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    // Prefer deltas if backend gives them; else use counters
    const kwh = num(r.DELTA_KWH) ?? num(r.KWH);
    const kvarh = num(r.DELTA_KVARH) ?? num(r.KVARH);
    const kvah = num(r.DELTA_KVAH) ?? num(r.KVAH);

    return {
      ts: new Date(String(r.TS ?? r.ts ?? r.timestamp)).getTime(),
      DID: r.DID ?? r.device_id ?? 'UNKNOWN',
      SID: r.SLAVE_ID ?? r.SID ?? 'UNKNOWN',
      panel_name: r.panel_name ?? 'MCC10',
      panel_location: r.panel_location ?? 'Compressor House',
      KWH: kwh,
      KVARH: kvarh,
      KVAH: kvah
    };
  },

  finalize: (row) => {
    const kwh = Number(row.KWH) || 0;
    const kvarh = Number(row.KVARH) || 0;
    const comp = kwh + kvarh;
    return {
      ...row,
      KWH_PCT: comp ? +(100 * (kwh / comp)).toFixed(2) : 0,
      KVARH_PCT: comp ? +(100 * (kvarh / comp)).toFixed(2) : 0,
      PERFORMANCE: PERFORMANCE.ACCEPTABLE
    };
  },

  columns: [
    { key: 'ts', label: 'TS', type: 'ts', width: 180 },
    { key: 'KWH', label: 'kWh', type: 'number', align: 'right', mono: true },
    { key: 'KVARH', label: 'KVARH', type: 'number', align: 'right', mono: true },
    { key: 'KVAH', label: 'kVAh Total', type: 'number', align: 'right', mono: true, bold: true },
    { key: 'KWH_PCT', label: 'kWh %', type: 'percent', align: 'right', mono: true },
    { key: 'KVARH_PCT', label: 'KVARH %', type: 'percent', align: 'right', mono: true },
    { key: 'PERFORMANCE', label: 'Performance', type: 'perf', align: 'right' }
  ],

  aggregation: { KWH: 'sum', KVARH: 'sum', KVAH: 'sum', KWH_PCT: 'avg', KVARH_PCT: 'avg' },
  pageSizes: [10, 25, 50, 100, 250],
  aggWindows: [
    { key: 0, label: 'RT Data' },
    { key: 15, label: 'Sum of 15 min' },
    { key: 30, label: 'Sum of 30 min' },
    { key: 60, label: 'Sum of 1 hr' },
    { key: 240, label: 'Sum of 4 hr' },
    { key: 480, label: 'Sum of 8 hr' },
    { key: 1440, label: 'Sum of 24 hr' }
  ],
  exportBase: 'energy'
};

export default energyConfig;
