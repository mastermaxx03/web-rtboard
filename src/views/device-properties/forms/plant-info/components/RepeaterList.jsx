import React from 'react';
import { Box, Grid, IconButton, TextField, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const RepeaterList = ({ field, value, onChange, error }) => {
  const items = Array.isArray(value) ? value : [];

  const add = () => {
    if (field.max && items.length >= field.max) return;
    onChange(field.id, [...items, '']);
  };
  const del = (i) =>
    onChange(
      field.id,
      items.filter((_, idx) => idx !== i)
    );
  const set = (i, v) =>
    onChange(
      field.id,
      items.map((it, idx) => (idx === i ? v : it))
    );

  const placeholder = field.itemType === 'phone' ? '10-digit mobile' : field.itemType === 'email' ? 'name@company.com' : 'Value';

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
            {field.label}
            {field.required && <span style={{ color: 'red' }}> *</span>}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={7}>
          <Grid container spacing={1}>
            {items.map((v, i) => (
              <Grid item xs={12} key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={v}
                  onChange={(e) => set(i, e.target.value)}
                  placeholder={placeholder}
                  type={field.itemType === 'email' ? 'email' : 'text'}
                  inputProps={field.itemType === 'phone' ? { inputMode: 'numeric', pattern: '[6-9][0-9]{9}', maxLength: 10 } : undefined}
                />
                {items.length > (field.min ?? 0) && (
                  <IconButton onClick={() => del(i)} aria-label="remove">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button onClick={add} startIcon={<AddIcon />} variant="outlined" size="small">
                Add
              </Button>
            </Grid>
          </Grid>
          {(error || field.helperText) && (
            <Typography color={error ? 'error' : 'text.secondary'} variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              {error || field.helperText}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RepeaterList;
