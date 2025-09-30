// section10Fields.js

export const section10Fields = [
  { type: 'header', label: ' Alerts & Standards (Acknowledgement)' },

  // --- Alert behaviour (single place) ---
  {
    id: 'alert_trigger_warning',
    label: 'Trigger Warning Alert if (parameter exceeds Warning range)',
    type: 'button-group',
    options: [
      { label: 'Enable', value: 'yes' },
      { label: 'Disable', value: 'no' }
    ],
    defaultValue: 'yes',
    helperText: 'Emits a Warning Alert if (value breaches the configured Warning band).'
  },
  {
    id: 'alert_trigger_critical',
    label: 'Trigger Critical Alert if (parameter exceeds Critical range)',
    type: 'button-group',
    options: [
      { label: 'Enable', value: 'yes' },
      { label: 'Disable', value: 'no' }
    ],
    defaultValue: 'yes',
    helperText: 'Critical alert fires after consecutive payload breaches (configurable below).'
  },
  {
    id: 'critical_consecutive_payloads',
    label: 'Consecutive payloads required for Critical alert',
    type: 'button-group',
    options: [
      { label: '1 Payload', value: 1 },
      { label: '2 Payloads', value: 2 }
    ],
    defaultValue: 2,
    visibleWhen: { field: 'alert_trigger_critical', equals: 'yes' },
    helperText: 'Critical alert triggers after this many consecutive payload breaches.'
  },


// --- Acknowledge alert behaviour (used by page-level ButtonAckField.requires) ---
{
  id: 'ack_alert_points',
    label: 'Acknowledge alert behaviour (Warning / Critical≥2 payloads / Auto-reset)',
      type: 'button-group',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ],
          defaultValue: 'yes',
},



{
  id: 'standards_acknowledged',
    label: 'I have reviewed and acknowledge the standards listed above',
      type: 'button-group',
        options: [
          { label: 'Yes', value: 'yes' },
        ],
            required: true
}
];
