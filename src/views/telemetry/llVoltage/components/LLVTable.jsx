import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { MessageChip } from './MessageChip';
import { fmt } from '../utils';

const perfColor = (p) => (p === 'CRITICAL' ? 'error' : p === 'WARNING' ? 'warning' : p === 'ACCEPTABLE' ? 'success' : 'default');

export default function LLVTable({ loading, rows, maxHeight = '58vh' }) {
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
          ) : (
            rows.map((r, i) => (
              <tr key={`${r.ts}-${i}`} style={{ borderBottom: '1px solid #f3f3f3' }}>
                <td style={{ padding: '10px 12px' }}>
                  <Typography variant="body2">{fmt(r.ts)}</Typography>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'ui-monospace,Menlo,Monaco,Consolas' }}>
                    {r.did}
                  </Typography>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'ui-monospace,Menlo,Monaco,Consolas' }}>
                    {r.sid}
                  </Typography>
                </td>

                <td style={{ padding: '10px 12px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.panel_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.panel_location}
                  </Typography>
                </td>

                {['vry', 'vyb', 'vbr', 'vavg', 'max_dev', 'imb_pct'].map((k) => (
                  <td key={k} style={{ padding: '10px 12px' }}>
                    <Typography variant="body2" sx={{ fontWeight: k === 'vavg' ? 700 : 500 }}>
                      {r[k].toFixed(k === 'imb_pct' ? 2 : 2)}
                      {k === 'imb_pct' ? ' %' : ''}
                    </Typography>
                  </td>
                ))}

                <td style={{ padding: '10px 12px' }}>
                  <Chip size="small" color={perfColor(r.performance)} label={r.performance} sx={{ fontWeight: 700 }} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Box>
  );
}
