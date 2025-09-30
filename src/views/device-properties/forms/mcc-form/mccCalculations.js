// ---------- small helpers ----------
const num = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : NaN;
};

export const clamp = (x, a, b) => {
  const n = Number(x);
  if (!Number.isFinite(n)) return a;
  return Math.min(Math.max(n, a), b);
};
export const r1 = (x) => Number.parseFloat((Math.round((Number(x) + Number.EPSILON) * 10) / 10).toFixed(1));
const r2 = (x) => Number.parseFloat((Math.round((Number(x) + Number.EPSILON) * 100) / 100).toFixed(2));

const computeKwDisplay = (unit, value) => {
  const val = num(value);
  if (!Number.isFinite(val)) return '—';
  const kw = unit === 'HP' ? val * 0.746 : val;
  return `${kw.toFixed(3)} kW`;
};

const symmetricRange = (nominal, percent, unitLabel = 'V') => {
  const n = num(nominal),
    p = num(percent);
  if (!Number.isFinite(n) || !Number.isFinite(p)) return { display: 'N/A', lower: null, upper: null };
  const d = n * (p / 100);
  const lo = +(n - d).toFixed(1);
  const hi = +(n + d).toFixed(1);
  return { display: `${lo} ${unitLabel} to ${hi} ${unitLabel}`, lower: lo, upper: hi };
};

// ---- Frequency thresholds (exported for FrequencyBlock) ----
export const computeFrequencyThresholds = (nominalFrequency) => {
  const n = num(nominalFrequency);
  if (!Number.isFinite(n)) {
    return {
      warning_threshold_freq_display: 'N/A',
      critical_threshold_freq_display: 'N/A',
      warning_freq_lower: null,
      warning_freq_upper: null,
      critical_freq_lower: null,
      critical_freq_upper: null
    };
  }
  const wDev = +(n * 0.01).toFixed(1); // ±1.0%
  const cDev = +(n * 0.03).toFixed(1); // ±3.0%

  const wLo = +(n - wDev).toFixed(1);
  const wHi = +(n + wDev).toFixed(1);
  const cLo = +(n - cDev).toFixed(1);
  const cHi = +(n + cDev).toFixed(1);

  return {
    warning_threshold_freq_display: `${wLo} Hz to ${wHi} Hz`,
    critical_threshold_freq_display: `${cLo} Hz to ${cHi} Hz`,
    warning_freq_lower: wLo,
    warning_freq_upper: wHi,
    critical_freq_lower: cLo,
    critical_freq_upper: cHi
  };
};

// ---- IEC voltage bands (L-L / L-N) ----
const IEC = { ACC: 10, WARN_MIN: 10, WARN_MAX: 15, CRIT_MIN: 15 };

export const computeIecVoltageBands = (mode = 'iec', bufferPct = 0) => {
  const b = mode === 'iec+buffer' ? Number(bufferPct) || 0 : 0;
  const acc = r1(IEC.ACC + b);
  const wMin = r1(IEC.WARN_MIN + b);
  const wMax = r1(IEC.WARN_MAX + b);
  const cMin = r1(IEC.CRIT_MIN + b);

  return {
    accPct: acc,
    warnMinPct: wMin,
    warnMaxPct: wMax,
    critMinPct: cMin,
    accDisplay: `Up to ±${acc}%`,
    warnDisplay: `Between ±${wMin}% and ±${wMax}%`,
    critDisplay: `Above ±${cMin}%`
  };
};

export const computeAbsoluteVoltageBands = (nominal, accPct, warnMinPct, warnMaxPct, critMinPct) => {
  const n = Number(nominal);
  if (!Number.isFinite(n) || n <= 0) return null;

  const accLower = r2(n * (1 - accPct / 100));
  const accUpper = r2(n * (1 + accPct / 100));

  const warnLowerBand = {
    lower: r2(n * (1 - warnMaxPct / 100)),
    upper: r2(n * (1 - warnMinPct / 100))
  };
  const warnUpperBand = {
    lower: r2(n * (1 + warnMinPct / 100)),
    upper: r2(n * (1 + warnMaxPct / 100))
  };

  const critLowerMax = r2(n * (1 - critMinPct / 100));
  const critUpperMin = r2(n * (1 + critMinPct / 100));

  return {
    acceptable: { lower: accLower, upper: accUpper },
    warning: { lowerBand: warnLowerBand, upperBand: warnUpperBand },
    critical: { lowerMax: critLowerMax, upperMin: critUpperMin }
  };
};

// ---- Voltage Imbalance (Phase Imbalance) bands ----
const VI = { ACC: 2, WARN_MIN: 2, WARN_MAX: 4, CRIT_MIN: 4 };

export const computeImbalanceBands = (mode = 'iec', bufferPct = 0) => {
  const b = mode === 'iec+buffer' ? Number(bufferPct) || 0 : 0;
  const acc = r1(VI.ACC + b);
  const wMin = r1(VI.WARN_MIN + b);
  const wMax = r1(VI.WARN_MAX + b);
  const cMin = r1(VI.CRIT_MIN + b);

  return {
    accPct: acc,
    warnMinPct: wMin,
    warnMaxPct: wMax,
    critMinPct: cMin,
    accDisplay: `≤ ${acc}%`,
    warnDisplay: `${wMin}% – ${wMax}%`,
    critDisplay: `> ${cMin}%`
  };
};

