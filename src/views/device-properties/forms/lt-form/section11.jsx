export const section11Fields = [
  { type: 'header', label: 'Form Preview' },
  {
    type: 'display',
    id: 'preview',
    label: 'Preview of All Sections',
    value: (formData) => {
      // Build a string or JSX to display form data for all sections
      return (
        <>
          {Object.keys(formData).map((sectionKey, index) => {
            const section = formData[sectionKey];
            return section ? (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {sectionKey.replace(/([A-Z])/g, ' $1').toUpperCase()} {/* Format section name */}
                </Typography>
                {section?.map((field, fieldIndex) => (
                  <Typography key={fieldIndex} sx={{ ml: 2 }}>
                    <b>{field.label}:</b> {formData[field.id] || '—'}
                  </Typography>
                ))}
              </Box>
            ) : null;
          })}
        </>
      );
    },
  },
];
