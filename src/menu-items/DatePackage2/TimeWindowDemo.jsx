import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination
} from '@mui/material';

import data from './data.json';
import { ShiftSettingsProvider } from './ShiftSettingsContext';
import { ZoneSettingsProvider } from './ZoneSettingsContext';
import DatePackage from './DatePackage';

// ---------------- helpers ----------------
function parseTS(v) {
  if (v == null || v === '') return NaN;
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  const s = String(v).replace(/,/g, '').trim();
  const direct = new Date(s).getTime();
  if (Number.isFinite(direct)) return direct;
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?)?$/);
  if (m) {
    let [, dd, mm, yyyy, hh, mi, ap] = m;
    dd = +dd;
    mm = +mm;
    yyyy = +yyyy;
    hh = hh ? +hh : 0;
    mi = mi ? +mi : 0;
    if (ap) {
      const pm = ap.toLowerCase() === 'pm';
      if (pm && hh < 12) hh += 12;
      if (!pm && hh === 12) hh = 0;
    }
    return new Date(yyyy, mm - 1, dd, hh, mi, 0, 0).getTime();
  }
  return NaN;
}

function normalizeRow(r) {
  const t = parseTS(r.TS ?? r.ts ?? r.timestamp);
  return {
    TS: Number.isFinite(t) ? new Date(t).toISOString() : null,
    _tms: t,
    VR: r.VR ?? r.vr ?? null,
    VY: r.VY ?? r.vy ?? null,
    VB: r.VB ?? r.vb ?? null,
    AVG_VLN: r.AVG_VLN ?? r.VAVG ?? r.vavg ?? null,
    Performance: r.Performance ?? r.performance ?? ''
  };
}

