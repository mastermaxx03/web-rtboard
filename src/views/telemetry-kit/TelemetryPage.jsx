/**
 * TelemetryPage.jsx
 * - Registry-driven telemetry table
 * - Sticky control bar + identity display (read-only pills)
 * - Download exports ALL filtered rows using loaderArgs
 */
const DEFAULT_DID = 'E_AA_Z_A_Z_P0001_D1';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tooltip,
  Typography,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { ShiftSettingsProvider } from './components/ShiftSettingsContext';
import DatePackage from './components/DatePackage';
import MainCard from './components/MainCard';
import PaginationBar from './components/PaginationBar';
import RefreshOverlay from './components/RefreshOverlay';
import TelemetryTable from './components/TelemetryTable';
import ExportMenu from './components/ExportMenu';

import { loadTelemetry } from './data/telemetryLoader';
import { PERFORMANCE } from './utils';

/* NEW: URL DID helpers */
import { ensureDidInURL, getDidFromURL, setDidInURL } from './data/didParam';

/* registry */
import llVoltage from './config/llVoltage.config';
import lnVoltage from './config/lnVoltage.config';
import current from './config/current.config';
import power from './config/power.config';
import harmonics from './config/harmonics.config';
import pf from './config/pf.config';
import frequency from './config/frequency.config';
import energy from './config/energy.config';
import totalPower from './config/totalPower.config';

const REGISTRY = { llVoltage, lnVoltage, current, power, harmonics, pf, frequency, energy, totalPower };

/* read-only pill */
function DisplayPill({ label, value }) {
  return (
    <Chip
      variant="outlined"
      color="primary"
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, lineHeight: 1 }}>
          <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
          <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{value || '—'}</Typography>{' '}
        </Box>
      }
      sx={{ px: 1.1, py: 0.9, borderRadius: 999, fontWeight: 700 }}
    />
  );
}

