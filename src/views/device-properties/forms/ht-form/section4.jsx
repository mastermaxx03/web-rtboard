// Power step (Section 4) — fields config
export const section4Fields = [
  { type: 'header', label: 'Power Monitoring' },

  {
    id: 'total_rated_power_kw',
    label: 'TOTAL RATED POWER (kW)',
    type: 'number',
    required: true,
    defaultValue: 21
  },

  {
    id: 'load_distribution_mode',
    label: 'Load Distribution',
    type: 'button-group',
    options: [
      { label: 'Balanced', value: 'balanced' },
      { label: 'Unbalanced', value: 'unbalanced' }
    ],
    defaultValue: 'balanced'
  },

  // Auto-filled & locked when Balanced; editable when Unbalanced
  { id: 'r_phase_rated_power', label: 'R Phase Rated Power (kW)', type: 'number', defaultValue: '' },
  { id: 'y_phase_rated_power', label: 'Y Phase Rated Power (kW)', type: 'number', defaultValue: '' },
  { id: 'b_phase_rated_power', label: 'B Phase Rated Power (kW)', type: 'number', defaultValue: '' },

  // Section-2-style tiles for Total vs Sum(R,Y,B)
  {
    id: 'power_balance_block',
    type: 'power-balance-block',
    config: { title: '3PH Power Balance (Total vs R+Y+B)' }
  }
];

export default section4Fields;
