// src/views/telemetry/llVoltage/components/TelemetryTable.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import PerformanceChip from './PerformanceChip';
import { fmt } from '../utils';

export default function TelemetryTable({ loading, rows, maxHeight = '60vh' }) {
  return (
    <Box sx={{ width: '100%', maxHeight, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {['TS', 'DID', 'SID', 'Panel (Location)', 'VRY', 'VYB', 'VBR', 'VAVG', 'Max Dev', 'Vol Imb %', 'Performance'].map((h) => (
              <th
                key={h}
                style={{
                  position: 'sticky',
                  top: 0,
                  background: '#fff',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderBottom: '1px solid #eaeaea',
                  fontWeight: 700,
                  zIndex: 1
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={11} style={{ padding: 14 }}>
                <Typography variant="body2" color="text.secondary">
                  Loading…
                </Typography>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={11} style={{ padding: 14 }}>
                <Typography variant="body2" color="text.secondary">
                  No data
                </Typography>
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={`${r.ts}-${idx}`} style={{ borderBottom: '1px solid #f3f3f3' }}>
                <td style={{ padding: '10px 12px' }}>{fmt(r.ts)}</td>
                <td style={{ padding: '10px 12px' }}>{r.DID}</td>
                <td style={{ padding: '10px 12px' }}>{r.SID}</td>

                <td style={{ padding: '10px 12px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.panel_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.panel_location}
                  </Typography>
                </td>

                {['VRY', 'VYB', 'VBR', 'VAVG', 'MAX_DEV', 'IMB_PCT'].map((k) => (
                  <td key={k} style={{ padding: '10px 12px' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'ui-monospace, Menlo, Monaco, Consolas' }}>
                      {k === 'IMB_PCT' ? `${r[k]} %` : r[k]}
                    </Typography>
                  </td>
                ))}

                <td style={{ padding: '10px 12px' }}>
                  <PerformanceChip value={r.PERFORMANCE} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Box>
  );
}
