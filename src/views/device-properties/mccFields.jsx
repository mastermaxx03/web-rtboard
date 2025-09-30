export const mccFields = [
  {
    type: 'header',
    label: 'SECTION 1 – Machine Info (Static Details)'
  },
  {
    id: 'esai_device_id',
    label: 'ESAI DEVICE ID(DID)',
    type: 'text',
    defaultValue: '',
    required: true
  },
  {
    id: 'machine_name',
    label: 'Name of Machine',
    type: 'text',
    defaultValue: '',
    required: true
  },
  {
    id: 'machine_id',
    label: 'Machine ID',
    type: 'text',
    defaultValue: '',
    required: true
  },
  {
    id: 'name_plate_details',
    label: 'Machine Name Plate Details',
    type: 'textarea',
    defaultValue: ''
  },
  {
    id: 'installation_date',
    label: 'ESAI Installation Date',
    type: 'date',
    defaultValue: ''
  },
  {
    id: 'owner_department',
    label: 'Machine Owner/Department',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'rated_power_value',
    label: 'Machine Rated Power Value',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'rated_power_unit',
    label: 'Power Unit',
    type: 'button-group',
    options: [
      { label: 'KW', value: 'KW' },
      { label: 'HP', value: 'HP' }
    ],
    defaultValue: 'KW'
  },
  {
    id: 'rated_voltage',
    label: 'Machine Rated Voltage',
    type: 'button-group',
    options: [
      { label: '400V', value: 400 },
      { label: '415V', value: 415 },
      { label: '433V', value: 433 },
      { label: 'Custom', value: 'custom' }
    ],
    defaultValue: '',
    required: true
  },
  {
    id: 'custom_voltage',
    label: 'Custom Voltage (V)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'rated_current',
    label: 'Rated Current (A)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'rated_frequency',
    label: 'Rated Frequency',
    type: 'button-group',
    options: [
      { label: '50 Hz', value: 50 },
      { label: '60 Hz', value: 60 }
    ],
    defaultValue: '',
    required: true
  },
  {
    id: 'rated_efficiency',
    label: 'Rated Efficiency',
    type: 'button-group',
    options: [
      { label: 'IE2', value: 'IE2' },
      { label: 'IE3', value: 'IE3' },
      { label: 'IE4', value: 'IE4' },
      { label: 'Custom', value: 'custom' }
    ],
    defaultValue: ''
  },
  {
    id: 'custom_efficiency',
    label: 'Custom Efficiency (%)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'power_factor',
    label: 'Rated Power Factor (lag)',
    type: 'button-group',
    options: [
      { label: '0.80', value: 0.8 },
      { label: '0.85', value: 0.85 },
      { label: '0.90', value: 0.9 },
      { label: '0.95', value: 0.95 },
      { label: 'Custom', value: 'custom' }
    ],
    defaultValue: ''
  },
  {
    id: 'custom_power_factor',
    label: 'Custom Power Factor',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'duty_type',
    label: 'Duty Type',
    type: 'button-group',
    options: [
      { label: 'Continuous', value: 'Continuous' },
      { label: 'Intermittent', value: 'Intermittent' },
      { label: 'Variable Load', value: 'Variable Load' }
    ],
    defaultValue: ''
  },
  {
    id: 'operating_hours',
    label: 'Operating Hours/Day',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'operating_days',
    label: 'Operating Days/Month',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'drive_type',
    label: 'Drive Type',
    type: 'button-group',
    options: [
      { label: 'DOL', value: 'DOL' },
      { label: 'Star-Delta', value: 'Star-Delta' },
      { label: 'VFD', value: 'VFD' },
      { label: 'Soft Starter', value: 'Soft Starter' },
      { label: 'Servo', value: 'Servo' },
      { label: 'Custom', value: 'custom' }
    ],
    defaultValue: ''
  },
  {
    id: 'custom_drive_type',
    label: 'Custom Drive Type',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'coupling_load_type',
    label: 'Mechanical Coupling Load Type',
    type: 'dropdown',
    options: [
      { label: 'Pump', value: 'Pump' },
      { label: 'Fan', value: 'Fan' },
      { label: 'Gearbox', value: 'Gearbox' },
      { label: 'Conveyor', value: 'Conveyor' },
      { label: 'Other', value: 'Other' },
      { label: 'Custom', value: 'custom' }
    ],
    defaultValue: ''
  },
  {
    id: 'custom_coupling_load_type',
    label: 'Custom Mechanical Coupling Load Type',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'mcc_image_upload',
    label: 'Upload Image of MCC Panel (JPEG/PNG)',
    type: 'file',
    accept: 'image/jpeg, image/png'
  },
  {
    id: 'panel_spec_pdf',
    label: 'Optional: Upload Panel Details & Specifications PDF',
    type: 'file',
    accept: '.pdf'
  },
  {
    type: 'header',
    label: 'SECTION 2 – Electrical Input & Protection Settings'
  },
  {
    type: 'header',
    label: '3PH L-L VOLTAGES'
  },
  {
    id: 'input_voltage_ll',
    label: 'Input L-L Voltage',
    type: 'number',
    defaultValue: '',
    required: true
  },
  {
    id: 'acceptable_range_ll_config',
    label: 'Acceptable Range',
    type: 'range-selector',
    buttonLabel: 'Up to ±10%',
    defaultPercent: 10,
    sliderMin: 0,
    sliderMax: 20,
    sliderStep: 0.1,
    displayFieldId: 'acceptable_range_ll_display',
    lowerBoundFieldId: 'acceptable_range_ll_lower',
    upperBoundFieldId: 'acceptable_range_ll_upper'
  },
  { id: 'acceptable_range_ll_display', type: 'hidden' },
  { id: 'acceptable_range_ll_lower', type: 'hidden' },
  { id: 'acceptable_range_ll_upper', type: 'hidden' },
  {
    id: 'warning_threshold_ll_config',
    label: 'Warning Thresholds',
    type: 'range-selector',
    buttonLabel: '10%',
    defaultPercent: 10,
    sliderMin: 5,
    sliderMax: 15,
    sliderStep: 0.1,
    displayFieldId: 'warning_threshold_ll_display',
    lowerBoundFieldId: 'warning_threshold_ll_lower',
    upperBoundFieldId: 'warning_threshold_ll_upper'
  },
  { id: 'warning_threshold_ll_display', type: 'hidden' },
  { id: 'warning_threshold_ll_lower', type: 'hidden' },
  { id: 'warning_threshold_ll_upper', type: 'hidden' },
  {
    id: 'critical_threshold_ll_config',
    label: 'Critical Thresholds',
    type: 'range-selector',
    buttonLabel: '15%',
    defaultPercent: 15,
    sliderMin: 10,
    sliderMax: 20,
    sliderStep: 0.1,
    displayFieldId: 'critical_threshold_ll_display',
    lowerBoundFieldId: 'critical_threshold_ll_lower',
    upperBoundFieldId: 'critical_threshold_ll_upper'
  },
  { id: 'critical_threshold_ll_display', type: 'hidden' },
  { id: 'critical_threshold_ll_lower', type: 'hidden' },
  { id: 'critical_threshold_ll_upper', type: 'hidden' },
  {
    type: 'header',
    label: '3PH L-N VOLTAGES'
  },
  {
    id: 'input_voltage_ln',
    label: 'Input L-N Voltage',
    type: 'number',
    defaultValue: '',
    required: true
  },
  {
    id: 'acceptable_range_ln_config',
    label: 'Acceptable Range',
    type: 'range-selector',
    buttonLabel: 'Up to ±10%',
    defaultPercent: 10,
    sliderMin: 0,
    sliderMax: 20,
    sliderStep: 0.1,
    displayFieldId: 'acceptable_range_ln_display',
    lowerBoundFieldId: 'acceptable_range_ln_lower',
    upperBoundFieldId: 'acceptable_range_ln_upper'
  },
  { id: 'acceptable_range_ln_display', type: 'hidden' },
  { id: 'acceptable_range_ln_lower', type: 'hidden' },
  { id: 'acceptable_range_ln_upper', type: 'hidden' },
  {
    id: 'warning_threshold_ln_config',
    label: 'Warning Thresholds',
    type: 'range-selector',
    buttonLabel: '10%',
    defaultPercent: 10,
    sliderMin: 5,
    sliderMax: 15,
    sliderStep: 0.1,
    displayFieldId: 'warning_threshold_ln_display',
    lowerBoundFieldId: 'warning_threshold_ln_lower',
    upperBoundFieldId: 'warning_threshold_ln_upper'
  },
  { id: 'warning_threshold_ln_display', type: 'hidden' },
  { id: 'warning_threshold_ln_lower', type: 'hidden' },
  { id: 'warning_threshold_ln_upper', type: 'hidden' },
  {
    id: 'critical_threshold_ln_config',
    label: 'Critical Thresholds',
    type: 'range-selector',
    buttonLabel: '15%',
    defaultPercent: 15,
    sliderMin: 10,
    sliderMax: 20,
    sliderStep: 0.1,
    displayFieldId: 'critical_threshold_ln_display',
    lowerBoundFieldId: 'critical_threshold_ln_lower',
    upperBoundFieldId: 'critical_threshold_ln_upper'
  },
  { id: 'critical_threshold_ln_display', type: 'hidden' },
  { id: 'critical_threshold_ln_lower', type: 'hidden' },
  { id: 'critical_threshold_ln_upper', type: 'hidden' },
  {
    type: 'header',
    label: 'PHASE IMBALANCE'
  },
  {
    id: 'acceptable_range_imbalance_config',
    label: 'Acceptable Range',
    type: 'range-selector',
    buttonLabel: 'Voltage imbalance ≤ 2%',
    defaultPercent: 2,
    sliderMin: 0,
    sliderMax: 2,
    sliderStep: 0.1,
    displayFieldId: 'acceptable_range_imbalance_display'
  },
  { id: 'acceptable_range_imbalance_display', type: 'hidden' },
  {
    id: 'warning_threshold_imbalance_config',
    label: 'Warning Threshold',
    type: 'range-selector',
    buttonLabel: 'Voltage imbalance 2 - 4%',
    defaultPercent: 3,
    sliderMin: 2,
    sliderMax: 4,
    sliderStep: 0.1,
    displayFieldId: 'warning_threshold_imbalance_display'
  },
  { id: 'warning_threshold_imbalance_display', type: 'hidden' },
  {
    id: 'critical_threshold_imbalance_config',
    label: 'Critical Threshold',
    type: 'range-selector',
    buttonLabel: 'Voltage imbalance > 4%',
    defaultPercent: 4,
    sliderMin: 4,
    sliderMax: 10,
    sliderStep: 0.1,
    displayFieldId: 'critical_threshold_imbalance_display'
  },
  { id: 'critical_threshold_imbalance_display', type: 'hidden' },
  {
    type: 'header',
    label: 'FREQUENCY'
  },
  {
    id: 'nominal_frequency',
    label: 'Nominal Frequency',
    type: 'button-group',
    options: [
      { label: '50.0 Hz', value: 50 },
      { label: '60 Hz', value: 60 }
    ],
    defaultValue: '',
    required: true
  },
  {
    id: 'warning_threshold_low_frequency',
    label: 'Warning Threshold Low (Hz)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'warning_threshold_high_frequency',
    label: 'Warning Threshold High (Hz)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'critical_threshold_low_frequency',
    label: 'Critical Threshold Low (Hz)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'critical_threshold_high_frequency',
    label: 'Critical Threshold High (Hz)',
    type: 'number',
    defaultValue: ''
  },
  {
    type: 'header',
    label: 'SECTION 3 – CURRENT SETTINGS'
  },
  {
    type: 'header',
    label: '3PH LOAD CURRENT'
  },
  {
    id: 'ct_primary_current',
    label: 'R/Y/B Phase CT Primary Current (A)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'ct_secondary_current',
    label: 'CT Secondary Current (A)',
    type: 'button-group',
    options: [
      { label: '1A', value: 1 },
      { label: '5A', value: 5 },
      { label: 'Custom', value: 'custom' }
    ],
    defaultValue: 1
  },
  {
    id: 'custom_ct_secondary',
    label: 'Custom CT Secondary Current (A)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'panel_rated_current',
    label: 'Panel Rated Current (A)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'mpcb_type',
    label: 'MPCB Type',
    type: 'dropdown',
    options: [
      { label: 'Type B', value: 'B' },
      { label: 'Type C', value: 'C' },
      { label: 'Type D', value: 'D' },
      { label: 'Adjustable', value: 'Adjustable' }
    ],
    defaultValue: ''
  },
  {
    id: 'mpcb_in',
    label: 'MPCB In (Rated Current, A)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'mpcb_ir_setting',
    label: 'MPCB Ir Setting',
    type: 'button-group',
    options: [
      { label: '0.4×In', value: 0.4 },
      { label: '0.6×In', value: 0.6 },
      { label: '0.8×In', value: 0.8 },
      { label: '1.0×In', value: 1.0 },
      { label: 'Custom', value: 'custom' }
    ],
    defaultValue: ''
  },
  {
    id: 'custom_mpcb_ir',
    label: 'Custom MPCB Ir Setting',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'mpcb_ir_calculated',
    label: 'MPCB Ir Auto-calculated Current (A)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'warning_threshold_option',
    label: 'Default Warning Threshold',
    type: 'button-group',
    options: [
      { label: '80-85% of Ir', value: '80-85' },
      { label: '86-90% of Ir', value: '86-90' }
    ],
    defaultValue: ''
  },
  {
    id: 'critical_threshold_option',
    label: 'Default Critical Threshold',
    type: 'button-group',
    options: [
      { label: '91-94% of Ir', value: '91-94' },
      { label: '95-98% of Ir', value: '95-98' }
    ],
    defaultValue: ''
  },
  {
    type: 'header',
    label: 'Current Imbalance'
  },
  {
    id: 'acceptable_range_current_imbalance_config',
    label: 'Acceptable Range',
    type: 'range-selector',
    buttonLabel: 'Current Imbalance ≤ 10%',
    defaultPercent: 10,
    sliderMin: 0,
    sliderMax: 10,
    sliderStep: 0.1,
    displayFieldId: 'acceptable_range_current_imbalance_display'
  },
  { id: 'acceptable_range_current_imbalance_display', type: 'hidden' },
  {
    id: 'warning_threshold_current_imbalance_config',
    label: 'Warning Threshold',
    type: 'range-selector',
    buttonLabel: 'Current Imbalance > 10%',
    defaultPercent: 10,
    sliderMin: 10,
    sliderMax: 20,
    sliderStep: 0.1,
    displayFieldId: 'warning_threshold_current_imbalance_display'
  },
  { id: 'warning_threshold_current_imbalance_display', type: 'hidden' },
  {
    id: 'critical_threshold_current_imbalance_config',
    label: 'Critical Threshold',
    type: 'range-selector',
    buttonLabel: 'Current Imbalance > 20%',
    defaultPercent: 20,
    sliderMin: 20,
    sliderMax: 30,
    sliderStep: 0.1,
    displayFieldId: 'critical_threshold_current_imbalance_display'
  },
  { id: 'critical_threshold_current_imbalance_display', type: 'hidden' },
  {
    type: 'header',
    label: 'SECTION 4 – Power Monitoring'
  },
  {
    id: 'load_distribution',
    label: 'Load distribution on each phase',
    type: 'button-group',
    options: [
      { label: 'Balanced', value: 'Balanced' },
      { label: 'Unbalanced', value: 'Unbalanced' }
    ],
    defaultValue: ''
  },
  {
    type: 'header',
    label: 'SECTION 5 – Energy Baseline'
  },
  {
    id: 'baseline_kwh_per_hour',
    label: 'Baseline kWh Consumption/Hour',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'monthly_energy_budget',
    label: 'Rated Monthly Energy Budget (kWh/MWh)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'shift_energy_budget',
    label: 'Shift-wise Energy Budget (kWh)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'idle_consumption',
    label: 'Idle/Standby Consumption (kW)',
    type: 'number',
    defaultValue: '',
    required: true
  },
  {
    type: 'header',
    label: 'POWER FACTOR SETTINGS'
  },
  {
    id: 'apply_ht_pf_logic',
    label: 'Option to Apply the same logic as per HT PF Monitoring settings',
    type: 'button-group',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' }
    ],
    defaultValue: 'no'
  },
  {
    id: 'pf_target',
    label: 'PF Target',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'pf_warning_threshold',
    label: 'Warning Threshold',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'pf_critical_threshold',
    label: 'Critical Threshold',
    type: 'number',
    defaultValue: ''
  },
  {
    type: 'header',
    label: 'SECTION 6 – Harmonics (THD)'
  },
  {
    id: 'voltage_thd_limit',
    label: 'Voltage THD Limit (%)',
    type: 'button-group',
    options: [
      { label: 'IS Standard (≤5%)', value: 5 },
      { label: 'Custom', value: 'custom' }
    ],
    defaultValue: 5
  },
  {
    id: 'custom_voltage_thd',
    label: 'Custom Voltage THD Limit (%)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'current_thd_limit',
    label: 'Current THD Limit (%)',
    type: 'button-group',
    options: [
      { label: 'IS Standard (≤8%)', value: 8 },
      { label: 'Custom', value: 'custom' }
    ],
    defaultValue: 8
  },
  {
    id: 'custom_current_thd',
    label: 'Custom Current THD Limit (%)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'vfd_harmonic_allowance',
    label: 'VFD Harmonic Allowance (%)',
    type: 'number',
    defaultValue: ''
  },
  {
    type: 'header',
    label: 'SECTION 7 – Maintenance & Audit Info'
  },
  {
    id: 'last_audit_date',
    label: 'Last Energy Audit Date',
    type: 'date',
    defaultValue: ''
  },
  {
    id: 'audit_remarks',
    label: 'Audit Observations / Remarks',
    type: 'textarea',
    defaultValue: ''
  },
  {
    id: 'audit_report_pdf',
    label: 'Option to upload – PDF energy audit report',
    type: 'file',
    accept: '.pdf'
  },
  {
    id: 'maintenance_interval',
    label: 'Maintenance Interval',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'insulation_resistance',
    label: 'Insulation Resistance (MΩ)',
    type: 'number',
    defaultValue: ''
  },
  {
    type: 'header',
    label: 'GENERAL FIELDS'
  },
  {
    id: 'location',
    label: 'Location (Building / Zone)',
    type: 'text',
    defaultValue: '',
    required: true
  },
  {
    id: 'department_process',
    label: 'Department / Process Served',
    type: 'text',
    defaultValue: ''
  },
  {
    type: 'header',
    label: 'INSTALLATION RESPONSIBLE PERSONNEL'
  },
  {
    id: 'install_date',
    label: 'Installation Date',
    type: 'date',
    defaultValue: ''
  },
  {
    id: 'technician_name',
    label: 'Technician Name',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'technician_mobile',
    label: 'Technician Mobile Number',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'supervisor_name',
    label: 'Supervisor Name & Signature',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'mfm_installed',
    label: 'MFM INSTALLED IN PANEL',
    type: 'button-group',
    options: [
      { label: 'YES', value: 'yes' },
      { label: 'NO', value: 'no' }
    ],
    defaultValue: 'no',
    required: true
  },
  {
    id: 'mfm_brand',
    label: 'MFM Brand Name',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'mfm_model',
    label: 'MFM Model No.',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'modbus_address',
    label: 'Modbus Address (Slave ID)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'baud_rate',
    label: 'Baud Rate',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'parity_stop_bits',
    label: 'Parity / Stop Bits',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'mfm_wiring',
    label: 'MFM Wiring System',
    type: 'text',
    defaultValue: ''
  },
  {
    id: 'pt_primary',
    label: 'PT Primary (V)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'pt_secondary',
    label: 'PT Secondary (V)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'ct_primary_mfm',
    label: 'CT Primary (A)',
    type: 'number',
    defaultValue: ''
  },
  {
    id: 'ct_secondary_mfm',
    label: 'CT Secondary (A)',
    type: 'number',
    defaultValue: ''
  }
];
