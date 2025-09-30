import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchHistoricalData } from '../api';

function norm(r) {
  const tsRaw = r.TS ?? r.ts ?? r.timestamp;
  const ts = tsRaw ? new Date(String(tsRaw)).getTime() : NaN;
  const dk = Number(r.DELTA_KVAH ?? r.delta_kvah ?? r.deltaKVAH ?? r['DELTA_KVAh'] ?? r['deltaKVAh']);
  return Number.isFinite(ts) && Number.isFinite(dk) ? { ts, deltaKVAh: dk } : null;
}

export function useDidUrlSync(defaultDid = 'E_AA_Z_A_Z_P0001_D1') {
  const [did, setDid] = useState(() => {
    if (typeof window === 'undefined') return defaultDid;
    const qp = new URLSearchParams(window.location.search);
    return qp.get('did') || defaultDid;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const qp = new URLSearchParams(window.location.search);
    if (qp.get('did') !== did) {
      qp.set('did', did);
      window.history.replaceState({}, '', `${window.location.pathname}?${qp.toString()}`);
    }
  }, [did]);
  return [did, setDid];
}

export function useRealTimeData({ did, timeFrame = '15m', segment = 'all', pollSec = 60, autoRefresh = true } = {}) {
  const [stream, setStream] = useState([]);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await fetchHistoricalData({ did, timeFrame, segment });
      const rows = (Array.isArray(data) ? data : []).map(norm).filter(Boolean);
      setStream(rows);
      setError(null);
    } catch (e) {
      setError(e);
    }
  }, [did, timeFrame, segment]);

  useEffect(() => {
    load();
  }, [load]);

  // clock tick
  useEffect(() => {
    const t1 = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t1);
  }, []);

  // polling controlled by toggle
  useEffect(() => {
    if (!autoRefresh) return;
    const t2 = setInterval(load, pollSec * 1000);
    return () => clearInterval(t2);
  }, [load, pollSec, autoRefresh]);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  }, [load]);

  const now = useMemo(() => new Date(tick), [tick]);
  return { stream, isLive: true, now, error, did, refreshing, reload };
}
