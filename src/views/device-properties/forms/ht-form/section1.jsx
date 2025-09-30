export const section1Fields = [
  // Step 1: Panel Info (Static Details)

  { type: 'header', label: 'PANEL INFORMATIONS (Static Details)' },

  {
    id: 'esai_device_id',
    label: 'ESAI DEVICE ID (DID)',
    type: 'text',
    helperText: 'Check device installation form',
    placeholder: 'E_AA_Z_A_X_P0040_D1',
    required: true,
    defaultValue: '2'
  },
  {
    id: 'panel_name',
    label: 'Panel Name',
    type: 'text',
    required: true,
    defaultValue: '2'
  },
  {
    id: 'panel_id',
    label: 'Panel ID',
    type: 'text',
    required: true,
    defaultValue: '2'
  },
  {
    id: 'panel_rating_details',
    label: 'Panel Rating Details',
    type: 'text'
  },
  {
    id: 'esai_installation_date',
    label: 'ESAI Installation Date',
    type: 'date',
    required: true,
    defaultValue: '2023-10-10'
  },
  {
    id:'panel_owner',
    label:'Panel Owner',
    type:'text',
  },
  {
    id: 'panel_rated_power_capacity',
    label: 'Panel Rated Power Capacity (kVA)',
    type: 'number',
    unit: 'kVA',
    required: true,
    defaultValue: '2'
  },
  ,

  { id: 'panel_image_upload', label: 'Upload Panel Image (JPEG/PNG)', type: 'file', accept: 'image/jpeg, image/png' },
  // { id: 'breaker_image_upload', label: 'Upload Live Image of Circuit Breaker (JPEG/PNG)', type: 'file', accept: 'image/jpeg, image/png' },
  { id: 'panel_spec_pdf_upload', label: 'Optional: Upload Panel Specification PDF / Wiring Diagram (PDF)', type: 'file', accept: '.pdf' }
];
