// ../Date Component/Date5.jsx
import React, { useState } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, IconButton, MenuItem, Paper, Select, Stack,
  TextField, Tooltip, Typography, InputAdornment
} from '@mui/material';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import BoltIcon from '@mui/icons-material/Bolt';
import SettingsIcon from '@mui/icons-material/Settings';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';

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
    return { start: startOfUTCDay(now), end: now };
  }
  if (key === 'currentWeekSoFar') {
    // week starts Sunday in UTC
    const dow = now.getUTCDay();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow, 0, 0, 0, 0));
    return { start, end: now };
  }
  if (key === 'currentMonthSoFar') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    return { start, end: now };
  }
  if (key === 'currentQuarterSoFar') {
    const m0 = Math.floor(now.getUTCMonth() / 3) * 3;
    const start = new Date(Date.UTC(now.getUTCFullYear(), m0, 1, 0, 0, 0, 0));
    return { start, end: now };
  }
  if (key === 'currentShiftSoFar') {
    // Interpret shift definitions as UTC wall times
    const toMin = (hhmm) => { const [h, m] = (hhmm || '00:00').split(':').map(Number); return h * 60 + m; };
    const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes();
    const order = ['A', 'B', 'C'];
    const segs = order.flatMap((k) => {
      const s = toMin(shifts?.[k]?.start);
      const e = toMin(shifts?.[k]?.end);
      return e <= s ? [{ k, s, e: 1440 }, { k, s: 0, e }] : [{ k, s, e }];
    });
    const hit = segs.find((t) => nowMin >= t.s && nowMin < t.e)?.k || 'A';

    // Build UTC range for today’s UTC date
    const y = now.getUTCFullYear(), mo = now.getUTCMonth(), d = now.getUTCDate();
    const [sh, sm] = (shifts?.[hit]?.start || '00:00').split(':').map(Number);
    const [eh, em] = (shifts?.[hit]?.end || '23:59').split(':').map(Number);
    const start = new Date(Date.UTC(y, mo, d, sh, sm, 0, 0));
    let end = new Date(Date.UTC(y, mo, d, eh, em, 0, 0));
    const overnight = (eh * 60 + em) <= (sh * 60 + sm);
    if (overnight) end = new Date(end.getTime() + 24 * 3600 * 1000);
    end.setMilliseconds(999);
    return { start, end, shift: hit };
  }
  return null;
}

