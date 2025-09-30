import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField, Button, Box, InputAdornment, useMediaQuery, useTheme } from '@mui/material';

const ComboInputField = ({ field, value, onChange, error }) => {
  const [mode, setMode] = useState(field.defaultValue || '');
  const [textValue, setTextValue] = useState(typeof value === 'number' ? value : field.bufferDefault || '');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const options = field.buttonOptions || [];
  const totalCols = options.length + 1;
  const supportsIecBuffer = options?.some((o) => o.value === 'iec+buffer');

  useEffect(() => {
    if (typeof value === 'number') {
      setTextValue(value);

      const hasPresetNumeric = options?.some((o) => o.value === value);
      const hasIecBuffer = options?.some((o) => o.value === 'iec+buffer');

      if (hasPresetNumeric) setMode(value);
      else if (hasIecBuffer && field.unit === '%') setMode('iec+buffer');
      else setMode(null);
    } else {
      setMode(value || field.defaultValue || '');
      if (value === 'iec') setTextValue('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, field]);

  // OPTIONAL: if field.linkModeId is provided, flip that mode to "user"
  const setLinkedModeToUser = () => {
    if (field.linkModeId) onChange(field.linkModeId, 'user');
  };

  const handleButtonClick = (buttonValue) => {
    setMode(buttonValue);

    if (buttonValue === 'iec+buffer') {
      const buf = field.bufferDefault ?? 0.5;
      setTextValue(buf);
      onChange(field.id, 'iec+buffer');
      setTimeout(() => onChange(field.id, buf), 0);
    } else if (typeof buttonValue === 'number') {
      // ✅ write the preset into the input and (optionally) switch top mode to "user"
      setTextValue(buttonValue);
      onChange(field.id, buttonValue);
      setLinkedModeToUser();
    } else {
      setTextValue('');
      onChange(field.id, buttonValue);
    }
  };

  const handleTextChange = (event) => {
    const raw = event.target.value;

    if (field.id.toLowerCase().includes('voltage') && field.unit === 'V') {
      setMode(null);
      setTextValue(raw);
      const v = raw === '' ? '' : Number(raw);
      onChange(field.id, v);
      return;
    }

    // for non-IEC presets (e.g., THD), don't force a fake 'iec+buffer' mode
    if (supportsIecBuffer) setMode('iec+buffer');
    else setMode(null);

    const v = raw === '' ? '' : Number(raw);
    setTextValue(v);
    onChange(field.id, v);
    setLinkedModeToUser(); // ✅ typing custom → ensure linked mode (if any) is "user"
  };

  const isBufferField = field.unit === '%' && options?.some((o) => o.value === 'iec+buffer');
  const disableInput = isBufferField && mode === 'iec';

  return (
    <Grid container spacing={2} alignItems="flex-start">
      {/* Label */}
      <Grid item xs={12} sm={5}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {field.label}
          {field.required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      </Grid>

      {/* Buttons + Input */}
      <Grid item xs={12} sm={7}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : `repeat(${totalCols}, 1fr)`,
            gap: 0,
            borderWidth: 1
          }}
        >
          {options.map((option, idx) => {
            const isActive = mode === option.value;

            return (
              <Button
                key={option.value}
                onClick={() => handleButtonClick(option.value)}
                disableElevation
                sx={{
                  borderRadius: 2,
                  minHeight: 40,
                  minWidth: isMobile ? '100%' : 120,
                  textTransform: 'none',
                  fontWeight: 700,
                  border: '1px solid #B9E2FF',
                  backgroundColor: isActive ? '#1EA7FD' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#1EA7FD',
                  mr: idx !== options.length - 1 ? 1 : 0,
                  boxShadow: isActive ? '0 2px 6px rgba(30,167,253,0.30)' : 'none',
                  '&:hover': {
                    backgroundColor: isActive ? '#1B90E4' : 'rgba(30,167,253,0.08)',
                    borderColor: isActive ? '#1B90E4' : '#8FD2FF'
                  }
                }}
              >
                {option.label}
              </Button>
            );
          })}

          {/* Custom Input */}
          <Box sx={{ minWidth: isMobile ? '100%' : 120, paddingLeft:'8px'}}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              placeholder={field.placeholder || 'Enter value'}
              value={textValue}
              onChange={handleTextChange}
              error={!!error}
              helperText={error || field.helperText}
              disabled={disableInput}
              InputProps={{
                endAdornment: field.unit ? <InputAdornment position="end">{field.unit}</InputAdornment> : undefined
              }}
              inputProps={field.inputProps || { min: 0, max: 15, step: 1 }}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ComboInputField;
