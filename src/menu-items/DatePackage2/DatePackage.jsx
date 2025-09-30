import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { useShifts } from './ShiftSettingsContext';
import { useZones } from './ZoneSettingsContext';
import TimeWindowTabs from './TimeWindowTabs';
import AggregationControls from './AggregationControls';
import { LAST_WINDOWS } from './constants';
import {
  rangeWithShift,
  windowsForShiftRange,
  zoneWindowsForRange,
  presetRange,
  startOfPlantDay,
  addOffset,
  listTimeZones,
  offsetForZone,
  formatYMD
} from './utils';
import ShiftSettingsDialog from './ShiftSettingsDialog';
import ZoneSettingsDialog from './ZoneSettingsDialog';

// strict local-day bound helpers
const startOfLocalDayISO = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
};
const endOfLocalDayISO = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
};

export default function DatePackage({ start, end, onChange }) {
  const { shifts } = useShifts();
  const { zones, billingCycleDay } = useZones();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const display = `${start ? new Date(start).toLocaleDateString('en-GB') : '—'} – ${end ? new Date(end).toLocaleDateString('en-GB') : '—'}`;

  // Modes & tabs
  const [mode, setMode] = useState('history');
  const [twType, setTwType] = useState('range');

  // Time zone
  const tzOptions = useMemo(() => listTimeZones(), []);
  const [timeZone, setTimeZone] = useState('Browser Time');
  const tzString = offsetForZone(timeZone);

  // Last / Relative
  const [lastSel, setLastSel] = useState(LAST_WINDOWS[0].value);
  const [relSel, setRelSel] = useState('currentShiftSoFar');

  // Range
  const [viewMonth, setViewMonth] = useState(() => startOfPlantDay(new Date(), shifts));
  const [rangeStartYMD, setRangeStartYMD] = useState('');
  const [rangeEndYMD, setRangeEndYMD] = useState('');

  // Agg / grouping / shift / zone
  const [aggregation, setAggregation] = useState('none');
  const [groupMin, setGroupMin] = useState(0);
  const [shiftSel, setShiftSel] = useState('ALL');
  const defaultZoneKey = 'ALL';
  const [zoneSel, setZoneSel] = useState(defaultZoneKey);

  // unified settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [zoneSettingsOpen, setZoneSettingsOpen] = useState(false); // compat

  // mode → tabs mapping
  useEffect(() => {
    if (mode === 'realtime' && twType === 'range') setTwType('last');
    if (mode === 'history') setTwType('range');
  }, [mode, twType]);

  const onPickDay = (ymd) => {
    if (!rangeStartYMD || (rangeStartYMD && rangeEndYMD)) {
      setRangeStartYMD(ymd);
      setRangeEndYMD('');
    } else {
      if (new Date(ymd) < new Date(rangeStartYMD)) {
        setRangeEndYMD(rangeStartYMD);
        setRangeStartYMD(ymd);
      } else {
        setRangeEndYMD(ymd);
      }
    }
  };

  const zoneLabel = (k) => (k === 'ALL' ? 'All Zones' : zones[k]?.label || k);

  const footerLabel = useMemo(() => {
    if (twType === 'last') {
      return `Last ${lastSel.count} ${lastSel.unit}${lastSel.count > 1 ? 's' : ''} • Shift ${shiftSel} • ${zoneLabel(zoneSel)}`;
    }
    if (twType === 'relative') {
      const map = {
        currentShiftSoFar: 'Current shift – so far',
        currentShiftPlusPrevious: 'Current shift + previous shift',
        currentCalendarDaySoFar: 'Current day (00:00 → now)',
        currentZoneSoFar: 'Current zone – so far',
        currentWeekMonSoFar: 'Current week – so far (Mon - Sun)',
        currentMonthSoFar: 'Current month – so far',
        currentBillingCycleSoFar: 'Current billing cycle – so far',
        currentQuarterSoFar: 'Current quarter – so far',
        currentYearSoFar: 'Current year – so far',
        allDataSoFar: 'All data – so far'
      };
      return `${map[relSel] || relSel} • Shift ${shiftSel} • ${zoneLabel(zoneSel)}`;
    }
    if (twType === 'range') {
      const s = rangeStartYMD ? new Date(rangeStartYMD).toLocaleDateString('en-GB') : '—';
      const e = rangeEndYMD || rangeStartYMD ? new Date(rangeEndYMD || rangeStartYMD).toLocaleDateString('en-GB') : '—';
      return `${s} – ${e} • Shift ${shiftSel} • ${zoneLabel(zoneSel)}`;
    }
    return '—';
  }, [twType, lastSel, relSel, rangeStartYMD, rangeEndYMD, shiftSel, zoneSel, zones]);

  const disabledApply = mode === 'history' && twType === 'range' && !rangeStartYMD;

  const computeWindowsForSpan = (startISO, endISO) => {
    const sY = formatYMD(new Date(startISO));
    const eY = formatYMD(new Date(endISO));
    const windows = windowsForShiftRange(sY, eY, shiftSel, shifts);
    const zoneWindows = zoneSel === 'ALL' ? [] : zoneWindowsForRange(sY, eY, zoneSel, zones);
    return { windows, zoneWindows };
  };

  const apply = () => {
    const now = new Date();
    let startISO = '',
      endISO = '';
    let windows = null,
      zoneWindows = null;

    if (twType === 'last') {
      endISO = now.toISOString();
      startISO = addOffset(now, { count: -lastSel.count, unit: lastSel.unit }).toISOString();
      ({ windows, zoneWindows } = computeWindowsForSpan(startISO, endISO));
    } else if (twType === 'relative') {
      const r = presetRange(relSel, now, shifts, { zones, zoneKey: zoneSel, billingCycleDay });
      startISO = r.start.toISOString();
      endISO = r.end.toISOString();
      ({ windows, zoneWindows } = computeWindowsForSpan(startISO, endISO));
    } else {
      const endYMD = rangeEndYMD || rangeStartYMD;
      startISO = startOfLocalDayISO(rangeStartYMD);
      endISO = endOfLocalDayISO(endYMD);
      windows = windowsForShiftRange(rangeStartYMD, endYMD, shiftSel, shifts);
      zoneWindows = zoneSel === 'ALL' ? [] : zoneWindowsForRange(rangeStartYMD, endYMD, zoneSel, zones);
    }

    onChange?.({
      mode,
      time_window_type: twType,
      time_zone: timeZone,
      tz_display: tzString,
      start: startISO,
      end: endISO,
      last: twType === 'last' ? { ...lastSel } : null,
      relative: twType === 'relative' ? { kind: relSel } : null,
      range_days: twType === 'range' ? { startYMD: rangeStartYMD, endYMD: rangeEndYMD || rangeStartYMD } : null,
      windows,
      zone_windows: zoneWindows,
      aggregation,
      group_interval_min: groupMin,
      shift: shiftSel,
      zone: zoneSel,
      billingCycleDay
    });

    setAnchorEl(null);
  };

  const clearAll = () => {
    setMode('history');
    setTwType('range');
    setTimeZone('Browser Time');
    setViewMonth(startOfPlantDay(new Date(), shifts));
    setRangeStartYMD('');
    setRangeEndYMD('');
    setRelSel('currentShiftSoFar');
    setAggregation('avg');
    setGroupMin(0);
    setShiftSel('ALL');
    setZoneSel(defaultZoneKey);
    onChange?.({ start: '', end: '', label: '', meta: null, windows: null, zone_windows: null, zone: '', shift: '' });
  };

  // month/year jumps moved into MonthGrid via handlers below
  const jumpMonth = (n) => setViewMonth((vm) => new Date(vm.getFullYear(), vm.getMonth() + n, 1));
  const jumpYear = (n) => setViewMonth((vm) => new Date(vm.getFullYear() + n, vm.getMonth(), 1));

  // Header: shift chips moved to the far right; removed old nav + tz text
  const Header = (
    <Box
      sx={(t) => ({
        position: 'sticky',
        top: 0,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 0.25,
        p: 0.4,
        borderRadius: 2,
        bgcolor: alpha(t.palette.primary.main, 0.06)
      })}
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={(_, v) => v && setMode(v)}
        sx={{ '& .MuiToggleButton-root': { borderRadius: 999, px: 1.3, textTransform: 'none' } }}
      >
        <ToggleButton value="realtime">Realtime</ToggleButton>
        <ToggleButton value="history">History</ToggleButton>
      </ToggleButtonGroup>

      {/* pushed to the extreme right as requested */}
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Chip size="small" label={`Shift ${shiftSel}`} />
        <Chip size="small" label={zoneLabel(zoneSel)} />
      </Stack>
    </Box>
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
              <IconButton size="small" edge="end" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <CalendarMonthIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ minWidth: 260 }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            p: 0.75,
            borderRadius: 2.5,
            width: 'min(92vw, 760px)',
            maxWidth: '92vw',
            maxHeight: '78vh',
            overflow: 'hidden',
            zIndex: 1305
          }
        }}
      >
        {Header}

        <Box sx={{ maxHeight: 'calc(78vh - 44px)', overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) 320px' },
              columnGap: 0.75,
              rowGap: 0.75,
              minHeight: 0
            }}
          >
            <Box sx={{ minHeight: 0, overflow: 'auto', pr: { md: 0.5 } }}>
              <TimeWindowTabs
                compact
                mode={mode}
                twType={twType}
                setTwType={setTwType}
                lastSel={lastSel}
                setLastSel={setLastSel}
                relSel={relSel}
                setRelSel={setRelSel}
                rangeStartYMD={rangeStartYMD}
                rangeEndYMD={rangeEndYMD}
                onPickDay={onPickDay}
                viewMonth={viewMonth}
                // NEW: pass jump handlers to MonthGrid
                onPrevYear={() => jumpYear(-1)}
                onPrevMonth={() => jumpMonth(-1)}
                onNextMonth={() => jumpMonth(+1)}
                onNextYear={() => jumpYear(+1)}
              />
            </Box>

            <Box sx={{ minHeight: 0, overflow: 'auto', pl: { md: 0.5 } }}>
              <AggregationControls
                compact
                tzString={tzString}
                timeZone={timeZone}
                setTimeZone={setTimeZone}
                tzOptions={tzOptions}
                aggregation={aggregation}
                setAggregation={setAggregation}
                groupMin={groupMin}
                setGroupMin={setGroupMin}
                shiftSel={shiftSel}
                setShiftSel={setShiftSel}
                zoneSel={zoneSel}
                setZoneSel={setZoneSel}
                onOpenShiftSettings={() => setSettingsOpen(true)}
                onOpenZoneSettings={() => setZoneSettingsOpen(true)}
                onApply={apply}
                onCancel={() => setAnchorEl(null)}
                onClear={clearAll}
                disabled={disabledApply}
                footerLabel={footerLabel}
              />
            </Box>
          </Box>
        </Box>
      </Popover>

      {/* unified dialog entrypoints */}
      <ShiftSettingsDialog
        open={settingsOpen || zoneSettingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setZoneSettingsOpen(false);
        }}
      />
      <ZoneSettingsDialog open={false} onClose={() => {}} />
    </>
  );
}
