export const section3Fields = [
  { type: 'header', label: 'Panel Incoming Supply Monitoring' },

  { id: 'incoming_ct_primary', label: 'Incoming Busbar CT Primary Current', type: 'number', required: true, unit: 'A' ,defaultValue: 400  },

  {
    id: 'incoming_breaker_type',
    label: 'Breaker Type',
    type: 'dropdown',
    required: true,
    placeholder: 'Select (VCB / ACB / MCCB / MCB / ELCB / RCCB)',
    options: [
      { label: 'VCB (Vacuum Circuit Breaker)', value: 'vcb' },
      { label: 'ACB (Air Circuit Breaker)', value: 'acb' },
      { label: 'MCCB (Moulded Case Circuit Breaker)', value: 'mccb' },
      { label: 'MCB (Miniature Circuit Breaker)', value: 'mcb' },
      { label: 'ELCB (Earth Leakage Circuit Breaker)', value: 'elcb' },
      { label: 'RCCB (Residual Current Circuit Breaker)', value: 'rccb' },
    ],
    defaultValue: 'mccb',
  },

  { id: 'cb_make_model', label: 'CB Details (Make & Model No)', type: 'text', placeholder: 'Make & Model No' },

  { id: 'upload_cb_nameplate', label: 'Upload CB Nameplate/Datesheet', type: 'file', accept: 'image/jpeg, image/png' },

  // In (rated current)
  { id: 'cb_rated_current', label: <>Circuit Breaker – I<sub>n</sub> (Rated Current)</>, type: 'number', unit: 'A' },

  // Ir setting as a MULTIPLIER of In (e.g. 0.4, 0.6, 0.8, 1.0)
  {
    id: 'cb_ir_setting',
    label: <>Circuit Breaker – I<sub>r</sub> Setting (@ × I<sub>n</sub>)</>,
    type: 'number',
    placeholder: 'e.g., 0.4, 0.6, 0.8, 1.0',
    unit: '× In',
    inputProps: { min: 0.1, max: 1, step: 0.1 },
    rules: [
      { type: 'number', message: 'Enter a valid number.' },
      { type: 'min', limits: 0.1, message: 'Must be ≥ 0.1' },
      { type: 'max', limits: 1, message: 'Must be ≤ 1' }
    ]
  },

  // Auto-calculated: In × Ir
  {
    id: 'cb_long_time_current',
    label: <>Circuit Breaker – I<sub>r</sub> (Long-Time/Continuous)</>,
    type: 'display',
    unit: 'A',
    inputProps: { readOnly: true },
    helperText: '(auto = Ir Setting × In)'
  },

  {
    id: 'cb_warning_threshold',
    label: <>Default Warning Threshold ( % of I<sub>r</sub> )</>,
    type: 'button-group',
    showSelected: true,
    options: [
      { label: <>(80–85)% of I<sub>r</sub></>, value: '80-85' },
      { label: <>(86–90)% of I<sub>r</sub></>, value: '86-90' },
    ],
    // defaultValue: '80-85'
  },
  {
    id: 'cb_critical_threshold',
    label: <>Default Critical Threshold ( % of I<sub>r</sub> )</>,
    type: 'button-group',
    showSelected: true,
    options: [
      { label: <>(90–95)% of I<sub>r</sub></>, value: '90-95' },
      { label: <>(96–100)% of I<sub>r</sub></>, value: '96-100' },
    ],
  },

  { type: 'header', label: 'Panel Outgoing Supply Monitoring' },
  {
    id: 'outgoing_count',
    label: 'Number of Outgoing Feeders',
    type: 'panel-outgoing-supply',
    required: true,
    placeholder: 'Enter 1–10',
    rules: [
      { type: 'number', message: 'Enter a valid number.' },
      { type: 'min', limits: 1, message: 'Minimum 1 feeder.' },
      { type: 'max', limits: 10, message: 'Maximum 10 feeders.' }
    ],
    inputProps: { min: 1, max: 10, step: 1 }
  },

  { type: 'header', label: 'Current Imbalance (%)' },
  {
    id: 'current_imbalance_acceptable',
    label: 'Acceptable Range',
    type: 'current-imbalance',
    config: {
      title: 'Current Imbalance (%)',
      sliderMin: 5,
      sliderMax: 25,
      sliderStep: 0.5,
      buttonLabel: 'Up to 10%',
      defaultAcceptable: 10,
      defaultWarning: 10,
      defaultCritical: 20,
    }
  }
];
