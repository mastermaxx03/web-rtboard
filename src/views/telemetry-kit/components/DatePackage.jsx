import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';

import { useShiftSettings } from './ShiftSettingsContext';
import { clampTo3Months, fmtDate, formatYMD, presetRange, rangeWithShift, startOfPlantDay } from './date-utils';

/** Month Grid (hotel style) */
function MonthGrid({ base, selStart, selEnd, onPick }) {
  const monthStart = new Date(base.getFullYear(), base.getMonth(), 1);
  const firstDow = monthStart.getDay();
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - firstDow);

  const cells = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const inMonth = d.getMonth() === base.getMonth();
    const ymd = formatYMD(d);
    const isStart = selStart && ymd === selStart;
    const isEnd = selEnd && ymd === selEnd;
    const inSel =
      selStart &&
      selEnd &&
      new Date(ymd).setHours(0, 0, 0, 0) >= new Date(selStart).setHours(0, 0, 0, 0) &&
      new Date(ymd).setHours(0, 0, 0, 0) <= new Date(selEnd).setHours(0, 0, 0, 0);

    return { d, ymd, inMonth, isStart, isEnd, inSel };
  });

  return (
    <Box sx={{ width: 316 }}>
      <Typography sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
        {base.toLocaleString(undefined, { month: 'long' })} {base.getFullYear()}
      </Typography>

      <Stack direction="row" justifyContent="space-between" sx={{ px: 1, mb: 0.5, color: 'text.secondary', fontSize: 12 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <Box key={d} sx={{ width: 36, textAlign: 'center' }}>
            {d}
          </Box>
        ))}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, px: 1 }}>
        {cells.map((c) => (
          <Box
            key={c.ymd}
            onClick={() => onPick(c.ymd)}
            sx={{
              width: 36,
              height: 36,
              lineHeight: '36px',
              textAlign: 'center',
              cursor: 'pointer',
              borderRadius: 1,
              fontWeight: c.isStart || c.isEnd ? 800 : 500,
              bgcolor: c.isStart || c.isEnd ? 'primary.main' : c.inSel ? 'primary.light' : 'transparent',
              color: c.isStart || c.isEnd ? '#fff' : c.inMonth ? 'text.primary' : 'text.disabled',
              transition: 'background 120ms',
              '&:hover': { bgcolor: c.isStart || c.isEnd ? 'primary.main' : c.inSel ? 'primary.light' : 'action.hover' }
            }}
          >
            {c.d.getDate()}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Shift settings dialog (conflict check built-in) */
function ShiftSettingsDialog({ open, onClose }) {
  const { shifts, setShifts } = useShiftSettings();
  const [local, setLocal] = useState(shifts);

  const update = (k, field, val) => setLocal((p) => ({ ...p, [k]: { ...p[k], [field]: val } }));

  const toMin = (hhmm) => {
    if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return NaN;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  const segmentsFrom = (start, end, key) => {
    const s = toMin(start);
    const e = toMin(end);
    if (Number.isNaN(s) || Number.isNaN(e)) return [];
    if (e <= s)
      return [
        { s, e: 1440, key },
        { s: 0, e, key }
      ]; // overnight
    return [{ s, e, key }];
  };
  const conflicts = (() => {
    const segs = [
      ...segmentsFrom(local.A.start, local.A.end, 'A'),
      ...segmentsFrom(local.B.start, local.B.end, 'B'),
      ...segmentsFrom(local.C.start, local.C.end, 'C')
    ].sort((a, b) => a.s - b.s);
    const list = [];
    for (let i = 1; i < segs.length; i++) {
      const prev = segs[i - 1];
      const cur = segs[i];
      if (cur.s < prev.e) {
        const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        list.push(`Shift ${prev.key} overlaps Shift ${cur.key} between ${fmt(cur.s)}–${fmt(prev.e)}`);
      }
    }
    return list;
  })();
  const hasConflicts = conflicts.length > 0;

  const save = () => {
    if (hasConflicts) return;
    setShifts(local);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Shift Settings</DialogTitle>
      <DialogContent dividers>
        {hasConflicts && (
          <Paper
            variant="outlined"
            sx={{ px: 2, py: 1.2, mb: 2, borderColor: 'warning.light', bgcolor: 'warning.light', color: 'warning.contrastText' }}
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
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1">Shift {k}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Label used in filters and exports
                  </Typography>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    label="Display Label"
                    size="small"
                    value={local[k].label}
                    onChange={(e) => update(k, 'label', e.target.value)}
                    sx={{ minWidth: 160 }}
                  />
                  <TextField
                    label="Start Time"
                    type="time"
                    size="small"
                    value={local[k].start}
                    onChange={(e) => update(k, 'start', e.target.value)}
                    inputProps={{ step: 60 }}
                    sx={{ minWidth: 140 }}
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    size="small"
                    value={local[k].end}
                    onChange={(e) => update(k, 'end', e.target.value)}
                    inputProps={{ step: 60 }}
                    sx={{ minWidth: 140 }}
                  />
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={save} disabled={hasConflicts}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Main Date Package (presets + range picker) */
export default function DatePackage({ start, end, onChange }) {
  const { shifts } = useShiftSettings();

  const [anchorEl, setAnchorEl] = useState(null);
  const [viewMonth, setViewMonth] = useState(() => startOfPlantDay(new Date(), shifts));
  const [selStart, setSelStart] = useState('');
  const [selEnd, setSelEnd] = useState('');
  const [shiftSel, setShiftSel] = useState('ALL');
  const [presetSel, setPresetSel] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const open = Boolean(anchorEl);
  const display = `${fmtDate(start)}  –  ${fmtDate(end)}`;

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const jumpMonth = (n) => setViewMonth((vm) => new Date(vm.getFullYear(), vm.getMonth() + n, 1));
  const jumpYear = (n) => setViewMonth((vm) => new Date(vm.getFullYear() + n, vm.getMonth(), 1));

  // two-click range selection
  const pick = (ymd) => {
    const d = clampTo3Months(new Date(ymd));
    const ymdC = formatYMD(d);

    if (!selStart || (selStart && selEnd)) {
      setSelStart(ymdC);
      setSelEnd('');
    } else {
      if (new Date(ymdC).getTime() < new Date(selStart).getTime()) {
        setSelEnd(selStart);
        setSelStart(ymdC);
      } else {
        setSelEnd(ymdC || selStart);
      }
    }
  };

  const applyRange = () => {
    if (!selStart) return;
    const endYMD = selEnd || selStart;

    const r = rangeWithShift(selStart, endYMD, shiftSel, shifts);

    onChange?.({
      start: new Date(r.start).toISOString(),
      end: new Date(r.end).toISOString(),
      label: `${new Date(selStart).toLocaleDateString()}–${new Date(endYMD).toLocaleDateString()} (${shiftSel})`,
      meta:
        shiftSel === 'ALL'
          ? null
          : {
              preset: presetSel || 'customRange',
              shift: shiftSel,
              startYMD: selStart,
              endYMD,
              shiftStart: shifts[shiftSel].start,
              shiftEnd: shifts[shiftSel].end
            }
    });
    handleClose();
  };

  const clear = () => {
    setSelStart('');
    setSelEnd('');
    setPresetSel('');
    setShiftSel('ALL');
    onChange?.({ start: '', end: '', label: '', meta: null });
    handleClose();
  };

  const onPresetChange = (val) => {
    setPresetSel(val);
    if (!val) return;
    const now = new Date();
    const r = presetRange(val, now, shifts);
    onChange?.({
      start: r.start.toISOString(),
      end: r.end.toISOString(),
      label: r.label,
      meta: { preset: val, shift: 'ALL' }
    });
    handleClose();
  };

  const Header = (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 1 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ fontWeight: 800 }}>Select Dates</Typography>
        <Tooltip title="Shift settings">
          <IconButton size="small" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Select
            displayEmpty
            value={presetSel}
            onChange={(e) => onPresetChange(e.target.value)}
            renderValue={(val) =>
              val
                ? {
                    currentShiftSoFar: 'Preset: Current Shift – so far',
                    currentDaySoFar: 'Preset: Current Day – so far',
                    currentWeekSoFar: 'Preset: Current Week – so far',
                    currentMonthSoFar: 'Preset: Current Month – so far',
                    currentQuarterSoFar: 'Preset: Current Quarter – so far'
                  }[val]
                : 'Presets…'
            }
          >
            <MenuItem value="">
              <em>Presets…</em>
            </MenuItem>
            <MenuItem value="currentShiftSoFar">Current Shift – so far</MenuItem>
            <MenuItem value="currentDaySoFar">Current Day – so far</MenuItem>
            <MenuItem value="currentWeekSoFar">Current Week – so far</MenuItem>
            <MenuItem value="currentMonthSoFar">Current Month – so far</MenuItem>
            <MenuItem value="currentQuarterSoFar">Current Quarter – so far</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={shiftSel} onChange={(e) => setShiftSel(e.target.value)} startAdornment={<TuneIcon sx={{ mr: 1 }} />}>
            {['A', 'B', 'C', 'ALL'].map((s) => (
              <MenuItem key={s} value={s}>
                Shift {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', sm: 'block' } }} />

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Previous year">
            <IconButton size="small" onClick={() => jumpYear(-1)}>
              «
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => jumpMonth(-1)}>
            <ArrowBackIosNewIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={() => jumpMonth(+1)}>
            <ArrowForwardIosIcon fontSize="inherit" />
          </IconButton>
          <Tooltip title="Next year">
            <IconButton size="small" onClick={() => jumpYear(+1)}>
              »
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );

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
        sx={{ minWidth: 260 }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, borderRadius: 3, width: 720 } }}
      >
        {/* Header */}
        {Header}

        {/* Calendar body */}
        <Stack direction="row" spacing={3}>
          <MonthGrid base={viewMonth} selStart={selStart} selEnd={selEnd} onPick={pick} />
          <MonthGrid
            base={new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)}
            selStart={selStart}
            selEnd={selEnd}
            onPick={pick}
          />
        </Stack>

        {/* Footer */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
          <Paper elevation={0} sx={{ px: 2, py: 0.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 700 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {selStart ? new Date(selStart).toLocaleDateString() : '—'} &nbsp;–&nbsp;{' '}
              {selEnd ? new Date(selEnd).toLocaleDateString() : selStart ? new Date(selStart).toLocaleDateString() : '—'} &nbsp;(
              {shiftSel})
            </Typography>
          </Paper>

          <Stack direction="row" spacing={1}>
            <Button onClick={clear} color="inherit" size="small">
              Clear
            </Button>
            <Button onClick={applyRange} variant="contained" size="small" disabled={!selStart}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>

      <ShiftSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
