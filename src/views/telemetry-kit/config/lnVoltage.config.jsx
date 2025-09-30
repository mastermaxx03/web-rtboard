// src/views/telemetry-kit/config/lnVoltage.config.js
import { parseTSUtc, performanceOf, THRESHOLDS } from '../utils';

const lnVoltage = {
  title: '3-Phase Voltage L-N',
  exportBase: 'ln_voltage',

  // ask API for either segment key; loader will merge
  segment: 'voltage',
  segments: ['voltage', 'all'],

  aggWindows: [
    { key: 0, label: 'RT Data (1s)' },
    { key: 15, label: '15 min' },
    { key: 60, label: '1 hour' }
  ],
  pageSizes: [10, 25, 50, 100, 250],

  normalize(r) {
    const ts = parseTSUtc(r.TS ?? r.ts ?? r.timestamp);

    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    // LN voltages appear as VR/VY/VB in your payload; also accept VRN/VYN/VBN.
    const VRN = num(r.VR ?? r.VRN);
    const VYN = num(r.VY ?? r.VYN);
    const VBN = num(r.VB ?? r.VBN);

    return {
      // keep both for export, but table will use `ts`
      TS: new Date(ts).toISOString(),
      ts,

      DID: r.DID ?? r.did ?? null,
      SID: r.SID ?? r.SLAVE_ID ?? r.sid ?? null,
      panel_name: r.panel_name ?? null,
      panel_location: r.panel_location ?? null,

      VRN,
      VYN,
      VBN,
      VAVG: num(r.AVG_VLN ?? r.VAVG),

      // prefer API-provided LN metrics
      MAX_DEV: num(r.LN_MAX_DEV ?? r.MAX_DEV),
      VOL_IMB_PCT: num(r.LN_VOL_IMB ?? r.VOL_IMB_PCT),

      // may be filled in finalize if missing
      PERFORMANCE: r.PERFORMANCE ?? r.performance ?? undefined
    };
  },

  columns: [
    { key: 'ts', label: 'TS', type: 'ts', width: 180 }, // ✅ use `ts` with type:'ts'
    { key: 'VRN', label: 'VRN' },
    { key: 'VYN', label: 'VYN' },
    { key: 'VBN', label: 'VBN' },
    { key: 'VAVG', label: 'V AVG' },
    { key: 'MAX_DEV', label: 'Max Dev' },
    { key: 'VOL_IMB_PCT', label: 'Vol Imb %', type: 'percent' },
    { key: 'PERFORMANCE', label: 'Performance', type: 'perf', align: 'right' } // ✅ perf chip
  ],

  finalize(row) {
    let out = { ...row };
    const { VRN: a, VYN: b, VBN: c } = out;

    // derive missing values
    if (!Number.isFinite(out.VAVG) && [a, b, c].every(Number.isFinite)) {
      out.VAVG = +((a + b + c) / 3).toFixed(2);
    }
    if (!Number.isFinite(out.MAX_DEV) && Number.isFinite(out.VAVG)) {
      const devs = [a, b, c].map((v) => Math.abs((v ?? out.VAVG) - out.VAVG));
      out.MAX_DEV = +Math.max(...devs).toFixed(2);
    }
    if (!Number.isFinite(out.VOL_IMB_PCT) && Number.isFinite(out.MAX_DEV) && Number.isFinite(out.VAVG) && out.VAVG !== 0) {
      out.VOL_IMB_PCT = +((out.MAX_DEV / out.VAVG) * 100).toFixed(2);
    }

    // ✅ compute performance from imbalance %
    if (out.PERFORMANCE == null && Number.isFinite(out.VOL_IMB_PCT)) {
      out.PERFORMANCE = performanceOf({ IMB_PCT: out.VOL_IMB_PCT }, THRESHOLDS);
    }

    return out;
  }
};

export default lnVoltage;
