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
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Popover,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';

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
    const start = selStart;
    const end = selEnd || selStart;

    const isStart = start && key === start;
    const isEnd = end && key === end;
    const inSel = start && end && new Date(key) >= new Date(start) && new Date(key) <= new Date(end);

    return { d, key, inMonth, isStart, isEnd, inSel };
  });

  return (
    <Box sx={{ width: 336 }}>
      <Typography sx={{ fontWeight: 800, textAlign: 'center', mb: 1.25 }}>
        {base.toLocaleString(undefined, { month: 'long' })} {base.getFullYear()}
      </Typography>

      <Stack direction="row" justifyContent="space-between" sx={{ px: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <Box key={d} sx={{ width: 40, textAlign: 'center' }}>
            {d}
          </Box>
        ))}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.75, px: 1 }}>
        {cells.map((c) => {
          const bg =
            c.isStart || c.isEnd
              ? 'primary.main'
              : c.inSel
              ? 'linear-gradient(180deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.08) 100%)'
              : 'transparent';
          const color = c.isStart || c.isEnd ? '#fff' : c.inMonth ? 'text.primary' : 'text.disabled';
          const ring =
            c.isStart || c.isEnd
              ? '0 0 0 2px rgba(59,130,246,0.35)'
              : c.inSel
              ? '0 0 0 1px rgba(59,130,246,0.18) inset'
              : 'none';

          return (
            <Box
              key={c.key}
              onClick={() => onPick(c.key)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                fontWeight: c.isStart || c.isEnd ? 800 : 500,
                bgcolor: bg,
                color,
                boxShadow: ring,
                transition: 'all 140ms',
                '&:hover': { bgcolor: c.isStart || c.isEnd ? 'primary.dark' : 'action.hover' }
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
    const s = toMin(start),
      e = toMin(end);
    if (Number.isNaN(s) || Number.isNaN(e)) return [];
    if (e <= s) return [{ s, e: 1440, k }, { s: 0, e, k }];
    return [{ s, e, k }];
  };

  const conflicts = useMemo(() => {
    const segs = [...spans(local.A.start, local.A.end, 'A'), ...spans(local.B.start, local.B.end, 'B'), ...spans(local.C.start, local.C.end, 'C')].sort(
      (a, b) => a.s - b.s
    );
    const out = [];
    for (let i = 1; i < segs.length; i++) {
      const p = segs[i - 1],
        c = segs[i];
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
          <Paper
            variant="outlined"
            sx={{ px: 2, py: 1.25, mb: 2, borderColor: 'warning.light', bgcolor: 'warning.light', color: 'warning.contrastText' }}
          >
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Conflicting shift times</Typography>
            {conflicts.map((c, i) => (
              <Typography key={i} variant="body2">
                • {c}
              </Typography>
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
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={() => onSave(local)} variant="contained" disabled={conflicts.length > 0}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- Main Unified Component ---------------- */
export default function UnifiedDateControls({
  value,
  onChange,
  maxSpanDays = 93,
  aggregationOptions = ['Average', 'Min', 'Max', 'Sum'],
  intervalOptions = ['5 min', '15 min', '30 min', '1 hour']
}) {
  // shifts
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
    } catch {
      return DEFAULT_SHIFTS;
    }
  });
  const saveShifts = (next) => {
    setShifts(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  // popover + mode
  const [anchorEl, setAnchorEl] = useState(null);
  const [mode, setMode] = useState('history'); // 'realtime' | 'history'
  const open = Boolean(anchorEl);

  // calendar + controls
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(() => startOfPlantDay(now, shifts));
  const [selStart, setSelStart] = useState('');
  const [selEnd, setSelEnd] = useState('');
  const [shiftSel, setShiftSel] = useState('ALL');

  // preset labeling map
  const PRESET_LABELS = {
    currentShiftSoFar: 'Current Shift – so far',
    currentDaySoFar: 'Current Day – so far',
    currentWeekSoFar: 'Current Week – so far',
    currentMonthSoFar: 'Current Month – so far',
    currentQuarterSoFar: 'Current Quarter – so far'
  };

  // default preset
  const DEFAULT_PRESET = 'currentShiftSoFar';
  const [presetSel, setPresetSel] = useState(value?.preset ?? DEFAULT_PRESET);

  // aggregation + interval
  const [agg, setAgg] = useState(value?.aggregation ?? 'Average');
  const [interval, setInterval] = useState(value?.interval ?? '15 min');

  // Realtime durations
  const quickDurations = [
    { label: '2 hours', hours: 2 },
    { label: '6 hours', hours: 6 },
    { label: '12 hours', hours: 12 },
    { label: '1 day', hours: 24 },
    { label: '7 days', hours: 24 * 7 },
    { label: '30 days', hours: 24 * 30 }
  ];
  const [rtw, setRtw] = useState('1 day');

  // Display in trigger: show preset label if no explicit range yet
  const display =
    value?.start && value?.end
      ? `${new Date(value.start).toLocaleDateString('en-GB')} – ${new Date(value.end).toLocaleDateString('en-GB')}`
      : `Preset: ${PRESET_LABELS[value?.preset ?? DEFAULT_PRESET]}`;

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setSelStart(value?.start ? ymd(new Date(value.start)) : '');
    setSelEnd(value?.end ? ymd(new Date(value.end)) : '');
    setShiftSel(value?.shift ?? 'ALL');
    setPresetSel(value?.preset ?? DEFAULT_PRESET);
    setAgg(value?.aggregation ?? 'Average');
    setInterval(value?.interval ?? '15 min');
    setViewMonth(startOfPlantDay(new Date(), shifts));
  };
  const handleClose = () => setAnchorEl(null);

  // calendar logic
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

  // apply history
  const applyHistory = () => {
    if (!selStart) return;
    const endY = selEnd || selStart;
    const s = new Date(selStart);
    const e = new Date(endY);
    const days = Math.floor((e - s) / (24 * 3600 * 1000)) + 1;
    const eFinal = days > maxSpanDays ? new Date(s.getTime() + (maxSpanDays - 1) * 24 * 3600 * 1000) : e;
    const { start, end } = rangeWithShift(ymd(s), ymd(eFinal), shiftSel, shifts);

    onChange?.({
      start: start.toISOString(),
      end: end.toISOString(),
      shift: shiftSel,
      preset: '',
      aggregation: agg,
      interval
    });
    handleClose();
  };

  const clearAll = () => {
    setSelStart('');
    setSelEnd('');
    setPresetSel(DEFAULT_PRESET);
    setShiftSel('ALL');
    onChange?.({ start: '', end: '', shift: 'ALL', preset: '', aggregation: agg, interval });
    handleClose();
  };

  // presets
  const onPreset = (val) => {
    setPresetSel(val);
    if (!val) return;
    const pr = makePresetRange(val, new Date(), shifts);
    onChange?.({
      start: pr.start.toISOString(),
      end: pr.end.toISOString(),
      shift: 'ALL',
      preset: val,
      aggregation: agg,
      interval
    });
    handleClose();
  };

  // realtime
  const applyRealtime = () => {
    const picked = quickDurations.find((d) => d.label === rtw) || quickDurations[3];
    const end = new Date();
    const start = new Date(end.getTime() - picked.hours * 3600 * 1000);
    onChange?.({
      start: start.toISOString(),
      end: end.toISOString(),
      shift: 'ALL',
      preset: `last_${picked.label.replace(/\s+/g, '')}`,
      aggregation: agg,
      interval
    });
    handleClose();
  };

  // header
  const Header = (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      <Paper elevation={0} sx={{ p: 0.5, borderRadius: 999, border: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50', display: 'inline-flex', gap: 0.5 }}>
        {[
          { key: 'realtime', label: 'Realtime' },
          { key: 'history', label: 'History' }
        ].map((tab) => (
          <Button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            size="small"
            sx={{
              textTransform: 'none',
              px: 2,
              borderRadius: 999,
              fontWeight: 800,
              boxShadow: mode === tab.key ? '0 2px 10px rgba(59,130,246,0.25)' : 'none',
              bgcolor: mode === tab.key ? 'primary.main' : 'transparent',
              color: mode === tab.key ? '#fff' : 'text.primary',
              '&:hover': { bgcolor: mode === tab.key ? 'primary.dark' : 'grey.200' }
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Paper>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        {mode === 'history' && (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <Select
              value={presetSel}                                   
              onChange={(e) => onPreset(e.target.value)}
              renderValue={(val) => `Preset: ${PRESET_LABELS[val] || '—'}`}
            >
              {/* No empty item → a preset label always shows */}
              <MenuItem value="currentShiftSoFar">Current Shift – so far</MenuItem>
              <MenuItem value="currentDaySoFar">Current Day – so far</MenuItem>
              <MenuItem value="currentWeekSoFar">Current Week – so far</MenuItem>
              <MenuItem value="currentMonthSoFar">Current Month – so far</MenuItem>
              <MenuItem value="currentQuarterSoFar">Current Quarter – so far</MenuItem>
            </Select>
          </FormControl>
        )}

        {mode === 'history' && (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={shiftSel} onChange={(e) => setShiftSel(e.target.value)} startAdornment={<TuneIcon sx={{ mr: 1 }} />}>
              {['A', 'B', 'C', 'ALL'].map((s) => (
                <MenuItem key={s} value={s}>
                  Shift {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Tooltip title="Shift settings">
          <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ border: '1px solid', borderColor: 'grey.300' }}>
            <SettingsIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );

  // footer
  const Footer = (applyAction) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
      <Paper elevation={0} sx={{ px: 2, py: 0.85, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 800, border: '1px solid', borderColor: 'primary.main', opacity: 0.9 }}>
        {mode === 'history' ? (
          <Typography sx={{ fontWeight: 800 }}>
            {selStart ? new Date(selStart).toLocaleDateString('en-GB') : '—'} &nbsp;–&nbsp;{' '}
            {selEnd ? new Date(selEnd).toLocaleDateString('en-GB') : selStart ? new Date(selStart).toLocaleDateString('en-GB') : '—'} &nbsp;
            {shiftSel ? `(Shift ${shiftSel})` : ''}
          </Typography>
        ) : (
          <Typography sx={{ fontWeight: 800 }}>Last: {rtw} • Agg: {agg}</Typography>
        )}
      </Paper>

      <Stack direction="row" spacing={1}>
        <Button onClick={clearAll} color="inherit" size="small" variant="outlined">
          Clear
        </Button>
        <Button onClick={applyAction} variant="contained" size="small" disabled={mode === 'history' ? !selStart : false}>
          Apply
        </Button>
      </Stack>
    </Stack>
  );

  // quick chips (history)
  const QuickChips = (
    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
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
          sx={{ borderRadius: 999, fontWeight: 700, bgcolor: 'grey.100' }}
        />
      ))}
    </Stack>
  );

  // render
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <TextField
        value={display}
        size="small"
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={handleOpen}>
                <CalendarMonthIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        onClick={handleOpen}
        sx={{ minWidth: 300 }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, borderRadius: 3, width: 760, maxWidth: 'calc(100vw - 24px)', boxShadow: '0 22px 60px rgba(12,21,47,0.2)' } }}
      >
        {Header}
        <Divider sx={{ mb: 2 }} />

        {mode === 'history' ? (
          <Stack spacing={1.25}>
            {/* month navigation bar */}
            <Paper variant="outlined" sx={{ px: 1, py: 0.75, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Tooltip title="Previous year"><IconButton size="small" onClick={() => jumpYear(-1)}><KeyboardDoubleArrowLeftIcon fontSize="inherit" /></IconButton></Tooltip>
                  <IconButton size="small" onClick={() => jumpMonth(-1)}><NavigateBeforeIcon fontSize="inherit" /></IconButton>
                </Stack>

                <Typography sx={{ fontWeight: 800, letterSpacing: 0.2 }}>Select a date range</Typography>

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <IconButton size="small" onClick={() => jumpMonth(+1)}><NavigateNextIcon fontSize="inherit" /></IconButton>
                  <Tooltip title="Next year"><IconButton size="small" onClick={() => jumpYear(+1)}><KeyboardDoubleArrowRightIcon fontSize="inherit" /></IconButton></Tooltip>
                </Stack>
              </Stack>
            </Paper>

            {QuickChips}

            <Stack direction="row" spacing={3}>
              <MonthGrid base={viewMonth} selStart={selStart} selEnd={selEnd} onPick={pick} />
              <MonthGrid base={addMonths(viewMonth, 1)} selStart={selStart} selEnd={selEnd} onPick={pick} />
            </Stack>
          </Stack>
        ) : (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            {/* Time window */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>Time window</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
              {['2 hours', '6 hours', '12 hours', '1 day', '7 days', '30 days'].map((label) => (
                <Chip
                  key={label}
                  label={label}
                  clickable
                  onClick={() => setRtw(label)}
                  color={rtw === label ? 'primary' : 'default'}
                  sx={{ borderRadius: 999, fontWeight: 700 }}
                  variant={rtw === label ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>

            {/* Aggregation for realtime */}
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: 800 }}>Aggregation</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {['Average', 'Min', 'Max', 'Sum'].map((label) => (
                <Chip
                  key={label}
                  label={label}
                  clickable
                  onClick={() => setAgg(label)}
                  color={agg === label ? 'primary' : 'default'}
                  variant={agg === label ? 'filled' : 'outlined'}
                  sx={{ borderRadius: 999, fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Paper>
        )}

        {Footer(mode === 'history' ? applyHistory : applyRealtime)}
      </Popover>

      <ShiftSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} value={shifts} onSave={(n) => (saveShifts(n), setSettingsOpen(false))} />
    </>
  );
}
