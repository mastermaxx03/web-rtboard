import React from 'react';
import { Grid, Typography, TextField, InputAdornment, Box } from '@mui/material';

const TextInputField = ({ field, value, onChange, error }) => {
  const isArea = field.type === 'textarea';
  const rows = isArea ? field.rows || 3 : 1;

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: error ? 'error.light' : 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <Grid container spacing={1.5} alignItems="center">
        <Grid item xs={12} sm={5}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {field.label}
            {field.required && <span style={{ color: 'red' }}> *</span>}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={7}>
          <TextField
            fullWidth
            size="small"
            type={isArea ? 'text' : field.type || 'text'}
            value={value ?? ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={!!error}
            helperText={error || field.helperText}
            multiline={isArea}
            rows={rows}
            inputProps={field.inputProps}
            InputProps={{
              endAdornment: field.unit ? <InputAdornment position="end">{field.unit}</InputAdornment> : null
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TextInputField;