// ---------- NEW: Current Imbalance bands (mirrors VI block, 10/20% base) ----------
const CI = { ACC: 10, WARN_MIN: 10, WARN_MAX: 20, CRIT_MIN: 20 };

export const computeCurrentImbalanceBands = (mode = 'iec', bufferPct = 0) => {
  const b = mode === 'iec+buffer' ? Number(bufferPct) || 0 : 0;
  const acc = r1(CI.ACC + b);
  const wMin = r1(CI.WARN_MIN + b);
  const wMax = r1(CI.WARN_MAX + b);
  const cMin = r1(CI.CRIT_MIN + b);

  return {
    accPct: acc,
    warnMinPct: wMin,
    warnMaxPct: wMax,
    critMinPct: cMin,
    accDisplay: `≤ ${acc}%`,
    warnDisplay: `${wMin}% – ${wMax}%`,
    critDisplay: `> ${cMin}%`
  };
};

// ---------- public API ----------
export const initMccDerived = (initial = {}) => {
  const patch = {};

  // Rated power
  if (initial.machine_power_unit || initial.machine_power_value) {
    patch.machine_power_kw_display = computeKwDisplay(initial.machine_power_unit || 'kW', initial.machine_power_value);
  }

  // L-L defaults
  if (initial.ll_voltage_input) {
    const acc = symmetricRange(initial.ll_voltage_input, 10, 'V');
    const wrn = symmetricRange(initial.ll_voltage_input, 10, 'V');
    const crt = symmetricRange(initial.ll_voltage_input, 15, 'V');
    patch.ll_acceptable_display = acc.display;
    patch.ll_acceptable_lower = acc.lower;
    patch.ll_acceptable_upper = acc.upper;
    patch.ll_warning_display = wrn.display;
    patch.ll_warning_lower = wrn.lower;
    patch.ll_warning_upper = wrn.upper;
    patch.ll_critical_display = crt.display;
    patch.ll_critical_lower = crt.lower;
    patch.ll_critical_upper = crt.upper;
  }

  // L-N defaults
  if (initial.ln_voltage_input) {
    const acc = symmetricRange(initial.ln_voltage_input, 10, 'V');
    const wrn = symmetricRange(initial.ln_voltage_input, 10, 'V');
    const crt = symmetricRange(initial.ln_voltage_input, 15, 'V');
    patch.ln_acceptable_display = acc.display;
    patch.ln_acceptable_lower = acc.lower;
    patch.ln_acceptable_upper = acc.upper;
    patch.ln_warning_display = wrn.display;
    patch.ln_warning_lower = wrn.lower;
    patch.ln_warning_upper = wrn.upper;
    patch.ln_critical_display = crt.display;
    patch.ln_critical_lower = crt.lower;
    patch.ln_critical_upper = crt.upper;
  }

  // Voltage (phase) imbalance defaults (IEC mode, no buffer)
  const vi = computeImbalanceBands('iec', 0);
  patch.acceptable_range_Vdisplay = vi.accDisplay;
  patch.warning_threshold_Vdisplay = vi.warnDisplay;
  patch.critical_threshold_Vdisplay = vi.critDisplay;

  // Frequency defaults if available
  if (initial.nominal_frequency) Object.assign(patch, computeFrequencyThresholds(initial.nominal_frequency));

  // Section 3 displays default to N/A
  patch.current_warning_range_display = patch.current_warning_range_display || 'N/A';
  patch.current_critical_range_display = patch.current_critical_range_display || 'N/A';

  return patch;
};

