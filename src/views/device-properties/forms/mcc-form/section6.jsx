export const mccSection6Fields = [
  { type: 'header', label: 'Harmonics (THD)' },

  {
    id: 'v_thd_mode',
    label: 'Voltage THD Limit (%)',
    type: 'button-group',
    options: [
      { label: 'IS Standard (≤5%)', value: 'std' },
      { label: 'User Input', value: 'user' }
    ],
    defaultValue: 'std'
  },
  {
    id: 'v_thd_limit',
    label: 'Voltage THD Limit (%) (if User)',
    type: 'combo-input',
    inputType: 'number',
    unit: '%',
    placeholder: 'e.g., 5.0',
    buttonOptions: [
      { label: '8%', value: 8.0 },
      { label: '10%', value: 10.0 },
      { label: '12%', value: 12.0 },
      { label: '14%', value: 14.0 }
    ],
    linkModeId: 'v_thd_mode',
    defaultValue: ''
  },

  {
    id: 'i_thd_mode',
    label: 'Current THD Limit (%)',
    type: 'button-group',
    options: [
      { label: 'IS Standard (≤8%)', value: 'std' },
      { label: 'User Input', value: 'user' }
    ],
    defaultValue: 'std'
  },
  {
    id: 'i_thd_limit',
    label: 'Current THD Limit (%) (if User)',
    type: 'combo-input',
    inputType: 'number',
    unit: '%',
    step: 0.1,
    min: 0,
    max: 100,
    placeholder: 'e.g., 8.0',
    buttonOptions: [
      { label: '10%', value: 10.0 },
      { label: '14%', value: 14.0 },
      { label: '18%', value: 18.0 },
      { label: '22%', value: 22.0 }
    ],
    linkModeId: 'i_thd_mode',
    defaultValue: '',
    inputProps: { min: 0, max: 30, step: 1}
  },

  { id: 'vfd_harmonic_allowance', label: 'VFD Harmonic Allowance (%) (optional)', type: 'number', defaultValue: '' }
];
