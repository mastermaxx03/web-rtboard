// src/views/plant-info/section2.js
export const plantSection2Fields = [
  { type: 'header', label: 'Electricity Billing & Operations' },

  {
    id: 'billing_cycle_start_day',
    label: 'Electricity Billing Cycle — Start Day of Each Month',
    type: 'billing-day',
    required: true,
    defaultValue: 1,
    helperText: 'Choose day 1–31.'
  },

  {
    id: 'has_shift',
    label: 'Shifts Enabled?',
    type: 'button-group',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' }
    ],
    defaultValue: 'no',
    required: true
  },

  {
    id: 'shift_block',
    type: 'shift-block',
    dependsOn: { field: 'has_shift', equals: 'yes' },
    defaultValue: []
  },

  { type: 'header', label: 'ToD (Time of Day) Zones' },
  {
    id: 'tod_zones',
    type: 'tod-zones-block',
    helperText: 'Define time ranges and applicable rate (₹/kWh).',
    defaultValue: []
  }
];
