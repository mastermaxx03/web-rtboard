import React from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';

function SelectedCaption({ value, irAmps }) {
  if (!value) return null;

  const [rawL, rawH] = String(value).split('-');
  const pLow  = Number(rawL);
  const pHigh = rawH != null ? Number(rawH) : pLow;
  if (!Number.isFinite(pLow)) return null;

  const pctText =
    rawH != null ? `${pLow}–${pHigh}% of I\u1D63` : `${pLow}% of I\u1D63`;

  let ampsText = '';
  if (Number.isFinite(irAmps) && irAmps > 0) {
    const loA = (irAmps * (pLow / 100)).toFixed(2);
    const hiA = rawH != null ? (irAmps * (pHigh / 100)).toFixed(2) : undefined;
    ampsText = ` (≈ ${loA}${hiA ? `–${hiA}` : ''} A)`;
  }

  return (
    <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: 'text.secondary' }}>
      Selected: {pctText}{ampsText}
    </Typography>
  );
}

const ButtonGroupField = ({ field, value, onChange, error, below }) => {
  const options = Array.isArray(field.options) ? field.options : [];

  const fieldLabel = (
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
        {/* pill group */}
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            border: '1px solid #B9E2FF',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          {options.map((opt, idx) => {
            const isActive = value === opt.value;
            const isLast   = idx === options.length - 1;

            return (
              <Button
                key={opt.value}
                onClick={() => onChange(field.id, opt.value)}
                disableElevation
                sx={{
                  flex: 1,
                  minHeight: 40,
                  borderRadius: 0,
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRight: isLast ? 'none' : '1px solid #B9E2FF',
                  backgroundColor: isActive ? '#1EA7FD' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#1EA7FD',
                  '&:hover': {
                    backgroundColor: isActive ? '#1B90E4' : 'rgba(30,167,253,0.08)',
                    borderColor: isActive ? '#1B90E4' : '#8FD2FF',
                  },
                }}
              >
                {opt.label}
              </Button>
            );
          })}
        </Box>

        {/* Prefer the injected `below` element from LtFields; else fallback to field.irAmps */}
        {below
          ? below
          : (field.showSelected && <SelectedCaption value={value} irAmps={field.irAmps} />)
        }

        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default ButtonGroupField;
