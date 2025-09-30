import React from 'react';
import { Box, TextField, MenuItem, Typography } from '@mui/material';

const DropdownField = ({ field, value, onChange, error }) => {
  const handle = (e) => onChange?.(field.id, e.target.value);

  return (
    <Box sx={{ mt: 1 }}>
      <TextField
        select
        fullWidth
        size="small"
        label={field.label}
        value={value ?? field.defaultValue ?? ''}
        onChange={handle}
        helperText={field.helperText}
        error={Boolean(error)}
      >
        {(field.options || []).map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DropdownField;
