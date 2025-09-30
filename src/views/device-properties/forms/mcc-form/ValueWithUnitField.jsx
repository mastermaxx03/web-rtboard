import React from 'react';
import { Box, Grid, Typography, TextField, ButtonGroup, Button } from '@mui/material';

/**
 * Inline “[ input ] [ unit buttons … ]” field.
 * Works with either a `field` schema prop or direct props.
 *
 * Schema example:
 * {
 *   id: 'machine_power_value',
 *   label: 'Rated Power',
 *   type: 'value-with-unit',
 *   unitFieldId: 'machine_power_unit',
 *   unitOptions: [{label:'KW', value:'kW'}, {label:'HP', value:'HP'}],
 *   inputType: 'number',
 *   placeholder: 'e.g., 75',
 *   required: true
 * }
 */
const ValueWithUnitField = (props) => {
  const {
    field = {},
    label: labelProp,
    value,
    unit,
    unitOptions: unitOptsProp,
    placeholder: phProp,
    inputType: inputTypeProp,
    onValueChange,
    onUnitChange,
    onChange,
    error
  } = props;

  // Safe lookups / defaults
  const label = field?.label ?? labelProp ?? '';
  const required = !!field?.required;
  const placeholder = field?.placeholder ?? phProp ?? '';
  const inputType = field?.inputType ?? inputTypeProp ?? 'text';

  const unitOptions = field?.unitOptions ??
    unitOptsProp ?? [
      { label: 'KW', value: 'kW' },
      { label: 'HP', value: 'HP' }
    ];

  const currentValue = value ?? '';
  const currentUnit = unit ?? unitOptions[0]?.value ?? 'kW';

  // Change handlers
  const handleValueChange = (newVal) => {
    if (onValueChange) return onValueChange(newVal);
    if (onChange && field?.id) return onChange(field.id, newVal);
  };

  const handleUnitChange = (newUnit) => {
    if (onUnitChange) return onUnitChange(newUnit);
    if (onChange && field?.unitFieldId) return onChange(field.unitFieldId, newUnit);
  };

  return (
    <Grid container spacing={2} alignItems="center">
      {/* Label */}
      <Grid item xs={12} sm={5}>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
      </Grid>

      {/* Controls */}
      <Grid item xs={12} sm={7}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Input (one flex slot) */}
          <TextField
            fullWidth
            size="small"
            type={inputType}
            value={currentValue}
            placeholder={placeholder}
            required={required}
            onChange={(e) => handleValueChange(e.target.value)}
            error={!!error}
            helperText={error || ''}
            sx={{ flex: 1 }}
          />

          {/* Unit options (each button shares remaining width equally) */}
          <ButtonGroup variant="outlined" sx={{ flex: Math.max(unitOptions.length, 1), display: 'flex', width: 'auto' }}>
            {unitOptions.map((opt) => (
              <Button
                key={opt.value}
                onClick={() => handleUnitChange(opt.value)}
                variant={currentUnit === opt.value ? 'contained' : 'outlined'}
                sx={{ flex: 1 }}
              >
                {opt.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ValueWithUnitField;
