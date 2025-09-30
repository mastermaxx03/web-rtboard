// section5Fields.js

export const section5Fields = [
  { type: 'header', label: 'Energy Monitoring' },

  {
    id: 'total_energy_consumption_kVAh',
    label: 'Approx. Feeder Total Energy Consumption / Hour',
    type: 'number',
    unit: 'kVAh',
    placeholder: 'e.g., 12.5',
    helperText: 'Energy per hour (kVAh)',
    rules: [
      { type: 'number', message: 'Enter a valid number.' },
      { type: 'min', limits: 0, message: 'Must be ≥ 0.' }
    ]
  },

  {
    id: 'monthly_energy_budget_kWh',
    label: 'Rated monthly energy budget or baseline',
    type: 'number',
    unit: 'kWh',
    placeholder: 'e.g., 25000',
    helperText: '(optional)',
    rules: [
      { type: 'number', message: 'Enter a valid number.' },
      { type: 'min', limits: 0, message: 'Must be ≥ 0.' }
    ]
  },

  {
    id: 'shift_wise_energy_budget_kWh',
    label: 'Shift-wise Energy Budget',
    type: 'number',
    unit: 'kWh',
    placeholder: 'e.g., 1200',
    rules: [
      { type: 'number', message: 'Enter a valid number.' },
      { type: 'min', limits: 0, message: 'Must be ≥ 0.' }
    ]
  },

  {
    id: 'idle_standby_consumption_kVAh',
    label: 'Idle / Standby Consumption',
    type: 'number',
    unit: 'kVAh',
    placeholder: 'e.g., 0.8',
    helperText: 'Energy per hour when idle/standby (kVAh)',
    rules: [
      { type: 'number', message: 'Enter a valid number.' },
      { type: 'min', limits: 0, message: 'Must be ≥ 0.' }
    ]
  }
];
