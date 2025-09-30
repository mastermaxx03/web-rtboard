// src/views/telemetry/llVoltage/LLVoltagePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack, Switch, Tooltip, Typography, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { ShiftSettingsProvider } from './date/ShiftSettingsContext';
import DatePackage from './date/DatePackage';

import MainCard from './components/MainCard';
import PaginationBar from './components/PaginationBar';
import RefreshOverlay from './components/RefreshOverlay';
import TelemetryTable from './components/TelemetryTable';
import ExportMenu from './components/ExportMenu';

import { fetchLLAggregated } from './data';
import { PERFORMANCE } from './utils';

// You can swap the CSV with any asset; leaving your default filename.
const defaultCsv = new URL('./data/telemetry_ll_voltage.csv', import.meta.url).href;

const AGG_WINDOWS = [
  { key: 0, label: 'RT Data (1s)' }, // ✅ default (no averaging)
  { key: 15, label: 'Average of 15 min' },
  { key: 30, label: 'Average of 30 min' },
  { key: 60, label: 'Average of 1 hr' },
  { key: 240, label: 'Average of 4 hr' },
  { key: 480, label: 'Average of 8 hr' },
  { key: 1440, label: 'Average of 24 hr' }
];

const PERF_FILTERS = ['ALL', PERFORMANCE.ACCEPTABLE, PERFORMANCE.WARNING, PERFORMANCE.CRITICAL];

export default function LLVoltagePage({ panelId = 'MCC10', csvUrl = defaultCsv }) {
  // pagination
  const [pageSize, setPageSize] = useState(500); // default like your screenshot
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // date range (empty => full CSV)
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  // background refresh
  const [autoRefresh, setAutoRefresh] = useState(true);

  // aggregation (0 = RT 1s)
  const [agg, setAgg] = useState(0); // ✅ default REALTIME

  // perf filter
  const [perfFilter, setPerfFilter] = useState('ALL');

  // data state
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const { rows: fetched, total: t } = await fetchLLAggregated({
        panelId,
        start,
        end,
        aggregateMinutes: agg,
        page,
        pageSize,
        csvUrl
      });
      setRows(fetched);
      setTotal(t);
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
  }, [panelId, page, pageSize, start, end, agg, autoRefresh, csvUrl]);

  const onChangeDateRange = ({ start: s, end: e }) => {
    setStart(s);
    setEnd(e);
    setPage(1);
  };

  const onChangePageSize = (n) => {
    setPageSize(n);
    setPage(1); // keep first page when row size changes
  };

  const filteredRows = useMemo(() => (perfFilter === 'ALL' ? rows : rows.filter((r) => r.PERFORMANCE === perfFilter)), [rows, perfFilter]);

  return (
    <ShiftSettingsProvider>
      <Box sx={{ p: 1 }}>
        {/* Sticky controls like alert page */}
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
              3-Phase L-L Voltage
            </Typography>

            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <DatePackage start={start} end={end} onChange={onChangeDateRange} />

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="agg">Aggregation</InputLabel>
                <Select
                  labelId="agg"
                  label="Aggregation"
                  value={agg}
                  onChange={(e) => {
                    setAgg(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {AGG_WINDOWS.map((o) => (
                    <MenuItem key={o.key} value={o.key}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="perf">Performance</InputLabel>
                <Select
                  labelId="perf"
                  label="Performance"
                  value={perfFilter}
                  onChange={(e) => {
                    setPerfFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {PERF_FILTERS.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
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
                  {[60, 100, 200, 500, 1000].map((n) => (
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

              <ExportMenu rows={filteredRows} filename={`ll_voltage_${panelId}`} />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ mt: 1, mb: 0.1 }}>
          <MainCard>
            <TelemetryTable loading={loading} rows={filteredRows} maxHeight="60vh" />
          </MainCard>
        </Box>

        <PaginationBar page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </Box>

      <RefreshOverlay show={rows.length > 0 && loading} />
    </ShiftSettingsProvider>
  );
}
