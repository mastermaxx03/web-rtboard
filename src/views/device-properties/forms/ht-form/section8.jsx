export const section8Fields = [
  // Step 8: Maintenance & Audit Info
    {
      type: "header",
      label: "Maintenance & Audit Info"
    },
    { id: 'last_energy_audit_date', 
      label: 'Last Energy Audit Date', 
      type: 'date' 
    },
    { id: 'audit_observations', 
      label: 'Remarks / Audit Observations', 
      type: 'textarea' 
    },
    { id: 'audit_report_upload', 
      label: 'Upload PDF audit report (optional)', 
      type: 'file', 
      accept: '.pdf' 
    },
    { id: 'maintenance_interval', 
      label: 'Maintenance Interval (Days/Months)', 
      type: 'text' 
    },
    { id: 'insulation_resistance', 
      label: 'Insulation Resistance (MΩ)', 
      type: 'number' 
    },
    
];
