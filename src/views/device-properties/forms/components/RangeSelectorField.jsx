import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';

const RangeSelectorField = ({
  field,
  config = { mode: 'default', percent: 0 },
  calculatedValue = 'N/A',
  onModeChange = () => {},
  onPercentChange = () => {},
  disabled = false
}) => {
  const { sliderMin, sliderMax, sliderStep, buttonLabel, defaultPercent } = field;
  const isDefault = config.mode === 'default';

  const fieldLabel = (
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {field.label}
      {field.required && <span style={{ color: 'red' }}> *</span>}
    </Typography>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top row: label + equal-width controls */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
          {fieldLabel}
        </Grid>

        {/* Two equal columns on sm+; stack on xs */}
        <Grid item xs={12} sm={7}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant={isDefault ? 'contained' : 'outlined'}
                onClick={() => onModeChange('default')}
                disabled={disabled}
                sx={{ height: 40 }} // keep height visually consistent with small TextField
              >
                {buttonLabel || `Value (±${defaultPercent}%)`}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Custom"
                value={config.percent ?? ''}
                onChange={(e) => {
                  if (config.mode !== 'custom') onModeChange('custom');
                  onPercentChange(e, sliderMin, sliderMax);
                }}
                size="small"
                disabled={disabled}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">±</InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: {
                    min: sliderMin,
                    max: sliderMax,
                    step: sliderStep ?? 0.1
                  }
                }}
                helperText={`Range: ${sliderMin}–${sliderMax}%`}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Calculated display */}
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mt: 2 }}
      >
        Calculated Range: <strong>{calculatedValue}</strong>
      </Typography>
    </Box>
  );
};

export default RangeSelectorField;