// ---------- apply changes / recompute ----------
export const applyMccAfterChange = (fieldId, newData) => {
  // HP → kW
  if (fieldId === 'machine_power_unit' || fieldId === 'machine_power_value') {
    const unit = fieldId === 'machine_power_unit' ? newData.machine_power_unit : newData.machine_power_unit || 'kW';
    const val = fieldId === 'machine_power_value' ? newData.machine_power_value : newData.machine_power_value;
    newData.machine_power_kw_display = computeKwDisplay(unit, val);
  }

  // Frequency recompute
  if (fieldId === 'nominal_frequency') {
    Object.assign(newData, computeFrequencyThresholds(newData.nominal_frequency));
  }

  // MPCB Ir auto current
  if (['mpcb_in_rated_current', 'mpcb_ir_setting', 'mpcb_ir_setting_mode'].includes(fieldId)) {
    const inA = num(newData.mpcb_in_rated_current);
    let setting = null;
    const mode = newData.mpcb_ir_setting_mode;
    if (mode === 'user') setting = num(newData.mpcb_ir_setting);
    else setting = num(mode); // 0.4 / 0.6 / 0.8 / 1.0
    if (Number.isFinite(inA) && Number.isFinite(setting)) newData.mpcb_ir_auto_current = (inA * setting).toFixed(2) + ' A';
    else newData.mpcb_ir_auto_current = '—';
  }

  // Recompute Section-3 "Calculated Range" displays
  if (
    [
      'mpcb_in_rated_current',
      'mpcb_ir_setting',
      'mpcb_ir_setting_mode',
      'current_warning_threshold',
      'current_critical_threshold'
    ].includes(fieldId)
  ) {
    const parsePercentPair = (val) => {
      if (!val) return null;
      const m = String(val).match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
      if (!m) return null;
      return [Number(m[1]), Number(m[2])];
    };
    const inA = num(newData.mpcb_in_rated_current);
    const mode = newData.mpcb_ir_setting_mode;
    const setting = mode === 'user' ? num(newData.mpcb_ir_setting) : num(mode);
    const Ir = Number.isFinite(inA) && Number.isFinite(setting) ? inA * setting : NaN;

    const computeRange = (sel) => {
      const pp = parsePercentPair(sel);
      if (!pp || !Number.isFinite(Ir)) return 'N/A';
      const [loPct, hiPct] = pp;
      const lo = r2((Ir * loPct) / 100);
      const hi = r2((Ir * hiPct) / 100);
      return `${lo} A – ${hi} A`;
    };

    newData.current_warning_range_display = computeRange(newData.current_warning_threshold);
    newData.current_critical_range_display = computeRange(newData.current_critical_threshold);
  }

  // ---------- POWER PAGE ----------
  const syncThreePhasesIfBalanced = () => {
    if (newData.load_distribution_mode !== 'balanced') return;
    const total = num(newData.total_rated_power_kw);
    if (!Number.isFinite(total)) {
      newData.r_phase_rated_power = '';
      newData.y_phase_rated_power = '';
      newData.b_phase_rated_power = '';
      return;
    }
    const per = +(total / 3).toFixed(3);
    newData.r_phase_rated_power = per;
    newData.y_phase_rated_power = per;
    newData.b_phase_rated_power = per;
  };

  const recomputePowerBalance = () => {
    const total = num(newData.total_rated_power_kw);
    const r = num(newData.r_phase_rated_power);
    const y = num(newData.y_phase_rated_power);
    const b = num(newData.b_phase_rated_power);

    if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(r) || !Number.isFinite(y) || !Number.isFinite(b)) {
      newData.power_sum_kw = null;
      newData.power_balance_ratio_pct = null;
      newData.power_balance_band = null;
      return;
    }

    const sum = +(r + y + b).toFixed(3);
    const ratio = r2((sum / total) * 100); // 100% = perfect match

    newData.power_sum_kw = sum;
    newData.power_balance_ratio_pct = ratio;
    newData.power_balance_band = ratio <= 100 ? 'ok' : ratio <= 110 ? 'warn' : 'crit';
  };

  if (fieldId === 'total_rated_power_kw' || fieldId === 'load_distribution_mode') {
    syncThreePhasesIfBalanced();
  }
  if (
    ['r_phase_rated_power', 'y_phase_rated_power', 'b_phase_rated_power'].includes(fieldId) &&
    newData.load_distribution_mode === 'balanced'
  ) {
    // keep locked while balanced
    syncThreePhasesIfBalanced();
  }

  if (
    ['total_rated_power_kw', 'r_phase_rated_power', 'y_phase_rated_power', 'b_phase_rated_power', 'load_distribution_mode'].includes(
      fieldId
    )
  ) {
    recomputePowerBalance();
  }
};

/** Reset helper for the current step */
export const resetPatchForMccStep = (fields) => {
  const fids = new Set(fields.map((f) => f.id).filter(Boolean));
  const patch = {};

  if (fids.has('machine_power_value') || fids.has('machine_power_unit')) {
    patch.machine_power_kw_display = '—';
  }
  if (fids.has('ll_thresholds') || fids.has('ll_voltage_input')) {
    patch.ll_acceptable_display = 'N/A';
    patch.ll_warning_display = 'N/A';
    patch.ll_critical_display = 'N/A';
  }
  if (fids.has('ln_thresholds') || fids.has('ln_voltage_input')) {
    patch.ln_acceptable_display = 'N/A';
    patch.ln_warning_display = 'N/A';
    patch.ln_critical_display = 'N/A';
  }
  if (fids.has('nominal_frequency')) {
    patch.warning_threshold_freq_display = 'N/A';
    patch.critical_threshold_freq_display = 'N/A';
  }
  if (fids.has('mpcb_in_rated_current') || fids.has('mpcb_ir_setting') || fids.has('mpcb_ir_setting_mode')) {
    patch.mpcb_ir_auto_current = '—';
  }

  if (fids.has('current_warning_threshold')) {
    patch.current_warning_range_display = 'N/A';
  }
  if (fids.has('current_critical_threshold')) {
    patch.current_critical_range_display = 'N/A';
  }

  // Power balance clear
  if (fids.has('power_balance_block') || fids.has('total_rated_power_kw')) {
    patch.power_sum_kw = null;
    patch.power_balance_ratio_pct = null;
    patch.power_balance_band = null;
  }

  return patch;
};
