import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TuneIcon from '@mui/icons-material/Tune';
import MapIcon from '@mui/icons-material/Map';

import { useShifts } from './ShiftSettingsContext';
import { useZones } from './ZoneSettingsContext';

/** --- tiny helpers shared by both panes --- */
const pad2 = (n) => String(n).padStart(2, '0');
const toMin = (hhmm) => {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return NaN;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const fmtMin = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;

/** ----------------------------------------------------------------------- */
/** Main dialog */
export default function SettingsDialog({ open, onClose }) {
  const { shifts, setShifts } = useShifts();
  const { zones, setZones, billingCycleDay, setBillingCycleDay } = useZones();

  // local working copies (don’t mutate contexts until Save)
  const [pane, setPane] = useState('shifts'); // 'shifts' | 'zones'
  const [localShifts, setLocalShifts] = useState(shifts);
  const [localZones, setLocalZones] = useState(zones);
  const [billLocal, setBillLocal] = useState(billingCycleDay);

  // if the dialog is re-opened, refresh local state from context
  React.useEffect(() => {
    if (open) {
      setPane((p) => p); // keep current tab
      setLocalShifts(shifts);
      setLocalZones(zones);
      setBillLocal(billingCycleDay);
    }
  }, [open, shifts, zones, billingCycleDay]);

  /** -------- Shifts editing -------- */
  const updateShift = (key, field, value) => setLocalShifts((p) => ({ ...p, [key]: { ...p[key], [field]: value } }));

  /** -------- Zones editing (with slots) -------- */
  const addZone = () => {
    const keys = Object.keys(localZones);
    let n = 1;
    while (localZones[`Z${n}`]) n++;
    setLocalZones((p) => ({
      ...p,
      [`Z${n}`]: { key: `Z${n}`, label: `Zone ${n}`, slots: [{ start: '00:00', end: '00:00' }] }
    }));
  };
  const removeZone = (key) => {
    const copy = { ...localZones };
    delete copy[key];
    setLocalZones(copy);
  };
  const updateZone = (key, field, val) => setLocalZones((p) => ({ ...p, [key]: { ...p[key], [field]: val } }));

  const addSlot = (key) =>
    setLocalZones((p) => ({
      ...p,
      [key]: { ...p[key], slots: [...(p[key].slots || []), { start: '00:00', end: '00:00' }] }
    }));

  const updateSlot = (key, idx, field, val) =>
    setLocalZones((p) => {
      const slots = (p[key].slots || []).slice();
      slots[idx] = { ...slots[idx], [field]: val };
      return { ...p, [key]: { ...p[key], slots } };
    });

  const removeSlot = (key, idx) =>
    setLocalZones((p) => {
      const slots = (p[key].slots || []).slice();
      slots.splice(idx, 1);
      return { ...p, [key]: { ...p[key], slots } };
    });

  // Validate zone slot overlaps per zone + billing day bounds
  const conflicts = useMemo(() => {
    const list = [];
    Object.values(localZones).forEach((z) => {
      const segs = (z.slots || [])
        .flatMap((s, idx) => {
          const S = toMin(s.start);
          const E = toMin(s.end);
          if (Number.isNaN(S) || Number.isNaN(E)) return [];
          if (E <= S) {
            // overnight split
            return [
              { s: S, e: 1440, idx },
              { s: 0, e: E, idx }
            ];
          }
          return [{ s: S, e: E, idx }];
        })
        .sort((a, b) => a.s - b.s);
      for (let i = 1; i < segs.length; i++) {
        const prev = segs[i - 1];
        const cur = segs[i];
        if (cur.s < prev.e) list.push(`Zone "${z.label}" overlaps between ${fmtMin(cur.s)}–${fmtMin(prev.e)}`);
      }
    });
    if (!(billLocal >= 1 && billLocal <= 28)) {
      list.push('Billing cycle day must be between 1 and 28.');
    }
    return list;
  }, [localZones, billLocal]);

  const save = () => {
    if (conflicts.length) return;
    setShifts(localShifts);
    setZones(localZones);
    setBillingCycleDay(billLocal);
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Settings — Shifts &amp; Zones</DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* top row: tab + billing day (right) */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={pane}
            onChange={(_, v) => v && setPane(v)}
            sx={{ '& .MuiToggleButton-root': { borderRadius: 999, textTransform: 'none', px: 1.5 } }}
          >
            <ToggleButton value="shifts" aria-label="shift-pane">
              <TuneIcon fontSize="small" style={{ marginRight: 6 }} /> Shifts
            </ToggleButton>
            <ToggleButton value="zones" aria-label="zone-pane">
              <MapIcon fontSize="small" style={{ marginRight: 6 }} /> Zones
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ flex: 1 }} />

          {/* billing day lives here (visible on both panes for convenience) */}
          <TextField
            size="small"
            label="Billing cycle start day"
            type="number"
            inputProps={{ min: 1, max: 28 }}
            value={billLocal}
            onChange={(e) => setBillLocal(Math.max(1, Math.min(28, parseInt(e.target.value || '1', 10))))}
            sx={{ width: 200 }}
          />
        </Stack>

        {conflicts.length > 0 && (
          <Paper
            variant="outlined"
            sx={{
              px: 2,
              py: 1.2,
              mb: 2,
              borderColor: (t) => alpha(t.palette.warning.main, 0.6),
              bgcolor: (t) => alpha(t.palette.warning.light, 0.35)
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Please fix the following:</Typography>
            {conflicts.map((c, i) => (
              <Typography key={i} variant="body2">
                • {c}
              </Typography>
            ))}
          </Paper>
        )}

        {/* ---------------- Shifts Pane ---------------- */}
        {pane === 'shifts' && (
          <Stack spacing={2}>
            {['A', 'B', 'C'].map((k) => {
              const s = localShifts[k];
              return (
                <Paper key={k} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems="center">
                    <TextField
                      size="small"
                      label="Shift Key"
                      value={s.key}
                      disabled
                      sx={{ width: 110 }}
                      InputProps={{ startAdornment: <InputAdornment position="start">#</InputAdornment> }}
                    />
                    <TextField
                      size="small"
                      label="Label"
                      value={s.label}
                      onChange={(e) => updateShift(k, 'label', e.target.value)}
                      sx={{ minWidth: 180 }}
                    />
                    <TextField
                      size="small"
                      label="Start"
                      type="time"
                      inputProps={{ step: 60 }}
                      value={s.start}
                      onChange={(e) => updateShift(k, 'start', e.target.value)}
                      sx={{ minWidth: 160 }}
                    />
                    <TextField
                      size="small"
                      label="End"
                      type="time"
                      inputProps={{ step: 60 }}
                      value={s.end}
                      onChange={(e) => updateShift(k, 'end', e.target.value)}
                      sx={{ minWidth: 160 }}
                    />
                    <Box sx={{ flex: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Overnight supported (end &lt;= start ⇒ next day)
                    </Typography>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}

        {/* ---------------- Zones Pane ---------------- */}
        {pane === 'zones' && (
          <Stack spacing={2}>
            {Object.values(localZones).map((z) => (
              <Paper key={z.key} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField
                    size="small"
                    label="Zone Label"
                    value={z.label}
                    onChange={(e) => updateZone(z.key, 'label', e.target.value)}
                    sx={{ minWidth: 240 }}
                  />
                  <Box sx={{ flex: 1 }} />
                  <Tooltip title="Add time slot (e.g. 00:00–06:00)">
                    <IconButton onClick={() => addSlot(z.key)}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove zone">
                    <IconButton onClick={() => removeZone(z.key)} color="error">
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack spacing={1.25}>
                  {(z.slots || []).map((s, idx) => (
                    <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        label={`Slot #${idx + 1} Start`}
                        type="time"
                        inputProps={{ step: 60 }}
                        value={s.start}
                        onChange={(e) => updateSlot(z.key, idx, 'start', e.target.value)}
                        sx={{ minWidth: 160 }}
                      />
                      <TextField
                        size="small"
                        label="End"
                        type="time"
                        inputProps={{ step: 60 }}
                        value={s.end}
                        onChange={(e) => updateSlot(z.key, idx, 'end', e.target.value)}
                        sx={{ minWidth: 160 }}
                      />
                      <Box sx={{ flex: 1 }} />
                      <Tooltip title="Delete this slot">
                        <IconButton onClick={() => removeSlot(z.key, idx)} color="error">
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            ))}

            <Button startIcon={<AddIcon />} onClick={addZone} variant="outlined" sx={{ alignSelf: 'flex-start' }}>
              Add Zone
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Zone “slots” define multiple time ranges per zone (e.g., <strong>00:00–06:00 &amp; 22:00–24:00</strong>
              ). Overnight ranges are supported (End earlier than Start rolls to next day).
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={save} disabled={conflicts.length > 0}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
