// src/views/device-properties/forms/mcc-form/section3Fields.js
export const mccSection3Fields = [
  { type: 'header', label: '3PH LOAD CURRENT' },

  { id: 'r_ct_primary', label: 'R/Y/B Phase CT Primary Current (A) ', type: 'number', defaultValue: '1', required: true },

  {
    id: 'ct_secondary',
    label: 'CT Secondary Current (A)',
    type: 'button-group',
    options: [
      { label: '1A', value: 1 },
      { label: '5A', value: 5 }
    ],
    defaultValue: 5,
    required: true
  },

  { id: 'panel_rated_current', label: 'Panel Rated Current (A)', type: 'number', defaultValue: '1', required: true },

  {
    id: 'mpcb_type',
    label: 'MPCB Type',
    type: 'button-group',
    options: [
      { label: 'Type B', value: 'B' },
      { label: 'Type C', value: 'C' },
      { label: 'Type D', value: 'D' },
      { label: 'Adjustable', value: 'adjustable' }
    ],
    defaultValue: 'C'
  },

  { id: 'mpcb_in_rated_current', label: 'MPCB Iₙ (Rated Current, A)', type: 'number', defaultValue: '1', required: true },

  {
    id: 'mpcb_ir_setting_mode',
    label: 'MPCB Iᵣ Setting (× Iₙ)',
    type: 'combo-input',
    inputType: 'number',
    step: 0.1,
    min: 0.1,
    max: 1.0,
    unit: '× Iₙ',
    placeholder: 'e.g., 1.0',
    buttonOptions: [
      { label: '0.4 × Iₙ', value: 0.4 },
      { label: '0.6 × Iₙ', value: 0.6 },
      { label: '0.8 × Iₙ', value: 0.8 },
      { label: '1.0 × Iₙ', value: 1.0 }
    ],
    defaultValue: 1.0,
    required: true
  },

  { id: 'mpcb_ir_setting', type: 'hidden', defaultValue: '' },

  {
    id: 'mpcb_ir_auto_current',
    label: 'MPCB Iᵣ Auto-calculated Current (A)',
    type: 'display',
    defaultValue: '—'
  },

  // % of Ir thresholds + A–A calculated ranges
  {
    id: 'current_warning_threshold',
    label: 'Default Warning Threshold (% of Iᵣ)',
    type: 'button-group',
    options: [
      { label: '80 – 85 % of Iᵣ', value: '80-85' },
      { label: '86 – 90 % of Iᵣ', value: '86-90' }
    ],
    defaultValue: '80-85'
  },
  { id: 'current_warning_range_display', label: 'Calculated Range', type: 'display', defaultValue: 'N/A' },

  {
    id: 'current_critical_threshold',
    label: 'Default Critical Threshold (% of Iᵣ)',
    type: 'button-group',
    options: [
      { label: '91 – 94 % of Iᵣ', value: '91-94' },
      { label: '95 – 98 % of Iᵣ', value: '95-98' }
    ],
    defaultValue: '91-94'
  },
  { id: 'current_critical_range_display', label: 'Calculated Range', type: 'display', defaultValue: 'N/A' },

  // Current Imbalance tiles (looks like Phase Imbalance)
  { type: 'header', label: 'Current Imbalance (%)' },
  {
    type: 'imbalance-block',
    config: {
      title: 'Current Imbalance (%)',
      fieldPrefix: 'ci', // stores ci_mode / ci_buffer_pct, independent of 'vi_*'
      variant: 'current' // tells the block to use computeCurrentImbalanceBands
    }
  }
];
