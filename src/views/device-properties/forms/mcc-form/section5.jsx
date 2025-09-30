export const mccSection5Fields = [
  { type: 'header', label: 'Energy Baseline' },

  { id: 'baseline_kwh_per_hour', label: 'Baseline kWh Consumption / Hour', type: 'number', defaultValue: '' },
  { id: 'rated_monthly_energy_budget', label: 'Rated Monthly Energy Budget (kWh/MWh)', type: 'text', defaultValue: '' },
  { id: 'shift_wise_energy_budget', label: 'Shift-wise Energy Budget (kWh)', type: 'text', defaultValue: '' },
  { id: 'idle_standby_kw', label: 'Idle / Standby Consumption (kW)', type: 'number', defaultValue: '1', required: true },

  
];
