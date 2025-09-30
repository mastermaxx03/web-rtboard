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

export const r1 = (x) =>
  Number.parseFloat((Math.round((Number(x) + Number.EPSILON) * 10) / 10).toFixed(1));
const r2 = (x) =>
  Number.parseFloat((Math.round((Number(x) + Number.EPSILON) * 100) / 100).toFixed(2));

// ---------- MCC-caliber calculators ----------

// Frequency thresholds: ±1% (Warning) and ±3% (Critical)
export const computeFrequencyThresholds = (nominalFrequency) => {
  const n = num(nominalFrequency);
  if (!Number.isFinite(n)) {
    return {
      warning_threshold_freq_display: 'N/A',
      critical_threshold_freq_display: 'N/A',
      warning_freq_lower: null,
      warning_freq_upper: null,
      critical_freq_lower: null,
      critical_freq_upper: null,
    };
  }
  const wDev = +(n * 0.01).toFixed(1);
  const cDev = +(n * 0.03).toFixed(1);

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
    critical_freq_upper: cHi,
  };
};

// IEC voltage bands (percent)
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
    critDisplay: `Above ±${cMin}%`,
  };
};

export const computeAbsoluteVoltageBands = (
  nominal,
  accPct,
  warnMinPct,
  warnMaxPct,
  critMinPct
) => {
  const n = Number(nominal);
  if (!Number.isFinite(n) || n <= 0) return null;

  const accLower = r2(n * (1 - accPct / 100));
  const accUpper = r2(n * (1 + accPct / 100));

  const warnLowerBand = {
    lower: r2(n * (1 - warnMaxPct / 100)),
    upper: r2(n * (1 - warnMinPct / 100)),
  };
  const warnUpperBand = {
    lower: r2(n * (1 + warnMinPct / 100)),
    upper: r2(n * (1 + warnMaxPct / 100)),
  };

  const critLowerMax = r2(n * (1 - critMinPct / 100));
  const critUpperMin = r2(n * (1 + critMinPct / 100));

  return {
    acceptable: { lower: accLower, upper: accUpper },
    warning: { lowerBand: warnLowerBand, upperBand: warnUpperBand },
    critical: { lowerMax: critLowerMax, upperMin: critUpperMin },
  };
};

// Voltage Imbalance (Phase Imbalance) bands
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
    critDisplay: `> ${cMin}%`,
  };
};

// ---------- internal writers that update BOTH MCC & legacy LT keys ----------

