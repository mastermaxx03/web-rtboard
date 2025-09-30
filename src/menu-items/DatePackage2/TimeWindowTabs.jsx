import React, { useEffect, useMemo } from 'react';
import { Stack, Tabs, Tab, Typography, TextField, MenuItem, IconButton, Box } from '@mui/material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MonthGrid from './MonthGrid';
import { LAST_WINDOWS, RELATIVE_PRESETS } from './constants';

export default function TimeWindowTabs({
  compact = true,
  mode,
  twType,
  setTwType,
  lastSel,
  setLastSel,
  relSel,
  setRelSel,
  rangeStartYMD,
  rangeEndYMD,
  onPickDay,
  viewMonth,
  // nav handlers provided by DatePackage
  onPrevYear,
  onPrevMonth,
  onNextMonth,
  onNextYear
}) {
  const isRealtime = mode === 'realtime';

  useEffect(() => {
    if (!isRealtime && twType !== 'range') setTwType('range');
    if (isRealtime && twType === 'range') setTwType('last');
  }, [isRealtime, twType, setTwType]);

  const tabs = useMemo(
    () =>
      isRealtime
        ? [
            { key: 'last', label: 'Last' },
            { key: 'relative', label: 'Relative' }
          ]
        : [{ key: 'range', label: 'Range' }],
    [isRealtime]
  );

  const currentIndex = Math.max(
    0,
    tabs.findIndex((t) => t.key === twType)
  );
  const handleTabChange = (_e, idx) => setTwType(tabs[idx].key);

  const realtimeAllowed = new Set([
    'currentShiftSoFar',
    'currentShiftPlusPrevious',
    'currentCalendarDaySoFar',
    'currentZoneSoFar',
    'currentWeekMonSoFar',
    'currentMonthSoFar',
    'currentBillingCycleSoFar',
    'currentQuarterSoFar',
    'currentYearSoFar',
    'allDataSoFar'
  ]);

  return (
    <Stack spacing={compact ? 0.8 : 1.4}>
      <Tabs
        value={currentIndex}
        onChange={handleTabChange}
        variant="standard"
        sx={{
          minHeight: 30,
          '& .MuiTab-root': { minHeight: 30, textTransform: 'none', fontSize: 13, py: 0 }
        }}
      >
        {tabs.map((t) => (
          <Tab key={t.key} label={t.label} />
        ))}
      </Tabs>

      {/* LAST (Realtime only) */}
      {twType === 'last' && isRealtime && (
        <TextField select size="small" label="Duration" value={lastSel} onChange={(e) => setLastSel(e.target.value)}>
          {LAST_WINDOWS.map((w) => (
            <MenuItem key={w.label} value={w.value}>
              {w.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      {/* RANGE (History only) */}
      {!isRealtime && twType === 'range' && (
        <Stack spacing={compact ? 0.8 : 1.2}>
          {/* >>> Moved nav buttons here, before the caption text <<< */}
          <Stack direction="row" alignItems="center">
            {/* Text stays all the way left */}
            <Typography variant="caption" color="text.secondary">
              <b>Pick dates</b>
            </Typography>

            {/* Buttons pushed to the right */}
            <Box sx={{ ml: 'auto' }}>
              <IconButton size="small" onClick={onPrevYear} aria-label="previous year">
                <KeyboardDoubleArrowLeftIcon fontSize="inherit" />
              </IconButton>
              <IconButton size="small" onClick={onPrevMonth} aria-label="previous month">
                <ChevronLeftIcon fontSize="inherit" />
              </IconButton>
              <IconButton size="small" onClick={onNextMonth} aria-label="next month">
                <ChevronRightIcon fontSize="inherit" />
              </IconButton>
              <IconButton size="small" onClick={onNextYear} aria-label="next year">
                <KeyboardDoubleArrowRightIcon fontSize="inherit" />
              </IconButton>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={compact ? 0.8 : 1.2}>
            <MonthGrid base={viewMonth} selStart={rangeStartYMD} selEnd={rangeEndYMD} onPick={onPickDay} compact={compact} />
            <MonthGrid
              base={new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)}
              selStart={rangeStartYMD}
              selEnd={rangeEndYMD}
              onPick={onPickDay}
              compact={compact}
            />
          </Stack>

          {/* Manual typing disabled per your request */}
          <Stack direction="row" spacing={0.8}>
            <TextField size="small" label="From" value={rangeStartYMD} InputProps={{ readOnly: true }} />
            <TextField size="small" label="To" value={rangeEndYMD} InputProps={{ readOnly: true }} />
          </Stack>
        </Stack>
      )}

      {/* RELATIVE (Realtime only) */}
      {twType === 'relative' && isRealtime && (
        <TextField select size="small" label="Preset" value={relSel} onChange={(e) => setRelSel(e.target.value)}>
          {RELATIVE_PRESETS.filter((p) => realtimeAllowed.has(p.key)).map((p) => (
            <MenuItem key={p.key} value={p.key}>
              {p.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
}
