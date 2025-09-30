// section9Fields.js

export const section9Fields = [
  // ===== Installation Responsible Personnel =====
  { type: 'header', label: 'ESAI DEVICE INSTALLATION DETAILS' },
  {
    id: 'planned_installation_date',
    label: 'Installation Date',
    type: 'date',
    required: true,
    helperText: 'Select installation/commissioning date.',
    defaultValue:'09/10/2025'
  },
  {
    id: 'technician_name',
    label: 'Technician Name',
    type: 'text',
    defaultValue: 'John Doe',
    required: true,
    helperText: 'Full name of the installing technician.'
  },
  {
    id: 'technician_mobile',
    label: 'Technician Mobile Number',
    type: 'phone-number',
    placeholder: '10-digit mobile number',
    required: true,
    defaultValue: '9876543210',
    helperText: 'For site coordination and alerts.',
    minLength: 10,
    maxLength: 10
  },

  {
    id: 'supervisor_name',
    label: 'Supervisor Name',
    type: 'text',
    defaultValue: 'Jane Smith',
    required: true,
    helperText: 'Responsible supervisor/approver.'
  },
  {
    id: 'supervisor_signature',
    label: 'Device Installation Form (Upload)',
    type: 'file',
    accept: 'image/png, image/jpeg',
    // required: true,
    helperText: 'Upload clear image of signature or sign-off stamp.'
  },

  // ===== Existing MFM Settings (ESAI Gateway Device) =====
  { type: 'header', label: 'EXISTING MFM SETTINGS (ESAI GATEWAY DEVICE)' },
  {
    id: 'mfm_brand',
    label: 'MFM Brand Name',
    type: 'text',
    required: true,
    helperText: 'Meter brand (e.g., Secure, Selec, Schneider, L&T).',
    defaultValue: 'EMS'
  },
  {
    id: 'mfm_model',
    label: 'MFM Model No.',
    type: 'text',
    required: true,
    defaultValue: 'EMS1234',
    helperText: 'Exact model printed on meter nameplate.'
  },
  {
    id: 'modbus_slave_id',
    label: 'Modbus Address (Slave ID)',
    type: 'number',
    required: true,
    defaultValue: 1,
    inputProps: { min: 1, max: 247, step: 1 },
    rules: [
      { type: 'number', message: 'Enter a valid integer.' },
      { type: 'min', limits: 1, message: 'Must be between 1 and 247.' },
      { type: 'max', limits: 247, message: 'Must be between 1 and 247.' }
    ],
    helperText: 'Device address on RS-485 Modbus network (1–247).'
  },
  {
    id: 'baud_rate',
    label: 'Baud Rate',
    type: 'button-group',
    options: [
      { label: '9600', value: 9600 },
      { label: '19200', value: 19200 },
      { label: '38400', value: 38400 },
      { label: '57600', value: 57600 },
      { label: '115200', value: 115200 }
    ],
    placeholder: 'Custom',
    required: true,
    defaultValue: 9600
  },
  {
    id: 'parity_stop_bits',
    label: 'Parity / Stop Bits',
    type: 'combo-input',
    buttonOptions: [
      { label: 'N-1', value: 'N-1' },
      { label: 'N-2', value: 'N-2' },
      { label: 'E-1', value: 'E-1' },
      { label: 'O-1', value: 'O-1' }
    ],
    placeholder: 'Custom',
    required: true,
    defaultValue: 'N-1'
  },
  {
    id: 'mfm_wiring_system',
    label: 'MFM Wiring System',
    type: 'button-group',
    options: [
      { label: '3P4W', value: '3P4W' },
      { label: '3P3W', value: '3P3W' }
    ],
    placeholder: 'Custom',
    required: true,
    defaultValue: '3P4W'
  },
  {
    id: 'pt_primary_v',
    label: 'PT Primary (V)',
    type: 'number',
    unit: 'V',
    placeholder: 'e.g., 1100',
    required: true,
    rules: [{ type: 'number', message: 'Enter a valid number.' }],
    helperText: 'Potential transformer primary voltage (if applicable).',
    defaultValue: 1100
  },
  {
    id: 'pt_secondary_v',
    label: 'PT Secondary (V)',
    type: 'number',
    unit: 'V',
    placeholder: 'e.g., 110',
    required: true,
    defaultValue: 110,
    rules: [{ type: 'number', message: 'Enter a valid number.' }],
    helperText: 'Potential transformer secondary voltage.'
  },
  {
    id: 'ct_primary_a',
    label: 'CT Primary (A)',
    type: 'number',
    unit: 'A',
    placeholder: 'e.g., 400',
    defaultValue: 400,
    required: true,
    rules: [{ type: 'number', message: 'Enter a valid number.' }]
  },
  {
    id: 'ct_secondary_a',
    label: 'CT Secondary (A)',
    type: 'combo-input',
    buttonOptions: [
      { label: '1A', value: 1 },
      { label: '5A', value: 5 }
    ],
    defaultValue: 5,
    placeholder: 'Custom (A)',
    required: true,
    unit: 'A'
  }
];
