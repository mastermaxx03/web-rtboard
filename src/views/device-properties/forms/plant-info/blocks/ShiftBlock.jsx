import React from 'react';
import { Box, Typography, Grid, TextField, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

const emptyShift = () => ({ label: '', start: '', end: '' });

const toDayjs = (hhmm) => (hhmm ? dayjs(`2000-01-01T${hhmm}:00`) : null);
const fmt = (d) => (d?.isValid() ? d.format('HH:mm') : '');

const ShiftBlock = ({ field, value, onChange }) => {
  const items = Array.isArray(value) ? value : [];
  const set = (i, patch) =>
    onChange(
      field.id,
      items.map((sh, idx) => (idx === i ? { ...sh, ...patch } : sh))
    );
  const add = () => onChange(field.id, [...items, emptyShift()]);
  const del = (i) =>
    onChange(
      field.id,
      items.filter((_, idx) => idx !== i)
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          p: 1.25,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={5}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Shift Package
            </Typography>
          </Grid>

          <Grid item xs={12} sm={7}>
            <Grid container spacing={1}>
              {items.map((s, i) => (
                <Grid item xs={12} key={i}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4}>
                      <TextField size="small" fullWidth label="Label" value={s.label} onChange={(e) => set(i, { label: e.target.value })} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TimePicker
                        label="Start"
                        value={toDayjs(s.start)}
                        onChange={(d) => set(i, { start: fmt(d) })}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        minutesStep={1}
                        timeSteps={{ minutes: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TimePicker
                        label="End"
                        value={toDayjs(s.end)}
                        onChange={(d) => set(i, { end: fmt(d) })}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        minutesStep={1}
                        timeSteps={{ minutes: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={() => del(i)} aria-label="remove">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button onClick={add} startIcon={<AddIcon />} variant="outlined" size="small">
                  Add Shift
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default ShiftBlock;
