import React from 'react';
import { Grid, Typography, TextField, Paper } from '@mui/material';

const F = ({ id, label, v, on, ph }) => (
  <TextField size="small" label={label} value={v ?? ''} onChange={(e) => on(id, e.target.value)} placeholder={ph} fullWidth />
);

const AddressPackage = ({ field, value, onChange, error }) => {
  const v = value || {};
  const set = (k, val) => onChange(field.id, { ...(value || {}), [k]: val });

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
        {field.label}
      </Typography>
      <Grid container spacing={1.25}>
        <Grid item xs={12}>
          <F id="line1" label="Address Line 1" v={v.line1} on={set} ph="Street / Area" />
        </Grid>
        <Grid item xs={12}>
          <F id="line2" label="Address Line 2" v={v.line2} on={set} ph="Landmark / Building (optional)" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <F id="city" label="City" v={v.city} on={set} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <F id="state" label="State" v={v.state} on={set} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <F id="pincode" label="Pincode" v={v.pincode} on={set} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <F id="country" label="Country" v={v.country ?? 'India'} on={set} />
        </Grid>
      </Grid>
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Paper>
  );
};

export default AddressPackage;
