// section6Fields.js
// Pure PF section (no HT logic). Includes target + thresholds and 2 editable slab tables.

export const section6Fields = [
  { type: 'header', label: 'POWER FACTOR ' },

  // ---- Target & thresholds ---------------------------------------------------
  {
    id: 'pf_target',
    label: 'PF Target', // 0.900 – 0.999
    type: 'threshold',
    placeholder: 'e.g., 0.990',
    // rules: [
    //   { type: 'number', message: 'Enter a valid number.' },
    //   { type: 'range', limits: { min: 0.900, max: 0.999 }, message: 'PF must be between 0.900 and 0.999.' }
    // ],
    helperText: 'Target PF must be 0.900–0.999 (3 decimals).'
  },

  // ---- Reference note --------------------------------------------------------
  {
    id: 'pf_reference_note',
    label: 'Reference',
    type: 'display',
    defaultValue:
      'PF will be computed up to 3 decimals (after rounding). Slabs below use a single shared scheme selector.'
  },

  // ---- ONE shared scheme dropdown (controls BOTH tables) --------------------
  {
    id: 'pf_slab_scheme', ///make dropdown here
    label: 'Slab Scheme (State/Board)',
    type: 'dropdown',
    // required: true,
    defaultValue: 'msedcl_2025',
    options: [
      { label: 'MSEDCL (FY 2024–25)', value: 'msedcl_2025' },
      { label: 'Generic (Example)', value: 'generic' }
    ],
    helperText: 'This selection applies to both Incentive and Penalty slabs.'
  },

  // ---- Incentive slabs -------------------------------------------------------
  { type: 'header', label: 'Incentive Slabs' },
  {
    id: 'pf_incentive_table',
    label: 'PF Incentive Slabs',
    type: 'table',
    externalSchemeFieldId: 'pf_slab_scheme', // << shared driver
    columns: [
      { id: 'range', label: 'Range of PF' },
      { id: 'pf_level', label: 'PF Level' },
      { id: 'incentive', label: 'Incentive %' }
    ],
    // default rows (fallback)
    rows: [
      { range: '0.951 – 0.954', pf_level: '0.95', incentive: '0%' },
      { range: '0.955 – 0.964', pf_level: '0.96', incentive: '0.5%' },
      { range: '0.965 – 0.974', pf_level: '0.97', incentive: '1.0%' },
      { range: '0.975 – 0.984', pf_level: '0.98', incentive: '1.5%' },
      { range: '0.985 – 0.994', pf_level: '0.99', incentive: '2.5%' },
      { range: '0.995 – 1.000', pf_level: '1.00', incentive: '3.5%' }
    ],
    schemes: [
      {
        key: 'msedcl_2025',
        label: 'MSEDCL (FY 2024–25)',
        rows: [
          { range: '0.951 – 0.954', pf_level: '0.95', incentive: '0%' },
          { range: '0.955 – 0.964', pf_level: '0.96', incentive: '0.5%' },
          { range: '0.965 – 0.974', pf_level: '0.97', incentive: '1.0%' },
          { range: '0.975 – 0.984', pf_level: '0.98', incentive: '1.5%' },
          { range: '0.985 – 0.994', pf_level: '0.99', incentive: '2.5%' },
          { range: '0.995 – 1.000', pf_level: '1.00', incentive: '3.5%' }
        ]
      },
      {
        key: 'generic',
        label: 'Generic (Example)',
        rows: [
          { range: '0.951 – 0.960', pf_level: '0.95', incentive: '0.5%' },
          { range: '0.961 – 0.970', pf_level: '0.96', incentive: '1.0%' },
          { range: '0.971 – 0.980', pf_level: '0.97', incentive: '1.5%' },
          { range: '0.981 – 0.990', pf_level: '0.98', incentive: '2.0%' },
          { range: '0.991 – 1.000', pf_level: '0.99–1.00', incentive: '3.0%' }
        ]
      }
    ]
  },

  // ---- Penalty slabs ---------------------------------------------------------
  { type: 'header', label: 'Penalty Slabs' },
  {
    id: 'pf_penalty_table',
    label: 'PF Penalty Slabs',
    type: 'table',
    externalSchemeFieldId: 'pf_slab_scheme', // << shared driver
    columns: [
      { id: 'range', label: 'Range of PF' },
      { id: 'pf_level', label: 'PF Level' },
      { id: 'penalty', label: 'Penalty %' }
    ],
    rows: [
      { range: '0.895 – 0.900', pf_level: '0.90', penalty: '0%' },
      { range: '0.885 – 0.894', pf_level: '0.89', penalty: '1.0%' },
      { range: '0.875 – 0.884', pf_level: '0.88', penalty: '1.5%' },
      { range: '0.865 – 0.874', pf_level: '0.87', penalty: '2.0%' },
      { range: '0.855 – 0.864', pf_level: '0.86', penalty: '2.5%' },
      { range: '0.845 – 0.854', pf_level: '0.85', penalty: '3.0%' },
      { range: '0.835 – 0.844', pf_level: '0.84', penalty: '3.5%' },
      { range: '0.825 – 0.834', pf_level: '0.83', penalty: '4.0%' },
      { range: '0.815 – 0.824', pf_level: '0.82', penalty: '4.5%' },
      { range: '0.805 – 0.814', pf_level: '0.81', penalty: '5.0%' }
    ],
    schemes: [
      {
        key: 'msedcl_2025',
        label: 'MSEDCL (FY 2024–25)',
        rows: [
          { range: '0.895 – 0.900', pf_level: '0.90', penalty: '0%' },
          { range: '0.885 – 0.894', pf_level: '0.89', penalty: '1.0%' },
          { range: '0.875 – 0.884', pf_level: '0.88', penalty: '1.5%' },
          { range: '0.865 – 0.874', pf_level: '0.87', penalty: '2.0%' },
          { range: '0.855 – 0.864', pf_level: '0.86', penalty: '2.5%' },
          { range: '0.845 – 0.854', pf_level: '0.85', penalty: '3.0%' },
          { range: '0.835 – 0.844', pf_level: '0.84', penalty: '3.5%' },
          { range: '0.825 – 0.834', pf_level: '0.83', penalty: '4.0%' },
          { range: '0.815 – 0.824', pf_level: '0.82', penalty: '4.5%' },
          { range: '0.805 – 0.814', pf_level: '0.81', penalty: '5.0%' }
        ]
      },
      {
        key: 'generic',
        label: 'Generic (Example)',
        rows: [
          { range: '0.890 – 0.900', pf_level: '0.90', penalty: '0.5%' },
          { range: '0.870 – 0.889', pf_level: '0.88–0.89', penalty: '1.5%' },
          { range: '0.850 – 0.869', pf_level: '0.85–0.86', penalty: '2.5%' },
          { range: '0.830 – 0.849', pf_level: '0.83–0.84', penalty: '3.5%' },
          { range: '< 0.830', pf_level: '< 0.83', penalty: '5.0%' }
        ]
      }
    ]
  }
];