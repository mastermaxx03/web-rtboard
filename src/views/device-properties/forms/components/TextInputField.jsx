import React, { useEffect } from 'react';
import { Grid, Typography, TextField, InputAdornment } from '@mui/material';

const TextInputField = ({ field, value, onChange, error }) => {
  const isNumber = field.type === 'number';

  const min = field?.inputProps?.min ?? field?.min;
  const max = field?.inputProps?.max ?? field?.max;
  const step = field?.inputProps?.step;

  const handleChange = (e) => {
    onChange(field.id, e.target.value);
  };

  const handleBlur = (e) => {
    if (!isNumber) return;

    const raw = e.target.value;
    if (raw === '' || raw === null || raw === undefined) return;

    let num = Number(raw);
    if (!Number.isFinite(num)) return;

    if (min !== undefined) num = Math.max(num, Number(min));
    if (max !== undefined) num = Math.min(num, Number(max));

    const decimals = step === 0.001 ? 3 : undefined;
    const finalVal = decimals !== undefined ? Number(num.toFixed(decimals)) : num;

    if (String(finalVal) !== String(raw)) {
      onChange(field.id, finalVal);
    }
  };

  const fieldLabel = (
    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
      {field.label}
      {field.required && <span style={{ color: 'red' }}> *</span>}
    </Typography>
  );

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.target.type === 'number') {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={5}>
        {fieldLabel}
      </Grid>
      <Grid item xs={12} sm={7}>
        <TextField
          type={field.type === 'textarea' ? 'text' : field.type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          size="small"
          placeholder={field.placeholder}
          multiline={field.type === 'textarea'}
          rows={field.type === 'textarea' ? 3 : 1}
          error={!!error}
          helperText={error || ''}
          inputProps={{
            ...field.inputProps,
            ...(min !== undefined ? { min } : {}),
            ...(max !== undefined ? { max } : {}),
            ...(step !== undefined ? { step } : {})
          }}
          InputProps={{
            endAdornment: field.unit ? (
              <InputAdornment position="end">{field.unit}</InputAdornment>
            ) : null
          }}
        />
      </Grid>
    </Grid>
  );
};

export default TextInputField;
