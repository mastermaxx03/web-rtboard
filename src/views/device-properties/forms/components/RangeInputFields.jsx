import React from 'react';
import { Box, Grid, Typography, TextField } from '@mui/material';

const RangeInputField = ({ field, value, onChange, error }) => {
  // The 'value' for this component is expected to be an array, e.g., ['lowValue', 'highValue']
  const [lowerValue, upperValue] = Array.isArray(value) ? value : ['', ''];

  // This handler updates the correct index in the value array
  const handleTextChange = (index, text) => {
    const newValues = [...(Array.isArray(value) ? value : ['', ''])];
    newValues[index] = text;
    onChange(field.id, newValues);
  };

  const fieldLabel = (
    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
      {field.label}
      {field.required && <span style={{ color: 'red' }}> *</span>}
    </Typography>
  );

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={5}>
        {fieldLabel}
      </Grid>
      <Grid item xs={12} sm={7}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* TextField for the lower bound of the range */}
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={field.placeholders ? field.placeholders[0] : 'Low'}
            value={lowerValue}
            onChange={(e) => handleTextChange(0, e.target.value)}
            error={!!error} // Show error state on both fields if an error exists
          />

          {/* TextField for the upper bound of the range */}
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={field.placeholders ? field.placeholders[1] : 'High'}
            value={upperValue}
            onChange={(e) => handleTextChange(1, e.target.value)}
            error={!!error}
          />
        </Box>
        {/* Display a single error or helper text for the entire field */}
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
      </Grid>
    </Grid>
  );
};

export default RangeInputField;
