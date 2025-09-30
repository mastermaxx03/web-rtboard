import React from 'react';
import { Grid, Typography, Button } from '@mui/material';

// --- DisplayField Component ---
export const DisplayField = ({ field, value }) => (
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={12} sm={5}>
      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
        {field.label}
      </Typography>
    </Grid>
    <Grid item xs={12} sm={7}>
      <Typography variant="body1">
        {value} {field.unit}
      </Typography>
    </Grid>
  </Grid>
);

// --- FileField Component ---
export const FileField = ({ field, onChange, error }) => (
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={12} sm={5}>
      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
        {field.label}
        {field.required && <span style={{ color: 'red' }}> *</span>}
      </Typography>
    </Grid>
    <Grid item xs={12} sm={7}>
      <>
        <Button variant="outlined" component="label" fullWidth>
          Upload File
          <input type="file" hidden accept={field.accept} onChange={(e) => onChange(field.id, e.target.files[0])} />
        </Button>
        {error && (
          <Typography color="error" variant="caption">
            {error}
          </Typography>
        )}
      </>
    </Grid>
  </Grid>
);
