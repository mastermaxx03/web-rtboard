export const plantSection1Fields = [
  { type: 'header', label: 'Company Meta Data' },

  { id: 'company_name', label: 'Company Name', type: 'text', required: true, defaultValue: '' },

  {
    id: 'company_type',
    label: 'Type',
    type: 'dropdown',
    required: true,
    defaultValue: 'pvtltd',
    options: [
      { label: 'Government', value: 'govt' },
      { label: 'Private Ltd', value: 'pvtltd' },
      { label: 'NGO', value: 'ngo' },
      { label: 'LLP', value: 'llp' },
      { label: 'Proprietorship', value: 'prop' }
    ],
    helperText: 'Select the organization category'
  },

  {
    id: 'address_package',
    label: 'Address',
    type: 'address-package',
    defaultValue: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  },

  { id: 'website', label: 'Website URL', type: 'url', defaultValue: '' },

  {
    id: 'company_description',
    label: 'Description of Company',
    type: 'textarea',
    placeholder: 'Short description (optional)',
    defaultValue: ''
  },

  {
    id: 'contact_numbers',
    label: 'Contact No.',
    type: 'repeater-list',
    itemType: 'phone',
    min: 0,
    max: 5,
    defaultValue: [''],
    helperText: 'Add more numbers if needed'
  },

  {
    id: 'company_emails',
    label: 'Email',
    type: 'repeater-list',
    itemType: 'email',
    min: 1,
    max: 5,
    defaultValue: [''],
    helperText: 'Add more emails if needed'
  },

  { type: 'header', label: 'Contact Person' },
  { id: 'cp_name', label: 'Name', type: 'text', required: true, defaultValue: '' },
  { id: 'cp_designation', label: 'Designation', type: 'text', defaultValue: '' },
  { id: 'cp_phone', label: 'Phone', type: 'phone', defaultValue: '' },
  { id: 'cp_email', label: 'Email', type: 'email', defaultValue: '' }
];
