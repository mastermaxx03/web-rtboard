import React from 'react';
import { Box, Stack, FormControl, InputLabel, Select, MenuItem, Tooltip, IconButton, Switch } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DatePackage from '../date/DatePackage';
import { ShiftSettingsProvider } from '../date/ShiftSettingsContext';

const DEFAULT_WINDOWS = [
  { key: 0, label: 'RT Data' },
  { key: 15, label: 'Average of 15 min' },
  { key: 30, label: 'Average of 30 min' },
  { key: 60, label: 'Average of 1 hr' },
  { key: 240, label: 'Average of 4 hr' },
  { key: 480, label: 'Average of 8 hr' },
  { key: 1440, label: 'Average of 24 hr' }
];

export default function Controls({
  start,
  end,
  onDateChange,
  agg,
  onAggChange,
  onRefresh,
  autoRefresh,
  onToggleAutoRefresh,
  sticky = true,
  aggWindows = DEFAULT_WINDOWS
}) {
  return (
    <ShiftSettingsProvider>
      <Box
        sx={{
          position: sticky ? 'sticky' : 'relative',
          top: sticky ? 90 : 'auto',
          zIndex: 120,
          bgcolor: '#F5F7FB',
          border: '1px solid #E6EAF2',
          borderRadius: 3,
          px: 2,
          py: 1.25
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.25} flexWrap="wrap" justifyContent="flex-end">
          <DatePackage start={start} end={end} onChange={onDateChange} />

          <FormControl size="small" sx={{ minWidth: 210 }}>
            <InputLabel id="rtw4-agg">Aggregation</InputLabel>
            <Select labelId="rtw4-agg" label="Aggregation" value={agg} onChange={(e) => onAggChange(Number(e.target.value))}>
              {aggWindows.map((o) => (
                <MenuItem key={o.key} value={o.key}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Refresh now">
            <span>
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={autoRefresh ? 'Auto-refresh ON (40s)' : 'Auto-refresh OFF'}>
            <Switch size="small" checked={autoRefresh} onChange={(e) => onToggleAutoRefresh?.(e.target.checked)} />
          </Tooltip>
        </Stack>
      </Box>
    </ShiftSettingsProvider>
  );
}
