// src/views/telemetry-kit/config/totalPower.config.jsx
import { PERFORMANCE } from '../utils';
import { parseTSUtc } from '../utils';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

const totalPowerConfig = {
  id: 'totalPower',
  title: 'Total Power Consumption',
  csvUrl: undefined,
  segment: 'all',

  normalize: (r) => {
    const totalKW = num(r.TOTAL_KW);
    const totalKVAR = num(r.TOTAL_KVAR);
    const totalKVA =
      num(r.TOTAL_KVA) ??
      (Number.isFinite(totalKW) && Number.isFinite(totalKVAR) ? +Math.sqrt(totalKW ** 2 + totalKVAR ** 2).toFixed(2) : undefined);

    const maxDemandKVA = num(r.MAX_DEMAND_KVA) ?? totalKVA;

    return {
      ts: parseTSUtc(r.TS ?? r.ts ?? r.timestamp),
      DID: r.DID ?? r.device_id ?? 'UNKNOWN',
      SID: r.SLAVE_ID ?? r.SID ?? 'UNKNOWN',
      panel_name: r.panel_name ?? 'MCC10',
      panel_location: r.panel_location ?? 'Compressor House',
      TOTAL_KVA: totalKVA,
      TOTAL_KW: totalKW,
      TOTAL_KVAR: totalKVAR,
      MAX_DEMAND_KVA: maxDemandKVA,
      ACTUAL_DEMAND_KW: totalKW,
      ACTUAL_DEMAND_KVAR: totalKVAR
    };
  },

  finalize: (row) => ({ ...row, PERFORMANCE: PERFORMANCE.ACCEPTABLE }),

  columns: [
    { key: 'ts', label: 'TS', type: 'ts', width: 180 },
    { key: 'TOTAL_KVA', label: 'Total KVA', type: 'number', mono: true, align: 'right' },
    { key: 'TOTAL_KW', label: 'Total kW', type: 'number', mono: true, align: 'right' },
    { key: 'TOTAL_KVAR', label: 'Total kVAr', type: 'number', mono: true, align: 'right' },
    { key: 'MAX_DEMAND_KVA', label: 'Max Demand (kVA)', type: 'number', mono: true, align: 'right' },
    { key: 'ACTUAL_DEMAND_KW', label: 'Actual Demand (kW+kVAr)', type: 'number', mono: true, align: 'right' },
    { key: 'PERFORMANCE', label: 'Performance', type: 'perf', align: 'right' }
  ],

  aggregation: {
    TOTAL_KVA: 'avg',
    TOTAL_KW: 'avg',
    TOTAL_KVAR: 'avg',
    MAX_DEMAND_KVA: 'avg',
    ACTUAL_DEMAND_KW: 'avg'
  },

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
  exportBase: 'total_power'
};

export default totalPowerConfig;