export default function TelemetryPage() {
  const { componentID } = useParams();
  const cfg = REGISTRY[componentID] ?? REGISTRY['llVoltage'];

  // page/pagination
  const [pageSize, setPageSize] = useState(cfg.pageSizes?.[0] ?? 10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // date range (default: last 1 hour – still shown in UI)
  const nowIso = new Date().toISOString();
  const oneHourAgoIso = new Date(Date.now() - 3600 * 1000).toISOString();
  const [start, setStart] = useState(oneHourAgoIso);
  const [end, setEnd] = useState(nowIso);

  // refresh
  const [autoRefresh, setAutoRefresh] = useState(true);

  // aggregation
  const [agg, setAgg] = useState(0);

  // performance filter
  const [perfFilter, setPerfFilter] = useState('ALL');

  // identity selections (kept for loader API)
  // NEW: bootstrap DID from URL or default
  const [selDID, setSelDID] = useState(getDidFromURL() || DEFAULT_DID);
  const [selSID, setSelSID] = useState('');
  const [selPanel, setSelPanel] = useState('');
  const [selLoc, setSelLoc] = useState('');

  // facets
  const [facets, setFacets] = useState({ dids: [], sids: [], panels: [], locations: [] });

  // data
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const singleOrEmpty = (arr) => (Array.isArray(arr) && arr.length === 1 ? arr[0] : '');

  // >>> EXACT WINDOW (seconds) — keep or remove as needed <<<
  const FIXED_FROM_SEC = 1754015166;
  const FIXED_TO_SEC = 1754792766;

  const queryOptions = {
    csvUrl: cfg.csvUrl,
    dataUrl: cfg.dataUrl,
    normalize: cfg.normalize,
    finalize: cfg.finalize,
    aggregateMinutes: agg,
    aggregationStrategy: cfg.aggregation ?? {},
    segment: cfg.segment || 'all',
    segments: cfg.segments || (cfg.segment ? [cfg.segment] : ['all']),
    start,
    end,
    filter: {
      DID: selDID || undefined,
      SID: selSID || undefined,
      panel_name: selPanel || undefined,
      panel_location: selLoc || undefined
    },
    overrideFromSec: FIXED_FROM_SEC,
    overrideToSec: FIXED_TO_SEC
  };

  const doLoad = async () => {
    setLoading(true);
    try {
      const {
        rows: fetched,
        total: t,
        facets: f
      } = await loadTelemetry({
        ...queryOptions,
        page,
        pageSize
      });

      const nextDID = selDID || singleOrEmpty(f?.dids);
      const nextSID = selSID || singleOrEmpty(f?.sids);
      const nextPanel = selPanel || singleOrEmpty(f?.panels);
      const nextLoc = selLoc || singleOrEmpty(f?.locations);

      if (nextDID && nextDID !== selDID) {
        setSelDID(nextDID);
        // NEW: keep URL in sync whenever DID settles
        setDidInURL(nextDID, { replace: true });
      }
      if (nextSID !== selSID) setSelSID(nextSID);
      if (nextPanel !== selPanel) setSelPanel(nextPanel);
      if (nextLoc !== selLoc) setSelLoc(nextLoc);

      setRows(fetched);
      setTotal(t);
      setFacets(f);

      /* eslint-disable no-console */
      // console.log('[TelemetryPage] rows:', fetched.length, fetched.slice(0, 3));
      // console.log('[TelemetryPage] total:', t, 'facets:', f);
      /* eslint-enable no-console */
    } finally {
      setLoading(false);
    }
  };

  // NEW: ensure URL carries a DID on first mount
  useEffect(() => {
    ensureDidInURL(DEFAULT_DID);
  }, []);

  useEffect(() => {
    doLoad();
    if (!autoRefresh) return;
    const id = setInterval(doLoad, 40000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentID, page, pageSize, start, end, agg, autoRefresh, selDID, selSID, selPanel, selLoc]);

  const onChangeDateRange = ({ start: s, end: e }) => {
    setStart(s);
    setEnd(e);
    setPage(1);
  };
  const onChangePageSize = (n) => {
    setPageSize(Number(n));
    setPage(1);
  };

  const filteredRows = useMemo(() => (perfFilter === 'ALL' ? rows : rows.filter((r) => r.PERFORMANCE === perfFilter)), [rows, perfFilter]);

  return (
    <ShiftSettingsProvider>
      <Box sx={{ p: 1 }}>
        <Box
          sx={{
            position: 'sticky',
            top: 90,
            zIndex: 120,
            bgcolor: '#F5F7FB',
            border: '1px solid #E6EAF2',
            borderRadius: 3,
            px: 2,
            py: 1.25
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {cfg.title}{' '}
            </Typography>

            <Stack direction="row" gap={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <DatePackage start={start} end={end} onChange={onChangeDateRange} />

              <FormControl size="small" sx={{ minWidth: 210 }}>
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
                  {(cfg.aggWindows ?? [{ key: 0, label: 'RT Data (1s)' }]).map((o) => (
                    <MenuItem key={o.key} value={o.key}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
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
                  {['ALL', PERFORMANCE.ACCEPTABLE, PERFORMANCE.WARNING, PERFORMANCE.CRITICAL].map((p) => (
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
                  sx={{ minWidth: 110 }}
                >
                  {(cfg.pageSizes ?? [10, 25, 50, 100, 250]).map((n) => (
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
                    onClick={doLoad}
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

              <ExportMenu
                filename={`${cfg.exportBase}_${componentID}`}
                columns={cfg.columns}
                loaderArgs={queryOptions}
                rows={filteredRows}
              />
            </Stack>
          </Stack>

          <Box sx={{ background: '#fff', border: '1px solid #E6EAF2', borderRadius: 2, px: 1.5, py: 0.75 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography sx={{ fontWeight: 800, mr: 0.5 }}>Device / Panel</Typography>
              <DisplayPill label="DID" value={selDID || (facets.dids?.[0] ?? '')} />
              <DisplayPill label="SID" value={selSID || (facets.sids?.[0] ?? '')} />
              <DisplayPill label="Panel" value={selPanel || (facets.panels?.[0] ?? '')} />
              <DisplayPill label="Location" value={selLoc || (facets.locations?.[0] ?? '')} />
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            </Stack>
          </Box>
        </Box>

        <Box sx={{ mt: 1, mb: 0.1 }}>
          <MainCard>
            <TelemetryTable loading={loading} rows={filteredRows} columns={cfg.columns} maxHeight="60vh" />
          </MainCard>
        </Box>

        <PaginationBar page={page} total={total} pageSize={pageSize} onChange={setPage} />
      </Box>

      <RefreshOverlay show={rows.length > 0 && loading} />
    </ShiftSettingsProvider>
  );
}
