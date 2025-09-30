export const section2Fields = [
  { type: 'header', label: '3PH L-L VOLTAGES' },

  {
    id: 'll_thresholds',
    type: 'thresholds-block',
    config: {
      title: '3PH L-L Voltage Thresholds',
      fieldPrefix: 'll',
      unit: 'V',
      presets: [400, 415, 433]
    },
  },

  { type: 'header', label: '3PH L-N VOLTAGES' },

  {
    id: 'ln_thresholds',
    type: 'thresholds-block',
    config: {
      title: '3PH L-N Voltage Thresholds',
      fieldPrefix: 'ln',
      unit: 'V',
      presets: [220, 230, 240]
    },
    
  },

  { type: 'header', label: 'PHASE IMBALANCE (applies to L-L & L-N)' },

  {
    id: 'voltage_imbalance_block',
    type: 'imbalance-block',
    config: {
      title: 'Phase Imbalance (applies to L-L & L-N)',
      fieldPrefix: 'vi'
    }
  },

  { type: 'header', label: 'FREQUENCY' },

  // Reusable frequency block (NO buffer). Keep id = 'nominal_frequency' so validation works.
  {
    id: 'nominal_frequency',
    type: 'frequency-block',
    required: false,
    config: {
      title: 'Frequency',
      presets: [50.0, 60.0],
      step: 0.1
    }
  }
];
