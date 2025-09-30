// Fetch, normalize, paginate, and derive arrays used by the chart.
import { useEffect, useMemo, useState } from 'react';
import { getTelemetry } from '../utils/historicalApi';
import { normalizeRows } from '../utils/normalize';

export function usePagedTelemetry({ did, from, to, timeFrame, segment, limit, pageSize }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let ab = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await getTelemetry({ did, from, to, timeFrame, segment, limit });
        const norm = normalizeRows(data);
        if (!ab) {
          setRows(norm);
          setPage(0);
        }
      } catch (e) {
        if (!ab) setErr(e?.response?.data?.message || e?.message || 'Request failed');
      } finally {
        if (!ab) setLoading(false);
      }
    })();
    return () => {
      ab = true;
    };
  }, [did, from, to, timeFrame, segment, limit]);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages - 1) setTimeout(() => setPage(totalPages - 1), 0);

  const slice = useMemo(() => {
    const s = page * pageSize,
      e = Math.min(total, s + pageSize);
    return rows.slice(s, e);
  }, [rows, page, pageSize, total]);

  const showSec = /s$/i.test(String(timeFrame || ''));
  const xLabels = useMemo(
    () =>
      slice.map(({ t }) => {
        const d = new Date(t);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        if (!showSec) return `${hh}:${mm}`;
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      }),
    [slice, showSec, timeFrame]
  );

  const prettyLabels = useMemo(
    () =>
      slice.map(({ t }) =>
        new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: showSec ? '2-digit' : undefined,
          hour12: true
        }).format(new Date(t))
      ),
    [slice, showSec]
  );

  const rA = slice.map((x) => x.r);
  const yA = slice.map((x) => x.y);
  const bA = slice.map((x) => x.b);

  const iAvg = useMemo(
    () =>
      slice.map((_, i) => {
        const v = [rA[i], yA[i], bA[i]].filter(Number.isFinite);
        return v.length ? v.reduce((a, c) => a + c, 0) / v.length : null;
      }),
    [slice, rA, yA, bA]
  );

  const devData = useMemo(
    () =>
      slice.map((_, i) => {
        const v = [rA[i], yA[i], bA[i]].filter(Number.isFinite);
        if (v.length < 2) return null;
        const avg = v.reduce((a, c) => a + c, 0) / v.length;
        return Math.max(...v.map((x) => Math.abs(x - avg)));
      }),
    [slice, rA, yA, bA]
  );

  const phaseImbA = useMemo(
    () =>
      slice.map((_, i) => {
        const v = [rA[i], yA[i], bA[i]].filter(Number.isFinite);
        return v.length ? Math.max(...v) - Math.min(...v) : null;
      }),
    [slice, rA, yA, bA]
  );

  return {
    state: { rows, page, loading, err, totalPages, noData: !loading && rows.length === 0 },
    setters: { setPage },
    arrays: { slice, xLabels, prettyLabels, rA, yA, bA, iAvg, devData, phaseImbA }
  };
}
