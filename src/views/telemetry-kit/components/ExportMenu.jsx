import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { exportCSV, exportXLSX } from '../utils';
import { loadAllTelemetry } from '../data/telemetryLoader';
import { api } from '../data/api'; // used only if EMAIL_API_URL is not set

/**
 * Props:
 * - filename    : string (base file name, no extension)
 * - columns     : array (page's column schema; supports key/exportKey/field)
 * - rows        : optional array (fallback if loaderArgs not supplied)
 * - loaderArgs  : optional object with SAME fields you pass to loadTelemetry
 *                 except page/pageSize (we fetch everything automatically)
 */
export default function ExportMenu({ filename = 'telemetry', columns = [], rows = [], loaderArgs }) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Telemetry Export');
  const [emailMessage, setEmailMessage] = useState('');
  const [sending, setSending] = useState(false);

  const EMAIL_API_URL = import.meta?.env?.VITE_EMAIL_API_URL; // optional multipart endpoint

  // -------- data gatherers --------
  const getAllRows = async () => {
    if (loaderArgs) {
      const { rows: all } = await loadAllTelemetry(loaderArgs);
      return all ?? [];
    }
    return rows ?? [];
  };

  // robust column key mapper: exportKey → field → key → raw string id
  const keyOf = (c) => c?.exportKey ?? c?.field ?? c?.key ?? c;

  // CSV builder
  const csvFrom = (cols, data) => {
    const keys = cols.map((c) => keyOf(c));
    const header = keys.join(',');
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = data.map((row) => keys.map((k) => esc(row?.[k])).join(','));
    return [header, ...lines].join('\n');
  };

  // -------- standard downloads --------
  const handleCSV = async () => {
    const all = await getAllRows();
    exportCSV(
      columns.map((c) => ({ ...c, key: keyOf(c) })),
      all,
      `${filename}.csv`
    );
    setAnchor(null);
  };

  const handleXLSX = async () => {
    const all = await getAllRows();
    exportXLSX(
      columns.map((c) => ({ ...c, key: keyOf(c) })),
      all,
      `${filename}.xlsx`
    );
    setAnchor(null);
  };

  // -------- email flow UI --------
  const handleEmail = () => {
    setAnchor(null);
    setEmailOpen(true);
  };

  // try #1: multipart to external EMAIL_API_URL
  const tryMultipartEmail = async ({ to, subject, message, fileBlob, fileName }) => {
    if (!EMAIL_API_URL) return false;
    const form = new FormData();
    form.append('to', to);
    form.append('subject', subject || '');
    form.append('message', message || '');
    form.append('attachment', fileBlob, fileName);

    const res = await fetch(EMAIL_API_URL, { method: 'POST', body: form });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Email API ${res.status}: ${txt || res.statusText}`);
    }
    return true;
  };

  // try #2: JSON to your telemetry API (/telemetry/email-csv)
  const tryJsonEmail = async ({ to, subject, message, csv, fileName }) => {
    try {
      const resp = await api.post('/telemetry/email-csv', {
        to,
        subject: subject || 'Telemetry CSV Export',
        message: message || '',
        filename: fileName || 'telemetry.csv',
        csv
      });
      return !!resp?.data;
    } catch (e) {
      // bubble up; caller decides fallback next
      throw e;
    }
  };

  // final fallback: download + open mailto (cannot attach automatically)
  const fallbackMailto = ({ to, subject, message, fileBlob, fileName }) => {
    // force-download so the user can attach manually
    const a = document.createElement('a');
    a.href = URL.createObjectURL(fileBlob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    const mailto = new URL(`mailto:${encodeURIComponent(to)}`);
    if (subject) mailto.searchParams.set('subject', subject);
    const body = message
      ? `${message}\n\n(Attachment downloaded locally as ${fileName})`
      : `(Attachment downloaded locally as ${fileName})`;
    mailto.searchParams.set('body', body);
    window.location.href = mailto.toString();
    return true;
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim()) {
      alert('Please enter a recipient email.');
      return;
    }

    setSending(true);
    try {
      const all = await getAllRows();
      const csv = csvFrom(columns, all);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const fileName = `${filename}.csv`;

      // 1) external multipart endpoint (if provided)
      if (EMAIL_API_URL) {
        await tryMultipartEmail({
          to: emailTo.trim(),
          subject: emailSubject,
          message: emailMessage,
          fileBlob: blob,
          fileName
        });
      } else {
        // 2) JSON to /telemetry/email-csv on your telemetry API
        await tryJsonEmail({
          to: emailTo.trim(),
          subject: emailSubject,
          message: emailMessage,
          csv,
          fileName
        });
      }

      setEmailOpen(false);
      setEmailTo('');
      setEmailSubject('Telemetry Export');
      setEmailMessage('');
      alert('Email sent.');
    } catch (err) {
      console.error('Email send failed:', err);

      // 3) fallback to mailto + local download (always succeeds in opening a draft)
      try {
        const all = await getAllRows();
        const csv = csvFrom(columns, all);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const fileName = `${filename}.csv`;
        fallbackMailto({
          to: emailTo.trim(),
          subject: emailSubject,
          message: emailMessage,
          fileBlob: blob,
          fileName
        });
        alert('Email draft opened in your mail client. CSV downloaded locally.');
      } catch (_) {
        alert(`Failed to send email: ${err?.message || err}`);
      }
    } finally {
      setSending(false);
    }
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
        <MenuItem onClick={handleEmail}>
          <ListItemText primary="Email…" />
        </MenuItem>
      </Menu>

      <Dialog open={emailOpen} onClose={() => !sending && setEmailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send Export via Email</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            type="email"
            label="To"
            placeholder="user@example.com"
            fullWidth
            margin="dense"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            disabled={sending}
            required
          />
          <TextField
            label="Subject"
            fullWidth
            margin="dense"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            disabled={sending}
          />
          <TextField
            label="Message"
            fullWidth
            margin="dense"
            multiline
            minRows={3}
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            disabled={sending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} variant="contained" disabled={sending}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
