// src/views/rtw/FrequencyHistoryChart.jsx
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { fetchHistoricalData } from '../../../utils/6h';

// ⬇️ Unified date+preset+shift(+agg/interval) control
import UnifiedDateControls from '../Date Component/Date4';

/* ---------------- Bands ---------------- */
const defaultBands = {
  green: [49.5, 50.5],
  yellow: [
    [49.2, 49.5],
    [50.5, 50.8]
  ],
  red: [
    [48.0, 49.2],
    [50.8, 52.0]
  ]
};

/* ---------------- Helpers ---------------- */
function classifyColors(hz, bands = defaultBands) {
  const [g0, g1] = bands?.green || [49.5, 50.5];
  const y = bands?.yellow || [];
  const inGreen = hz >= g0 && hz <= g1;
  const inYellow =
    (y[0] && hz >= y[0][0] && hz <= y[0][1]) ||
    (y[1] && hz >= y[1][0] && hz <= y[1][1]);

  if (inGreen) {
    return { label: 'Acceptable', solid: '#0E9F6E',
      barGradient: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#0E9F6E'},{offset:1,color:'#0E9F6E'}]),
      tipColor: '#0E9F6E' };
  }
  if (inYellow) {
    return { label: 'Warning', solid: '#D97706',
      barGradient: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#D97706'},{offset:1,color:'#D97706'}]),
      tipColor: '#D97706' };
  }
  return { label: 'Critical', solid: '#E86100',
    barGradient: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#E86100'},{offset:1,color:'#E86100'}]),
    tipColor: '#E86100' };
}

function fmtFull(ms, useUTC = false) {
  const d = new Date(ms);
  const y = useUTC ? d.getUTCFullYear() : d.getFullYear();
  const mo = d.toLocaleString(undefined, { month: 'long', timeZone: useUTC ? 'UTC' : undefined });
  const day = useUTC ? d.getUTCDate() : d.getDate();
  const h24 = useUTC ? d.getUTCHours() : d.getHours();
  const ap = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(useUTC ? d.getUTCMinutes() : d.getMinutes()).padStart(2, '0');
  return `${day} ${mo} ${y} ${h12}:${mm} ${ap}`;
}

const hhmmFromTs = (ms, mode = 'utc') => {
  const d = new Date(ms);
  const h = mode === 'utc' ? d.getUTCHours() : d.getHours();
  const m = mode === 'utc' ? d.getUTCMinutes() : d.getMinutes();
  const two = (n) => String(n).padStart(2, '0');
  return `${two(h)}:${two(m)}`;
};

/* -------- nice ticks / auto scale -------- */
function niceStep(span) {
  if (span <= 0.05) return 0.01;
  if (span <= 0.10) return 0.02;
  if (span <= 0.25) return 0.05;
  if (span <= 0.5)  return 0.1;
  if (span <= 1.0)  return 0.2;
  return 0.5;
}
const floorTo = (v, step) => Math.floor(v / step) * step;
const ceilTo  = (v, step) => Math.ceil(v / step) * step;

