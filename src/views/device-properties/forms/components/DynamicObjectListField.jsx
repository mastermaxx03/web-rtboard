import React from 'react';
import { Box, Grid, Typography, TextField } from '@mui/material';

// A simple renderer for the sub-fields within each object.
// In a real app, you might pass down your main `renderField` function as a prop.
const renderSubField = (item, subField, index, onChange) => {
  const { id, label, type, unit, placeholder } = subField;
  const value = item[id] || '';

  return (
    <TextField
      key={id}
      label={`${label} ${unit ? `(${unit})` : ''}`}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(index, id, e.target.value)}
      variant="outlined"
      size="small"
      fullWidth
    />
  );
};


const DynamicObjectListField = ({ field, value, onChange, error }) => {
  // The 'value' for this component is an array of objects, e.g., [ { ct_rating: '', ... }, { ... } ]
  const items = Array.isArray(value) ? value : [];

  // This handler updates a specific property ('subFieldId') on a specific object ('itemIndex') in the array.
  const handleItemChange = (itemIndex, subFieldId, text) => {
    const newItems = items.map((item, index) => {
      if (index === itemIndex) {
        return { ...item, [subFieldId]: text };
      }
      return item;
    });
    onChange(field.id, newItems);
  };

  const fieldLabel = (
    <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
      {field.label}
      {field.required && <span style={{ color: 'red' }}> *</span>}
    </Typography>
  );

  return (
    <Box>
      {fieldLabel}
      {items.map((item, index) => (
        <Box 
          key={index} 
          sx={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            p: 2, 
            mb: 2,
            backgroundColor: '#fafafa'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Feeder #{index + 1}
          </Typography>
          <Grid container spacing={2}>
            {field.objectFields.map((subField) => (
              <Grid item xs={12} sm={6} md={3} key={subField.id}>
                {renderSubField(item, subField, index, handleItemChange)}
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {!error && field.helperText && (
        <Typography color="text.secondary" variant="caption" sx={{ mt: 1 }}>
          {field.helperText}
        </Typography>
      )}
    </Box>
  );
};

export default DynamicObjectListField;