const writeVoltageOutputs = (target, prefix, baseV, mode = 'iec', bufferPct = 0) => {
  const bands = computeIecVoltageBands(mode, bufferPct);
  const abs = computeAbsoluteVoltageBands(
    baseV,
    bands.accPct,
    bands.warnMinPct,
    bands.warnMaxPct,
    bands.critMinPct
  );

  // MCC-style displays used by shared UI blocks
  target[`${prefix}_acceptable_display`] = bands.accDisplay;
  target[`${prefix}_warning_display`] = bands.warnDisplay;
  target[`${prefix}_critical_display`] = bands.critDisplay;

  target[`${prefix}_acceptable_lower`] = abs?.acceptable?.lower ?? null;
  target[`${prefix}_acceptable_upper`] = abs?.acceptable?.upper ?? null;

  target[`${prefix}_warning_lower_1`] = abs?.warning?.lowerBand?.lower ?? null;
  target[`${prefix}_warning_upper_1`] = abs?.warning?.lowerBand?.upper ?? null;
  target[`${prefix}_warning_lower_2`] = abs?.warning?.upperBand?.lower ?? null;
  target[`${prefix}_warning_upper_2`] = abs?.warning?.upperBand?.upper ?? null;

  target[`${prefix}_critical_lower_max`] = abs?.critical?.lowerMax ?? null;
  target[`${prefix}_critical_upper_min`] = abs?.critical?.upperMin ?? null;

  // Legacy LT mirrors (range_display + coarse bounds)
  const unit = 'V';
  if (prefix === 'll') {
    if (abs) {
      target.ll_acceptable_range_display = `${abs.acceptable.lower} ${unit} to ${abs.acceptable.upper} ${unit}`;
      target.ll_acceptable_range_lower = abs.acceptable.lower;
      target.ll_acceptable_range_upper = abs.acceptable.upper;

      target.ll_warning_range_display =
        `${abs.warning.lowerBand.lower} ${unit} to ${abs.warning.lowerBand.upper} ${unit}` +
        ` & ${abs.warning.upperBand.lower} ${unit} to ${abs.warning.upperBand.upper} ${unit}`;
      target.ll_warning_range_lower = abs.warning.lowerBand.lower;
      target.ll_warning_range_upper = abs.warning.upperBand.upper;

      target.ll_critical_range_display = `< ${abs.critical.lowerMax} ${unit} or > ${abs.critical.upperMin} ${unit}`;
      target.ll_critical_range_lower = abs.critical.lowerMax;
      target.ll_critical_range_upper = abs.critical.upperMin;
    } else {
      target.ll_acceptable_range_display = 'N/A';
      target.ll_warning_range_display = 'N/A';
      target.ll_critical_range_display = 'N/A';
    }
  }

  if (prefix === 'ln') {
    if (abs) {
      target.ln_acceptable_range_display = `${abs.acceptable.lower} ${unit} to ${abs.acceptable.upper} ${unit}`;
      target.ln_acceptable_range_lower = abs.acceptable.lower;
      target.ln_acceptable_range_upper = abs.acceptable.upper;

      target.ln_warning_range_display =
        `${abs.warning.lowerBand.lower} ${unit} to ${abs.warning.lowerBand.upper} ${unit}` +
        ` & ${abs.warning.upperBand.lower} ${unit} to ${abs.warning.upperBand.upper} ${unit}`;
      target.ln_warning_range_lower = abs.warning.lowerBand.lower;
      target.ln_warning_range_upper = abs.warning.upperBand.upper;

      target.ln_critical_range_display = `< ${abs.critical.lowerMax} ${unit} or > ${abs.critical.upperMin} ${unit}`;
      target.ln_critical_range_lower = abs.critical.lowerMax;
      target.ln_critical_range_upper = abs.critical.upperMin;
    } else {
      target.ln_acceptable_range_display = 'N/A';
      target.ln_warning_range_display = 'N/A';
      target.ln_critical_range_display = 'N/A';
    }
  }
};

const writeImbalanceOutputs = (target, mode = 'iec', bufferPct = 0) => {
  const vi = computeImbalanceBands(mode, bufferPct);

  // For shared MCC tiles
  target.acceptable_range_Vdisplay = vi.accDisplay;
  target.warning_threshold_Vdisplay = vi.warnDisplay;
  target.critical_threshold_Vdisplay = vi.critDisplay;

  // Legacy LT mirrors
  target.imbalance_acceptable_display = `≤ ${vi.accPct}%`;
  target.imbalance_acceptable_lower = 0;
  target.imbalance_acceptable_upper = vi.accPct;

  target.imbalance_warning_display = `${vi.warnMinPct}% – ${vi.warnMaxPct}%`;
  target.imbalance_warning_lower = vi.warnMinPct;
  target.imbalance_warning_upper = vi.warnMaxPct;

  target.imbalance_critical_display = `> ${vi.critMinPct}%`;
  target.imbalance_critical_lower = vi.critMinPct;
  target.imbalance_critical_upper = null;
};

const writeFrequencyOutputs = (target, nominal) => {
  const f = computeFrequencyThresholds(nominal);

  // Shared MCC keys
  target.warning_threshold_freq_display = f.warning_threshold_freq_display;
  target.critical_threshold_freq_display = f.critical_threshold_freq_display;
  target.warning_freq_lower = f.warning_freq_lower;
  target.warning_freq_upper = f.warning_freq_upper;
  target.critical_freq_lower = f.critical_freq_lower;
  target.critical_freq_upper = f.critical_freq_upper;

  // Legacy LT mirrors
  target.frequency_warning_display = f.warning_threshold_freq_display;
  target.frequency_critical_display = f.critical_threshold_freq_display;
  target.frequency_warning_low = f.warning_freq_lower;
  target.frequency_warning_high = f.warning_freq_upper;
  target.frequency_critical_low = f.critical_freq_lower;
  target.frequency_critical_high = f.critical_freq_upper;
};

// ---------- PUBLIC API (LT-only) ----------

