import React, { useMemo, useRef, useState } from 'react';
import { Autocomplete, Button, Divider, MenuItem, Popover, Stack, TextField, Typography } from '@mui/material';
import { AGGREGATIONS, GROUPING_INTERVALS_MIN } from './constants';
import { useZones } from './ZoneSettingsContext';

export default function AggregationControls({
  compact = true,
  tzString,
  timeZone,
  setTimeZone,
  tzOptions,
  aggregation,
  setAggregation,
  groupMin,
  setGroupMin,
  shiftSel,
  setShiftSel,
  zoneSel,
  setZoneSel,
  onOpenShiftSettings,
  onOpenZoneSettings,
  onApply,
  onCancel,
  onClear,
  disabled,
  footerLabel
}) {
  const [tzOpen, setTzOpen] = useState(false);
  const tzAnchorRef = useRef(null);

  const { zones } = useZones();
  const zoneKeys = useMemo(() => ['ALL', ...Object.keys(zones || {})], [zones]);

  const gap = compact ? 1 : 1.2;
  const baseFont = 13;

  return (
    <Stack spacing={gap} sx={{ fontSize: baseFont }}>
      {/* Header row with UTC chip */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 0.6, borderRadius: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          Time window
        </Typography>
        <Typography
          ref={tzAnchorRef}
          variant="caption"
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            bgcolor: '#e6f2ff',
            px: 0.8,
            py: 0.3,
            borderRadius: 1,
            fontWeight: 600,
            color: 'text.primary'
          }}
          onClick={() => setTzOpen(true)}
          title="Change time zone"
        >
          {tzString}
        </Typography>
      </Stack>

      {/* Timezone selector popover */}
      <Popover
        open={tzOpen}
        anchorEl={tzAnchorRef.current}
        onClose={() => setTzOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 1, width: 300, borderRadius: 2 } }}
      >
        <Stack spacing={0.75}>
          <Autocomplete
            size="small"
            options={tzOptions}
            value={timeZone}
            onChange={(_, v) => setTimeZone(v || 'Browser Time')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Time zone"
                placeholder="Select time zone"
                sx={{ '& .MuiInputBase-root': { fontSize: baseFont } }}
              />
            )}
          />
          <Button onClick={() => setTimeZone('Browser Time')} size="small" variant="text" sx={{ alignSelf: 'flex-start', px: 0 }}>
            Use browser time ({tzString})
          </Button>
        </Stack>
      </Popover>

      {/* Aggregation */}
      <TextField
        select
        size="small"
        label="Aggregation"
        value={aggregation}
        onChange={(e) => setAggregation(e.target.value)}
        fullWidth
        sx={{ '& .MuiInputBase-root': { fontSize: baseFont, py: 0.3 } }}
      >
        {AGGREGATIONS.map((a) => (
          <MenuItem key={a.key} value={a.key}>
            {a.label}
          </MenuItem>
        ))}
      </TextField>

      {/* Grouping interval */}
      <TextField
        select
        size="small"
        label="Grouping interval"
        value={groupMin}
        onChange={(e) => setGroupMin(Number(e.target.value))}
        fullWidth
        sx={{ '& .MuiInputBase-root': { fontSize: baseFont, py: 0.3 } }}
      >
        {GROUPING_INTERVALS_MIN.map((m) => (
          <MenuItem key={m} value={m}>
            {m === 0
              ? 'None'
              : m < 60
                ? `${m} min`
                : m % 60 === 0
                  ? `${m / 60} hour${m === 60 ? '' : 's'}`
                  : `${Math.floor(m / 60)}h ${m % 60}m`}
          </MenuItem>
        ))}
      </TextField>

      {/* Shift */}
      <TextField
        select
        size="small"
        label="Shift"
        value={shiftSel}
        onChange={(e) => setShiftSel(e.target.value)}
        fullWidth
        sx={{ '& .MuiInputBase-root': { fontSize: baseFont, py: 0.3 } }}
      >
        <MenuItem value="ALL">Shift ALL</MenuItem>
        <MenuItem value="A">Shift A</MenuItem>
        <MenuItem value="B">Shift B</MenuItem>
        <MenuItem value="C">Shift C</MenuItem>
      </TextField>

      {/* ToD zone (label only changed) */}
      <TextField
        select
        size="small"
        label="ToD zone"
        value={zoneSel}
        onChange={(e) => setZoneSel(e.target.value)}
        fullWidth
        sx={{ '& .MuiInputBase-root': { fontSize: baseFont, py: 0.3 } }}
      >
        {zoneKeys.map((k) => (
          <MenuItem key={k} value={k}>
            {k === 'ALL' ? 'All Zones' : zones[k]?.label || k}
          </MenuItem>
        ))}
      </TextField>

      {/* Settings entry (kept the same text elsewhere, minimal change) */}
      <Button onClick={onOpenShiftSettings} size="small" sx={{ textTransform: 'none', fontSize: 12, alignSelf: 'flex-start', py: 0 }}>
        ⚙ Configure Shifts, Zones & slots
      </Button>

      <Divider sx={{ my: 0.5 }} />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 0.5, py: 0.3, borderRadius: 1, bgcolor: 'action.hover', fontSize: 12 }}
      >
        {footerLabel}
      </Typography>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 0.3 }}>
        <Button onClick={onClear} size="small" sx={{ textTransform: 'none', fontSize: 12 }}>
          Clear
        </Button>
        <Button onClick={onCancel} size="small" sx={{ textTransform: 'none', fontSize: 12 }}>
          Cancel
        </Button>
        <Button onClick={onApply} size="small" variant="contained" disabled={disabled} sx={{ textTransform: 'none', fontSize: 12 }}>
          Update
        </Button>
      </Stack>
    </Stack>
  );
}
