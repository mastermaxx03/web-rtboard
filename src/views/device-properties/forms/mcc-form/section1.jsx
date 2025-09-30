// src/views/device-properties/forms/mcc-form/section1.js
export const mccSection1Fields = [
  { type: 'header', label: 'Machine Info (Static Details)' },

  { id: 'esai_did', label: 'ESAI DEVICE ID (DID)', type: 'text', required: true, defaultValue: '2', placeholder: 'Auto-generated' },
  {
    id: 'machine_name',
    label: 'Name of Machine',
    type: 'text',
    required: true,
    defaultValue: '1',
    placeholder: 'e.g., Cooling Water Pump'
  },
  { id: 'machine_id', label: 'Machine ID', type: 'text', required: true, defaultValue: '1', placeholder: 'e.g., P-101A' },
  {
    id: 'nameplate_details',
    label: 'Machine Name Plate Details (10-25 words)',
    type: 'textarea',
    defaultValue: '1',
    placeholder: 'Model, rating, manufacturer, voltage, current…'
  },
  { id: 'esai_installation_date', label: 'ESAI Installation Date', type: 'date', defaultValue: '', placeholder: 'ESAI Installation Date' },
  { id: 'machine_owner', label: 'Machine Owner / Department', type: 'text', defaultValue: '', placeholder: 'e.g., Utilities / Production' },

  // ── Rated Power (inline: input + KW/HP buttons) ───────────────────────────
  {
    id: 'machine_power_value',
    label: 'Rated Power',
    type: 'combo-input', // rendered by ValueWithUnitField
    // unitFieldId: 'machine_power_unit', // where to store unit in formData
    buttonOptions: [
      { label: 'KW', value: 'kW' },
      { label: 'HP', value: 'HP' }
    ],
    inputType: 'number',
    step: 0.001, // allow decimals
    placeholder: 'e.g., 75',
    required: true,
    defaultValue: '2'
  },
  // keep unit in state but don’t render a separate row
  { id: 'machine_power_unit', type: 'hidden', defaultValue: 'kW' },

  {
    id: 'machine_power_kw_display',
    label: 'Rated Power (in kW)',
    type: 'display',
    defaultValue: ''
  },

  // ── Machine Rated Voltage (input first + quick options) ───────────────────
  {
    id: 'machine_rated_voltage',
    label: 'Machine Rated Voltage',
    type: 'combo-input',
    inputType: 'number',
    step: 0.1, // allow decimals
    buttonOptions: [
      { label: '400V', value: 400 },
      { label: '415V', value: 415 },
      { label: '433V', value: 433 }
    ],
    placeholder: 'Voltage (V)',
    unit: 'V',
    required: true,
    defaultValue:'400'
  },

  {
    id: 'rated_current',
    label: 'Rated Full Load Current (A)',
    type: 'number',
    defaultValue: '2',
    unit: 'A',
    step: 0.001, // allow decimals
    required: true,
    placeholder: 'e.g., 125.5'
  },

  // ── Rated Frequency ───────────────────────────────────────────────────────
  {
    id: 'nominal_frequency',
    label: 'Rated Frequency',
    type: 'button-group',
    options: [
      { label: '50 Hz', value: '50.0' },
      { label: '60 Hz', value: '60.0' }
    ],
    defaultValue: '50 Hz',
    unit: 'Hz',
    required: true
  },

  // ── Rated Efficiency (input first; optional quick presets can be added) ──
  {
    id: 'rated_efficiency_percent',
    label: 'Rated Efficiency',
    type: 'number',
    inputType: 'number',
    step: 0.1, // per requirement
    // buttonOptions: [{ label: 'IE2', value: 'IE2' }, { label: 'IE3', value: 'IE3' }, { label: 'IE4', value: 'IE4' }],
    placeholder: 'e.g., 92.4',
    unit: '%',
    defaultValue: '1'
  },

  // ── Rated Power Factor (lag) ──────────────────────────────────────────────
  {
    id: 'rated_pf',
    label: 'Rated Power Factor (lag)',
    type: 'number',
    inputType: 'number',
    step: 0.1, // per requirement
    // buttonOptions: [{ label: '0.80', value: 0.8 }, { label: '0.85', value: 0.85 }, { label: '0.90', value: 0.9 }, { label: '0.95', value: 0.95 }],
    placeholder: 'e.g., 0.85',
    defaultValue: '1',
    required: true
  },

  // ── Duty type ─────────────────────────────────────────────────────────────
  {
    id: 'duty_type',
    label: 'Duty Type',
    type: 'button-group',
    options: [
      { label: 'Continuous', value: 'continuous' },
      { label: 'Intermittent', value: 'intermittent' },
      { label: 'Variable Load', value: 'variable' }
    ],
    defaultValue: 'continuous'
  },

  {
    id: 'operating_hours_day',
    label: 'Operating Hours / Day',
    type: 'number',
    defaultValue: '',
    placeholder: 'e.g., 16.5',
    unit: 'hours',
    step: 0.1
  },
  {
    id: 'operating_days_month',
    label: 'Operating Days / Month',
    type: 'number',
    defaultValue: '',
    placeholder: 'e.g., 26.5',
    unit: 'days',
    step: 0.1
  },

  // ── Drive Type (input first + options if you add them later) ─────────────
  {
    id: 'drive_type',
    label: 'Drive Type',
    type: 'text',
    // buttonOptions: [{ label: 'DOL', value: 'DOL' }, { label: 'Star-Delta', value: 'star_delta' }, { label: 'VFD', value: 'VFD' }, { label: 'Soft Starter', value: 'soft_starter' }, { label: 'Servo', value: 'servo' }],
    placeholder: 'e.g., DOL / Star-Delta / VFD / Soft Starter / Servo'
  },

  // ── Mechanical Coupling Load Type ─────────────────────────────────────────
  {
    id: 'coupling_load_type',
    label: 'Mechanical Coupling Load Type',
    type: 'text',
    // buttonOptions: [{ label: 'Pump', value: 'pump' }, { label: 'Fan', value: 'fan' }, { label: 'Gearbox', value: 'gearbox' }, { label: 'Conveyor', value: 'conveyor' }, { label: 'Other', value: 'other' }],
    placeholder: 'e.g., Pump / Fan / Gearbox / Conveyor / Other',
    defaultValue: ''
  },

  // ── Uploads ───────────────────────────────────────────────────────────────
  { id: 'mcc_image', label: 'Upload Image of MCC Panel (JPEG/PNG)', type: 'file', accept: 'image/jpeg, image/png' },
  { id: 'mcc_spec_pdf', label: 'Optional: Upload Panel Details & Specifications PDF', type: 'file', accept: '.pdf' }
];