/** Seed computed/derived fields when LT form loads with defaults (MCC logic inside). */
export const seedHtDefaults = (initial = {}) => {
  const patch = { ...initial };

  // L-L
  if (initial.ll_voltage_input) {
    const mode = initial.ll_mode || 'iec';
    const buf = initial.ll_buffer_pct || 0;
    writeVoltageOutputs(patch, 'll', initial.ll_voltage_input, mode, buf);
  } else {
    patch.ll_acceptable_range_display = 'N/A';
    patch.ll_warning_range_display = 'N/A';
    patch.ll_critical_range_display = 'N/A';
  }

  // L-N
  if (initial.ln_voltage_input) {
    const mode = initial.ln_mode || 'iec';
    const buf = initial.ln_buffer_pct || 0;
    writeVoltageOutputs(patch, 'ln', initial.ln_voltage_input, mode, buf);
  } else {
    patch.ln_acceptable_range_display = 'N/A';
    patch.ln_warning_range_display = 'N/A';
    patch.ln_critical_range_display = 'N/A';
  }

  // Voltage imbalance
  writeImbalanceOutputs(patch, initial.vi_mode || 'iec', initial.vi_buffer_pct || 0);

  // Frequency
  if (initial.nominal_frequency) {
    writeFrequencyOutputs(patch, initial.nominal_frequency);
  } else {
    patch.frequency_warning_display = 'N/A';
    patch.frequency_critical_display = 'N/A';
  }

  return patch;
};

