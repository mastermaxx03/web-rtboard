// src/views/electricity/BillDetails.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, Grid, Skeleton, Button, Divider, Select,
  MenuItem, FormControl, InputLabel, Chip, Dialog, DialogContent, DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveIcon from '@mui/icons-material/Save';
import dayjs from 'dayjs';
import { getBill, setBillStatus } from './e';

const Field = ({ label, value, mono }) => (
  <Stack spacing={0.5}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography
      variant="body1"
      sx={{ fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' : undefined }}
    >
      {value ?? '—'}
    </Typography>
  </Stack>
);

export default function BillDetails() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [status, setStatus] = useState('not_paid');
  const [openPDF, setOpenPDF] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getBill(billId)
      .then((b) => { if (mounted) { setBill(b); setStatus(b.status); } })
      .catch(() => {})
      .finally(() => {});
    return () => { mounted = false; };
  }, [billId]);

  const handleSave = async () => {
    if (!bill) return;
    setSaving(true);
    try {
      await setBillStatus(bill.id, status);
      setBill({ ...bill, status });
    } finally {
      setSaving(false);
    }
  };

  if (!bill) {
    return (
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="text" width={220} />
        </Stack>
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rounded" height={64} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" sx={{ ml: 1, flex: 1 }}>Electricity — Bill Details</Typography>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Field label="Month" value={dayjs(bill.month + '-01').format('MMMM YYYY')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Field label="Bill No." value={bill.bill_no} mono />
          </Grid>

          <Grid item xs={12} md={6}>
            <Field label="Units (kWh)" value={bill.units.toLocaleString()} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Field label="Amount (₹)" value={`₹ ${bill.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Field label="Due Date" value={dayjs(bill.due_date).format('DD MMM YYYY')} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="status-lb">Status</InputLabel>
                  <Select
                    labelId="status-lb"
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="not_paid">Not Paid</MenuItem>
                    <MenuItem value="pre_paid">Pre-Paid</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Field label="Submitted At" value={dayjs(bill.submitted_at).format('DD MMM YYYY, HH:mm')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">Quick Status</Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  color={bill.status === 'paid' ? 'success' : bill.status === 'pre_paid' ? 'info' : 'warning'}
                  label={bill.status.toUpperCase()}
                />
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => setOpenPDF(true)}>
                Show Bill (PDF)
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Bill file: {bill.pdf_url}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openPDF} onClose={() => setOpenPDF(false)} fullWidth maxWidth="md">
        <DialogTitle>Bill PDF — {dayjs(bill.month + '-01').format('MMM YYYY')}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ position: 'relative', pt: '56.25%' }}>
            <Box
              component="iframe"
              src={bill.pdf_url}
              title="Bill PDF"
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