/* ---------------- Month Grid (elevated card, circular pills) ---------------- */
function MonthCard({ base, selStart, selEnd, hoverKey, onPick, onHover }) {
  const m0 = startOfMonth(base);
  const firstDow = m0.getDay();
  const gridStart = new Date(m0);
  gridStart.setDate(m0.getDate() - firstDow);

  const cells = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(gridStart); d.setDate(gridStart.getDate() + i);
    const key = ymd(d);
    const s = selStart; const e = selEnd || selStart;
    const preview = s && !selEnd && hoverKey
      ? (new Date(key) >= new Date(Math.min(new Date(s), new Date(hoverKey))) &&
         new Date(key) <= new Date(Math.max(new Date(s), new Date(hoverKey))))
      : false;
    const inSel = (s && selEnd && new Date(key) >= new Date(s) && new Date(key) <= new Date(e)) || preview;
    const isEdge = key === s || key === e;
    const inMonth = d.getMonth() === base.getMonth();

    return { d, key, inSel, isEdge, inMonth, preview };
  });

  return (
    <Paper elevation={0} sx={{
      p: 1.25, borderRadius: 3, border: '1px solid', borderColor: 'divider',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94))',
      boxShadow: '0 18px 40px rgba(2,6,23,0.06)'
    }}>
      <Typography sx={{ fontWeight: 900, textAlign: 'center', mb: 1 }}>
        {base.toLocaleString(undefined, { month: 'long' })} {base.getFullYear()}
      </Typography>

      <Stack direction="row" justifyContent="space-between" sx={{ px: 0.5, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <Box key={d} sx={{ width: 42, textAlign: 'center' }}>{d}</Box>
        ))}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, px: 0.5 }}>
        {cells.map((c) => (
          <Box
            key={c.key}
            onClick={() => onPick(c.key)}
            onMouseEnter={() => onHover?.(c.key)}
            onMouseLeave={() => onHover?.('')}
            sx={{
              width: 42, height: 42, display: 'grid', placeItems: 'center',
              borderRadius: '999px', cursor: 'pointer', userSelect: 'none',
              fontWeight: c.isEdge ? 900 : 600,
              color: c.isEdge ? '#fff' : c.inMonth ? 'text.primary' : 'text.disabled',
              background: c.isEdge
                ? 'linear-gradient(180deg, #2563eb, #1e40af)'
                : c.inSel
                  ? 'radial-gradient(60% 60% at 50% 50%, rgba(59,130,246,0.18), rgba(59,130,246,0.08))'
                  : 'transparent',
              border: c.isEdge ? '2px solid rgba(255,255,255,0.8)'
                : c.inSel ? '1px dashed rgba(59,130,246,0.35)' : '1px solid rgba(0,0,0,0.06)',
              transition: 'transform 120ms, background 120ms',
              '&:hover': { transform: 'translateY(-1px)', background: c.isEdge ? 'linear-gradient(180deg, #1d4ed8, #1e3a8a)' : 'rgba(2,6,23,0.04)' }
            }}
          >
            {c.d.getDate()}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

/* ---------------- Shift Settings (light) ---------------- */
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

/* ---------------- Main ---------------- */
export default function Date5({ value, onChange, maxSpanDays = 93 }) {
  // shifts store
  const STORAGE_KEY = 'shift_settings_v1';
  const DEFAULT_SHIFTS = {
    A: { key: 'A', start: '06:00', end: '14:00', label: 'A' },
    B: { key: 'B', start: '14:00', end: '22:00', label: 'B' },
    C: { key: 'C', start: '22:00', end: '06:00', label: 'C' },
  };
  const [shifts, setShifts] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : DEFAULT_SHIFTS; }
    catch { return DEFAULT_SHIFTS; }
  });
  const saveShifts = (next) => { setShifts(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {} };

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('history'); // 'history' | 'realtime'
  const [settingsOpen, setSettingsOpen] = useState(false);

  // calendar state
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(() => startOfPlantDay(now, shifts));
  const [selStart, setSelStart] = useState('');
  const [selEnd, setSelEnd] = useState('');
  const [hoverKey, setHoverKey] = useState('');
  const [shiftSel, setShiftSel] = useState('ALL');

  const PRESETS = {
    currentShiftSoFar: 'Current Shift – so far',
    currentDaySoFar: 'Current Day – so far',
    currentWeekSoFar: 'Current Week – so far',
    currentMonthSoFar: 'Current Month – so far',
    currentQuarterSoFar: 'Current Quarter – so far',
  };

  // ✅ DEFAULT to "Current Shift – so far"
  const DEFAULT_PRESET = 'currentShiftSoFar';
  const [presetSel, setPresetSel] = useState(value?.preset ?? DEFAULT_PRESET);

  // realtime
  const [agg, setAgg] = useState(value?.aggregation ?? 'Average');
  const [rtLabel, setRtLabel] = useState('1 Day');
  const RT_CHOICES = ['2 Hours', '6 Hours', '12 Hours', '1 Day', '7 Days', '30 Days'];
  const hoursFromLabel = (lbl) => ({ '2 Hours':2, '6 Hours':6, '12 Hours':12, '1 Day':24, '7 Days':168, '30 Days':720 }[lbl] ?? 24);

  // input trigger — render in UTC so label matches query semantics
  const display =
    value?.start && value?.end
      ? `${new Date(value.start).toLocaleDateString('en-GB', { timeZone: 'UTC' })} – ${new Date(value.end).toLocaleDateString('en-GB', { timeZone: 'UTC' })}`
      : `Preset: ${PRESETS[value?.preset ?? DEFAULT_PRESET]}`;

  const handleOpen = () => {
    setOpen(true);
    // read current value using UTC day, so manual range aligns to UTC display
    setSelStart(value?.start ? ymdUTC(new Date(value.start)) : '');
    setSelEnd(value?.end ? ymdUTC(new Date(value.end)) : '');
    setHoverKey('');

    // set default preset & detect current shift for "currentShiftSoFar" (UTC)
    const presetToUse = value?.preset ?? DEFAULT_PRESET;
    setPresetSel(presetToUse);

    if (presetToUse === 'currentShiftSoFar') {
      const pr = makePresetRangeUTC('currentShiftSoFar', new Date(), shifts);
      setShiftSel(pr?.shift || 'ALL'); // auto-focus the active shift (by UTC)
    } else {
      setShiftSel(value?.shift ?? 'ALL');
    }

    setAgg(value?.aggregation ?? 'Average');
    setRtLabel('1 Day');
    setViewMonth(startOfPlantDay(new Date(), shifts));
  };

  const handleClose = () => setOpen(false);

  // calendar behaviour
  const pick = (k) => {
    if (!selStart || (selStart && selEnd)) { setSelStart(k); setSelEnd(''); }
    else { if (new Date(k) < new Date(selStart)) { setSelEnd(selStart); setSelStart(k); } else { setSelEnd(k); } }
  };
  const jumpMonth = (n) => setViewMonth((vm) => addMonths(vm, n));
  const jumpYear = (n) => setViewMonth((vm) => new Date(vm.getFullYear() + n, vm.getMonth(), 1));

  // actions
  const applyHistory = () => {
    if (selStart) {
      const endY = selEnd || selStart;
      const s = new Date(selStart); const e = new Date(endY);
      const days = Math.floor((e - s) / (24 * 3600 * 1000)) + 1;
      const eFinal = days > maxSpanDays ? new Date(s.getTime() + (maxSpanDays - 1) * 24 * 3600 * 1000) : e;
      const { start, end } = rangeWithShift(ymd(s), ymd(eFinal), shiftSel, shifts);
      end.setMilliseconds(999); // inclusive end
      onChange?.({
        start: asUTC(start),        // treat selected wall time as UTC
        end:   asUTC(end),
        shift: shiftSel,
        preset: '',
        aggregation: agg
      });
    } else {
      const chosen = presetSel || DEFAULT_PRESET;
      const pr = makePresetRangeUTC(chosen, new Date(), shifts);
      if (!pr) return;
      const useShift = chosen === 'currentShiftSoFar' ? (pr.shift || shiftSel) : shiftSel;
      // `pr.start` and `pr.end` are already UTC instants
      onChange?.({
        start: pr.start.toISOString(),
        end:   pr.end.toISOString(),
        shift: useShift,
        preset: chosen,
        aggregation: agg
      });
    }
    handleClose();
  };

  const applyRealtime = () => {
    // Use pure UTC instants
    const h = hoursFromLabel(rtLabel);
    const end = new Date(); // now (instant); toISOString() is UTC
    const start = new Date(end.getTime() - h * 3600 * 1000);
    onChange?.({
      start: start.toISOString(),
      end:   end.toISOString(),
      shift: 'ALL',
      preset: `last_${h}h`,
      aggregation: agg
    });
    handleClose();
  };

  const clearAll = () => {
    setSelStart(''); setSelEnd(''); setHoverKey('');
    // reset back to Current Shift – so far (UTC) and auto-detect that shift
    setPresetSel(DEFAULT_PRESET);
    const pr = makePresetRangeUTC('currentShiftSoFar', new Date(), shifts);
    setShiftSel(pr?.shift || 'ALL');

    onChange?.({ start: '', end: '', shift: 'ALL', preset: '', aggregation: agg });
    handleClose();
  };

  /* ---------------- Render ---------------- */
  return (
    <>
      <TextField
        value={display}
        size="small"
        InputProps={{
          readOnly: true,
          startAdornment: <InputAdornment position="start"><CalendarTodayIcon fontSize="small" /></InputAdornment>,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={handleOpen} aria-label="Open date picker">
                <CalendarMonthIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onClick={handleOpen}
        sx={{
          minWidth: 360,
          '& .MuiInputBase-root': {
            borderRadius: 2,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 22px rgba(2,6,23,0.06)',
          },
        }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: 1120,
            maxWidth: '96vw',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 50px 120px rgba(2,6,23,0.35)',
          },
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{
            px: 3, py: 2, color: '#fff',
            background: 'linear-gradient(90deg, #0ea5e9, #2563eb 55%, #7c3aed)',
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: 20, fontWeight: 900, letterSpacing: 0.3 }}>Date Range (UTC)</Typography>

              <Paper elevation={0} sx={{ p: 0.5, borderRadius: 999, display: 'inline-flex', gap: 0.5, bgcolor: 'rgba(255,255,255,0.18)' }}>
                <Button
                  size="small"
                  startIcon={<HistoryIcon fontSize="inherit" />}
                  onClick={() => setMode('history')}
                  sx={{
                    textTransform: 'none', px: 2.2, borderRadius: 999, fontWeight: 900,
                    bgcolor: mode === 'history' ? '#fff' : 'transparent',
                    color: mode === 'history' ? '#111827' : '#fff',
                    '&:hover': { bgcolor: mode === 'history' ? '#e5e7eb' : 'rgba(255,255,255,0.24)' }
                  }}
                >History</Button>
                <Button
                  size="small"
                  startIcon={<BoltIcon fontSize="inherit" />}
                  onClick={() => setMode('realtime')}
                  sx={{
                    textTransform: 'none', px: 2.2, borderRadius: 999, fontWeight: 900,
                    bgcolor: mode === 'realtime' ? '#fff' : 'transparent',
                    color: mode === 'realtime' ? '#111827' : '#fff',
                    '&:hover': { bgcolor: mode === 'realtime' ? '#e5e7eb' : 'rgba(255,255,255,0.24)' }
                  }}
                >Realtime</Button>
              </Paper>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 0.8, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={
                  value?.start && value?.end
                    ? `${new Date(value.start).toLocaleDateString('en-GB', { timeZone: 'UTC' })} – ${new Date(value.end).toLocaleDateString('en-GB', { timeZone: 'UTC' })}`
                    : PRESETS[presetSel]
                }
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }}
              />
              {mode === 'history'
                ? <Chip size="small" label={`Shift ${shiftSel}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }} />
                : <Chip size="small" label={`Window ${rtLabel} • ${agg}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }} />
              }
            </Stack>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <Stack direction="row" sx={{ minHeight: 540 }}>
            {/* LEFT pane */}
            <Box sx={{ flex: 1, p: 2 }}>
              {/* sticky month toolbar */}
              <Paper variant="outlined" sx={{ px: 1, py: 0.6, borderRadius: 2, mb: 1, position: 'sticky', top: 0, zIndex: 1, backdropFilter: 'blur(4px)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title="Prev year"><IconButton size="small" onClick={() => jumpYear(-1)}><KeyboardDoubleArrowLeftIcon fontSize="inherit" /></IconButton></Tooltip>
                    <IconButton size="small" onClick={() => jumpMonth(-1)}><NavigateBeforeIcon fontSize="inherit" /></IconButton>
                  </Stack>

                  <Typography sx={{ fontWeight: 900 }}>Pick days</Typography>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton size="small" onClick={() => jumpMonth(+1)}><NavigateNextIcon fontSize="inherit" /></IconButton>
                    <Tooltip title="Next year"><IconButton size="small" onClick={() => jumpYear(+1)}><KeyboardDoubleArrowRightIcon fontSize="inherit" /></IconButton></Tooltip>
                  </Stack>
                </Stack>
              </Paper>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <MonthCard
                  base={viewMonth}
                  selStart={selStart}
                  selEnd={selEnd}
                  hoverKey={hoverKey}
                  onPick={pick}
                  onHover={setHoverKey}
                />
                <MonthCard
                  base={addMonths(viewMonth, 1)}
                  selStart={selStart}
                  selEnd={selEnd}
                  hoverKey={hoverKey}
                  onPick={pick}
                  onHover={setHoverKey}
                />
              </Stack>
            </Box>

            {/* RIGHT rail */}
            <Box sx={{ width: 340, borderLeft: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, rgba(2,6,23,0.02), rgba(2,6,23,0.04))' }}>
              <Box sx={{ p: 2, pb: 1, flex: 1, overflow: 'auto' }}>
                {mode === 'history' ? (
                  <>
                    <Typography sx={{ fontWeight: 900, mb: 1 }}>Select range</Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                      <Select
                        value={presetSel}
                        onChange={(e) => setPresetSel(e.target.value)}
                        displayEmpty
                        renderValue={(val) => PRESETS[val || DEFAULT_PRESET]}
                      >
                        {Object.entries(PRESETS).map(([k, label]) => (
                          <MenuItem key={k} value={k}>{label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', my: 1, textAlign: 'center' }}>
                      Quick picks
                    </Typography>
                    <Stack direction="column" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap', mb: 1.5 }}>
                      {[
                        { k: 'today', label: 'Today', f: () => [new Date(), new Date()], icon: <TodayIcon fontSize="inherit" /> },
                        { k: 'yesterday', label: 'Yesterday', f: () => { const d = new Date(); d.setUTCDate(d.getUTCDate() - 1); return [d, d]; } },
                        { k: 'last7', label: 'Last 7 days', f: () => { const e = new Date(); const s = new Date(); s.setUTCDate(e.getUTCDate() - 6); return [s, e]; } },
                        { k: 'last30', label: 'Last 30 days', f: () => { const e = new Date(); const s = new Date(); s.setUTCDate(e.getUTCDate() - 29); return [s, e]; } },
                      ].map((q) => (
                        <Chip
                          key={q.k}
                          icon={q.icon ?? null}
                          label={q.label}
                          size="small"
                          onClick={() => { const [s, e] = q.f(); setSelStart(ymd(s)); setSelEnd(ymd(e)); }}
                          sx={{ borderRadius: 999, fontWeight: 800 }}
                          clickable
                        />
                      ))}
                    </Stack>

                    <Divider sx={{ my: 1.25 }} />

                    <Typography sx={{ fontWeight: 900, mb: 0.5, textAlign: 'center' }}>Shift</Typography>
                    <Paper elevation={0} sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, p: 0.5, borderRadius: 999, border: '1px solid', borderColor: 'divider' }}>
                      {['A', 'B', 'C', 'ALL'].map((k) => (
                        <Button
                          key={k}
                          onClick={() => setShiftSel(k)}
                          size="small"
                          sx={{
                            textTransform: 'none', px: 1.6, borderRadius: 999, fontWeight: 900,
                            bgcolor: shiftSel === k ? 'primary.main' : 'transparent',
                            color: shiftSel === k ? '#fff' : 'text.primary',
                          }}
                        >
                          {k}
                        </Button>
                      ))}
                      <Tooltip title="Shift settings">
                        <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ ml: 0.5 }}>
                          <SettingsIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Paper>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontWeight: 900, mb: 1 }}>Realtime window</Typography>
                    <Stack spacing={1}>
                      {RT_CHOICES.map((lbl) => (
                        <Button
                          key={lbl}
                          variant={rtLabel === lbl ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setRtLabel(lbl)}
                          sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                        >
                          {lbl}
                        </Button>
                      ))}
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography sx={{ fontWeight: 900, mb: 0.75, textAlign: 'center' }}>Aggregation</Typography>
                    <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
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

              {/* Actions */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', background: 'rgba(255,255,255,0.86)' }}>
                <Stack direction="row" spacing={1}>
                  <Button onClick={clearAll} color="inherit" size="small" variant="outlined" sx={{ flex: 1 }}>
                    Clear
                  </Button>
                  <Button
                    onClick={mode === 'history' ? applyHistory : applyRealtime}
                    variant="contained"
                    size="small"
                    startIcon={<CalendarMonthIcon fontSize="inherit" />}
                    disabled={mode === 'history' ? !presetSel && !selStart : false}
                    sx={{
                      flex: 1,
                      background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                      '&:hover': { background: 'linear-gradient(90deg, #1d4ed8, #6d28d9)' }
                    }}
                  >
                    Apply
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
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
