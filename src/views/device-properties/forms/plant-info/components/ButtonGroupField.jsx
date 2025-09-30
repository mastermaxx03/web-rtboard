import React from 'react';
import { Grid, Typography, Box, Button } from '@mui/material';

const ButtonGroupField = ({ field, value, onChange, error }) => {
  const options = field.options || [];
  return (
    <Box sx={{ p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Grid container spacing={1.5} alignItems="center">
        <Grid item xs={12} sm={5}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {field.label}
            {field.required && <span style={{ color: 'red' }}> *</span>}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={7}>
          <Box sx={{ display: 'flex', border: '1px solid #B9E2FF', borderRadius: 999, overflow: 'hidden' }}>
            {options.map((opt, i) => {
              const active = value === opt.value;
              return (
                <Button
                  key={String(opt.value)}
                  onClick={() => onChange(field.id, opt.value)}
                  sx={{
                    flex: 1,
                    minHeight: 40,
                    borderRadius: 0,
                    textTransform: 'none',
                    fontWeight: 700,
                    backgroundColor: active ? '#1EA7FD' : '#FFF',
                    color: active ? '#FFF' : '#1EA7FD',
                    '&:hover': { backgroundColor: active ? '#1B90E4' : 'rgba(30,167,253,0.08)' }
                  }}
                >
                  {opt.label}
                </Button>
              );
            })}
          </Box>
          {error && (
            <Typography color="error" variant="caption">
              {error}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ButtonGroupField;
