import React from 'react';
import { Grid, Typography, TextField } from '@mui/material';

const PhoneNumberField = ({ field, value, onChange, error }) => {
  const handle = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(field.id, v);
  };
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={5}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {field.label}
          {field.required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={7}>
        <TextField
          fullWidth
          size="small"
          value={value ?? ''}
          onChange={handle}
          placeholder="10-digit mobile"
          error={!!error}
          helperText={error || field.helperText || 'Starts 6–9'}
          inputProps={{ inputMode: 'numeric', pattern: '[6-9][0-9]{9}', maxLength: 10 }}
        />
      </Grid>
    </Grid>
  );
};
export default PhoneNumberField;
