import React from 'react';
import {
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';

const DropdownField = ({ field, value, onChange, error }) => {
  const handleChange = (event) => {
    onChange(field.id, event.target.value);
  };

  return (
    <Grid container spacing={2} alignItems="center">
      {/* Label */}
      <Grid item xs={12} sm={5}>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          {field.label}
          {field.required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      </Grid>

      {/* Dropdown */}
      <Grid item xs={12} sm={7}>
        <FormControl
          fullWidth
          size="small"
          error={Boolean(error)}
        >
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={value || field.defaultValue || ''}
            onChange={handleChange}
            label={field.label}
          >
            {(field.options || []).map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {error || field.helperText || ''}
          </FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default DropdownField;
