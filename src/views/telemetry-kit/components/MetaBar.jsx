/**
 * MetaBar.jsx
 * - Shows DID / SID / Panel / Location above the table
 * - If there is >1 option for a field, renders a dropdown to work as a filter.
 * - Else renders static text (like a label).
 */

import React from 'react';
import { Box, Chip, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';

function MaybeSelect({ label, value, options, onChange }) {
  if (!options || options.length <= 1) {
    return (
      <Chip
        variant="outlined"
        label={
          <span>
            <b>{label}:</b>&nbsp;{options && options.length ? options[0] : value || '—'}
          </span>
        }
        sx={{ fontWeight: 600 }}
      />
    );
  }

  return (
    <FormControl size="small" sx={{ minWidth: 240 }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value || 'ALL'} onChange={(e) => onChange(e.target.value === 'ALL' ? '' : e.target.value)}>
        <MenuItem value="ALL">All</MenuItem>
        {options.map((v) => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function MetaBar({ options, value, onChange }) {
  const { did = [], sid = [], panel = [], location = [] } = options || {};
  const { DID = '', SID = '', panel_name = '', panel_location = '' } = value || {};

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        border: '1px solid #E6EAF2',
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        mb: 1
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        <Typography variant="body2" sx={{ fontWeight: 800, mr: 1 }}>
          Device / Panel
        </Typography>

        <MaybeSelect label="DID" value={DID} options={did} onChange={(v) => onChange({ ...value, DID: v })} />
        <MaybeSelect label="SID" value={SID} options={sid} onChange={(v) => onChange({ ...value, SID: v })} />
        <MaybeSelect label="Panel" value={panel_name} options={panel} onChange={(v) => onChange({ ...value, panel_name: v })} />
        <MaybeSelect
          label="Location"
          value={panel_location}
          options={location}
          onChange={(v) => onChange({ ...value, panel_location: v })}
        />
      </Stack>
    </Box>
  );
}
