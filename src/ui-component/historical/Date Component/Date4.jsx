// ../Date Component/DayVibe.jsx
import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
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
  Tooltip,
  Typography,
  FormControl,
  Select,
  List,
  ListItemButton,
  ListItemText,
  LinearProgress
} from '@mui/material';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';
import BoltIcon from '@mui/icons-material/Bolt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/* ---------------- Utilities ---------------- */
const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const ymdUTC = (d) => `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

// Create a UTC ISO from the *local* date's components (treat local wall time as UTC)
function asUTC(d) {
  return new Date(Date.UTC(
    d.getFullYear(), d.getMonth(), d.getDate(),
    d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()
  )).toISOString();
}

const startOfPlantDay = (now, shifts) => {
  const [h, m] = (shifts?.A?.start ?? '06:00').split(':').map(Number);
  return new Date(now.getFullYear(), now.getMonth(), 1, h, m || 0, 0, 0);
};

function rangeWithShift(selStartYMD, selEndYMD, shiftKey, shifts) {
  const s = new Date(selStartYMD);
  const e = new Date(selEndYMD || selStartYMD);
  if (shiftKey === 'ALL') {
    const start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
    const end = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
    return { start, end };
  }
  const cfg = shifts?.[shiftKey] || { start: '00:00', end: '23:59' };
  const [sh, sm] = cfg.start.split(':').map(Number);
  const [eh, em] = cfg.end.split(':').map(Number);
  const overnight = eh * 60 + em <= sh * 60 + sm;
  const start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), sh, sm, 0, 0);
  const end = new Date(e.getFullYear(), e.getMonth(), e.getDate(), eh, em, 0, 0);
  if (overnight) end.setDate(end.getDate() + 1);
  end.setMilliseconds(999); // inclusive end
  return { start, end };
}

/* ---------- UTC-based presets (entirely in UTC) ---------- */
function startOfUTCDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}
function makePresetRangeUTC(key, now = new Date(), shifts) {
  if (key === 'currentDaySoFar') {
    return { start: startOfUTCDay(now), end: now, label: 'Current Day – so far' };
  }
  if (key === 'currentWeekSoFar') {
    // week starts Sunday in UTC
    const dow = now.getUTCDay();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow, 0, 0, 0, 0));
    return { start, end: now, label: 'Current Week – so far' };
  }
  if (key === 'currentMonthSoFar') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    return { start, end: now, label: 'Current Month – so far' };
  }
  if (key === 'currentQuarterSoFar') {
    const m0 = Math.floor(now.getUTCMonth() / 3) * 3;
    const start = new Date(Date.UTC(now.getUTCFullYear(), m0, 1, 0, 0, 0, 0));
    return { start, end: now, label: 'Current Quarter – so far' };
  }
  if (key === 'currentShiftSoFar') {
    const toMin = (hhmm) => { const [h, m] = (hhmm || '00:00').split(':').map(Number); return h * 60 + m; };
    const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes();
    const order = ['A', 'B', 'C'];
    const segs = order.flatMap((k) => {
      const s = toMin(shifts?.[k]?.start);
      const e = toMin(shifts?.[k]?.end);
      return e <= s ? [{ k, s, e: 1440 }, { k, s: 0, e }] : [{ k, s, e }];
    });
    const hit = segs.find((t) => nowMin >= t.s && nowMin < t.e)?.k || 'A';

    // UTC date components
    const y = now.getUTCFullYear(), mo = now.getUTCMonth(), d = now.getUTCDate();
    const [sh, sm] = (shifts?.[hit]?.start || '00:00').split(':').map(Number);
    const [eh, em] = (shifts?.[hit]?.end || '23:59').split(':').map(Number);
    const start = new Date(Date.UTC(y, mo, d, sh, sm, 0, 0));
    let end = new Date(Date.UTC(y, mo, d, eh, em, 0, 0));
    if ((eh * 60 + em) <= (sh * 60 + sm)) end = new Date(end.getTime() + 24 * 3600 * 1000);
    end.setMilliseconds(999);
    return { start, end, label: `Current Shift – so far (${hit})`, shift: hit };
  }
  return null;
}

/* ---------------- Month Grid ---------------- */
function MonthGrid({ base, selStart, selEnd, onPick }) {
  const m0 = startOfMonth(base);
  const firstDow = m0.getDay();
  const gridStart = new Date(m0);
  gridStart.setDate(m0.getDate() - firstDow);

  const cells = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const key = ymd(d);
    const inMonth = d.getMonth() === base.getMonth();
    const s = selStart;
    const e = selEnd || selStart;
    const inSel = s && e && new Date(key) >= new Date(s) && new Date(key) <= new Date(e);
    const isEdge = key === s || key === e;
    return { d, key, inMonth, inSel, isEdge };
  });

  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 3, minWidth: 332 }}>
      <Typography sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
        {base.toLocaleString(undefined, { month: 'long' })} {base.getFullYear()}
      </Typography>

      <Stack direction="row" justifyContent="space-between" sx={{ px: 0.5, mb: 0.75, color: 'text.secondary', fontSize: 12 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <Box key={d} sx={{ width: 40, textAlign: 'center' }}>{d}</Box>
        ))}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {cells.map((c) => (
          <Box
            key={c.key}
            onClick={() => onPick(c.key)}
            sx={{
              width: 40, height: 40, display: 'grid', placeItems: 'center',
              borderRadius: 2, cursor: 'pointer', userSelect: 'none',
              fontWeight: c.isEdge ? 900 : 600,
              bgcolor: c.isEdge ? 'primary.main' : c.inSel ? 'primary.light' : 'rgba(255,255,255,0.7)',
              color: c.isEdge ? '#fff' : c.inMonth ? 'text.primary' : 'text.disabled',
              border: '1px solid',
              borderColor: c.isEdge ? 'primary.main' : c.inSel ? 'primary.main' : 'divider',
              '&:hover': { boxShadow: '0 6px 16px rgba(2,6,23,0.12)', transform: 'translateY(-1px)' },
              transition: 'all 140ms'
            }}
          >
            {c.d.getDate()}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

/* ---------------- Shift Settings ---------------- */
function ShiftSettingsDialog({ open, onClose, value, onSave }) {
  const [local, setLocal] = useState(value);
  const update = (k, field, val) => setLocal((p) => ({ ...p, [k]: { ...p[k], [field]: val } }));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Shift Settings</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {['A', 'B', 'C'].map((k) => (
            <Paper key={k} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField label={`Shift ${k} Label`} size="small" value={local[k].label}
                  onChange={(e) => update(k, 'label', e.target.value)} />
                <TextField label="Start" type="time" size="small" value={local[k].start}
                  onChange={(e) => update(k, 'start', e.target.value)} inputProps={{ step: 60 }} />
                <TextField label="End" type="time" size="small" value={local[k].end}
                  onChange={(e) => update(k, 'end', e.target.value)} inputProps={{ step: 60 }} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={() => onSave(local)} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- Main: DayVibe (UTC) ---------------- */
export default function DayVibe({
  value,
  onChange,
  maxSpanDays = 93
}) {
  // shifts in localStorage
  const STORAGE_KEY = 'shift_settings_v1';
  const DEFAULT_SHIFTS = {
    A: { key: 'A', start: '06:00', end: '14:00', label: 'A' },
    B: { key: 'B', start: '14:00', end: '22:00', label: 'B' },
    C: { key: 'C', start: '22:00', end: '06:00', label: 'C' }
  };
  const [shifts, setShifts] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : DEFAULT_SHIFTS; }
    catch { return DEFAULT_SHIFTS; }
  });
  const saveShifts = (next) => { setShifts(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {} };

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('history');

  const [viewMonth, setViewMonth] = useState(() => startOfPlantDay(new Date(), shifts));
  const [selStart, setSelStart] = useState('');
  const [selEnd, setSelEnd] = useState('');
  const [shiftSel, setShiftSel] = useState('ALL');

  const PRESET_LABELS = {
    currentShiftSoFar: 'Current Shift – so far',
    currentDaySoFar: 'Current Day – so far',
    currentWeekSoFar: 'Current Week – so far',
    currentMonthSoFar: 'Current Month – so far',
    currentQuarterSoFar: 'Current Quarter – so far'
  };
  const DEFAULT_PRESET = 'currentDaySoFar';
  const [presetSel, setPresetSel] = useState(value?.preset ?? DEFAULT_PRESET);

  // realtime
  const RT_WINDOWS = [
    { label: '2 Hours', h: 2 },
    { label: '6 Hours', h: 6 },
    { label: '12 Hours', h: 12 },
    { label: '1 Day', h: 24 },
    { label: '7 Days', h: 24 * 7 },
    { label: '30 Days', h: 24 * 30 }
  ];
  const [rtw, setRtw] = useState('1 Day');
  const [agg, setAgg] = useState(value?.aggregation ?? 'Average');

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Display text in UTC so it matches query semantics 1:1
  const display =
    value?.start && value?.end
      ? `${new Date(value.start).toLocaleDateString('en-GB', { timeZone: 'UTC' })} – ${new Date(value.end).toLocaleDateString('en-GB', { timeZone: 'UTC' })}`
      : `Preset: ${PRESET_LABELS[value?.preset ?? DEFAULT_PRESET]}`;

  const handleOpen = () => {
    setOpen(true);
    // seed selected days from the current value using UTC date parts
    setSelStart(value?.start ? ymdUTC(new Date(value.start)) : '');
    setSelEnd(value?.end ? ymdUTC(new Date(value.end)) : '');
    setShiftSel(value?.shift ?? 'ALL');
    setPresetSel(value?.preset ?? DEFAULT_PRESET);
    setAgg(value?.aggregation ?? 'Average');
    setViewMonth(startOfPlantDay(new Date(), shifts));
  };
  const handleClose = () => setOpen(false);

  const pick = (k) => {
    if (!selStart || (selStart && selEnd)) { setSelStart(k); setSelEnd(''); }
    else { if (new Date(k) < new Date(selStart)) { setSelEnd(selStart); setSelStart(k); } else setSelEnd(k); }
  };
  const jumpMonth = (n) => setViewMonth((vm) => addMonths(vm, n));
  const jumpYear = (n) => setViewMonth((vm) => new Date(vm.getFullYear() + n, vm.getMonth(), 1));

  const applyHistory = () => {
    if (selStart) {
      const endY = selEnd || selStart;
      const s = new Date(selStart);
      const e = new Date(endY);
      const days = Math.floor((e - s) / (24 * 3600 * 1000)) + 1;
      const eFinal = days > maxSpanDays ? new Date(s.getTime() + (maxSpanDays - 1) * 24 * 3600 * 1000) : e;
      const { start, end } = rangeWithShift(ymd(s), ymd(eFinal), shiftSel, shifts); // local dates for walls
      end.setMilliseconds(999);
      onChange?.({
        start: asUTC(start),     // treat wall time as UTC instant
        end:   asUTC(end),
        shift: shiftSel,
        preset: '',
        aggregation: agg
      });
    } else {
      const chosen = presetSel || DEFAULT_PRESET;
      const pr = makePresetRangeUTC(chosen, new Date(), shifts);
      if (!pr) return;
      // If currentShiftSoFar, label already includes the hit; shift value optional here
      onChange?.({
        start: pr.start.toISOString(),
        end:   pr.end.toISOString(),
        shift: shiftSel,  // keep current selection (or you could set pr.shift if you prefer)
        preset: chosen,
        aggregation: agg
      });
    }
    handleClose();
  };

  const applyRealtime = () => {
    const pick = RT_WINDOWS.find((x) => x.label === rtw) || RT_WINDOWS[3];
    const end = new Date();   // now (UTC instant via toISOString)
    const start = new Date(end.getTime() - pick.h * 3600 * 1000);
    onChange?.({
      start: start.toISOString(),
      end: end.toISOString(),
      shift: 'ALL',
      preset: `last_${pick.label.replace(/\s+/g, '')}`,
      aggregation: agg
    });
    handleClose();
  };

  const clearAll = () => {
    setSelStart(''); setSelEnd(''); setShiftSel('ALL'); setPresetSel(DEFAULT_PRESET);
    onChange?.({ start: '', end: '', shift: 'ALL', preset: '', aggregation: agg });
    handleClose();
  };

  const selectedHours = useMemo(() => (RT_WINDOWS.find((x) => x.label === rtw)?.h ?? 24), [rtw]);

  /* ---------------- Render ---------------- */
  return (
    <>
      <TextField
        value={display}
        size="small"
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <CalendarTodayIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={handleOpen} aria-label="Open date picker">
                <CalendarMonthIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        onClick={handleOpen}
        sx={{
          minWidth: 320,
          '& .MuiInputBase-root': {
            borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 18px rgba(2,6,23,0.06)'
          }
        }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: 980,
            maxWidth: '96vw',
            borderRadius: 4,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.92))',
            boxShadow: '0 40px 90px rgba(2,6,23,0.35)'
          }
        }}
      >
        <DialogTitle sx={{ py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Paper elevation={0} sx={{ p: 0.5, borderRadius: 999, display: 'inline-flex', gap: 0.5, border: '1px solid rgba(59,130,246,0.35)' }}>
              {['history', 'realtime'].map((k) => (
                <Button
                  key={k}
                  onClick={() => setMode(k)}
                  size="small"
                  startIcon={k === 'realtime' ? <BoltIcon fontSize="inherit" /> : <CalendarTodayIcon fontSize="inherit" />}
                  sx={{ textTransform: 'none', px: 2.2, borderRadius: 999, fontWeight: 900,
                        bgcolor: mode === k ? 'primary.main' : 'rgba(255,255,255,0.4)',
                        color: mode === k ? '#fff' : 'text.primary' }}
                >
                  {k === 'history' ? 'History' : 'Realtime'}
                </Button>
              ))}
            </Paper>

            <Stack direction="row" spacing={1} alignItems="center">
              {mode === 'history' && (
                <Paper elevation={0} sx={{ display: 'inline-flex', borderRadius: 999, p: 0.25, border: '1px solid rgba(2,6,23,0.12)' }}>
                  {['A', 'B', 'C', 'ALL'].map((k) => (
                    <Button key={k} onClick={() => setShiftSel(k)} size="small"
                      sx={{ textTransform: 'none', px: 1.4, borderRadius: 999, fontWeight: 900,
                            bgcolor: shiftSel === k ? 'primary.main' : 'transparent',
                            color: shiftSel === k ? '#fff' : 'text.primary' }}>
                      {k}
                    </Button>
                  ))}
                </Paper>
              )}
              <Tooltip title="Shift settings">
                <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ border: '1px solid', borderColor: 'grey.300' }}>
                  <SettingsIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent dividers sx={{ p: 0 }}>
          <Stack direction="row" sx={{ minHeight: 460 }}>
            {/* LEFT RAIL */}
            <Box sx={{ width: 280, p: 2, borderRight: '1px solid', borderColor: 'divider',
                       background: mode === 'history'
                         ? 'linear-gradient(180deg, rgba(59,130,246,0.08), rgba(16,185,129,0.08))'
                         : 'linear-gradient(180deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))' }}>
              {mode === 'history' ? (
                <>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>Select range (UTC)</Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                    <Select
                      value={presetSel}
                      onChange={(e) => setPresetSel(e.target.value)}
                      displayEmpty
                      renderValue={(val) => PRESET_LABELS[val || DEFAULT_PRESET]}
                    >
                      {Object.entries(PRESET_LABELS).map(([k, label]) => (
                        <MenuItem key={k} value={k}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary' }}>
                    Quick picks
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    {[
                      { k: 'today', label: 'Today', f: () => [new Date(), new Date()] },
                      { k: 'yesterday', label: 'Yesterday', f: () => { const d = new Date(); d.setUTCDate(d.getUTCDate() - 1); return [d, d]; } },
                      { k: 'last7', label: 'Last 7 days', f: () => { const e = new Date(); const s = new Date(); s.setUTCDate(e.getUTCDate() - 6); return [s, e]; } },
                      { k: 'last30', label: 'Last 30 days', f: () => { const e = new Date(); const s = new Date(); s.setUTCDate(e.getUTCDate() - 29); return [s, e]; } }
                    ].map((q) => (
                      <ListItemButton
                        key={q.k}
                        onClick={() => { const [s, e] = q.f(); setSelStart(ymd(s)); setSelEnd(ymd(e)); }}
                        sx={{ borderRadius: 2, mb: 0.5 }}
                      >
                        <ListItemText primaryTypographyProps={{ fontWeight: 800 }} primary={q.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </>
              ) : (
                <>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>Realtime window</Typography>
                  <Stack spacing={0.75}>
                    {RT_WINDOWS.map(({ label }) => (
                      <Button
                        key={label}
                        onClick={() => setRtw(label)}
                        variant={rtw === label ? 'contained' : 'outlined'}
                        size="small"
                        sx={{
                          justifyContent: 'flex-start',
                          borderRadius: 2,
                          fontWeight: 800
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </Stack>

                  <Typography sx={{ fontWeight: 900, mt: 2, mb: 0.75 }}>Aggregation</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {['Average', 'Min', 'Max', 'Sum'].map((label) => (
                      <Chip
                        key={label}
                        label={label}
                        clickable
                        onClick={() => setAgg(label)}
                        color={agg === label ? 'primary' : 'default'}
                        variant={agg === label ? 'filled' : 'outlined'}
                        sx={{ borderRadius: 999, fontWeight: 900 }}
                      />
                    ))}
                  </Stack>
                </>
              )}
            </Box>

            {/* RIGHT PANEL */}
            <Box sx={{ flex: 1, p: 2 }}>
              {mode === 'history' ? (
                <>
                  <Paper variant="outlined" sx={{ px: 1, py: 0.6, borderRadius: 2, mb: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="Previous year">
                          <IconButton size="small" onClick={() => jumpYear(-1)} aria-label="Previous year">
                            <KeyboardDoubleArrowLeftIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={() => jumpMonth(-1)} aria-label="Previous month">
                          <NavigateBeforeIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>

                      <Typography sx={{ fontWeight: 900 }}>Pick days</Typography>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton size="small" onClick={() => jumpMonth(+1)} aria-label="Next month">
                          <NavigateNextIcon fontSize="inherit" />
                        </IconButton>
                        <Tooltip title="Next year">
                          <IconButton size="small" onClick={() => jumpYear(+1)} aria-label="Next year">
                            <KeyboardDoubleArrowRightIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>

                  <Stack direction="row" spacing={2} justifyContent="center">
                    <MonthGrid base={viewMonth} selStart={selStart} selEnd={selEnd} onPick={pick} />
                    <MonthGrid base={addMonths(viewMonth, 1)} selStart={selStart} selEnd={selEnd} onPick={pick} />
                  </Stack>

                  <Box sx={{ mt: 1.25, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {selStart
                        ? `${new Date(selStart).toLocaleDateString('en-GB', { timeZone: 'UTC' })} – ${selEnd ? new Date(selEnd).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : new Date(selStart).toLocaleDateString('en-GB', { timeZone: 'UTC' })}`
                        : PRESET_LABELS[presetSel]}
                      &nbsp; • Shift {shiftSel} • Agg {agg}
                    </Typography>
                  </Box>
                </>
              ) : (
                // ======= Realtime Preview (clean & centered) =======
                <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }} spacing={2}>
                  <Typography sx={{ fontWeight: 900, fontSize: 20 }}>
                    Last {selectedHours < 24 ? `${selectedHours} hour${selectedHours > 1 ? 's' : ''}` : `${Math.round(selectedHours / 24)} day(s)`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Aggregation: <b>{agg}</b>
                  </Typography>

                  {/* Visual timeline bar */}
                  <Box sx={{ width: '80%', maxWidth: 560 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (selectedHours / (24 * 30)) * 100)}
                      sx={{
                        height: 12,
                        borderRadius: 999,
                        '& .MuiLinearProgress-bar': { borderRadius: 999 }
                      }}
                    />
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Now − {selectedHours < 24 ? `${selectedHours}h` : `${Math.round(selectedHours / 24)}d`}</Typography>
                      <Typography variant="caption" color="text.secondary">30d</Typography>
                    </Stack>
                  </Box>

                  {/* Helpful note */}
                  <Typography variant="caption" color="text.secondary">
                    Use the list on the left to change the window or aggregation.
                  </Typography>
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.9))' }}>
          <Stack direction="row" spacing={1} sx={{ width: '100%' }} alignItems="center" justifyContent="space-between">
            <Button onClick={clearAll} color="inherit" size="small" variant="outlined">Clear</Button>
            <Button
              onClick={mode === 'history' ? applyHistory : applyRealtime}
              variant="contained"
              size="small"
              startIcon={<CalendarMonthIcon fontSize="inherit" />}
              disabled={mode === 'history' ? !presetSel && !selStart : false}
            >
              {mode === 'history' ? (selStart ? 'Apply' : 'Apply preset') : 'Apply'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <ShiftSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        value={shifts}
        onSave={(n) => (saveShifts(n), setSettingsOpen(false))}
      />
    </>
  );
}
