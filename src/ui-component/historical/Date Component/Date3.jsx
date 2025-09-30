// ../Date Component/Date.jsx
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
  Select
} from '@mui/material';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';

/* ---------------- Utilities ---------------- */
const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

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
  return { start, end };
}

function makePresetRange(key, now, shifts) {
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === 'currentDaySoFar') return { start: today0, end: now, label: 'Current Day – so far' };
  if (key === 'currentWeekSoFar') {
    const dow = today0.getDay();
    const start = new Date(today0);
    start.setDate(today0.getDate() - dow);
    return { start, end: now, label: 'Current Week – so far' };
  }
  if (key === 'currentMonthSoFar') return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now, label: 'Current Month – so far' };
  if (key === 'currentQuarterSoFar') {
    const m = Math.floor(now.getMonth() / 3) * 3;
    return { start: new Date(now.getFullYear(), m, 1), end: now, label: 'Current Quarter – so far' };
  }
  if (key === 'currentShiftSoFar') {
    const toMin = (hhmm) => {
      const [h, m] = (hhmm || '00:00').split(':').map(Number);
      return h * 60 + m;
    };
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const order = ['A', 'B', 'C'];
    const segs = order.flatMap((k) => {
      const s = toMin(shifts?.[k]?.start);
      const e = toMin(shifts?.[k]?.end);
      if (e <= s) return [{ k, s, e: 1440 }, { k, s: 0, e }];
      return [{ k, s, e }];
    });
    const hit = segs.find((t) => nowMin >= t.s && nowMin < t.e)?.k || 'A';
    const { start } = rangeWithShift(ymd(today0), ymd(today0), hit, shifts);
    return { start, end: now, label: `Current Shift – so far (${hit})` };
  }
  return null;
}

