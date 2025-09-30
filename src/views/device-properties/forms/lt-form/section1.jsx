export const section1Fields = [
  // Step 1: Panel Info (Static Details)

  { type: 'header', label: 'PANEL INFORMATIONS (Static Details)' },

  { id: 'esai_device_id', label: 'ESAI DEVICE ID (DID)', type: 'text', helperText: 'Check device installation form', placeholder: 'E_AA_Z_A_X_P0040_D1', required: true ,defaultValue: '2'},
  { id: 'panel_name', label: 'Panel Name', type: 'text', required: true,defaultValue: '2' },
  { id: 'panel_id', label: 'Panel ID', type: 'text', required: true ,defaultValue: '2'},
  {
    id: 'panel_type',
    label: 'Panel Type',
    // MODIFIED: Changed 'dropdown' to 'button-group' as it's the closest available type.
    type: 'button-group',
    required: true,
    options: [
      { label: 'LT Incomer', value: 'LT_INCOMER' },
      { label: 'LT Outgoing', value: 'LT_OUTGOING' },
      { label: 'PCC', value: 'PCC' },
      { label: 'Distribution Panel', value: 'DISTRIBUTION_PANEL' },
      { label: 'MCC', value: 'MCC' },
    ],
    defaultValue: 'PCC'
  },
  { id: 'panel_location', label: 'Panel Location (Building / Zone)', type: 'text', required: true, defaultValue: '2' },
  { id: 'department_process_served', label: 'Department / Process Served', type: 'text' },
  { id: 'esai_installation_date', label: 'ESAI Installation Date', type: 'date',required: true, defaultValue: '2023-10-10' },
  { id: 'panel_rated_power_capacity', label: 'Panel Rated Power Capacity (kVA)', type: 'number', unit: 'kVA', required: true ,defaultValue: '2'},
  // { id: 'incoming_busbar_rating', label: 'Incoming Busbar Rating (A)', type: 'number', unit: 'A', required: true },
  //   {
  //   id: 'number_of_outgoings',
  //   label: 'Number of Outgoings',
  //   type: 'number',
  //   required: true,
  //   rules: [
  //     { type: 'range', limits: { min: 1, max: 10 }, message: 'Must be between 1 and 10' }
  //   ]
  // }
  ,
  // {
  //   id: 'outgoing_busbar_ratings',
  //   label: 'Outgoing Busbar Ratings (A)',
  //   type: 'dynamic-list',
  //   required: true,
  //   unit: 'A',
  // },
  { id: 'panel_image_upload', label: 'Upload Panel Image (JPEG/PNG)', type: 'file', accept: 'image/jpeg, image/png' },
  // { id: 'breaker_image_upload', label: 'Upload Live Image of Circuit Breaker (JPEG/PNG)', type: 'file', accept: 'image/jpeg, image/png' },
  { id: 'panel_spec_pdf_upload', label: 'Optional: Upload Panel Specification PDF / Wiring Diagram (PDF)', type: 'file', accept: '.pdf' },
]