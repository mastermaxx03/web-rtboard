import React from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { MessageChip } from './MessageChip';
import { fmt, fmtCompact } from '../utils';

/** The table (unchanged look). Receives already-filtered rows. */
export const AlertTable = ({ loading, rows, keyFor, onAcknowledgeClick, maxHeight = '58vh' }) => {
  return (
    <Box sx={{ width: '100%', maxHeight, overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {['Panel (Location)', 'Timestamp', 'Tag Name', 'Alert Value', 'Alert Message', 'Status', 'Acknowledge', 'Ack User (TS)'].map(
              (h) => (
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
              )
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} style={{ padding: 14 }}>
                <Typography variant="body2" color="text.secondary">
                  Loading…
                </Typography>
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={`${r.alert_id}-${keyFor(r)}`} style={{ borderBottom: '1px solid #f3f3f3' }}>
                <td style={{ padding: '10px 12px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.panel_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.panel_location}
                  </Typography>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Typography variant="body2">{fmt(r.ts)}</Typography>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Typography variant="body2" style={{ fontFamily: 'ui-monospace, Menlo, Monaco, Consolas' }}>
                    {r.tag_name}
                  </Typography>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Typography variant="body2" style={{ fontWeight: 700 }}>
                    {r.alert_value}{' '}
                    <Typography component="span" variant="caption" color="text.secondary">
                      {r.unit}
                    </Typography>
                  </Typography>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <MessageChip message={r.message} severity={r.severity} />
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Chip size="small" variant="outlined" label={String(r.status).toUpperCase()} />
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {r.ack_user ? (
                    <Button size="small" variant="contained" color="warning" onClick={() => onAcknowledgeClick(r)}>
                      Unacknowledge
                    </Button>
                  ) : (
                    <Button size="small" variant="contained" onClick={() => onAcknowledgeClick(r)}>
                      Acknowledge
                    </Button>
                  )}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {r.ack_user ? (
                    <Tooltip
                      title={
                        <Box>
                          <div>
                            <b>User:</b> {r.ack_user}
                          </div>
                          <div>
                            <b>Time:</b> {fmt(r.ack_ts)}
                          </div>
                          {r.ack_note ? (
                            <div>
                              <b>Note:</b> {r.ack_note}
                            </div>
                          ) : null}
                        </Box>
                      }
                    >
                      <span>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                          {r.ack_user}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {fmtCompact(r.ack_ts)}
                        </Typography>
                      </span>
                    </Tooltip>
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      —
                    </Typography>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Box>
  );
};

/** Export the same note dialog as a static property to keep the page tidy */
AlertTable.NoteDialog = function NoteDialog({ open, note, setNote, onClose, onSave }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Acknowledge Alert</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Add a note for this acknowledgment (optional).
        </Typography>
        <TextField
          autoFocus
          multiline
          minRows={3}
          fullWidth
          placeholder="Type your note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={onSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
