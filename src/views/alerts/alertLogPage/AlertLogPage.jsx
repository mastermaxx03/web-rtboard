// src/views/alertLogPage/AlertLogPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { ShiftSettingsProvider } from './date/ShiftSettingsContext';
import Grid from '@mui/material/Grid2';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
  Snackbar,
  Alert as MUIAlert,
  IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

import DatePackage from './date/DatePackage';
import { MainCard } from './components/MainCard';
import { KpiCards } from './components/KpiCards';
import { AlertTable } from './components/AlertTable';
import { PaginationBar } from './components/PaginationBar';
import { exportCSV } from './utils';
// NOTE: import MOCK_USERS so the menu matches the dataset
import { mockFetchAlerts, MOCK_USERS } from './data';
import { useAckMemory, keyFor } from './hooks/useAckMemory';
import { MessageChip } from './components/MessageChip';
import RefreshOverlay from './components/RefreshOverlay';
import spinnerLogo from './assets/esm-rotate-loading.png';

export default function AlertLogPage({ panelId = 'MCC10', currentUser = 'operator_01' }) {
  // --- page & pagination state ---
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalsView, setTotalsView] = useState(null);

  // --- PRIMARY filter: User/owner ---
  const [userFilter, setUserFilter] = useState('ALL');

  // --- date filters/controls ---
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // --- data/ux state ---
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

  // secondary filters
  const [messageFilter, setMessageFilter] = useState('ALL');
  const [kpiFilter, setKpiFilter] = useState('ALL');

  // ack dialog state
  const [ackDialog, setAckDialog] = useState({ open: false, alertId: null, note: '' });

  // ACK memory
  const { mergeRows, rememberAck, forgetAck, clearHolds, getRememberedOnly, getAllSnapshots, holdAckKeys } = useAckMemory();

  const bumpTotals = (severity, fromStatus, toStatus) => {
    if (!totalsView) return;
    const next = { ...totalsView };
    const isCrit = severity === 'critical';
    const isWarn = severity === 'warning';
    const dec = (k) => (next[k] = Math.max(0, (next[k] || 0) - 1));
    const inc = (k) => (next[k] = (next[k] || 0) + 1);
    if (fromStatus === 'open' && toStatus === 'acknowledged') {
      if (isCrit) {
        dec('pending_critical');
        inc('ack_critical');
      }
      if (isWarn) {
        dec('pending_warning');
        inc('ack_warning');
      }
    } else if (fromStatus === 'acknowledged' && toStatus === 'open') {
      if (isCrit) {
        dec('ack_critical');
        inc('pending_critical');
      }
      if (isWarn) {
        dec('ack_warning');
        inc('pending_warning');
      }
    }
    setTotalsView(next);
  };

  const sanitizeIncoming = (inRows) =>
    inRows.map((r) => ({
      ...r,
      status: 'open',
      ack_user: null,
      ack_user_id: null,
      ack_ts: null,
      ack_note: null
    }));

  // fetch + merge + reconcile totals with local ACKs
  const load = async () => {
    setLoading(true);
    try {
      const {
        rows: fetched,
        total: t,
        totals
      } = await mockFetchAlerts({
        panelId,
        page,
        pageSize,
        start,
        end,
        user: userFilter // ← PRIMARY filter applied in the data source
        // NOTE: when you start passing meta (shift/day windows) from DatePackage,
        // simply include it here as `meta`
      });

      const sanitized = sanitizeIncoming(fetched);
      setRows(mergeRows(sanitized));
      setTotal(t || 0);

      let adjusted = totals ? { ...totals } : null;
      if (adjusted) {
        const snaps = getAllSnapshots();
        for (const s of snaps) {
          if (s.status === 'acknowledged') {
            const isCrit = s.severity === 'critical';
            const isWarn = s.severity === 'warning';
            if (isCrit) {
              adjusted.pending_critical = Math.max(0, adjusted.pending_critical - 1);
              adjusted.ack_critical = (adjusted.ack_critical || 0) + 1;
            } else if (isWarn) {
              adjusted.pending_warning = Math.max(0, adjusted.pending_warning - 1);
              adjusted.ack_warning = (adjusted.ack_warning || 0) + 1;
            }
          }
        }
      }
      setTotalsView(adjusted);
      clearHolds();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!autoRefresh) return;
    const id = setInterval(load, 40000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelId, page, pageSize, start, end, autoRefresh, userFilter]); // ← depends on userFilter

  // Reset to first page whenever primary/secondary filters that affect dataset change
  const onChangePageSize = (val) => {
    setPageSize(val);
    setPage(1);
  };

  const onChangeDateRange = ({ start: s, end: e }) => {
    setStart(s);
    setEnd(e);
    setPage(1);
  };

  // If user filter changes, reset to page 1 (primary)
  const onChangeUser = (val) => {
    setUserFilter(val);
    setPage(1);
  };

  // acknowledge / unacknowledge
  const onAcknowledgeClick = (alert) => {
    const k = keyFor(alert);
    if (alert.ack_user) {
      setRows((prev) =>
        prev.map((r) => (keyFor(r) === k ? { ...r, status: 'open', ack_user: null, ack_user_id: null, ack_ts: null, ack_note: null } : r))
      );
      forgetAck(alert);
      bumpTotals(alert.severity, 'acknowledged', 'open');
      setToast({ open: true, msg: `Alert ${alert.alert_id} unacknowledged`, sev: 'success' });
    } else {
      setAckDialog({ open: true, alertId: alert.alert_id, note: '' });
    }
  };

  const saveAcknowledge = () => {
    const note = ackDialog.note.trim();
    const id = ackDialog.alertId;
    const row = rows.find((r) => r.alert_id === id);
    if (!row) {
      setAckDialog({ open: false, alertId: null, note: '' });
      return;
    }

    // Use the selected User (display name) when available; otherwise fall back to operator ID.
    const displayName = userFilter && userFilter !== 'ALL' ? userFilter : currentUser;

    const payload = {
      status: 'acknowledged',
      ack_user: displayName, // human-friendly name shown in the table
      ack_user_id: currentUser, // keep the technical/operator ID too
      ack_ts: new Date().toISOString(),
      ack_note: note || null
    };

    setRows((prev) => prev.map((r) => (keyFor(r) === keyFor(row) ? { ...r, ...payload } : r)));
    rememberAck(row, payload);

    bumpTotals(row.severity, 'open', 'acknowledged');
    setAckDialog({ open: false, alertId: null, note: '' });
    setToast({ open: true, msg: `Alert ${id} acknowledged by ${displayName}`, sev: 'success' });
  };

  const cancelAcknowledge = () => setAckDialog({ open: false, alertId: null, note: '' });

  const rememberedOnly = useMemo(() => getRememberedOnly(rows), [rows, getRememberedOnly]);

  const statsView = useMemo(() => {
    const all = [...rows, ...rememberedOnly];
    const pCrit = all.filter((r) => r.severity === 'critical' && r.status === 'open').length;
    const pWarn = all.filter((r) => r.severity === 'warning' && r.status === 'open').length;
    const aCrit = all.filter((r) => r.severity === 'critical' && r.status === 'acknowledged').length;
    const aWarn = all.filter((r) => r.severity === 'warning' && r.status === 'acknowledged').length;
    return { pending_critical: pCrit, pending_warning: pWarn, ack_critical: aCrit, ack_warning: aWarn };
  }, [rows, rememberedOnly]);

  const filteredRows = useMemo(() => {
    let base = rows;
    if (kpiFilter === 'ACK_CRIT' || kpiFilter === 'ACK_WARN') {
      base = [...rows, ...rememberedOnly];
    }
    let out = base;
    if (messageFilter !== 'ALL') out = out.filter((r) => r.message === messageFilter);
    switch (kpiFilter) {
      case 'PENDING_CRIT':
        out = out.filter((r) => r.severity === 'critical' && r.status === 'open');
        break;
      case 'PENDING_WARN':
        out = out.filter((r) => r.severity === 'warning' && r.status === 'open');
        break;
      case 'ACK_CRIT':
        out = out.filter((r) => r.severity === 'critical' && r.status === 'acknowledged');
        break;
      case 'ACK_WARN':
        out = out.filter((r) => r.severity === 'warning' && r.status === 'acknowledged');
        break;
      default:
        break;
    }
    if (kpiFilter === 'ALL' && holdAckKeys.size) {
      const byKey = new Map(out.map((r) => [keyFor(r), r]));
      rows.forEach((r) => {
        const k = keyFor(r);
        if (holdAckKeys.has(k)) byKey.set(k, r);
      });
      out = Array.from(byKey.values());
    }
    return out;
  }, [rows, rememberedOnly, messageFilter, kpiFilter, holdAckKeys]);

  const toggleCard = (key) => setKpiFilter((prev) => (prev === key ? 'ALL' : key));
  const activeCard = (key) => (kpiFilter === key ? { boxShadow: '0 0 0 2px rgba(25,118,210,.35) inset' } : {});

  return (
    <ShiftSettingsProvider>
      <Box sx={{ p: 1 }}>
        {/* Sticky controls + KPI area */}
        <Box
          sx={{
            position: 'sticky',
            top: 90,
            zIndex: 120,
            bgcolor: '#F5F7FB',
            border: '1px solid #E6EAF2',
            borderRadius: 3,
            px: 2,
            py: 1.5
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Panel Alert Log
            </Typography>

            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              {/* Secondary filters start here */}
              <DatePackage start={start} end={end} onChange={onChangeDateRange} />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="msg-filter">Alert Message</InputLabel>
                <Select labelId="msg-filter" label="Alert Message" value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)}>
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="Returned to Normal">
                    <MessageChip message="Returned to Normal" severity="info" />
                  </MenuItem>
                  <MenuItem value="Warning!!">
                    <MessageChip message="Warning!!" severity="warning" />
                  </MenuItem>
                  <MenuItem value="Critical">
                    <MessageChip message="Critical" severity="critical" />
                  </MenuItem>
                </Select>
              </FormControl>

              {/* PRIMARY: User filter */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="user-filter">User</InputLabel>
                <Select labelId="user-filter" label="User" value={userFilter} onChange={(e) => onChangeUser(e.target.value)}>
                  {MOCK_USERS.map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel id="pgsz">Rows</InputLabel>
                <Select
                  labelId="pgsz"
                  label="Rows"
                  value={pageSize}
                  onChange={(e) => onChangePageSize(e.target.value)}
                  sx={{ minWidth: 90 }}
                >
                  {[10, 20, 30, 50].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title="Refresh now">
                <span>
                  <IconButton
                    size="small"
                    onClick={load}
                    disabled={loading}
                    sx={{
                      animation: loading ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': { to: { transform: 'rotate(360deg)' } }
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={autoRefresh ? 'Auto-refresh ON (40s)' : 'Auto-refresh OFF'}>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Switch size="small" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                </Stack>
              </Tooltip>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={!filteredRows.length}
                onClick={() => exportCSV(filteredRows, `alert_log_${panelId}.csv`)}
              >
                Export
              </Button>
            </Stack>
          </Stack>

          {/* KPI Cards */}
          <Grid container spacing={1.5}>
            <KpiCards statsView={statsView} activeCard={activeCard} toggleCard={toggleCard} totalsView={totalsView} />
          </Grid>
        </Box>

        {/* Table */}
        <Box sx={{ marginTop: 1, marginBottom: 0.1 }}>
          <MainCard>
            <AlertTable loading={loading} rows={filteredRows} keyFor={keyFor} onAcknowledgeClick={onAcknowledgeClick} maxHeight="60vh" />
          </MainCard>
        </Box>

        <PaginationBar page={page} total={total} pageSize={pageSize} onChange={setPage} />

        <AlertTable.NoteDialog
          open={ackDialog.open}
          note={ackDialog.note}
          setNote={(note) => setAckDialog((p) => ({ ...p, note }))}
          onClose={cancelAcknowledge}
          onSave={saveAcknowledge}
        />

        <Snackbar open={toast.open} autoHideDuration={1800} onClose={() => setToast({ ...toast, open: false })}>
          <MUIAlert onClose={() => setToast({ ...toast, open: false })} severity="success" variant="filled" sx={{ width: '100%' }}>
            {toast.msg}
          </MUIAlert>
        </Snackbar>
      </Box>

      <RefreshOverlay show={rows.length > 0 && loading} logoSrc={spinnerLogo} />
    </ShiftSettingsProvider>
  );
}
