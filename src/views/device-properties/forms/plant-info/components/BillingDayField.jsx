import React from 'react';
import { Grid, Typography, TextField, MenuItem, Box } from '@mui/material';

const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function BillingDayField({ field, value, onChange, error }) {
  const val = Number.isFinite(Number(value)) && value !== '' ? Number(value) : (field.defaultValue ?? 1);

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: error ? 'error.light' : 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Grid container spacing={1.5} alignItems="center">
        <Grid item xs={12} sm={5}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {field.label || 'Electricity Billing Cycle — Start Day of Each Month'}
            {(field.required ?? true) && <span style={{ color: 'red' }}> *</span>}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={7}>
          <TextField
            select
            size="small"
            value={val}
            onChange={(e) => onChange(field.id, Number(e.target.value))}
            error={!!error}
            helperText={error || 'Choose day 1–31.'}
            // keep it compact; not full width
            sx={{ minWidth: 180, maxWidth: 240 }}
          >
            {days.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
}
