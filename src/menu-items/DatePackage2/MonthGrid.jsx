import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { formatYMD } from './utils';

export default function MonthGrid({ base, selStart, selEnd, onPick, compact = true }) {
  const GAP = compact ? 0.35 : 0.6;

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
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, textAlign: 'center', mb: 0.3, fontSize: 14 }}>
        {base.toLocaleString(undefined, { month: 'long' })} {base.getFullYear()}
      </Typography>

      <Stack direction="row" justifyContent="space-between" sx={{ px: 0.25, mb: 0.1, color: 'text.secondary', fontSize: 11 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <Box key={d} sx={{ flex: 1, textAlign: 'center' }}>
            {d}
          </Box>
        ))}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: GAP,
          px: 0.25,
          overflowX: 'hidden'
        }}
      >
        {cells.map((c) => (
          <Box
            key={c.ymd}
            onClick={() => onPick(c.ymd)}
            sx={{
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: 1,
              fontSize: 13,
              lineHeight: 1,
              fontWeight: c.isStart || c.isEnd ? 800 : 500,
              bgcolor: c.isStart || c.isEnd ? 'primary.main' : c.inSel ? 'primary.light' : 'transparent',
              color: c.isStart || c.isEnd ? '#fff' : c.inMonth ? 'text.primary' : 'text.disabled',
              transition: 'background 120ms',
              '&:hover': {
                bgcolor: c.isStart || c.isEnd ? 'primary.main' : c.inSel ? 'primary.light' : 'action.hover'
              }
            }}
          >
            {c.d.getDate()}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
