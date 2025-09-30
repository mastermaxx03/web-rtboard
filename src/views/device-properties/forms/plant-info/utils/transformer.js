export const transformPlantInfoForBackend = (state, plantId) => {
  const emails = Array.isArray(state.company_emails) ? state.company_emails.filter(Boolean) : [];
  const primaryEmail = emails[0] || '';

  const payload = {
    plantId,
    company: {
      name: state.company_name || '',
      type: state.company_type || '',
      website: state.website || '',
      description: state.company_description || '',
      address: state.address_package || null,
      contacts: {
        phones: state.contact_numbers || [],
        emails,
        primaryEmail
      },
      contactPerson: {
        name: state.cp_name || '',
        designation: state.cp_designation || '',
        phone: state.cp_phone || '',
        email: state.cp_email || ''
      }
    },
    operations: {
      billingCycleStartDay: Number(state.billing_cycle_start_day) || 1,
      shiftsEnabled: state.has_shift === 'yes',
      shifts: state.shift_block || [],
      todZones: state.tod_zones || []
    }
  };
  return payload;
};
