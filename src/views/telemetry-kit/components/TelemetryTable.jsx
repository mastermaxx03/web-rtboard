// src/views/telemetry-kit/components/TelemetryTable.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import PerformanceChip from './PerformanceChip';
import { fmt, n2, n2pct } from '../utils';

/**
 * Generic telemetry table.
 * - Drives columns off the `columns` prop from a config file.
 * - TS column: no wrap + fixed/min width to avoid overlap.
 * - Numbers right-aligned, mono; percent rendered with %.
 */
export default function TelemetryTable({ loading, rows, columns, maxHeight = '60vh' }) {
  const cols = Array.isArray(columns) ? columns : [];

  return (
    <Box sx={{ width: '100%', maxHeight, overflow: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          tableLayout: 'fixed'
        }}
      >
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                style={{
                  position: 'sticky',
                  top: 0,
                  background: '#fff',
                  textAlign: c.align || (c.type === 'ts' ? 'left' : 'right'),
                  padding: '10px 12px',
                  borderBottom: '1px solid #eaeaea',
                  fontWeight: 700,
                  zIndex: 1,
                  whiteSpace: c.type === 'ts' ? 'nowrap' : 'normal',
                  width: c.width ? `${c.width}px` : undefined,
                  minWidth: c.type === 'ts' ? (c.width ? `${c.width}px` : '210px') : undefined
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={cols.length} style={{ padding: 14 }}>
                <Typography variant="body2" color="text.secondary">
                  Loading…
                </Typography>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length} style={{ padding: 14 }}>
                <Typography variant="body2" color="text.secondary">
                  No data
                </Typography>
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={`${r.ts}-${idx}`} style={{ borderBottom: '1px solid #f3f3f3' }}>
                {cols.map((c) => {
                  const v = r[c.key];
                  const common = { padding: '10px 5px', textAlign: c.align || (c.type === 'ts' ? 'left' : 'right') };

                  if (c.type === 'ts') {
                    return (
                      <td key={c.key} style={{ ...common, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }} title={fmt(r.ts)}>
                        {fmt(r.ts)}
                      </td>
                    );
                  }

                  if (c.type === 'perf') {
                    return (
                      <td key={c.key} style={common}>
                        <PerformanceChip value={v} />
                      </td>
                    );
                  }

                  if (c.type === 'percent') {
                    return (
                      <td key={c.key} style={common}>
                        <Typography variant="body2" sx={{ fontFamily: 'ui-monospace, Menlo, Monaco, Consolas' }}>
                          {n2pct(v)}
                        </Typography>
                      </td>
                    );
                  }

                  // default: number / text
                  return (
                    <td key={c.key} style={common}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'ui-monospace, Menlo, Monaco, Consolas',
                          fontWeight: c.bold ? 700 : 400
                        }}
                      >
                        {typeof v === 'number' ? n2(v) : String(v ?? '')}
                      </Typography>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Box>
  );
}
