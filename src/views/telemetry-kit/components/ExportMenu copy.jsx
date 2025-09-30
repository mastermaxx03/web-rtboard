import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemText } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { exportCSV, exportXLSX } from '../utils';
import { loadAllTelemetry } from '../data/telemetryLoader';

/**
 * Props:
 * - filename    : string (base file name, no extension)
 * - columns     : array (page's column schema)
 * - rows        : optional array (fallback if loaderArgs not supplied)
 * - loaderArgs  : optional object with the SAME fields you pass to loadTelemetry
 *                 except page/pageSize (we fetch everything automatically)
 */
export default function ExportMenu({ filename = 'telemetry', columns = [], rows = [], loaderArgs }) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const getAllRows = async () => {
    if (loaderArgs) {
      const { rows: all } = await loadAllTelemetry(loaderArgs);
      return all;
    }
    // fallback: whatever was handed to us (may be just the current page)
    return rows || [];
  };

  const handleCSV = async () => {
    const all = await getAllRows();
    // utils export signature: exportCSV(columns, rows, filename)
    exportCSV(columns, all, `${filename}.csv`);
    setAnchor(null);
  };

  const handleXLSX = async () => {
    const all = await getAllRows();
    exportXLSX(columns, all, `${filename}.xlsx`);
    setAnchor(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Download
      </Button>

      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)}>
        <MenuItem onClick={handleCSV}>
          <ListItemText primary="CSV" />
        </MenuItem>
        <MenuItem onClick={handleXLSX}>
          <ListItemText primary="Excel" />
        </MenuItem>
      </Menu>
    </>
  );
}
