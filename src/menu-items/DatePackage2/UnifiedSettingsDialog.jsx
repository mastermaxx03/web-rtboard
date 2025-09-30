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
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { useShifts } from './ShiftSettingsContext';
import { useZones } from './ZoneSettingsContext';

// --- time helpers (no broken regex) ---
const HM_RE = /^(\d{2}):(\d{2})$/;
function hm(hhmm) {
  const m = HM_RE.exec(String(hhmm || '').trim());
  if (!m) return { h: NaN, m: NaN };
  return { h: +m[1], m: +m[2] };
}
function toMin(hhmm) {
  const { h, m } = hm(hhmm);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
}
const fmtMin = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

export default function UnifiedSettingsDialog({ open, onClose, initialPane = 'shifts' }) {
  const { shifts, setShifts } = useShifts();
  const { zones, setZones, billingCycleDay, setBillingCycleDay } = useZones();

  const [pane, setPane] = useState(initialPane); // 'shifts' | 'zones' | 'billing'
  const [sLocal, setSLocal] = useState(shifts);
  const [zLocal, setZLocal] = useState(zones);
  const [billLocal, setBillLocal] = useState(billingCycleDay);

  // ---------- validation ----------
  const conflicts = useMemo(() => {
    const msgs = [];

    // validate shifts HH:MM and not identical times
    [
      ['A', 'Shift A'],
      ['B', 'Shift B'],
      ['C', 'Shift C']
    ].forEach(([k, label]) => {
      const s = sLocal?.[k];
      if (!HM_RE.test(s?.start || '') || !HM_RE.test(s?.end || '')) {
        msgs.push(`${label}: please enter valid HH:MM times.`);
      }
    });

    // zones: no overlapping slots within the same zone (supports overnight)
    Object.values(zLocal || {}).forEach((z) => {
      const segs = (z.slots || [])
        .flatMap((s, idx) => {
          const S = toMin(s.start);
          const E = toMin(s.end);
          if (!Number.isFinite(S) || !Number.isFinite(E)) return [];
          if (E <= S) {
            // overnight -> split into [S,1440) + [0,E)
            return [
              { s: S, e: 1440, idx },
              { s: 0, e: E, idx }
            ];
          }
          return [{ s: S, e: E, idx }];
        })
        .sort((a, b) => a.s - b.s);

      for (let i = 1; i < segs.length; i++) {
        const prev = segs[i - 1],
          cur = segs[i];
        if (cur.s < prev.e) {
          msgs.push(`Zone "${z.label || z.key}" overlaps between ${fmtMin(cur.s)}–${fmtMin(prev.e)}`);
        }
      }
    });

    if (!(billLocal >= 1 && billLocal <= 28)) {
      msgs.push('Billing cycle day must be between 1 and 28.');
    }
    return msgs;
  }, [sLocal, zLocal, billLocal]);

  // ---------- mutators ----------
  const updateShift = (key, field, val) => setSLocal((p) => ({ ...p, [key]: { ...p[key], [field]: val } }));

  const addZone = () => {
    const keys = Object.keys(zLocal || {});
    let n = 1;
    while (zLocal[`Z${n}`]) n++;
    setZLocal((p) => ({
      ...p,
      [`Z${n}`]: { key: `Z${n}`, label: `Zone ${n}`, slots: [{ start: '06:00', end: '14:00' }] }
    }));
  };
  const removeZone = (key) => {
    const copy = { ...zLocal };
    delete copy[key];
    setZLocal(copy);
  };
  const updateZone = (key, field, val) => setZLocal((p) => ({ ...p, [key]: { ...p[key], [field]: val } }));

  const addSlot = (key) =>
    setZLocal((p) => ({
      ...p,
      [key]: { ...p[key], slots: [...(p[key].slots || []), { start: '00:00', end: '00:00' }] }
    }));
  const updateSlot = (key, idx, field, val) =>
    setZLocal((p) => {
      const slots = (p[key].slots || []).slice();
      slots[idx] = { ...slots[idx], [field]: val };
      return { ...p, [key]: { ...p[key], slots } };
    });
  // 🚫 Guard: don't allow removing the last remaining slot in a zone
  const removeSlot = (key, idx) =>
    setZLocal((p) => {
      const slots = (p[key].slots || []).slice();
      if (slots.length <= 1) return p; // keep at least one
      slots.splice(idx, 1);
      return { ...p, [key]: { ...p[key], slots } };
    });

  const save = () => {
    if (conflicts.length) return;
    setShifts(sLocal);
    setZones(zLocal);
    setBillingCycleDay(billLocal);
    onClose?.();
  };

  // ---------- UI ----------
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Settings — Shifts &amp; Zones</DialogTitle>
      <DialogContent dividers sx={{ pt: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={pane}
            onChange={(_, v) => v && setPane(v)}
            sx={{ '& .MuiToggleButton-root': { borderRadius: 999, px: 1.25, textTransform: 'none' } }}
          >
            <ToggleButton value="shifts">Shifts</ToggleButton>
            <ToggleButton value="zones">Zones</ToggleButton>
            <ToggleButton value="billing">Billing</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Overnight supported • HH:MM
          </Typography>
        </Stack>

        {conflicts.length > 0 && (
          <Paper variant="outlined" sx={{ px: 2, py: 1.25, mb: 2, borderColor: 'warning.light', bgcolor: 'warning.light' }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Please fix the following:</Typography>
            {conflicts.map((c, i) => (
              <Typography key={i} variant="body2">
                • {c}
              </Typography>
            ))}
          </Paper>
        )}

        {pane === 'shifts' && (
          <Stack spacing={2}>
            {['A', 'B', 'C'].map((k) => (
              <Paper key={k} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    size="small"
                    label={`Shift ${k} Label`}
                    value={sLocal[k].label}
                    onChange={(e) => updateShift(k, 'label', e.target.value)}
                    sx={{ minWidth: 220 }}
                  />
                  <TextField
                    size="small"
                    label="Start"
                    type="time"
                    value={sLocal[k].start}
                    inputProps={{ step: 60 }}
                    onChange={(e) => updateShift(k, 'start', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    sx={{ minWidth: 160 }}
                  />
                  <TextField
                    size="small"
                    label="End"
                    type="time"
                    value={sLocal[k].end}
                    inputProps={{ step: 60 }}
                    onChange={(e) => updateShift(k, 'end', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    sx={{ minWidth: 160 }}
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {pane === 'zones' && (
          <Stack spacing={2}>
            {Object.values(zLocal).map((z) => (
              <Paper key={z.key} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField
                    size="small"
                    label="Zone Label"
                    value={z.label}
                    onChange={(e) => updateZone(z.key, 'label', e.target.value)}
                    sx={{ minWidth: 220 }}
                  />
                  <Box sx={{ flex: 1 }} />
                  <Tooltip title="Add slot">
                    <IconButton onClick={() => addSlot(z.key)}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete zone">
                    <IconButton onClick={() => removeZone(z.key)} color="error">
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack spacing={1.1}>
                  {(z.slots || []).map((s, idx) => (
                    <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
                      {/* Show delete only if more than one slot exists */}
                      {(z.slots?.length ?? 0) > 1 && (
                        <IconButton onClick={() => removeSlot(z.key, idx)} color="error">
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            ))}
            <Button startIcon={<AddIcon />} onClick={addZone} variant="outlined" sx={{ alignSelf: 'flex-start' }}>
              Add Zone
            </Button>
            <Typography variant="caption" color="text.secondary">
              Zone “slots” are active windows for that zone (e.g., 00:00–06:00 & 22:00–24:00).
            </Typography>
          </Stack>
        )}

        {pane === 'billing' && (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Set the monthly billing cycle start day (1–28). Used by “Current billing cycle so far”.
            </Typography>
            <TextField
              size="small"
              label="Billing cycle start day"
              type="number"
              inputProps={{ min: 1, max: 28 }}
              value={billLocal}
              onChange={(e) => setBillLocal(Math.max(1, Math.min(28, parseInt(e.target.value || '1', 10))))}
              sx={{ maxWidth: 220 }}
            />
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