/* ====================== COMPONENT ====================== */
export default function FrequencyHistoryChart({
  mode = 'auto',
  data: staticData,
  fetchOverrides = {},
  fetchOptions = {},
  refreshIntervalMs = null,
  panelName = '',
  did = '',
  bands = defaultBands,

  // chart scaling
  yMin = 48,
  yMax = 52,
  autoScale = true,
  autoPad = 0.02,

  pageSize = 120,
  timeBase = 'utc'
}) {
  const useUTC = timeBase === 'utc';

  const wrapperRef = useRef(null);
  const chartInstRef = useRef(null);

  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // unified control state
  const makeTodayRange = () => {
      const now = new Date();
      const start = (timeBase === 'utc')
        ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
        : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = (timeBase === 'utc')
        ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))
        : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString(), label: 'Today', meta: { preset: 'TODAY', shift: 'ALL' } };
    };
  
    const [dateRange, setDateRange] = useState(() => makeTodayRange());
  const [rangeInitialized, setRangeInitialized] = useState(false);
  const [aggregation, setAggregation] = useState('avg');   // not used by API yet, but accepted from control
  const [intervalMin, setIntervalMin] = useState(15);     // not used by API yet

  // label↔code helpers (keep consistent with other charts)
  const aggLabelToCode = { Average: 'avg', Min: 'min', Max: 'max', Sum: 'sum' };
  const aggCodeToLabel = { avg: 'Average', min: 'Min', max: 'Max', sum: 'Sum' };
  const parseIntervalLabelToMinutes = (label) => {
    if (!label) return 15;
    const m = /(\d+)\s*(s|min|hour)/i.exec(label);
    if (!m) return 15;
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    if (unit === 'hour') return n * 60;
    if (unit === 'min') return n;
    if (unit === 's') return Math.max(1, Math.round(n / 60));
    return 15;
  };
  const minutesToIntervalLabel = (m) => (m % 60 === 0 ? `${m / 60} hour` : `${m} min`);

  /* ---------------- fetch ---------------- */
  useEffect(() => {
    const shouldFetch = (mode === 'remote' || (mode === 'auto' && !staticData));
    if (!shouldFetch) return;

    const ac = new AbortController();
    let timer;

    const fetchOnce = async () => {
      try {
        setLoading(true);
        setErr(null);

        const tz =
          fetchOverrides?.tz ??
          (useUTC ? 'UTC' : (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } })());

        const { data, meta } = await fetchHistoricalData(
          {
            ...fetchOverrides,
            tz,
            from: dateRange.start || fetchOverrides.from,
            to:   dateRange.end   || fetchOverrides.to,
            // if your endpoint later supports these, they're ready:
            aggregation,
            intervalMinutes: intervalMin,
          },
          { signal: ac.signal, ...fetchOptions }
        );

        const rows = Array.isArray(data) ? data.slice() : [];
        rows.sort((a, b) => {
          const ats = a.TS ?? a.ts ?? a.timestamp ?? a.time ?? a.TIME ?? 0;
          const bts = b.TS ?? b.ts ?? b.timestamp ?? b.time ?? b.TIME ?? 0;
          const ams = typeof ats === 'number' ? (ats < 1e12 ? ats * 1000 : ats) : +new Date(ats);
          const bms = typeof bts === 'number' ? (bts < 1e12 ? bts * 1000 : bts) : +new Date(bts);
          return ams - bms;
        });

        const bySlot = new Map();
        for (const row of rows) {
          const ts = row.TS ?? row.ts ?? row.timestamp ?? row.time ?? row.TIME;
          const freq = row.FREQUENCY ?? row.frequency ?? row.freq ?? row.Freq;
          const ms = (typeof ts === 'number') ? (ts < 1e12 ? ts * 1000 : ts) : (ts ? +new Date(ts) : NaN);
          if (!Number.isFinite(ms)) continue;
          const t = hhmmFromTs(ms, timeBase);
          const hz = (freq != null && isFinite(+freq)) ? +(+freq).toFixed(3) : null;
          if (hz == null) continue;
          bySlot.set(t, { hz, ms });
        }

        const pts = Array.from(bySlot.entries()).map(([t, v]) => ({ t, hz: v.hz, ms: v.ms }));

        setRemote({
          points: pts,
          bands,
          meta: {
            panelName: meta?.panelName ?? panelName ?? 'Panel',
            did: meta?.did ?? did ?? '-'
          }
        });

        if (!rangeInitialized && rows.length) {
          const all = rows.map(r => r.TS ?? r.ts ?? r.timestamp ?? r.time ?? r.TIME)
            .map(v => (typeof v === 'number' ? (v < 1e12 ? v * 1000 : v) : +new Date(v)))
            .filter(Number.isFinite);
          if (all.length) {
            const minMs = Math.min(...all), maxMs = Math.max(...all);
            const minD = new Date(minMs), maxD = new Date(maxMs);
            const start = useUTC
              ? new Date(Date.UTC(minD.getUTCFullYear(), minD.getUTCMonth(), minD.getUTCDate(), 0,0,0,0)).toISOString()
              : new Date(minD.getFullYear(), minD.getMonth(), minD.getDate(), 0,0,0,0).toISOString();
            const end = useUTC
              ? new Date(Date.UTC(maxD.getUTCFullYear(), maxD.getUTCMonth(), maxD.getUTCDate(), 23,59,59,999)).toISOString()
              : new Date(maxD.getFullYear(), maxD.getMonth(), maxD.getDate(), 23,59,59,999).toISOString();
            setDateRange({ start, end, label: '', meta: { preset: 'fromAPI', shift: 'ALL' } });
            setRangeInitialized(true);
          }
        }
      } catch (e) {
        setErr(e?.response?.status === 401 ? 'Not authorized. Please sign in again.' : (e?.message || String(e)));
        setRemote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOnce();
    if (refreshIntervalMs && refreshIntervalMs > 0) timer = setInterval(fetchOnce, refreshIntervalMs);
    return () => { ac.abort(); if (timer) clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode, staticData,
    JSON.stringify(fetchOverrides), JSON.stringify(fetchOptions),
    refreshIntervalMs, timeBase,
    dateRange.start, dateRange.end, rangeInitialized, bands, panelName, did,
    aggregation, intervalMin
  ]);

  /* ---------------- Choose source ---------------- */
  const src = useMemo(() => {
   const empty = { points: [], bands, meta: { panelName: panelName || 'Panel', did: did || '-' } };
   if (mode === 'static' && staticData) return staticData;
   if ((mode === 'remote' || mode === 'auto') && remote) return remote;
   // if fetch failed or nothing yet, show empty (your "No records" overlay will handle UX)
   if (err) return empty;
   return staticData || empty;
 }, [mode, staticData, remote, err, bands, panelName, did]);

  const metaPanel = src?.meta?.panelName ?? panelName ?? 'Panel';
  const metaDid   = src?.meta?.did ?? did ?? '-';

  const labelsAll = useMemo(() => (Array.isArray(src?.points) ? src.points.map(p => p.t) : []), [src]);
  const valuesAll = useMemo(() => (Array.isArray(src?.points) ? src.points.map(p => p.hz) : []), [src]);
  const msAll     = useMemo(() => (Array.isArray(src?.points) ? src.points.map(p => p.ms ?? null) : []), [src]);

  const avgVal = useMemo(() => {
    const vals = (src?.points || []).map(p => +p.hz).filter(Number.isFinite);
    if (!vals.length) return (yMin + yMax) / 2;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  }, [src, yMin, yMax]);

  /* ---------------- Pagination ---------------- */
  const [page, setPage] = useState(0);
  const totalCats = labelsAll.length;
  const totalPages = Math.max(1, Math.ceil(totalCats / pageSize));
  useEffect(() => { if (page > totalPages - 1) setPage(totalPages - 1); /* eslint-disable-next-line */ }, [totalPages]);

  const pageSlice = useMemo(() => {
    const start = page * pageSize;
    const end = Math.min(totalCats, start + pageSize);
    return {
      labels: labelsAll.slice(start, end),
      values: valuesAll.slice(start, end),
      ms:     msAll.slice(start, end)
    };
  }, [labelsAll, valuesAll, msAll, page, pageSize, totalCats]);

  /* --------- Auto Y scale for this page --------- */
  const { yMinFinal, yMaxFinal, yStep } = useMemo(() => {
    const vals = (pageSlice.values || []).filter(Number.isFinite);
    if (!vals.length || !autoScale) {
      const span = Math.max(0.0001, yMax - yMin);
      return { yMinFinal: yMin, yMaxFinal: yMax, yStep: niceStep(span) };
    }
    let vmin = Math.min(...vals), vmax = Math.max(...vals);
    if (vmax - vmin < 1e-6) { vmin -= 0.01; vmax += 0.01; }
    vmin -= autoPad; vmax += autoPad;
    const span = Math.max(0.0001, vmax - vmin);
    const step = niceStep(span);
    const minSnap = floorTo(vmin, step);
    const maxSnap = ceilTo(vmax, step);
    return { yMinFinal: +minSnap.toFixed(3), yMaxFinal: +maxSnap.toFixed(3), yStep: step };
  }, [pageSlice.values, autoScale, autoPad, yMin, yMax]);

  /* ---------------- Layout + zoom behaviors ---------------- */
  const [dims, setDims] = useState({ width: 800, height: 560, font: 12, nameFont: 16 });

  const getVVH = () =>
    (window.visualViewport && typeof window.visualViewport.height === 'number')
      ? window.visualViewport.height
      : window.innerHeight;

  const recalc = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = getVVH();
    const isMobile = vw < 520;

    const availableH = Math.max(isMobile ? 420 : 460, Math.floor(vh - rect.top - 8));
    const w = Math.max(320, Math.floor(vw));
    const font = w < 420 ? 10 : w < 768 ? 11 : 12;
    const nameFont = w < 420 ? 14 : w < 768 ? 15 : 16;
    setDims({ width: w, height: availableH, font, nameFont });

    requestAnimationFrame(() => {
      chartInstRef.current?.resize?.();
      applyBarSpecs(getVisibleCount() || pageSlice.labels.length || pageSize);
    });
  };

  useLayoutEffect(() => {
    recalc();
    const schedule = () => requestAnimationFrame(recalc);
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    const ro = new ResizeObserver(schedule);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => { window.removeEventListener('resize', schedule); window.removeEventListener('orientationchange', schedule); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // lock page scroll behind the card
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflowY;
    const prevBodyOverflow = body.style.overflowY;
    html.style.overflowY = 'hidden';
    body.style.overflowY = 'hidden';
    return () => { html.style.overflowY = prevHtmlOverflow; body.style.overflowY = prevBodyOverflow; };
  }, []);

  // zoom-aware bar widths
  const computeBarSpecPct = (visibleCats, { bars = 1, baseOcc = 0.58, gapFactor = 0.25 }) => {
    const occ =
      visibleCats > 200 ? Math.max(0.58, baseOcc - 0.06) :
      visibleCats > 120 ? Math.max(0.60, baseOcc - 0.04) :
      visibleCats > 80  ? Math.max(0.62, baseOcc - 0.02) :
                          baseOcc;
    const barW = (occ * 100) / (bars + (bars - 1) * gapFactor);
    const barWidthPct = Math.max(4, Math.min(28, +barW.toFixed(2)));
    const barGapPercent = Math.round(gapFactor * 100);
    const catGapPercent = Math.round((1 - occ) * 100);
    return { barWidthPct, barGapPercent, catGapPercent };
  };

  const getVisibleCount = () => {
    const inst = chartInstRef.current;
    const n = pageSlice.labels.length || 0;
    if (!inst || !n) return n;
    let opt;
    try { opt = inst.getOption(); } catch { return n; }
    const dz = (Array.isArray(opt?.dataZoom) ? opt.dataZoom : [])[0] || {};
    let start = 0, end = n - 1;
    if (dz.startValue != null || dz.endValue != null) {
      start = Math.max(0, Math.min(n - 1, dz.startValue ?? 0));
      end   = Math.max(0, Math.min(n - 1, dz.endValue   ?? (n - 1)));
    } else if (dz.start != null || dz.end != null) {
      const s = Math.max(0, Math.min(100, dz.start ?? 0)) / 100;
      const e = Math.max(0, Math.min(100, dz.end   ?? 100)) / 100;
      start = Math.floor(s * (n - 1));
      end   = Math.ceil(e * (n - 1));
    }
    return Math.max(1, end - start + 1);
  };

  const applyBarSpecs = (visible) => {
    const spec = computeBarSpecPct(visible, { bars: 1, baseOcc: 0.58, gapFactor: 0.25 });
    try {
      chartInstRef.current?.setOption({
        series: [{ id: 'freqBars', barWidth: `${spec.barWidthPct}%`, barGap: `${spec.barGapPercent}%`, barCategoryGap: `${spec.catGapPercent}%`, barMaxWidth: 46 }]
      }, { lazyUpdate: true });
    } catch {}
  };

  const resetZoomToFullPage = () => {
    const inst = chartInstRef.current; const n = pageSlice.labels.length;
    if (!inst || !n) return;
    try { inst.dispatchAction({ type: 'dataZoom', startValue: 0, endValue: n - 1 }); } catch {}
  };

  /* ---------------- Fullscreen (icon) ---------------- */
  const [isFS, setIsFS] = useState(false);

  const enterFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      // Safari
      // @ts-ignore
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

      if (screen.orientation?.lock) {
        try { await screen.orientation.lock('landscape'); } catch {}
      }
    } catch {}
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
      // Safari
      // @ts-ignore
      else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
    } catch {}
  };

  useEffect(() => {
    const onFS = () => {
      const fs = !!(document.fullscreenElement || /* safari */ document.webkitFullscreenElement);
      setIsFS(fs);
      setTimeout(() => chartInstRef.current?.resize?.(), 80);
    };
    const onOrient = () => setTimeout(() => chartInstRef.current?.resize?.(), 120);
    document.addEventListener('fullscreenchange', onFS);
    // @ts-ignore
    document.addEventListener('webkitfullscreenchange', onFS);
    window.addEventListener('orientationchange', onOrient);
    return () => {
      document.removeEventListener('fullscreenchange', onFS);
      // @ts-ignore
      document.removeEventListener('webkitfullscreenchange', onFS);
      window.removeEventListener('orientationchange', onOrient);
    };
  }, []);

  /* ---------------- Legend icon for dashed F_avg ---------------- */
  const FAVG_ICON =
    'image://data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="12">' +
      '<line x1="2" y1="6" x2="42" y2="6" stroke="#3e3e3eff" stroke-width="3" stroke-dasharray="6,6" stroke-linecap="round" />' +
      '</svg>'
    );

  /* ---------------- Chart options ---------------- */
  const isMobile = dims.width < 520;
  const gridLeft   = isFS ? 46 : (isMobile ? 58 : 78);
  const gridRight  = isFS ? 30 : (isMobile ? 40 : 66);
  const gridTop    = isFS ? 24 : (isMobile ? 96 : 110);
  const gridBottom = isFS ? 30 : (isMobile ? 88 : 108);

  const option = useMemo(() => ({
    // ✅ Keep background white in both modes
    backgroundColor: '#ffffff',
    useDirtyRect: true,
    animation: false,

    grid: [{ top: gridTop, left: gridLeft, right: gridRight, bottom: gridBottom, containLabel: true }],

    legend: [{
      show: !isFS,
      type: 'plain',
      right: isMobile ? 10 : 18,
      bottom: isMobile ? 8 : 12,
      align: 'right',
      itemWidth: 16, itemHeight: 12, itemGap: isMobile ? 10 : 14,
      // Use light theme colors even in fullscreen
      textStyle: { color: '#374151', fontSize: isMobile ? 12 : 14, fontWeight: 600 },
      data: isMobile
        ? [{ name: 'Frequency', itemStyle: { color:'#0E9F6E'}, icon: 'roundRect' }, { name: 'F_avg', icon: FAVG_ICON }]
        : [
            { name: 'Frequency',  itemStyle: { color:'#0E9F6E'}, icon: 'roundRect' },
            { name: 'F_avg',      icon: FAVG_ICON },
            { name: 'Acceptable', itemStyle: { color: '#0E9F6E' }, icon: 'roundRect' },
            { name: 'Warning',    itemStyle: { color: '#D97706' }, icon: 'roundRect' },
            { name: 'Critical',   itemStyle: { color: '#E86100' }, icon: 'roundRect' }
          ]
    }],

    dataZoom: [{
      id: 'xzoom-inside', type: 'inside', xAxisIndex: [0],
      filterMode: 'none', zoomOnMouseWheel: true, moveOnMouseMove: true, moveOnMouseWheel: true, pinch: true, throttle: 16,
      startValue: 0, endValue: Math.max(0, (pageSlice.labels?.length || 1) - 1)
    }],

    tooltip: {
      show: !isFS,
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148,163,184,0.14)' }, snap: true },
      backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1,
      textStyle: { color: '#111827', fontSize: isMobile ? Math.max(10, dims.font - 1) : dims.font },
      extraCssText: 'box-shadow:0 10px 30px rgba(0,0,0,0.12);padding:10px 12px;border-radius:12px;',
      formatter: (p) => {
        const i = p?.[0]?.dataIndex ?? 0;
        const hz = pageSlice.values[i];
        if (hz == null) return '';
        const { label, tipColor } = classifyColors(hz, bands);
        const full = msAll.length ? fmtFull(pageSlice.ms[i], useUTC) : pageSlice.labels[i];
        const dot = (c) => `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};margin-right:8px"></span>`;
        return `
          <div style="min-width:${isMobile ? 200 : 260}px">
            <div style="font-weight:800;margin-bottom:8px">${full}</div>
            <div style="display:flex;justify-content:space-between;margin:4px 0">
              <span style="display:flex;align-items:center;color:#6b7280">${dot(tipColor)}Frequency</span>
              <span style="font-weight:700;color:#111827">${(+hz).toFixed(3)} Hz</span>
            </div>
            <div style="font-size:12px;color:#6b7280;margin-top:6px">
              STATUS:
              <span style="display:inline-block;padding:2px 8px;margin-left:6px;border-radius:999px;background:${tipColor}1A;color:${tipColor};font-weight:700;">
                ${label}
              </span>
            </div>
          </div>`;
      }
    },

    xAxis: [{
      type: 'category',
      boundaryGap: true,
      name: 'TIME',
      nameLocation: 'middle',
      nameGap: isFS ? 25 : (isMobile ? 20 : 26),
      // Light theme colors in both modes
      nameTextStyle: { color: '#374151', fontWeight: 700, fontSize: `${dims.nameFont}px` },
      data: pageSlice.labels,
      axisLabel: { color: '#6b7280', fontSize: dims.font, hideOverlap: true },
      axisTick: { show: false, alignWithLabel: true },
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    }],

    yAxis: [{
      type: 'value',
      name: 'FREQUENCY (Hz)',
      nameLocation: 'middle',
      nameGap: isFS ? 50 : (isMobile ? 42 : 52),
      nameTextStyle: { color: '#374151', fontWeight: 700, fontSize: `${dims.nameFont}px` },
      min: yMinFinal,
      max: yMaxFinal,
      interval: yStep,
      axisLabel: {
        color: '#6b7280',
        fontSize: dims.font,
        formatter: (v) => (yStep < 0.05 ? (+v).toFixed(3) : (+v).toFixed(1))
      },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eef2f7' } }
    }],

    series: [
      {
        id: 'freqBars',
        name: 'Frequency',
        type: 'bar',
        data: pageSlice.values,
        barWidth: '16%', barGap: '25%', barCategoryGap: '34%', barMaxWidth: 46,
        large: true, progressive: 2000, progressiveThreshold: 3000,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (p) => {
            const v = p.data;
            if (v == null || !Number.isFinite(v)) return 'rgba(0,0,0,0.06)';
            return classifyColors(+v, bands).barGradient;
          }
        },
        emphasis: { focus: 'none' }
      },
      {
        id: 'favg',
        name: 'F_avg',
        type: 'line',
        data: pageSlice.values.map(() => (avgVal ?? null)),
        smooth: false,
        symbol: 'none',
        // Use light theme color in both modes
        lineStyle: { width: 2, type: 'dashed', color: '#4d4c4cff' },
        z: 6
      }
    ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [pageSlice, dims, yMinFinal, yMaxFinal, yStep, avgVal, bands, useUTC, isMobile, isFS, gridTop, gridLeft, gridRight, gridBottom]);

  const onEvents = {
    datazoom: () => {
      const v = getVisibleCount() || pageSlice.labels.length || 1;
      applyBarSpecs(v);
    }
  };

  /* ---------------- Render ---------------- */
  const noRecords =
    !loading &&
    mode !== 'static' &&
    (dateRange.start || dateRange.end) &&
    !!remote &&
    Array.isArray(remote.points) &&
    remote.points.length === 0;

  const totalPagesDisplay = Math.max(1, Math.ceil((labelsAll.length || 0) / pageSize));
  const isMobileHeader = dims.width < 520;
  const headerGrid = isMobileHeader ? 'auto' : '1fr auto';
  const headerAlign = isMobileHeader ? 'stretch' : 'center';

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: `${dims.height}px`,
        // ✅ Keep container white in fullscreen too
        background: '#fff',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 12
      }}
    >
      {/* Header & UnifiedDateControls (hidden in fullscreen) */}
      {!isFS && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 12,
            right: 12,
            zIndex: 6,
            display: 'grid',
            gridTemplateColumns: headerGrid,
            alignItems: headerAlign,
            gap: 10
          }}
        >
          <div style={{ marginTop: isMobileHeader ? 8 : 20, textAlign: isMobileHeader ? 'left' : 'left' , width: '100%' }}>
            <div style={{ fontWeight: 900, fontSize: isMobileHeader ? 20 : 22, color: '#0f172a', lineHeight: 1.1 }}>
              Frequency (Hz)
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>Panel Name: {metaPanel || "Default"}</div>
            <div style={{ marginTop: 2, fontSize: 12, color: '#6b7280' }}>Device ID: {metaDid}</div>
          </div>

          <div style={{ justifySelf: isMobileHeader ? 'stretch' : 'end' }}>
            <UnifiedDateControls
              value={{
                start: dateRange.start,
                end: dateRange.end,
                shift: dateRange.meta?.shift || 'ALL',
                preset: dateRange.meta?.preset || '',
                aggregation: aggCodeToLabel[aggregation],
                interval: minutesToIntervalLabel(intervalMin)
              }}
              onChange={(r) => {
                // (optional) read these if your API starts using them
                setAggregation(aggLabelToCode[r.aggregation] ?? 'avg');
                setIntervalMin(parseIntervalLabelToMinutes(r.interval));

                // Date range + shift
                const next = {
                  start: r?.start || '',
                  end: r?.end || '',
                  label: r?.label || '',
                  meta: { preset: r?.preset || '', shift: r?.shift || 'ALL' }
                };
                setDateRange(next);
                setPage(0);
              }}
              aggregationOptions={['Average', 'Min', 'Max', 'Sum']}
              intervalOptions={['5 min', '15 min', '30 min', '1 hour']}
              maxSpanDays={93}
            />
          </div>
        </div>
      )}

      {/* Fullscreen icon — moved to bottom-left to avoid overlap */}
      <button
        onClick={() => (isFS ? exitFullscreen() : enterFullscreen())}
        title={isFS ? 'Exit fullscreen' : 'Fullscreen (rotate)'}
        aria-label={isFS ? 'Exit fullscreen' : 'Enter fullscreen'}
        style={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          zIndex: 8,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(0,0,0,0.08)',
          background: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          opacity: 0.96
        }}
      >
        {!isFS ? (
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 3H3v4M3 3l6 6M17 3h4v4M21 3l-6 6M7 21H3v-4M3 21l6-6M17 21h4v-4M21 21l-6-6"
                  stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3H3v6M3 3l8 8M15 3h6v6M21 3l-8 8M9 21H3v-6M3 21l8-8M15 21h6v-6M21 21l-8-8"
                  stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <ReactECharts
        option={option}
        notMerge
        lazyUpdate
        onEvents={{ datazoom: () => applyBarSpecs(getVisibleCount() || pageSlice.labels.length || pageSize) }}
        style={{ width: '100%', height: '100%' }}
        onChartReady={(inst) => {
          chartInstRef.current = inst;
          requestAnimationFrame(() => {
            inst.resize?.();
            resetZoomToFullPage();
            applyBarSpecs(getVisibleCount() || pageSlice.labels.length || pageSize);
            setTimeout(() => {
              inst.resize?.();
              resetZoomToFullPage();
              applyBarSpecs(getVisibleCount() || pageSlice.labels.length || pageSize);
            }, 60);
          });
        }}
        opts={{ renderer: 'canvas' }}
      />

      {/* Soft overlay when selected range returns no rows (hidden in FS) */}
      {!isFS && !loading && mode !== 'static' && (dateRange.start || dateRange.end) && remote && Array.isArray(remote.points) && remote.points.length === 0 && (
        <div
          style={{
            position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:5, pointerEvents:'none'
          }}
        >
          <div style={{
            background:'rgba(255,255,255,0.92)', border:'1px solid #e5e7eb', borderRadius:12,
            padding:'10px 14px', fontSize:12, color:'#6b7280', boxShadow:'0 6px 20px rgba(0,0,0,0.06)'
          }}>
            No records found for the selected range.
          </div>
        </div>
      )}

      {/* Pager (hidden in FS) */}
      {!isFS && pageSlice.labels.length > 0 && (
        <div
          style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 8, zIndex: 6,
            display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.9)',
            border: '1px solid #e5e7eb', borderRadius: 12, padding: '6px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}
        >
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #e5e7eb', background: page === 0 ? '#f3f4f6' : '#ffffff', fontSize: 12, fontWeight: 600 }}
                  title={`Prev ${pageSize}`}>Prev</button>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', minWidth: 90, textAlign: 'center' }}>
            Page {Math.min(page + 1, totalPagesDisplay)} / {totalPagesDisplay}
          </div>

          <button onClick={() => setPage(p => Math.min(totalPagesDisplay - 1, p + 1))} disabled={page >= totalPagesDisplay - 1}
                  style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #e5e7eb', background: page >= totalPagesDisplay - 1 ? '#f3f4f6' : '#ffffff', fontSize: 12, fontWeight: 600 }}
                  title={`Next ${pageSize}`}>Next</button>
        </div>
      )}

      {/* Status overlays (hidden in FS) */}
      {!isFS && err && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, maxWidth: 520, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 800, marginBottom: 8, color: '#111827' }}>{err === 'Not authorized. Please sign in again.' ? 'Not authorized' : 'Error'}</div>
            <div style={{ color: '#6b7280' }}>{String(err)}</div>
          </div>
        </div>
      )}

      {!isFS && loading && mode !== 'static' && !staticData && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Loading…</div>
        </div>
      )}
    </div>
  );
}