function exportCSV(filename, rows) {
  const header = ['TS', 'VR', 'VY', 'VB', 'AVG_VLN', 'Performance'];
  const csv = [
    header.join(','),
    ...rows.map((r) => [r.TS ?? '', r.VR ?? '', r.VY ?? '', r.VB ?? '', r.AVG_VLN ?? '', r.Performance ?? ''].join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Convert DatePackage payload -> demo's tw shape
function dpToTW(payload) {
  if (!payload || !payload.start || !payload.end) return null;

  const { mode, time_window_type, time_zone, tz_display, start, end, aggregation, group_interval_min, shift, zone, windows, zone_windows } =
    payload;

  const label = `${new Date(start).toLocaleString()} – ${new Date(end).toLocaleString()} • Shift ${shift} • Zone ${zone}`;

  return {
    // table logic uses these
    start,
    end,
    agg: aggregation,
    group: (group_interval_min || 0) * 60 * 1000,
    shift,
    tz: tz_display || time_zone || 'UTC',

    // header info
    label,
    pane: mode,
    mode,
    rt: mode === 'realtime',
    zone,

    // carry window arrays to enforce true intersection
    windows: Array.isArray(windows) ? windows : null, // shift windows
    zone_windows: Array.isArray(zone_windows) ? zone_windows : null // zone-slot windows
  };
}

// [start, end) membership check for a list of windows
function inAnyWindow(ts, wins) {
  if (!Array.isArray(wins) || wins.length === 0) return true; // no restriction
  for (const w of wins) {
    const s = new Date(w.start).getTime();
    const e = new Date(w.end).getTime();
    // DatePackage emits [start, end) windows — use strict end bound
    if (ts >= s && ts < e) return true;
  }
  return false;
}

export default function TimeWindowDemo() {
  const baseRows = useMemo(() => (Array.isArray(data) ? data : []).map(normalizeRow).filter((r) => Number.isFinite(r._tms)), []);

  const [tw, setTW] = useState(null);

  // realtime tick
  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => {
    if (!tw?.rt) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [tw?.rt]);

  // filtering + aggregation
  const grouped = useMemo(() => {
    if (!tw) return baseRows.slice().sort((a, b) => a._tms - b._tms); // show ALL when cleared

    const s = new Date(tw.start).getTime();
    const e = new Date(tw.end).getTime();

    // 1) coarse bound filter using overall range
    // 2) intersection with shift windows AND zone windows
    let arr = baseRows
      .filter((r) => r._tms >= s && r._tms <= e)
      .filter((r) => inAnyWindow(r._tms, tw.windows))
      .filter((r) => inAnyWindow(r._tms, tw.zone_windows));

    // optional grouping + aggregation
    if (tw.group > 0 && tw.agg !== 'none') {
      const map = new Map();
      for (const r of arr) {
        const b = Math.floor(r._tms / tw.group) * tw.group;
        if (!map.has(b)) map.set(b, []);
        map.get(b).push(r);
      }
      const cols = ['VR', 'VY', 'VB', 'AVG_VLN'];
      const out = [];
      for (const [b, rows] of map) {
        const obj = { TS: new Date(b).toISOString(), _tms: b, Performance: '' };
        if (tw.agg === 'count') {
          for (const c of cols) obj[c] = rows.length;
        } else {
          for (const c of cols) {
            const vals = rows.map((x) => Number(x[c])).filter(Number.isFinite);
            if (!vals.length) {
              obj[c] = null;
              continue;
            }
            if (tw.agg === 'min') obj[c] = Math.min(...vals);
            if (tw.agg === 'max') obj[c] = Math.max(...vals);
            if (tw.agg === 'sum') obj[c] = vals.reduce((a, v) => a + v, 0);
            if (tw.agg === 'avg') obj[c] = vals.reduce((a, v) => a + v, 0) / vals.length;
          }
        }
        out.push(obj);
      }
      return out.sort((a, b) => a._tms - b._tms);
    }
    return arr.sort((a, b) => a._tms - b._tms);
  }, [baseRows, tw, tick]);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  useEffect(() => {
    setPage(0);
  }, [tw, tick]);
  const paged = useMemo(() => grouped.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [grouped, page, rowsPerPage]);

  return (
    <ShiftSettingsProvider>
      <ZoneSettingsProvider>
        <Card elevation={0} sx={{ p: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Time Window Demo (JSON)
                  </Typography>

                  {/* DatePackage hook-up */}
                  <DatePackage
                    start={tw?.start || ''}
                    end={tw?.end || ''}
                    onChange={(payload) => {
                      // If the DatePackage "Clear" was used, we’ll receive empty bounds.
                      if (!payload?.start || !payload?.end) {
                        setTW(null);
                        return;
                      }
                      setTW(dpToTW(payload));
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" disabled={!grouped.length} onClick={() => exportCSV('export', grouped)}>
                    Export CSV
                  </Button>
                </Stack>
              </Stack>

              <Divider />

              <Box sx={{ px: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Selected window:&nbsp;<strong>{tw?.label || '— (showing all data)'}</strong>
                </Typography>
                {tw && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Pane: {tw.pane} • Mode: {tw.mode} • Realtime: {tw.rt ? 'On' : 'Off'} • Shift: {tw.shift} • Zone: {tw.zone} • TZ: {tw.tz}{' '}
                    • &nbsp;Agg: {tw.agg} • Grouping: {tw.group ? `${tw.group / 60000} min` : 'off'}
                  </Typography>
                )}
              </Box>

              <TableContainer component={Paper} elevation={0}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>TS</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>VR</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>VY</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>VB</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>AVG_VLN</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((r, i) => (
                      <TableRow key={`${r._tms}-${i}`}>
                        <TableCell>{r.TS ? new Date(r.TS).toLocaleString() : '—'}</TableCell>
                        <TableCell>{r.VR ?? '—'}</TableCell>
                        <TableCell>{r.VY ?? '—'}</TableCell>
                        <TableCell>{r.VB ?? '—'}</TableCell>
                        <TableCell>{r.AVG_VLN ?? '—'}</TableCell>
                        <TableCell>{r.Performance || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {paged.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          {tw ? 'No rows in selected window.' : 'Pick a time window and press Update.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <TablePagination
                  component="div"
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  count={grouped.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </TableContainer>
            </Stack>
          </CardContent>
        </Card>
      </ZoneSettingsProvider>
    </ShiftSettingsProvider>
  );
}
