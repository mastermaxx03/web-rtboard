// src/views/alertLogPage/components/DateRangeField.jsx
import React, { useState } from 'react';
import { Box, Button, IconButton, InputAdornment, Popover, Stack, TextField, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { addMonths, fmtDate, inRange, startOfMonth, toYMD } from '../utils';

/** Month grid used by the range picker (hotel-style two-month) */
function MonthGrid({ base, tmpStart, tmpEnd, onPick }) {
  const monthStart = startOfMonth(base);

  const firstDow = monthStart.getDay(); // 0 = Sun
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - firstDow);

  const cells = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const inMonth = d.getMonth() === base.getMonth();
    const ymd = toYMD(d);
    const isStart = tmpStart && ymd === tmpStart;
    const isEnd = tmpEnd && ymd === tmpEnd;
    const inSel = inRange(ymd, tmpStart, tmpEnd);
    return { d, ymd, inMonth, isStart, isEnd, inSel };
  });

  return (
    <Box sx={{ width: 300 }}>
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
            {new Date(c.d).getDate()}
          </Box>
        ))}
      </Box>
    </Box>
  );
} 

/** Compact single field that opens a hotel-style two-month range picker */
export const DateRangeField = ({ start, end, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tmpStart, setTmpStart] = useState(start || '');
  const [tmpEnd, setTmpEnd] = useState(end || '');
  const [viewMonth, setViewMonth] = useState(start ? startOfMonth(new Date(start)) : startOfMonth(new Date()));

  const open = Boolean(anchorEl);
  const display = `${fmtDate(start)}  –  ${fmtDate(end)}`;

  const handleOpen = (e) => {
    setTmpStart(start || '');
    setTmpEnd(end || '');
    setViewMonth(start ? startOfMonth(new Date(start)) : startOfMonth(new Date()));
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const onPick = (ymd) => {
    if (!tmpStart || (tmpStart && tmpEnd)) {
      setTmpStart(ymd);
      setTmpEnd('');
    } else {
      if (new Date(ymd) < new Date(tmpStart)) {
        setTmpEnd(tmpStart);
        setTmpStart(ymd);
      } else {
        setTmpEnd(ymd);
      }
    }
  };

  const apply = () => {
    onChange({ start: tmpStart, end: tmpEnd || tmpStart });
    handleClose();
  };
  const clear = () => {
    setTmpStart('');
    setTmpEnd('');
    onChange({ start: '', end: '' });
    handleClose();
  };

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
        sx={{ minWidth: 240 }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, borderRadius: 3 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 800 }}>Select Dates</Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => setViewMonth(addMonths(viewMonth, -1))}>
              <ArrowBackIosNewIcon fontSize="inherit" />
            </IconButton>
            <IconButton size="small" onClick={() => setViewMonth(addMonths(viewMonth, +1))}>
              <ArrowForwardIosIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={3}>
          <MonthGrid base={viewMonth} tmpStart={tmpStart} tmpEnd={tmpEnd} onPick={onPick} />
          <MonthGrid base={addMonths(viewMonth, 1)} tmpStart={tmpStart} tmpEnd={tmpEnd} onPick={onPick} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {tmpStart ? new Date(tmpStart).toLocaleDateString('en-GB') : '—'} &nbsp;–&nbsp; {tmpEnd ? new Date(tmpEnd).toLocaleDateString('en-GB') : '—'}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={clear} color="inherit" size="small">
              Clear
            </Button>
            <Button onClick={apply} variant="contained" size="small" disabled={!tmpStart}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};