/** Mutates newData with derived LT fields based on which field changed. */
export const applyHtChange = (fieldId, newData) => {
  // ---------- L-L/L-N voltage inputs or mode/buffer toggles ----------
  for (const pref of ['ll', 'ln']) {
    if (
      fieldId === `${pref}_voltage_input` ||
      fieldId === `${pref}_mode` ||
      fieldId === `${pref}_buffer_pct`
    ) {
      const baseV = newData[`${pref}_voltage_input`];
      const mode  = newData[`${pref}_mode`] || 'iec';
      const buf   = newData[`${pref}_buffer_pct`] || 0;
      writeVoltageOutputs(newData, pref, baseV, mode, buf);
      return;
    }
  }

  // ---------- Imbalance controls ----------
  if (fieldId === 'vi_mode' || fieldId === 'vi_buffer_pct') {
    const mode = newData.vi_mode || 'iec';
    const buf  = newData.vi_buffer_pct || 0;
    writeImbalanceOutputs(newData, mode, buf);
    return;
  }

  // ---------- Frequency ----------
  if (fieldId === 'nominal_frequency') {
    writeFrequencyOutputs(newData, newData.nominal_frequency);
    return;
  }

  // =====================================================================
  //                      POWER PAGE (Section 4)
  // =====================================================================

  const toNum = (v) => {
    const n = typeof v === 'number' ? v : parseFloat(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const syncThreePhasesIfBalanced = () => {
    if (newData.load_distribution_mode !== 'balanced') return;

    const total = toNum(newData.total_rated_power_kw);
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
    const total = toNum(newData.total_rated_power_kw);
    const r = toNum(newData.r_phase_rated_power);
    const y = toNum(newData.y_phase_rated_power);
    const b = toNum(newData.b_phase_rated_power);

    if (
      !Number.isFinite(total) || total <= 0 ||
      !Number.isFinite(r) || !Number.isFinite(y) || !Number.isFinite(b)
    ) {
      newData.power_sum_kw = null;
      newData.power_balance_ratio_pct = null;
      newData.power_balance_band = null;
      return;
    }

    const sum   = +(r + y + b).toFixed(3);
    const ratio = Number(((sum / total) * 100).toFixed(2)); // 100% = perfect

    newData.power_sum_kw = sum;
    newData.power_balance_ratio_pct = ratio;
    newData.power_balance_band =
      ratio <= 100 ? 'ok' :
      ratio <= 110 ? 'warn' :
      'crit';
  };

  // When total or mode changes, (re)sync phases if balanced
  if (fieldId === 'total_rated_power_kw' || fieldId === 'load_distribution_mode') {
    syncThreePhasesIfBalanced();
    recomputePowerBalance();
    return;
  }

  // If user edits phase values while Balanced, keep them locked
  if (
    ['r_phase_rated_power', 'y_phase_rated_power', 'b_phase_rated_power'].includes(fieldId) &&
    newData.load_distribution_mode === 'balanced'
  ) {
    syncThreePhasesIfBalanced();
    recomputePowerBalance();
    return;
  }

  // If user edits phase values while Unbalanced, just recompute
  if (
    ['r_phase_rated_power', 'y_phase_rated_power', 'b_phase_rated_power'].includes(fieldId) ||
    fieldId === 'total_rated_power_kw'
  ) {
    recomputePowerBalance();
    return;
  }
};

// ---- LT Power step validator (Section 4) ----
export const validateHtPowerStep = (fields, formData) => {
  // Only run on the Power step
  const isPowerStep = Array.isArray(fields) && fields.some(f => f?.id === 'total_rated_power_kw');
  if (!isPowerStep) return { ok: true, newErrors: {} };

  const newErrors = {};
  let ok = true;

  const toNum = (v) => {
    const n = typeof v === 'number' ? v : parseFloat(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const total = toNum(formData.total_rated_power_kw);
  const r = toNum(formData.r_phase_rated_power);
  const y = toNum(formData.y_phase_rated_power);
  const b = toNum(formData.b_phase_rated_power);
  const ratio = toNum(formData.power_balance_ratio_pct);

  // If Unbalanced → enforce sum(R,Y,B) == Total (with tolerance)
  if (
    formData.load_distribution_mode === 'unbalanced' &&
    Number.isFinite(total) &&
    Number.isFinite(r) &&
    Number.isFinite(y) &&
    Number.isFinite(b)
  ) {
    const sum = r + y + b;
    const tol = Math.max(0.001 * total, 0.05); // 0.1% of total OR 0.05 kW
    if (Math.abs(total - sum) > tol) {
      ok = false;
      newErrors.r_phase_rated_power = `Sum of phases (${sum.toFixed(3)} kW) must equal Total (${total.toFixed(
        3
      )} kW). Difference exceeds tolerance.`;
    }
  }

  // Always block critical (>110%)
  if (Number.isFinite(ratio) && ratio > 110) {
    ok = false;
    newErrors.r_phase_rated_power = `Sum of phases exceeds 110% of Total (ratio: ${ratio.toFixed(1)}%).`;
  }

  return { ok, newErrors };
};

/** Reset helper for LT display fields used by the page. */
export const resetHtStep = (fields) => {
  const fids = new Set(fields.map((f) => f.id).filter(Boolean));
  const patch = {};

  if (fids.has('ll_voltage_input') || fids.has('ll_mode') || fids.has('ll_buffer_pct')) {
    patch.ll_acceptable_range_display = 'N/A';
    patch.ll_warning_range_display = 'N/A';
    patch.ll_critical_range_display = 'N/A';

    patch.ll_acceptable_display = 'N/A';
    patch.ll_warning_display = 'N/A';
    patch.ll_critical_display = 'N/A';
  }
  if (fids.has('ln_voltage_input') || fids.has('ln_mode') || fids.has('ln_buffer_pct')) {
    patch.ln_acceptable_range_display = 'N/A';
    patch.ln_warning_range_display = 'N/A';
    patch.ln_critical_range_display = 'N/A';

    patch.ln_acceptable_display = 'N/A';
    patch.ln_warning_display = 'N/A';
    patch.ln_critical_display = 'N/A';
  }
  if (fids.has('vi_mode') || fids.has('vi_buffer_pct')) {
    patch.acceptable_range_Vdisplay = '≤ 2%';
    patch.warning_threshold_Vdisplay = '2% – 4%';
    patch.critical_threshold_Vdisplay = '> 4%';

    patch.imbalance_acceptable_display = '≤ 2%';
    patch.imbalance_warning_display = '2% – 4%';
    patch.imbalance_critical_display = '> 4%';
  }
  if (fids.has('nominal_frequency')) {
    patch.warning_threshold_freq_display = 'N/A';
    patch.critical_threshold_freq_display = 'N/A';

    patch.frequency_warning_display = 'N/A';
    patch.frequency_critical_display = 'N/A';
  }

  // Power balance clear (Section 4)
  if (fids.has('power_balance_block') || fids.has('total_rated_power_kw')) {
    patch.power_sum_kw = null;
    patch.power_balance_ratio_pct = null;
    patch.power_balance_band = null;
  }

  return patch;
};
