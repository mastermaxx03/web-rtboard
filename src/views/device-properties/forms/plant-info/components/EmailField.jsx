import React from 'react';
import { Grid, Typography, TextField } from '@mui/material';

const EmailField = ({ field, value, onChange, error }) => (
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
        type="email"
        placeholder={field.placeholder || 'name@company.com'}
        value={value ?? ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        error={!!error}
        helperText={error || field.helperText}
      />
    </Grid>
  </Grid>
);
export default EmailField;
