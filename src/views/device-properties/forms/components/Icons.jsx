// src/views/device-properties/forms/components/Icons.jsx
import React, { useMemo, useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, IconButton, Tooltip, Stack } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// ====== IMPORT YOUR ICONS HERE ======
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import ElectricalServicesOutlinedIcon from '@mui/icons-material/ElectricalServicesOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SaveIcon from '@mui/icons-material/Save';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// ====== REGISTRY ======
const ICONS = [
  { name: 'CheckCircle', importPath: "@mui/icons-material/CheckCircle", Component: CheckCircleIcon },
  { name: 'BuildCircleOutlined', importPath: "@mui/icons-material/BuildCircleOutlined", Component: BuildCircleOutlinedIcon },
  { name: 'ElectricalServicesOutlined', importPath: "@mui/icons-material/ElectricalServicesOutlined", Component: ElectricalServicesOutlinedIcon },
  { name: 'TuneOutlined', importPath: "@mui/icons-material/TuneOutlined", Component: TuneOutlinedIcon },
  { name: 'BoltOutlined', importPath: "@mui/icons-material/BoltOutlined", Component: BoltOutlinedIcon },
  { name: 'EnergySavingsLeafOutlined', importPath: "@mui/icons-material/EnergySavingsLeafOutlined", Component: EnergySavingsLeafOutlinedIcon },
  { name: 'GraphicEqOutlined', importPath: "@mui/icons-material/GraphicEqOutlined", Component: GraphicEqOutlinedIcon },
  { name: 'HandymanOutlined', importPath: "@mui/icons-material/HandymanOutlined", Component: HandymanOutlinedIcon },
  { name: 'Settings', importPath: "@mui/icons-material/Settings", Component: SettingsIcon },
  { name: 'HistoryToggleOff', importPath: "@mui/icons-material/HistoryToggleOff", Component: HistoryToggleOffIcon },
  { name: 'Visibility', importPath: "@mui/icons-material/Visibility", Component: VisibilityIcon },
  { name: 'CheckCircleOutline', importPath: "@mui/icons-material/CheckCircleOutline", Component: CheckCircleOutlineIcon },

  { name: 'ArrowBackIosNew', importPath: "@mui/icons-material/ArrowBackIosNew", Component: ArrowBackIosNewIcon },
  { name: 'ArrowForwardIos', importPath: "@mui/icons-material/ArrowForwardIos", Component: ArrowForwardIosIcon },
  { name: 'KeyboardDoubleArrowLeft', importPath: "@mui/icons-material/KeyboardDoubleArrowLeft", Component: KeyboardDoubleArrowLeftIcon },
  { name: 'KeyboardDoubleArrowRight', importPath: "@mui/icons-material/KeyboardDoubleArrowRight", Component: KeyboardDoubleArrowRightIcon },
  { name: 'ChevronLeft', importPath: "@mui/icons-material/ChevronLeft", Component: ChevronLeftIcon },
  { name: 'ChevronRight', importPath: "@mui/icons-material/ChevronRight", Component: ChevronRightIcon },
  { name: 'VisibilityOff', importPath: "@mui/icons-material/VisibilityOff", Component: VisibilityOffIcon },
  { name: 'CalendarMonth', importPath: "@mui/icons-material/CalendarMonth", Component: CalendarMonthIcon },
  { name: 'Save', importPath: "@mui/icons-material/Save", Component: SaveIcon },
  { name: 'ColorLens', importPath: "@mui/icons-material/ColorLens", Component: ColorLensIcon },
  { name: 'Close', importPath: "@mui/icons-material/Close", Component: CloseIcon },
  { name: 'ErrorOutline', importPath: "@mui/icons-material/ErrorOutline", Component: ErrorOutlineIcon },
  { name: 'ArrowDownward', importPath: "@mui/icons-material/ArrowDownward", Component: ArrowDownwardIcon }
];

// ====== Card Component ======
function IconCard({ name, importPath, Component }) {
  const importLine = `import ${name}Icon from '${importPath}';`;
  const usageLine = `<${name}Icon />`;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Stack spacing={1.25} alignItems="center">
        <Box sx={{ display: 'grid', placeItems: 'center', width: 56, height: 56 }}>
          <Component fontSize="large" />
        </Box>
        <Typography variant="subtitle2">{name}Icon</Typography>

        <Box sx={{ width: '100%', bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', p: 1, borderRadius: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {importLine}
            </Typography>
            <Tooltip title="Copy import">
              <IconButton size="small" onClick={() => copy(importLine)}>
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box sx={{ width: '100%', bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', p: 1, borderRadius: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usageLine}
            </Typography>
            <Tooltip title="Copy JSX">
              <IconButton size="small" onClick={() => copy(usageLine)}>
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

// ====== Page ======
export default function Icons() {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ICONS;
    return ICONS.filter(({ name, importPath }) => name.toLowerCase().includes(s) || importPath.toLowerCase().includes(s));
  }, [q]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Project Icons
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manually curated. Add icons by importing above and pushing into the <code>ICONS</code> array.
          </Typography>
        </Box>
        <TextField size="small" placeholder="Search icons…" value={q} onChange={(e) => setQ(e.target.value)} sx={{ minWidth: 280 }} />
      </Stack>

      <Grid container spacing={2}>
        {filtered.map(({ name, importPath, Component }) => (
          <Grid key={name} item xs={12} sm={6} md={4} lg={3} xl={2}>
            <IconCard name={name} importPath={importPath} Component={Component} />
          </Grid>
        ))}
      </Grid>

      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 6 }}>
          <Typography variant="body2">No icons match your search.</Typography>
        </Box>
      )}
    </Box>
  );
}
