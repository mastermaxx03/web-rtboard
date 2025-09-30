// src/views/telemetry/llVoltage/components/ExportMenu.jsx
import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemText } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { exportCSV, exportXLSX /*, printPDF */ } from '../utils';

export default function ExportMenu({ rows, filename = 'll_voltage' }) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);

  return (
    <>
      <Button variant="outlined" startIcon={<DownloadIcon />} disabled={!rows?.length} onClick={(e) => setAnchor(e.currentTarget)}>
        Download
      </Button>

      <Menu anchorEl={anchor} open={open} onClose={close}>
        <MenuItem
          onClick={() => {
            close();
            exportCSV(rows, `${filename}.csv`);
          }}
        >
          <ListItemText primary="CSV (.csv)" secondary="Spreadsheet-friendly" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            close();
            exportXLSX(rows, `${filename}.xlsx`);
          }}
        >
          <ListItemText primary="Excel (.xlsx)" secondary="If xlsx unavailable falls back to CSV" />
        </MenuItem>

        {/* Temporarily disabled per request
        <MenuItem
          onClick={() => {
            close();
            printPDF();
          }}
        >
          <ListItemText primary="PDF (print)" secondary="Browser print → Save as PDF" />
        </MenuItem>
        */}
      </Menu>
    </>
  );
}