/* ---------------- Month Grid (with hover preview) ---------------- */
function MonthGrid({ base, selStart, selEnd, hoverKey, onPick, onHover }) {
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

    const preview =
      s && !selEnd && hoverKey
        ? (new Date(key) >= new Date(Math.min(new Date(s), new Date(hoverKey))) &&
           new Date(key) <= new Date(Math.max(new Date(s), new Date(hoverKey))))
        : false;

    const isStart = s && key === s;
    const isEnd = e && key === e && !!selEnd;
    const inSel =
      (s && selEnd && new Date(key) >= new Date(s) && new Date(key) <= new Date(e)) ||
      preview;

    return { d, key, inMonth, isStart, isEnd, inSel, preview };
  });

  return (
    <Box sx={{ width: 336 }}>
      <Typography sx={{ fontWeight: 900, textAlign: 'center', mb: 1, letterSpacing: 0.4 }}>
        {base.toLocaleString(undefined, { month: 'long' })} {base.getFullYear()}
      </Typography>

      <Stack direction="row" justifyContent="space-between" sx={{ px: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <Box key={d} sx={{ width: 40, textAlign: 'center' }}>{d}</Box>
        ))}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.7, px: 1 }}>
        {cells.map((c) => {
          const baseBg = c.inSel
            ? c.preview
              ? 'linear-gradient(180deg, rgba(59,130,246,0.16), rgba(59,130,246,0.1))'
              : 'linear-gradient(180deg, rgba(59,130,246,0.18), rgba(59,130,246,0.12))'
            : 'rgba(255,255,255,0.06)';
          const isEdge = c.isStart || c.isEnd;
          return (
            <Box
              key={c.key}
              role="button"
              aria-label={`Pick ${c.d.toDateString()}`}
              tabIndex={0}
              onClick={() => onPick(c.key)}
              onMouseEnter={() => onHover?.(c.key)}
              onMouseLeave={() => onHover?.('')}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: isEdge ? 900 : 600,
                bgcolor: isEdge ? 'primary.main' : baseBg,
                color: isEdge ? '#fff' : c.inMonth ? 'text.primary' : 'text.disabled',
                border: c.inSel && !isEdge ? '1px dashed rgba(59,130,246,0.35)' : '1px solid rgba(0,0,0,0.04)',
                transition: 'all 140ms',
                boxShadow: isEdge ? '0 0 0 2px rgba(59,130,246,0.35), 0 12px 18px rgba(2,6,23,0.12)' : '0 2px 6px rgba(2,6,23,0.04)',
                '&:hover': { transform: 'translateY(-1px) scale(1.02)', bgcolor: isEdge ? 'primary.dark' : 'action.hover' },
                outline: 'none',
                '&:focus-visible': { boxShadow: '0 0 0 2px rgba(59,130,246,0.6)' }
              }}
            >
              {c.d.getDate()}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/* ---------------- Shift Settings ---------------- */
function ShiftSettingsDialog({ open, onClose, value, onSave }) {
  const [local, setLocal] = useState(value);
  const update = (k, field, val) => setLocal((p) => ({ ...p, [k]: { ...p[k], [field]: val } }));

  const toMin = (hhmm) => {
    if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return NaN;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  const spans = (start, end, k) => {
    const s = toMin(start), e = toMin(end);
    if (Number.isNaN(s) || Number.isNaN(e)) return [];
    if (e <= s) return [{ s, e: 1440, k }, { s: 0, e, k }];
    return [{ s, e, k }];
  };

  const conflicts = useMemo(() => {
    const segs = [
      ...spans(local.A.start, local.A.end, 'A'),
      ...spans(local.B.start, local.B.end, 'B'),
      ...spans(local.C.start, local.C.end, 'C')
    ].sort((a, b) => a.s - b.s);
    const out = [];
    for (let i = 1; i < segs.length; i++) {
      const p = segs[i - 1], c = segs[i];
      if (c.s < p.e) {
        const fmt = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
        out.push(`Shift ${p.k} overlaps Shift ${c.k} between ${fmt(c.s)}–${fmt(p.e)}`);
      }
    }
    return out;
  }, [local]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Shift Settings</DialogTitle>
      <DialogContent dividers>
        {conflicts.length > 0 && (
          <Paper variant="outlined" sx={{ px: 2, py: 1.25, mb: 2, borderColor: 'warning.light', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Conflicting shift times</Typography>
            {conflicts.map((c, i) => (
              <Typography key={i} variant="body2">• {c}</Typography>
            ))}
          </Paper>
        )}
        <Stack spacing={2}>
          {['A', 'B', 'C'].map((k) => (
            <Paper key={k} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField label={`Shift ${k} Label`} size="small" value={local[k].label} onChange={(e) => update(k, 'label', e.target.value)} />
                <TextField label="Start" type="time" size="small" value={local[k].start} onChange={(e) => update(k, 'start', e.target.value)} inputProps={{ step: 60 }} />
                <TextField label="End" type="time" size="small" value={local[k].end} onChange={(e) => update(k, 'end', e.target.value)} inputProps={{ step: 60 }} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={() => onSave(local)} variant="contained" disabled={conflicts.length > 0}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- Main Component ---------------- */
export default function UnifiedDateControls({
  value,
  onChange,
  maxSpanDays = 93,
  aggregationOptions = ['Average', 'Min', 'Max', 'Sum'],
  intervalOptions = ['5 min', '15 min', '30 min', '1 hour'] // compatibility only
}) {
  // shifts persisted locally
  const STORAGE_KEY = 'shift_settings_v1';
  const DEFAULT_SHIFTS = {
    A: { key: 'A', start: '06:00', end: '14:00', label: 'A' },
    B: { key: 'B', start: '14:00', end: '22:00', label: 'B' },
    C: { key: 'C', start: '22:00', end: '06:00', label: 'C' }
  };
  const [shifts, setShifts] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_SHIFTS;
    } catch { return DEFAULT_SHIFTS; }
  });
  const saveShifts = (next) => { setShifts(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {} };

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('history'); // 'history' | 'realtime'

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(() => startOfPlantDay(now, shifts));
  const [selStart, setSelStart] = useState('');
  const [selEnd, setSelEnd] = useState('');
  const [hoverKey, setHoverKey] = useState('');
  const [shiftSel, setShiftSel] = useState('ALL');

  const PRESET_LABELS = {
    currentShiftSoFar: 'Current Shift – so far',
    currentDaySoFar: 'Current Day – so far',
    currentWeekSoFar: 'Current Week – so far',
    currentMonthSoFar: 'Current Month – so far',
    currentQuarterSoFar: 'Current Quarter – so far'
  };

  // 👉 Default preset now “Current Day – so far” (matches the quick chips theme)
  const DEFAULT_PRESET = 'currentDaySoFar';
  const [presetSel, setPresetSel] = useState(value?.preset ?? DEFAULT_PRESET);

  // Realtime only
  const [agg, setAgg] = useState(value?.aggregation ?? 'Average');
  const [rtw, setRtw] = useState('1 day');

  const [settingsOpen, setSettingsOpen] = useState(false);

  const display =
    value?.start && value?.end
      ? `${new Date(value.start).toLocaleDateString('en-GB')} – ${new Date(value.end).toLocaleDateString('en-GB')}`
      : `Preset: ${PRESET_LABELS[value?.preset ?? DEFAULT_PRESET]}`;

  const handleOpen = () => {
    setOpen(true);
    setSelStart(value?.start ? ymd(new Date(value.start)) : '');
    setSelEnd(value?.end ? ymd(new Date(value.end)) : '');
    setHoverKey('');
    setShiftSel(value?.shift ?? 'ALL');
    setPresetSel(value?.preset ?? DEFAULT_PRESET);
    setAgg(value?.aggregation ?? 'Average');
    setViewMonth(startOfPlantDay(new Date(), shifts));
  };
  const handleClose = () => setOpen(false);

  // calendar behaviour
  const pick = (k) => {
    if (!selStart || (selStart && selEnd)) {
      setSelStart(k);
      setSelEnd('');
    } else {
      if (new Date(k) < new Date(selStart)) {
        setSelEnd(selStart);
        setSelStart(k);
      } else {
        setSelEnd(k);
      }
    }
  };
  const jumpMonth = (n) => setViewMonth((vm) => addMonths(vm, n));
  const jumpYear = (n) => setViewMonth((vm) => new Date(vm.getFullYear() + n, vm.getMonth(), 1));

  const selectedDaysCount = (() => {
    if (!selStart) return 0;
    const e = selEnd || selStart;
    return Math.abs(Math.floor((new Date(e) - new Date(selStart)) / (24 * 3600 * 1000))) + 1;
  })();

  // actions
  const applyHistory = () => {
    if (selStart) {
      const endY = selEnd || selStart;
      const s = new Date(selStart);
      const e = new Date(endY);
      const days = Math.floor((e - s) / (24 * 3600 * 1000)) + 1;
      const eFinal = days > maxSpanDays ? new Date(s.getTime() + (maxSpanDays - 1) * 24 * 3600 * 1000) : e;
      const { start, end } = rangeWithShift(ymd(s), ymd(eFinal), shiftSel, shifts);
      onChange?.({ start: start.toISOString(), end: end.toISOString(), shift: shiftSel, preset: '', aggregation: agg });
    } else {
      const chosen = presetSel || DEFAULT_PRESET;
      const pr = makePresetRange(chosen, new Date(), shifts);
      if (!pr) return;
      onChange?.({ start: pr.start.toISOString(), end: pr.end.toISOString(), shift: shiftSel, preset: chosen, aggregation: agg });
    }
    handleClose();
  };

  const applyRealtime = () => {
    const choices = [
      { label: '2 hours', h: 2 },
      { label: '6 hours', h: 6 },
      { label: '12 hours', h: 12 },
      { label: '1 day', h: 24 },
      { label: '7 days', h: 24 * 7 },
      { label: '30 days', h: 24 * 30 }
    ];
    const pick = choices.find((x) => x.label === rtw) || choices[3];
    const end = new Date();
    const start = new Date(end.getTime() - pick.h * 3600 * 1000);
    onChange?.({ start: start.toISOString(), end: end.toISOString(), shift: 'ALL', preset: `last_${pick.label.replace(/\s+/g, '')}`, aggregation: agg });
    handleClose();
  };

  const clearAll = () => {
    setSelStart('');
    setSelEnd('');
    setHoverKey('');
    setShiftSel('ALL');
    setPresetSel(DEFAULT_PRESET);
    onChange?.({ start: '', end: '', shift: 'ALL', preset: '', aggregation: agg });
    handleClose();
  };

  /* ---------------- UI fragments ---------------- */

  const ModeToggle = (
    <Paper elevation={0} sx={{ p: 0.5, borderRadius: 999, display: 'inline-flex', gap: 0.5, background: 'linear-gradient(90deg, rgba(59,130,246,0.18), rgba(139,92,246,0.18))', border: '1px solid rgba(59,130,246,0.35)', boxShadow: '0 10px 24px rgba(2,6,23,0.18)' }}>
      {[
        { k: 'history', label: 'History' },
        { k: 'realtime', label: 'Realtime' }
      ].map((tab) => (
        <Button key={tab.k} onClick={() => setMode(tab.k)} size="small"
          sx={{ textTransform: 'none', px: 2.2, borderRadius: 999, fontWeight: 900, letterSpacing: 0.25, bgcolor: mode === tab.k ? 'primary.main' : 'rgba(255,255,255,0.25)', color: mode === tab.k ? '#fff' : 'text.primary', backdropFilter: 'blur(6px)', transition: 'all 140ms', '&:hover': { transform: 'translateY(-1px)', bgcolor: mode === tab.k ? 'primary.dark' : 'rgba(255,255,255,0.35)' } }}>
          {tab.label}
        </Button>
      ))}
    </Paper>
  );

  const ShiftSegment = (
    <Paper elevation={0} sx={{ display: 'inline-flex', borderRadius: 999, p: 0.25, border: '1px solid rgba(2,6,23,0.12)', background: 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))', backdropFilter: 'blur(4px)' }}>
      {['A', 'B', 'C', 'ALL'].map((k) => {
        const sCfg = shifts[k] || {};
        const tip = k === 'ALL' ? '00:00–23:59' : `${sCfg.start ?? '--:--'}–${sCfg.end ?? '--:--'}`;
        return (
          <Tooltip key={k} title={`Shift ${k}: ${tip}`}>
            <Button onClick={() => setShiftSel(k)} size="small"
              sx={{ textTransform: 'none', px: 1.4, borderRadius: 999, fontWeight: 900, bgcolor: shiftSel === k ? 'primary.main' : 'transparent', color: shiftSel === k ? '#fff' : 'text.primary', '&:hover': { bgcolor: shiftSel === k ? 'primary.dark' : 'grey.100' } }}>
              {k}
            </Button>
          </Tooltip>
        );
      })}
    </Paper>
  );

  // ⬇️ Center the quick chips row
  const QuickChips = (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      {[
        { k: 'today', label: 'Today', f: () => [new Date(), new Date()] },
        { k: 'yesterday', label: 'Yesterday', f: () => { const d = new Date(); d.setDate(d.getDate() - 1); return [d, d]; } },
        { k: 'last7', label: 'Last 7 days', f: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 6); return [s, e]; } },
        { k: 'last30', label: 'Last 30 days', f: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 29); return [s, e]; } }
      ].map((q) => (
        <Chip
          key={q.k}
          label={q.label}
          onClick={() => { const [s, e] = q.f(); setSelStart(ymd(s)); setSelEnd(ymd(e)); }}
          size="small"
          sx={{ borderRadius: 999, fontWeight: 800, bgcolor: 'grey.100', '&:hover': { transform: 'translateY(-1px)' } }}
        />
      ))}
    </Stack>
  );

  /* ---------------- Render ---------------- */
  return (
    <>
      <TextField
        value={display}
        size="small"
        InputProps={{
          readOnly: true,
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
            borderRadius: 2,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 20px rgba(2,6,23,0.06)'
          }
        }}
      />

      {/* Centered modal dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            width: 860,
            maxWidth: '96vw',
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.92))',
            boxShadow: '0 30px 60px rgba(2,6,23,0.35), inset 0 0 0 1px rgba(59,130,246,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {ModeToggle}
            <Stack direction="row" spacing={1} alignItems="center">
              {mode === 'history' && ShiftSegment}
              <Tooltip title="Shift settings">
                <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ border: '1px solid', borderColor: 'grey.300' }}>
                  <SettingsIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </DialogTitle>

        <Divider />

        {/* Content */}
        <DialogContent
          dividers
          sx={{
            pt: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {mode === 'history' ? (
            <>
              <Box sx={{ width: '100%', maxWidth: 980 }}>
                <Typography sx={{ fontWeight: 900, my: 1, letterSpacing: 0.25 }}>Select range</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 1, minWidth: 260 }}>
                  <Select
                    value={presetSel}
                    onChange={(e) => setPresetSel(e.target.value)}
                    displayEmpty
                    renderValue={(val) =>
                      val ? PRESET_LABELS[val] : PRESET_LABELS[DEFAULT_PRESET]
                    }
                  >
                    {Object.entries(PRESET_LABELS).map(([key, label]) => (
                      <MenuItem key={key} value={key}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Paper variant="outlined"
                  sx={{ px: 1, py: 0.6, borderRadius: 2, mb: 1, background: 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.7))' }}>
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

                    <Typography sx={{ fontWeight: 900, letterSpacing: 0.2 }}>Pick days</Typography>

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
              </Box>

              {/* Calendars centered */}
              <Stack direction="row" spacing={3} justifyContent="center" sx={{ width: '100%' }}>
                <MonthGrid
                  base={viewMonth}
                  selStart={selStart}
                  selEnd={selEnd}
                  hoverKey={hoverKey}
                  onPick={pick}
                  onHover={setHoverKey}
                />
                <MonthGrid
                  base={addMonths(viewMonth, 1)}
                  selStart={selStart}
                  selEnd={selEnd}
                  hoverKey={hoverKey}
                  onPick={pick}
                  onHover={setHoverKey}
                />
              </Stack>

              {/* 👇 Quick chips centered */}
              <Box sx={{ width: '100%', maxWidth: 980, mt: 1 }}>
                {QuickChips}
              </Box>
            </>
          ) : (
            <Box sx={{ width: '100%', maxWidth: 980 }}>
              <Typography sx={{ fontWeight: 900, mb: 1, letterSpacing: 0.25 }}>Realtime window</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1, justifyContent: 'center' }}>
                {['2 hours', '6 hours', '12 hours', '1 day', '7 days', '30 days'].map((lbl) => (
                  <Chip key={lbl} label={lbl} clickable onClick={() => setRtw(lbl)}
                    color={rtw === lbl ? 'primary' : 'default'} variant={rtw === lbl ? 'filled' : 'outlined'}
                    sx={{ borderRadius: 999, fontWeight: 900, '&:hover': { transform: 'translateY(-1px)' } }} />
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Stack direction="row" spacing={1} sx={{ width: '100%' }} alignItems="center" justifyContent="space-between">
            <Button onClick={clearAll} color="inherit" size="small" variant="outlined">Clear</Button>
            <Button
              onClick={mode === 'history' ? applyHistory : applyRealtime}
              variant="contained"
              size="small"
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
