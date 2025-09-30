import React from 'react';
import { Box, Typography, Grid, TextField, IconButton, Button, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

const emptyZone = () => ({ label: '', rate: '', slots: [{ start: '', end: '' }] });
const toDayjs = (hhmm) => (hhmm ? dayjs(`2000-01-01T${hhmm}:00`) : null);
const fmt = (d) => (d?.isValid() ? d.format('HH:mm') : '');

const ToDZonesBlock = ({ field, value, onChange }) => {
  const zones = Array.isArray(value) ? value : [];

  const setZone = (i, patch) =>
    onChange(
      field.id,
      zones.map((z, idx) => (idx === i ? { ...z, ...patch } : z))
    );

  const addZone = () => onChange(field.id, [...zones, emptyZone()]);
  const delZone = (i) =>
    onChange(
      field.id,
      zones.filter((_, idx) => idx !== i)
    );

  const addSlot = (zi) => setZone(zi, { slots: [...(zones[zi].slots || []), { start: '', end: '' }] });
  const setSlot = (zi, si, patch) =>
    setZone(zi, {
      slots: (zones[zi].slots || []).map((s, j) => (j === si ? { ...s, ...patch } : s))
    });
  const delSlot = (zi, si) => {
    const slots = (zones[zi].slots || []).slice();
    if (slots.length <= 1) return;
    slots.splice(si, 1);
    setZone(zi, { slots });
  };

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
        <Grid container spacing={1.5} alignItems="flex-start">
          <Grid item xs={12} sm={5}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              ToD Zones
            </Typography>
          </Grid>

          <Grid item xs={12} sm={7}>
            <Box sx={{ display: 'grid', gap: 1.25 }}>
              {zones.map((z, zi) => (
                <Box key={zi} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={5}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Zone Label"
                        value={z.label}
                        onChange={(e) => setZone(zi, { label: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Rate (₹/kWh)"
                        value={z.rate}
                        onChange={(e) => setZone(zi, { rate: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <IconButton onClick={() => delZone(zi)} color="error" aria-label="remove zone">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1 }} />

                  <Grid container spacing={1}>
                    {(z.slots || []).map((s, si) => (
                      <React.Fragment key={si}>
                        <Grid item xs={6} md={3}>
                          <TimePicker
                            label={`Slot #${si + 1} Start`}
                            value={toDayjs(s.start)}
                            onChange={(d) => setSlot(zi, si, { start: fmt(d) })}
                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            minutesStep={1}
                            timeSteps={{ minutes: 1 }}
                          />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <TimePicker
                            label="End"
                            value={toDayjs(s.end)}
                            onChange={(d) => setSlot(zi, si, { end: fmt(d) })}
                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            minutesStep={1}
                            timeSteps={{ minutes: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button size="small" variant="outlined" onClick={() => addSlot(zi)} startIcon={<AddIcon />}>
                            Add Slot
                          </Button>
                          {(z.slots?.length ?? 0) > 1 && (
                            <IconButton onClick={() => delSlot(zi, si)} color="error" aria-label="remove slot">
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
                </Box>
              ))}
              <Button onClick={addZone} startIcon={<AddIcon />} variant="outlined" size="small" sx={{ justifySelf: 'start' }}>
                Add Zone
              </Button>
            </Box>

            {field.helperText && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                {field.helperText}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default ToDZonesBlock;
