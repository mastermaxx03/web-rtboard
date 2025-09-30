import React from 'react';
import { Box, TextField, MenuItem, Typography } from '@mui/material';

const DropdownField = ({ field, value, onChange, error }) => {
  return (
    <Box sx={{ mt: 1 }}>
      <TextField
        select
        fullWidth
        size="small"
        label={field.label}
        value={value ?? field.defaultValue ?? ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        helperText={error || field.helperText}
        error={!!error}
      >
        {(field.options || []).map((opt) => (
          <MenuItem key={String(opt.value)} value={opt.value}>
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
