// /views/device-properties/dataTransformer.jsx
// Strict section-wise ordering + numeric min/max + SI on every entry.

export const transformDataForBackend = (formData, didOrName, extras = {}) => {
  // ----------------------------
  // Helpers
  // ----------------------------
  const name = String(
    didOrName ||
      formData?.deviceId ||
      formData?.did ||
      formData?.esai_device_id ||
      formData?.esai_did ||
      ''
  ).trim();

  const toNum = (v) => {
    if (v === '' || v === null || typeof v === 'undefined') return null;
    const n = typeof v === 'number' ? v : parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const isNumericLike = (v) => typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim());

  // Map field key -> SI unit ('' when not applicable)
  const siFor = (key) => {
    const K = String(key).toUpperCase();

    // Exact keys
    const EXACT = {
      NOMINAL_FREQUENCY: 'Hz',
      FREQUENCY: 'Hz',

      PT_PRIMARY_V: 'V',
      PT_SECONDARY_V: 'V',
      CT_PRIMARY_A: 'A',
      CT_SECONDARY_A: 'A',

      IR: 'A', IY: 'A', IB: 'A', AVG_I: 'A',

      R_THD_V: '%', Y_THD_V: '%', B_THD_V: '%',
      R_THD_I: '%', Y_THD_I: '%', B_THD_I: '%',

      R_PF: '', Y_PF: '', B_PF: '', AVG_PF: '',

      R_KW: 'kW', Y_KW: 'kW', B_KW: 'kW', TOTAL_KW: 'kW',
      R_KVA: 'kVA', Y_KVA: 'kVA', B_KVA: 'kVA', TOTAL_KVA: 'kVA',
      R_KVAR: 'kvar', Y_KVAR: 'kvar', B_KVAR: 'kvar', TOTAL_KVAR: 'kvar',

      KWH: 'kWh', KVAH: 'kVAh', KVARH: 'kVArh',

      RSSI: 'dBm',

      VRY: 'V', VRB: 'V', VBR: 'V', AVG_VLL: 'V',
      VR: 'V', VY: 'V', VB: 'V', AVG_VLN: 'V',
    };
    if (EXACT[K] !== undefined) return EXACT[K];

    // Patterns
    if (K.startsWith('VI_')) return '%';                             // vi_acceptable_percent etc.
    if (/_PERCENT$/.test(K)) return '%';                             // any *_percent
    if (/IMBALANCE_.*_(LOWER|UPPER)$/i.test(K)) return '%';          // imbalance_*_lower/upper
    if (/^LL_/.test(K)) return 'kV';                                 // your LL derived fields usually in kV
    if (/FREQ|FREQUENCY/i.test(K)) return 'Hz';                      // warning_freq_lower etc.

    // Panel/MFM misc: leave unit empty unless explicitly known
    return '';
  };

  const asValue = (key, v) => {
    const value = isNumericLike(v) ? Number(v) : v;
    return { value, SI: siFor(key) };
  };

  const putKV = (pairs, key, val) => pairs.push([key, val]);

  const putRange = (pairs, key, min, max, SI) =>
    pairs.push([key, { min: typeof min === 'string' ? toNum(min) : min,
                       max: typeof max === 'string' ? toNum(max) : max,
                       SI }]);

  const numberFromPercentDisplay = (disp) => {
    if (!disp) return null;
    const m = String(disp).match(/\d+(\.\d+)?/);
    return m ? Number(m[0]) : null;
  };

  const parseRangeFromDisplay = (str) => {
    if (!str || typeof str !== 'string') return { min: null, max: null, unit: null };
    const unitKV = /kV/i.test(str);
    const unitV  = /(^|[^k])V\b/i.test(str);
    const nums = (str.match(/\d+(\.\d+)?/g) || []).map(Number);
    let min = null, max = null;
    if (nums.length >= 2) [min, max] = nums;
    else if (nums.length === 1) {
      if (/≤|<=/i.test(str)) { min = null; max = nums[0]; }
      else if (/≥|>=|>|from/i.test(str)) { min = nums[0]; max = null; }
      else { min = nums[0]; max = nums[0]; }
    }
    if (unitKV) { if (min != null) min *= 1000; if (max != null) max *= 1000; } // normalize to V
    return { min, max, unit: unitKV || unitV ? 'V' : null };
  };

  const hasAny = (fd, keys) => keys.some((k) => k in (fd || {}));

  // ----------------------------
  // Detect form kind
  // ----------------------------
  const detectKind = (fd) => {
    if (hasAny(fd, ['machine_name', 'mcc_image', 'machine_power_value', 'mcc_spec_pdf'])) return 'MCC';
    if (hasAny(fd, ['ln_thresholds', 'panel_type', 'department_process_served'])) return 'LT';
    return 'HT';
  };
  const kind = detectKind(formData);
  const isHT = kind === 'HT';
  const isLT = kind === 'LT';
  const isMCC = kind === 'MCC';

  // ----------------------------
  // Section orders
  // ----------------------------
  const SECTION_ORDER_LT = [
    // 1
    'esai_device_id','panel_name','panel_id','panel_type','panel_location',
    'department_process_served','esai_installation_date','panel_rated_power_capacity',
    'panel_image_upload','panel_spec_pdf_upload',
    // 2
    'll_thresholds','ln_thresholds','voltage_imbalance_block','nominal_frequency',
    // 3
    'incoming_ct_primary','incoming_breaker_type','cb_make_model','upload_cb_nameplate',
    'cb_rated_current','cb_ir_setting','cb_long_time_current',
    'cb_warning_threshold','cb_critical_threshold','outgoing_count','current_imbalance_acceptable',
    // 4
    'total_rated_power_kw','load_distribution_mode','r_phase_rated_power',
    'y_phase_rated_power','b_phase_rated_power','power_balance_block',
    // 5
    'total_energy_consumption_kVAh','monthly_energy_budget_kWh',
    'shift_wise_energy_budget_kWh','idle_standby_consumption_kVAh',
    // 6
    'pf_target','pf_reference_note','pf_slab_scheme','pf_incentive_table','pf_penalty_table',
    // 7
    'v_thd_mode','v_thd_limit','i_thd_mode','i_thd_limit','vfd_harmonic_allowance',
    // 8
    'last_energy_audit_date','audit_observations','audit_report_upload',
    'maintenance_interval','insulation_resistance',
    // 9
    'planned_installation_date','technician_name','technician_mobile',
    'supervisor_name','supervisor_signature',
    'mfm_brand','mfm_model','modbus_slave_id','baud_rate','parity_stop_bits',
    'mfm_wiring_system','pt_primary_v','pt_secondary_v','ct_primary_a','ct_secondary_a',
    // 10
    'alert_trigger_warning','alert_trigger_critical','critical_consecutive_payloads',
    'ack_alert_points','standards_acknowledged'
  ];

  const SECTION_ORDER_HT = [
    // 1
    'esai_device_id','panel_name','panel_id','panel_rating_details',
    'esai_installation_date','panel_owner','panel_rated_power_capacity',
    'panel_image_upload','panel_spec_pdf_upload',
    // 2
    'll_thresholds','voltage_imbalance_block','nominal_frequency',
    // 3
    'incoming_ct_primary','incoming_breaker_type','cb_make_model','upload_cb_nameplate',
    'cb_rated_current','cb_ir_setting','cb_long_time_current',
    'cb_warning_threshold','cb_critical_threshold','outgoing_count','current_imbalance_acceptable',
    // 4
    'total_rated_power_kw','load_distribution_mode','r_phase_rated_power',
    'y_phase_rated_power','b_phase_rated_power','power_balance_block',
    // 5
    'total_energy_consumption_kVAh','monthly_energy_budget_kWh',
    'shift_wise_energy_budget_kWh','idle_standby_consumption_kVAh',
    // 6
    'pf_target','pf_reference_note','pf_slab_scheme','pf_incentive_table','pf_penalty_table',
    // 7
    'v_thd_mode','v_thd_limit','i_thd_mode','i_thd_limit','vfd_harmonic_allowance',
    // 8
    'last_energy_audit_date','audit_observations','audit_report_upload',
    'maintenance_interval','insulation_resistance',
    // 9
    'planned_installation_date','technician_name','technician_mobile',
    'supervisor_name','supervisor_signature',
    'mfm_brand','mfm_model','modbus_slave_id','baud_rate','parity_stop_bits',
    'mfm_wiring_system','pt_primary_v','pt_secondary_v','ct_primary_a','ct_secondary_a',
    // 10
    'alert_trigger_warning','alert_trigger_critical','critical_consecutive_payloads',
    'ack_alert_points','standards_acknowledged'
  ];

  const SECTION_ORDER_MCC = [
    // 1
    'esai_did','machine_name','machine_id','nameplate_details','esai_installation_date',
    'machine_owner','machine_power_value','machine_power_unit','machine_power_kw_display',
    'machine_rated_voltage','rated_current','nominal_frequency',
    'rated_efficiency_percent','rated_pf','duty_type',
    'operating_hours_day','operating_days_month','drive_type','coupling_load_type',
    'mcc_image','mcc_spec_pdf',
    // 2
    'll_thresholds','ln_thresholds','voltage_imbalance_block','nominal_frequency',
    // 3
    'r_ct_primary','ct_secondary','panel_rated_current','mpcb_type',
    'mpcb_in_rated_current','mpcb_ir_setting_mode','mpcb_ir_setting','mpcb_ir_auto_current',
    'current_warning_threshold','current_warning_range_display',
    'current_critical_threshold','current_critical_range_display',
    'ci_mode','ci_buffer_pct',
    // 4
    'total_rated_power_kw','load_distribution_mode',
    'r_phase_rated_power','y_phase_rated_power','b_phase_rated_power','power_balance_block',
    // 5
    'baseline_kwh_per_hour','rated_monthly_energy_budget','shift_wise_energy_budget','idle_standby_kw',
    'pf_apply_ht_logic','pf_target','pf_thresholds_block','pf_slab_scheme','pf_incentive_table','pf_penalty_table',
    // 6
    'v_thd_mode','v_thd_limit','i_thd_mode','i_thd_limit','vfd_harmonic_allowance',
    // 7
    'last_energy_audit_date','audit_observations','energy_audit_pdf',
    'maintenance_interval_value','maintenance_interval_unit','insulation_resistance',
    'location','department_served','installation_date','technician_name','technician_mobile','supervisor_signature',
    'is_mfm_present','mfm_brand','mfm_model','mfm_slave_id','mfm_baudrate','mfm_parity_stop',
    'mfm_wiring','mfm_pt_primary','mfm_pt_secondary','mfm_ct_primary','mfm_ct_secondary'
  ];

  const ORDER = isLT ? SECTION_ORDER_LT : isHT ? SECTION_ORDER_HT : SECTION_ORDER_MCC;

  // ----------------------------
  // Ordered pairs builder
  // ----------------------------
  const pairs = [];
  const added = new Set();

  const addValueIfPresent = (key) => {
    if (key in (formData || {})) {
      const v = formData[key];
      if (typeof v !== 'undefined') {
        putKV(pairs, key, asValue(key, v));
        added.add(key);
      }
    }
  };

  const hasKey = (k) => added.has(k);

  // ----------------------------
  // Derivers
  // ----------------------------
  const pickLLRange = () => {
    let min = formData?.ll_acceptable_lower ?? formData?.acceptable_range_lower ?? null;
    let max = formData?.ll_acceptable_upper ?? formData?.acceptable_range_upper ?? null;

    if (min == null && max == null) {
      const disp = formData?.ll_acceptable_range_display || formData?.acceptable_range_display;
      const parsed = parseRangeFromDisplay(disp);
      min = parsed.min; max = parsed.max;
    }
    // HT often inputs LL in kV; scale to V if values look like kV
    if (isHT && min != null && max != null && min <= 1000 && max <= 1000) {
      min *= 1000; max *= 1000;
    }
    return { min, max };
  };

  const pickLNRange = () => {
    let min = formData?.ln_acceptable_lower ?? null;
    let max = formData?.ln_acceptable_upper ?? null;
    if (min == null && max == null) {
      const parsed = parseRangeFromDisplay(formData?.ln_acceptable_range_display);
      min = parsed.min; max = parsed.max;
    }
    return { min, max };
  };

  const pickFrequencyRange = () => {
    let min = formData?.critical_freq_lower ?? null;
    let max = formData?.critical_freq_upper ?? null;

    if (min == null && max == null) {
      let p = parseRangeFromDisplay(formData?.critical_threshold_freq_display);
      if ((p.min == null && p.max == null) && formData?.warning_threshold_freq_display) {
        p = parseRangeFromDisplay(formData?.warning_threshold_freq_display);
      }
      if (p.min != null || p.max != null) { min = p.min; max = p.max; }
    }

    // fallback to nominal if needed
    const nf = toNum(formData?.nominal_frequency);
    if ((min == null || max == null) && nf != null) {
      if (min == null) min = nf;
      if (max == null) max = nf;
    }
    return { min, max };
  };

  // Bases to compute numeric defaults
  const detectRatedCurrentBase = () => {
    const candidates = [
      formData?.cb_long_time_current,
      formData?.cb_rated_current,
      formData?.panel_rated_current,
      formData?.incoming_ct_primary,
      formData?.r_ct_primary
    ].map(toNum);
    return candidates.find((n) => n != null) ?? null;
  };

  const detectRatedKWBase = () => {
    const totalKW = toNum(formData?.total_rated_power_kw);
    const r = toNum(formData?.r_phase_rated_power) || 0;
    const y = toNum(formData?.y_phase_rated_power) || 0;
    const b = toNum(formData?.b_phase_rated_power) || 0;
    const sumPh = r + y + b;
    if (Number.isFinite(totalKW)) return totalKW;
    return sumPh > 0 ? sumPh : null;
  };

  const pfForCalc = () => {
    const pf = toNum(formData?.pf_target);
    if (pf != null && pf > 0 && pf <= 1.2) return pf;
    return 0.9;
  };

  // ----------------------------
  // Emit in section order and inject core ranges near their sections
  // ----------------------------
  ORDER.forEach((key) => {
    // 1) Add if present (normal path)
    addValueIfPresent(key);

    // 2) *** Force-save real inputs that must always be present ***
    //    Make sure they are inserted AT THEIR SECTION POSITION
    if ((key === 'drive_type' || key === 'pf_target') && !hasKey(key)) {
      const v = key in (formData || {}) ? formData[key] : ''; // persist empty string if truly missing
      putKV(pairs, key, asValue(key, v));
      added.add(key);
    }

    // 3) Derived inserts near their logical place
    if (key === 'll_thresholds' && !hasKey('AVG_VLL')) {
      const { min, max } = pickLLRange();
      putRange(pairs, 'VRY', min, max, siFor('VRY')); added.add('VRY');
      putRange(pairs, 'VRB', min, max, siFor('VRB')); added.add('VRB');
      putRange(pairs, 'VBR', min, max, siFor('VBR')); added.add('VBR');
      putRange(pairs, 'AVG_VLL', min, max, siFor('AVG_VLL')); added.add('AVG_VLL');
    }

    if (key === 'ln_thresholds' && !hasKey('AVG_VLN')) {
      if (isLT || isMCC) {
        const { min, max } = pickLNRange();
        putRange(pairs, 'VR', min, max, siFor('VR')); added.add('VR');
        putRange(pairs, 'VY', min, max, siFor('VY')); added.add('VY');
        putRange(pairs, 'VB', min, max, siFor('VB')); added.add('VB');
        putRange(pairs, 'AVG_VLN', min, max, siFor('AVG_VLN')); added.add('AVG_VLN');
      } else {
        putRange(pairs, 'VR', null, null, siFor('VR')); added.add('VR');
        putRange(pairs, 'VY', null, null, siFor('VY')); added.add('VY');
        putRange(pairs, 'VB', null, null, siFor('VB')); added.add('VB');
        putRange(pairs, 'AVG_VLN', null, null, siFor('AVG_VLN')); added.add('AVG_VLN');
      }
    }

    if (key === 'nominal_frequency' && !hasKey('FREQUENCY')) {
      const { min, max } = pickFrequencyRange();
      putRange(pairs, 'FREQUENCY', min, max, siFor('FREQUENCY')); added.add('FREQUENCY');
    }

    if (key === 'voltage_imbalance_block') {
      const acc = numberFromPercentDisplay(formData?.acceptable_range_Vdisplay);
      const warn = numberFromPercentDisplay(formData?.warning_threshold_Vdisplay);
      const crit = numberFromPercentDisplay(formData?.critical_threshold_Vdisplay);
      if (acc != null && !hasKey('vi_acceptable_percent')) { putKV(pairs, 'vi_acceptable_percent', asValue('vi_acceptable_percent', acc)); added.add('vi_acceptable_percent'); }
      if (warn != null && !hasKey('vi_warning_percent'))   { putKV(pairs, 'vi_warning_percent',   asValue('vi_warning_percent',   warn)); added.add('vi_warning_percent'); }
      if (crit != null && !hasKey('vi_critical_percent'))  { putKV(pairs, 'vi_critical_percent',  asValue('vi_critical_percent',  crit)); added.add('vi_critical_percent'); }
    }
  });

  // ----------------------------
  // Leftovers (skip helpers)
  // ----------------------------
  const shouldSkipLeftover = (k) =>
    k === 'preview' ||
    k === '__preview__' ||
    k === '__order' ||
    /_display$/i.test(k) ||
    /_range_display$/i.test(k);

  Object.keys(formData || {}).forEach((k) => {
    if (added.has(k)) return;
    if (typeof formData[k] === 'undefined') return;
    if (shouldSkipLeftover(k)) return;
    putKV(pairs, k, asValue(k, formData[k]));
    added.add(k);
  });

  // ----------------------------
  // Telemetry defaults (numeric only) WITH SI
  // ----------------------------
  const ensureDefaultOrdered = (k, min, max) => {
    if (!added.has(k)) {
      putRange(pairs, k, min, max, siFor(k));
      added.add(k);
    }
  };

  // bases
  const baseA    = detectRatedCurrentBase();
  const baseKW   = detectRatedKWBase();
  const pf       = pfForCalc();
  const baseKVA  = baseKW != null ? baseKW / Math.max(pf, 0.1) : null;
  const acos     = (x) => Math.acos(Math.min(Math.max(x, -1), 1));
  const tan      = (x) => Math.tan(x);
  const baseKVAR = baseKW != null ? baseKW * tan(acos(Math.min(pf, 1))) : null;

  // THD (%)
  ensureDefaultOrdered('R_THD-V', 0.0, 35.0);
  ensureDefaultOrdered('Y_THD-V', 0.0, 35.0);
  ensureDefaultOrdered('B_THD-V', 0.0, 35.0);
  ensureDefaultOrdered('R_THD-I', 0.0, 50.0);
  ensureDefaultOrdered('Y_THD-I', 0.0, 50.0);
  ensureDefaultOrdered('B_THD-I', 0.0, 50.0);

  // Energy counters
  ensureDefaultOrdered('KWH',   0, 999999);
  ensureDefaultOrdered('KVAH',  0, 999999);
  ensureDefaultOrdered('KVARH', 0, 999999);

  // Currents (0 .. 3× base)
  const iMax = baseA != null ? baseA * 3 : null;
  ensureDefaultOrdered('IR',    0, iMax);
  ensureDefaultOrdered('IY',    0, iMax);
  ensureDefaultOrdered('IB',    0, iMax);
  ensureDefaultOrdered('AVG_I', 0, iMax);

  // PF
  ensureDefaultOrdered('R_PF',   0.3, 1.15);
  ensureDefaultOrdered('Y_PF',   0.3, 1.15);
  ensureDefaultOrdered('B_PF',   0.3, 1.15);
  ensureDefaultOrdered('AVG_PF', 0.3, 1.15);

  // kW
  const kwMax = baseKW != null ? baseKW * 2 : null;
  ensureDefaultOrdered('R_KW',     -50, kwMax);
  ensureDefaultOrdered('Y_KW',     -50, kwMax);
  ensureDefaultOrdered('B_KW',     -50, kwMax);
  ensureDefaultOrdered('TOTAL_KW', -50, kwMax);

  // kVA
  const kvaMax = baseKVA != null ? baseKVA * 2 : null;
  ensureDefaultOrdered('R_KVA',     0, kvaMax);
  ensureDefaultOrdered('Y_KVA',     0, kvaMax);
  ensureDefaultOrdered('B_KVA',     0, kvaMax);
  ensureDefaultOrdered('TOTAL_KVA', 0, kvaMax);

  // kvar
  const kvarMax = baseKVAR != null ? baseKVAR * 2 : null;
  ensureDefaultOrdered('R_KVAR',     -50, kvarMax);
  ensureDefaultOrdered('Y_KVAR',     -50, kvarMax);
  ensureDefaultOrdered('B_KVAR',     -50, kvarMax);
  ensureDefaultOrdered('TOTAL_KVAR', -50, kvarMax);

  // Signal
  ensureDefaultOrdered('RSSI', -120, -20);

  // ----------------------------
  // Finalize
  // ----------------------------
  const jsonObj = Object.fromEntries(pairs);
  jsonObj.__order = pairs.map(([k]) => k);

  // Allow overrides
  Object.assign(jsonObj, extras?.jsonObjOverrides || {});

  return { name, jsonObj };
};
