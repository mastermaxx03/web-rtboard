// // forms/mcc-form/section7.js
// export const mccSection7Fields = [
//   { type: 'header', label: 'Maintenance & Audit' },
//   { id: 'last_energy_audit_date', label: 'Last Energy Audit Date', type: 'date', defaultValue: '' },
//   { id: 'audit_observations', label: 'Audit Observations / Remarks', type: 'textarea', defaultValue: '' },
//   { id: 'energy_audit_pdf', label: 'Upload Energy Audit Report (PDF)', type: 'file', accept: '.pdf' },
//   { id: 'maintenance_interval_value', label: 'Maintenance Interval (value)', type: 'number', defaultValue: '' },
//   {
//     id: 'maintenance_interval_unit',
//     label: 'Maintenance Interval (unit)',
//     type: 'button-group',
//     options: [
//       { label: 'Days', value: 'days' },
//       { label: 'Months', value: 'months' },
//       { label: 'Hours', value: 'hours' }
//     ],
//     defaultValue: 'months'
//   },
//   { id: 'insulation_resistance', label: 'Insulation Resistance (MΩ) (optional)', type: 'number', defaultValue: '' },

//   { type: 'header', label: 'General Fields' },
//   { id: 'location', label: 'Location (Building / Zone)', type: 'text', required: true, defaultValue: '' },
//   { id: 'department_served', label: 'Department / Process Served', type: 'text', defaultValue: '' },

//   { type: 'header', label: 'Installation Personnel' },
//   { id: 'installation_date', label: 'Installation Date', type: 'date', defaultValue: '' },
//   { id: 'technician_name', label: 'Technician Name', type: 'text', defaultValue: '' },
//   { id: 'technician_mobile', label: 'Technician Mobile Number', type: 'text', defaultValue: '' },
//   { id: 'supervisor_signature', label: 'Supervisor Name & Signature', type: 'text', defaultValue: '' },

//   { type: 'header', label: 'MFM in Panel' },
//   {
//     id: 'is_mfm_present',
//     label: 'MFM installed in panel?',
//     type: 'button-group',
//     options: [
//       { label: 'Yes', value: 'yes' },
//       { label: 'No', value: 'no' }
//     ],
//     defaultValue: 'no',
//     required: true
//   },

//   // If yes — capture ESAI device settings
//   { id: 'mfm_brand', label: 'MFM Brand Name', type: 'text', defaultValue: '' },
//   { id: 'mfm_model', label: 'MFM Model No.', type: 'text', defaultValue: '' },
//   { id: 'mfm_slave_id', label: 'Modbus Address (Slave ID)', type: 'text', defaultValue: '' },
//   { id: 'mfm_baudrate', label: 'Baud Rate', type: 'text', defaultValue: '' },
//   { id: 'mfm_parity_stop', label: 'Parity / Stop Bits', type: 'text', defaultValue: '' },
//   { id: 'mfm_wiring', label: 'MFM Wiring System', type: 'text', defaultValue: '' },
//   { id: 'mfm_pt_primary', label: 'PT Primary (V)', type: 'number', defaultValue: '' },
//   { id: 'mfm_pt_secondary', label: 'PT Secondary (V)', type: 'number', defaultValue: '' },
//   { id: 'mfm_ct_primary', label: 'CT Primary (A)', type: 'number', defaultValue: '' },
//   { id: 'mfm_ct_secondary', label: 'CT Secondary (A)', type: 'number', defaultValue: '' }
// ];
