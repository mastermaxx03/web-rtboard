// src/views/rtw/RTW7H_PFGroup.jsx
import React, { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { fetchHistoricalData } from '../../../utils/historical';

// ⬇️ unified control (date + presets + shift + aggregation + interval)
import UnifiedDateControls from '../Date Component/Date5';

/**
 * PFGroup (paged like RTW8H)
 * - Top grid: R/Y/B (bars) + Avg PF (line)
 * - Bottom grid: PF Imbalance (%) (single bar per category)
 * - Pagination + in-page zoom with density-safe bar sizing (PERCENT-BASED)
 */

const GRID_HEADER = 110;
const GRID_BOTTOM = 84;
const GRID_GAP_PX = 28;
const TOP_FRACTION = 0.60;

export default function RTW7H_PFGroup({
  timeSlots, rPF, yPF, bPF,
  yMin = 0.80, yMax = 1.00,
  fetchOverrides = {},
  panelName = '', did = '',
  timeBase = 'utc',
  pageSize = 120,
}) {
  const wrapperRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstRef = useRef(null);

  const [dims, setDims] = useState({ width: 800, height: 560, font: 12, nameFont: 13, symbol: 5 });

  const [remote, setRemote] = useState({ tsMs: [], slotsHHmm: [], r: [], y: [], b: [] });
  const [errState, setErrState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metaInfo, setMetaInfo] = useState({ did: did || '', panelName: panelName || '' });

  // NEW: aggregation/grouping interval UI state (minutes)
  const [aggregation, setAggregation] = useState('avg'); // 'avg' | 'min' | 'max' | 'sum'
  const [interval, setInterval] = useState(15);         // minutes

  // Mappings between UnifiedDateControls labels and our internal codes
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

  // --- Default to TODAY (00:00–23:59:59.999) in selected timeBase ---
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
  const [rangeInitialized, setRangeInitialized] = useState(true);
  const [page, setPage] = useState(0);

  // ----- time helpers -----
  const useUTC = timeBase === 'utc';
  const two = (n) => String(n).padStart(2, '0');
  const dGet = {
    Y: (d) => (useUTC ? d.getUTCFullYear() : d.getFullYear()),
    M: (d) => (useUTC ? d.getUTCMonth() : d.getMonth()),
    D: (d) => (useUTC ? d.getUTCDate() : d.getDate()),
    h: (d) => (useUTC ? d.getUTCHours() : d.getHours()),
    m: (d) => (useUTC ? d.getUTCMinutes() : d.getMinutes()),
  };

  const toMs = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
    if (typeof v === 'string') {
      if (/^\d{1,2}:\d{2}$/.test(v)) {
        const [H, M] = v.split(':').map(Number);
        const base = new Date();
        return useUTC
          ? Date.UTC(dGet.Y(base), dGet.M(base), dGet.D(base), H, M, 0, 0)
          : new Date(dGet.Y(base), dGet.M(base), dGet.D(base), H, M, 0, 0).getTime();
      }
      const d = new Date(v);
      if (!Number.isNaN(+d)) return +d;
    }
    return null;
  };

  const labelHHmm = (ms) => {
    const d = new Date(ms);
    return `${two(dGet.h(d))}:${two(dGet.m(d))}`;
  };

  const fmtFull = (ms) => {
    const d = new Date(ms);
    const day = dGet.D(d);
    const month = d.toLocaleString(undefined, { month: 'long', timeZone: useUTC ? 'UTC' : undefined });
    const year = dGet.Y(d);
    const h24 = dGet.h(d);
    const ap = h24 >= 12 ? 'PM' : 'AM';
    the: 0; // appease linter
    const h12 = h24 % 12 === 0 ? 12 : (h24 % 12);
    const mm = two(dGet.m(d));
    return `${day} ${month} ${year} ${h12}:${mm} ${ap}`;
  };

  const buildRangeFromMs = (arr) => {
    if (!arr?.length) return null;
    const lo = Math.min(...arr);
    const hi = Math.max(...arr);
    const ld = new Date(lo);
    const hd = new Date(hi);

    const start = useUTC
      ? new Date(Date.UTC(ld.getUTCFullYear(), ld.getUTCMonth(), ld.getUTCDate(), 0, 0, 0, 0))
      : new Date(ld.getFullYear(), ld.getMonth(), ld.getDate(), 0, 0, 0, 0);

    const end = useUTC
      ? new Date(Date.UTC(hd.getUTCFullYear(), hd.getUTCMonth(), hd.getUTCDate(), 23, 59, 59, 999))
      : new Date(hd.getFullYear(), hd.getMonth(), hd.getDate(), 23, 59, 59, 999);

    return { start: start.toISOString(), end: end.toISOString(), label: '', meta: { preset: 'fromAPI', shift: 'ALL' } };
  };

  // Keep TODAY aligned when timeBase changes
  useEffect(() => {
    if (dateRange?.meta?.preset === 'TODAY') setDateRange(makeTodayRange());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeBase]);

  // ----- sizing / recalc -----
  const getVVH = () =>
    (window.visualViewport && typeof window.visualViewport.height === 'number')
      ? window.visualViewport.height : window.innerHeight;

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prevHtml; document.body.style.overflow = prevBody; };
  }, []);

  const recalc = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = getVVH();
    const availableH = Math.max(460, Math.floor(vh - rect.top - 8));
    const w = Math.max(320, Math.floor(vw));
    const font = w < 480 ? 10 : w < 768 ? 11 : 12;
    const nameFont = w < 480 ? 11 : w < 768 ? 12 : 13;
    const symbol = w < 480 ? 4 : 5;
    setDims({ width: w, height: availableH, font, nameFont, symbol });

    requestAnimationFrame(() => {
      chartInstRef.current?.resize?.();
      applyBarSpecs(getVisibleCount() || pageData.tsMs.length || pageSize);
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

  // ----- normalizers -----
  function normalizeRows(rows) {
    if (!Array.isArray(rows)) return { tsMs: [], slotsHHmm: [], r: [], y: [], b: [] };

    const tsKeys = ['timestamp', 'ts', 'TS', 'time', 'TIME', 'Time'];
    the: 0;
    const rpfKeys = ['R_PF', 'rPF', 'r_pf', 'RPF', 'rpf', 'rphase_pf'];
    const ypfKeys = ['Y_PF', 'yPF', 'y_pf', 'YPF', 'ypf', 'yphase_pf'];
    const bpfKeys = ['B_PF', 'bPF', 'b_pf', 'BPF', 'bpf', 'bphase_pf'];

    const tsMs = [], r = [], y = [], b = [];

    const getNum = (o, keys) => { for (const k of keys) if (o?.[k] != null && isFinite(Number(o[k]))) return Number(o[k]); return null; };

    rows.forEach((row, i) => {
      let raw = row;
      for (const k of tsKeys) { if (row && row[k] != null) { raw = row[k]; break; } }
      let ms = toMs(raw);
      if (ms == null) {
        const base = new Date(); base.setHours(0, 0, 0, 0);
        ms = +base + i * 15 * 60 * 1000;
      }
      tsMs.push(ms);
      r.push(getNum(row, rpfKeys));
      y.push(getNum(row, ypfKeys));
      b.push(getNum(row, bpfKeys));
    });

    const order = tsMs.map((ms, i) => [ms, i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const tsAsc = order.map((i) => tsMs[i]);
    const rAsc  = order.map((i) => r[i]);
    const yAsc  = order.map((i) => y[i]);
    const bAsc  = order.map((i) => b[i]);

    return { tsMs: tsAsc, slotsHHmm: tsAsc.map(labelHHmm), r: rAsc, y: yAsc, b: bAsc };
  }

  // ----- fetch -----
  useEffect(() => {
    // if props provide data, skip fetching
    if (Array.isArray(timeSlots) && Array.isArray(rPF) && Array.isArray(yPF) && Array.isArray(bPF)) return;

    const c = new AbortController();
    setLoading(true);
    setErrState(null);
    chartInstRef.current?.showLoading?.('default', { text: 'Loading…' });

    (async () => {
      try {
        const params = {
          segment: 'pf',
          ...fetchOverrides,
          from: dateRange.start || fetchOverrides.from || null,
          to:   dateRange.end   || fetchOverrides.to   || null,
          tz: fetchOverrides.tz ?? (timeBase === 'utc'
                ? 'UTC'
                : Intl.DateTimeFormat().resolvedOptions().timeZone),

          // NEW: pass aggregation & interval along with request
          aggregation,          // 'avg' | 'min' | 'max' | 'sum'
          interval,             // minutes
        };

        const resp = await fetchHistoricalData(params, { signal: c.signal });
        const rows = Array.isArray(resp) ? resp : (resp?.data ?? []);
        const packed = normalizeRows(rows);
        setRemote(packed);

        const didFromResp =
          resp?.meta?.did ?? resp?.did ?? rows?.[0]?.did ?? fetchOverrides?.did ?? did ?? '';
        const panelFromResp =
          resp?.meta?.panelName ?? resp?.panelName ?? rows?.[0]?.panelName ?? panelName ?? '';
        setMetaInfo(prev => ({
          did: didFromResp || prev.did,
          panelName: panelFromResp || prev.panelName,
        }));

        if (!rangeInitialized && !(dateRange.start && dateRange.end) && packed?.tsMs?.length) {
          const apiRange = buildRangeFromMs(packed.tsMs);
          if (apiRange) setDateRange(apiRange);
          setRangeInitialized(true);
          setPage(0);
        }
      } catch (err) {
        const code = err?.response?.status || 0;
        const msg = err?.response?.data?.message || err?.message || 'Request failed';
        setErrState({ code, msg: code === 401 ? 'Not authorized. Please sign in again.' : msg });
        setRemote({ tsMs: [], slotsHHmm: [], r: [], y: [], b: [] });
      } finally {
        setLoading(false);
        chartInstRef.current?.hideLoading?.();
      }
    })();

    return () => c.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeBase,
    dateRange.start,
    dateRange.end,
    fetchOverrides?.from,
    fetchOverrides?.to,
    fetchOverrides?.did,
    fetchOverrides?.timeFrame,
    fetchOverrides?.limit,
    fetchOverrides?.tz,
    fetchOverrides?.date,
    aggregation,
    interval,
  ]);

  useEffect(() => {
    setMetaInfo(prev => ({
      did: did || prev.did,
      panelName: panelName || prev.panelName,
    }));
  }, [did, panelName]);

  // ----- precedence (props → remote) -----
  const effective = useMemo(() => {
    if (Array.isArray(timeSlots) && Array.isArray(rPF) && Array.isArray(yPF) && Array.isArray(bPF)) {
      const pairs = (timeSlots || []).map((t, i) => [toMs(t), i]).filter((p) => p[0] != null).sort((a, b) => a[0] - b[0]);
      const order = pairs.map((p) => p[1]);
      const tsMs = pairs.map((p) => p[0]);
      return {
        tsMs,
        slotsHHmm: tsMs.map(labelHHmm),
        r: order.map((i) => rPF[i]),
        y: order.map((i) => yPF[i]),
        b: order.map((i) => bPF[i]),
      };
    }
    return remote;
  }, [timeSlots, rPF, yPF, bPF, remote, timeBase]);

  // ----- derived series -----
  const avgPF = useMemo(
    () => effective.tsMs.map((_, i) => {
      const vals = [effective.r[i], effective.y[i], effective.b[i]].filter((v) => typeof v === 'number');
      return vals.length ? vals.reduce((a, c) => a + c, 0) / vals.length : null;
    }),
    [effective]
  );

  const pfImbalance = useMemo(
    () => effective.tsMs.map((_, i) => {
      const vals = [effective.r[i], effective.y[i], effective.b[i]].filter((v) => typeof v === 'number');
      if (vals.length < 2) return null;
      return (Math.max(...vals) - Math.min(...vals)) * 100;
    }),
    [effective]
  );

  // ----- pagination -----
  const total = effective.tsMs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const pageData = useMemo(() => {
    const start = safePage * pageSize;
    const end = Math.min(total, start + pageSize);
    return {
      tsMs:        effective.tsMs.slice(start, end),
      slotsHHmm:   effective.slotsHHmm.slice(start, end),
      r:           effective.r.slice(start, end),
      y:           effective.y.slice(start, end),
      b:           effective.b.slice(start, end),
      avgPF:       avgPF.slice(start, end),
      pfImbalance: pfImbalance.slice(start, end),
    };
  }, [effective, avgPF, pfImbalance, safePage, pageSize, total]);

  // dynamic PF axis per page (keeps line/bars readable)
  const pfAxis = useMemo(() => {
    const vals = [...pageData.r, ...pageData.y, ...pageData.b].filter(v => typeof v === 'number');
    if (!vals.length) return { min: yMin, max: (yMax ?? 1) };
    const pad = 0.02;
    const dataMin = Math.min(...vals);
    const dataMax = Math.max(...vals);
    return {
      min: Math.min(yMin, Math.max(0, +(dataMin - pad).toFixed(2))),
      max: yMax != null ? yMax : +(Math.max(1, dataMax + pad).toFixed(2)),
    };
  }, [pageData, yMin, yMax]);

  // ===== PERCENT-BASED BAR SPECS (no overlap at any zoom) =====
  const computeBarSpecPct = (visibleCats, { bars, baseOcc, gapFactor }) => {
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
    const inst = chartInstRef.current; const n = pageData.tsMs.length || 0;
    if (!inst || !n) return n;
    let opt; try { opt = inst.getOption(); } catch { return n; }
    const dz = (Array.isArray(opt?.dataZoom) ? opt.dataZoom : [])[0] || {};
    let start = 0, end = n - 1;
    if (dz.startValue != null || dz.endValue != null) {
      start = Math.max(0, Math.min(n - 1, dz.startValue ?? 0));
      end   = Math.max(0, Math.min(n - 1, dz.endValue   ?? (n - 1)));
    } else if (dz.start != null || dz.end != null) {
      const s = Math.max(0, Math.min(100, dz.start ?? 0)) / 100;
      const e = Math.max(0, Math.min(100, dz.end   ?? 100)) / 100;
      start = Math.floor(s * (n - 1)); end = Math.ceil(e * (n - 1));
    }
    return Math.max(1, end - start + 1);
  };

  const applyBarSpecs = (visible) => {
    const top = computeBarSpecPct(visible, { bars: 3, baseOcc: 0.66, gapFactor: 0.25 });
    const bot = computeBarSpecPct(visible, { bars: 1, baseOcc: 0.55, gapFactor: 0.00 });
    try {
      chartInstRef.current?.setOption({
        series: [
          { id: 'rBars',    barWidth: `${top.barWidthPct}%`, barGap: `${top.barGapPercent}%`, barCategoryGap: `${top.catGapPercent}%`, barMaxWidth: 42 },
          { id: 'yBars',    barWidth: `${top.barWidthPct}%`, barGap: `${top.barGapPercent}%`, barCategoryGap: `${top.catGapPercent}%`, barMaxWidth: 42 },
          { id: 'bBars',    barWidth: `${top.barWidthPct}%`, barGap: `${top.barGapPercent}%`, barCategoryGap: `${top.catGapPercent}%`, barMaxWidth: 42 },
          { id: 'pfImbBar', barWidth: `${bot.barWidthPct}%`, barGap: '0%',                    barCategoryGap: `${bot.catGapPercent}%`, barMaxWidth: 48 },
        ],
      }, { lazyUpdate: true });
    } catch {}
  };

  const resetZoomToFullPage = () => {
    const inst = chartInstRef.current; const n = pageData.tsMs.length;
    if (!inst || !n) return;
    try { inst.dispatchAction({ type: 'dataZoom', startValue: 0, endValue: n - 1 }); } catch {}
  };

  // keep zoom/widths correct when page or data changes
  useEffect(() => {
    const inst = chartInstRef.current;
    if (!inst || !pageData.tsMs.length) return;
    requestAnimationFrame(() => {
      inst.resize?.();
      resetZoomToFullPage();
      applyBarSpecs(pageData.tsMs.length);
      setTimeout(() => {
        inst.resize?.();
        resetZoomToFullPage();
        applyBarSpecs(getVisibleCount() || pageData.tsMs.length || pageSize);
      }, 60);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageData.tsMs, page]);

  // ----- axes layout -----
  const avail = Math.max(320, dims.height) - GRID_HEADER - GRID_BOTTOM - GRID_GAP_PX;
  const g1Top = GRID_HEADER;
  const g1H = Math.max(220, Math.round(avail * TOP_FRACTION));
  const g2Top = g1Top + g1H + GRID_GAP_PX;
  const g2H = Math.max(120, Math.round(dims.height - g2Top - GRID_BOTTOM));

  // ----- x labels (page) -----
  const xLabels = useMemo(() => pageData.tsMs.map(labelHHmm), [pageData.tsMs, timeBase]);
  const prettyLabels = useMemo(() => pageData.tsMs.map(fmtFull), [pageData.tsMs, timeBase]);

  const noDataInRange = !loading && (dateRange.start || dateRange.end) && (effective.tsMs.length === 0);
  const totalPagesDisplay = Math.max(1, Math.ceil((effective.tsMs.length || 0) / pageSize));

  // ----- option -----
  const option = useMemo(() => {
    const baseOption = {
      backgroundColor: '#ffffff',
      useDirtyRect: true,
      animation: false,

      grid: [
        { top: g1Top, left: 70, right: 28, height: g1H, containLabel: true },
        { top: g2Top, left: 70, right: 28, height: g2H, containLabel: true },
      ],

      legend: noDataInRange ? [] : [
        {
          type: 'plain', right: 18, top: '58%', align: 'right',
          itemWidth: 12, itemHeight: 10, itemGap: 14, icon: 'roundRect',
          textStyle: { color: '#374151', fontSize: '14px', fontWeight: 600 },
          data: ['R PF', 'Y PF', 'B PF', 'Avg PF'],
        },
        {
          type: 'plain', right: 18, bottom: '6%', align: 'right',
          itemWidth: 12, itemHeight: 10, itemGap: 14, icon: 'roundRect',
          textStyle: { color: '#374151', fontSize: '14px', fontWeight: 600 },
          data: ['PF Imbalance'],
        },
      ],

      xAxis: [
        {
          type: 'category', gridIndex: 0, boundaryGap: true,
          name: 'TIME', nameLocation: 'middle', nameGap: 24,
          nameTextStyle: { color: '#374151', fontWeight: 700, fontSize: '16px' },
          data: xLabels,
          axisLabel: { color: noDataInRange ? '#e5e7eb' : '#6b7280', fontSize: dims.font, hideOverlap: true, show: !noDataInRange },
          axisTick: { show: !noDataInRange, alignWithLabel: true },
          axisLine: { lineStyle: { color: '#e5e7eb' } },
        },
        {
          type: 'category', gridIndex: 1, boundaryGap: true,
          name: 'TIME', nameLocation: 'middle', nameGap: 24,
          nameTextStyle: { color: '#374151', fontWeight: 700, fontSize: '16px' },
          data: xLabels,
          axisLabel: { color: noDataInRange ? '#e5e7eb' : '#6b7280', fontSize: dims.font, hideOverlap: true, show: !noDataInRange },
          axisTick: { show: !noDataInRange, alignWithLabel: true },
          axisLine: { lineStyle: { color: '#e5e7eb' } },
        },
      ],

      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          name: 'Power Factor (PF)',
          nameLocation: 'middle',
          nameGap: 48,
          nameTextStyle: { color: '#374151', fontWeight: 700, fontSize: '16px' },
          min: pfAxis.min,
          max: pfAxis.max,
          axisLabel: { color: noDataInRange ? '#e5e7eb' : '#6b7280', fontSize: dims.font, formatter: (v) => v.toFixed(2), show: !noDataInRange },
          axisLine: { show: false },
          splitLine: { lineStyle: { color: noDataInRange ? '#f6f7fb' : '#eef2f7' } },
        },
        {
          type: 'value', gridIndex: 1,
          name: 'PF Imbalance (%)', nameLocation: 'middle', nameGap: 38,
          nameTextStyle: { color: '#374151', fontWeight: 700, fontSize: '16px' },
          min: 0, max: 30,
          axisLabel: { color: noDataInRange ? '#e5e7eb' : '#6b7280', fontSize: dims.font, formatter: (v) => `${v.toFixed(0)}`, show: !noDataInRange },
          axisLine: { show: false },
          splitLine: { lineStyle: { color: noDataInRange ? '#f6f7fb' : '#eef2f7' } },
        },
      ],

      tooltip: { show: !noDataInRange, trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148,163,184,0.14)' }, snap: true },
        backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1,
        textStyle: { color: '#111827', fontSize: dims.font },
        extraCssText: 'box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:10px 12px;border-radius:10px;',
        formatter: (p) => {
          const i = p?.[0]?.dataIndex ?? 0;
          const header = prettyLabels[i];
          const rVal = pageData.r[i];
          const yVal = pageData.y[i];
          const bVal = pageData.b[i];
          const imVal = pageData.pfImbalance[i];
          const aVal = pageData.avgPF[i];
          const row = (lbl, val, col, d = 3) =>
            `<div style="display:flex;justify-content:space-between;margin:2px 0">
               <span style="color:#6b7280">${lbl}</span>
               <span style="font-weight:700;color:${col}">${typeof val === 'number' ? val.toFixed(d) : '-'}</span>
             </div>`;
          const statusOf = (pf) => (pf == null ? '-' : pf >= 0.951 ? 'ACCEPTABLE' : pf >= 0.9 ? 'WARNING' : 'CRITICAL');
          const statusColor = (pf) => (pf >= 0.951 ? '#16a34a' : pf >= 0.9 ? '#f59e0b' : '#ef4444');
          const s = statusOf(aVal), c = statusColor(aVal);
          return `
            <div style="min-width:230px">
              <div style="font-weight:700;margin-bottom:6px">${header}</div>
              ${row('R PF', rVal, '#ef4444')}
              ${row('Y PF', yVal, '#f59e0b')}
              ${row('B PF', bVal, '#2563eb')}
              ${row('PF IMBALANCE (%)', imVal, '#3b82f6', 1)}
              <div style="font-size:12px;color:#6b7280;margin-top:6px">
                STATUS:
                <span style="display:inline-block;padding:2px 8px;margin-left:6px;border-radius:999px;background:${c}1A;color:${c};font-weight:700;">
                  ${s}
                </span>
              </div>
            </div>`;
        },
      },

      // default series (overridden by applyBarSpecs)
      series: noDataInRange ? [] : [
        {
          id: 'rBars', name: 'R PF', type: 'bar', xAxisIndex: 0, yAxisIndex: 0,
          data: pageData.r, barWidth: '18%', barGap: '25%', barCategoryGap: '34%', barMaxWidth: 42,
          large: true, progressive: 2000, progressiveThreshold: 3000,
          itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] },
          emphasis: { focus: 'none' },
        },
        {
          id: 'yBars', name: 'Y PF', type: 'bar', xAxisIndex: 0, yAxisIndex: 0,
          data: pageData.y, barWidth: '18%', barGap: '25%', barCategoryGap: '34%', barMaxWidth: 42,
          large: true, progressive: 2000, progressiveThreshold: 3000,
          itemStyle: { color: '#f3ae35ff', borderRadius: [4, 4, 0, 0] },
          emphasis: { focus: 'none' },
        },
        {
          id: 'bBars', name: 'B PF', type: 'bar', xAxisIndex: 0, yAxisIndex: 0,
          data: pageData.b, barWidth: '18%', barGap: '25%', barCategoryGap: '34%', barMaxWidth: 42,
          large: true, progressive: 2000, progressiveThreshold: 3000,
          itemStyle: { color: '#4e7fe9d4', borderRadius: [4, 4, 0, 0] },
          emphasis: { focus: 'none' },
        },
        {
          name: 'Avg PF', type: 'line', xAxisIndex: 0, yAxisIndex: 0,
          data: pageData.avgPF, smooth: true, symbol: 'circle', symbolSize: dims.symbol,
          sampling: 'lttb', lineStyle: { width: 3, color: '#10b981' }, itemStyle: { color: '#10b981' },
          emphasis: { focus: 'none' }, z: 5,
        },
        {
          id: 'pfImbBar', name: 'PF Imbalance', type: 'bar', xAxisIndex: 1, yAxisIndex: 1,
          data: pageData.pfImbalance, barWidth: '55%', barGap: '0%', barCategoryGap: '45%', barMaxWidth: 48,
          large: true, progressive: 2000, progressiveThreshold: 3000,
          itemStyle: { color: '#3b82f6', borderRadius: [3, 3, 0, 0] },
          emphasis: { focus: 'none' }, z: 3,
        },
      ],
    };

    // Empty-state: hide dataZoom and DO NOT draw extra graphic text
    if (noDataInRange) {
      baseOption.dataZoom = [];
      baseOption.graphic = []; // ← prevents second message from chart
    } else {
      baseOption.dataZoom = [{
        type: 'inside',
        xAxisIndex: [0, 1],
        filterMode: 'none',
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
        pinch: true,
        throttle: 16,
        startValue: 0,
        endValue: Math.max(0, (pageData.tsMs?.length || 1) - 1),
      }];
      baseOption.graphic = [];
    }

    return baseOption;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xLabels, prettyLabels, pageData, dims, yMin, yMax, pfAxis, g1Top, g1H, g2Top, g2H, noDataInRange, dateRange]);

  function formatRangeLabel(r) {
    try {
      if (!r?.start && !r?.end) return '';
      const s = r.start ? new Date(r.start) : null;
      const e = r.end ? new Date(r.end) : null;
      const fmt = (d) =>
        d.toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
      if (s && e) return `${fmt(s)} — ${fmt(e)}`;
      if (s) return `From ${fmt(s)}`;
      if (e) return `Until ${fmt(e)}`;
      return '';
    } catch { return ''; }
  }

  const onEvents = {
    datazoom: () => { const v = getVisibleCount() || pageData.tsMs.length || 1; applyBarSpecs(v); },
  };

  // ----- render -----
  const noDataOverlay = !loading && !errState && noDataInRange;

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: `${dims.height}px`, background: '#fff', overflow: 'hidden', position: 'relative' }}
    >
      {/* Header + unified date/shift/agg/interval control */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 16,
          right: 16,
          zIndex: 6,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'start',
          gap: 12,
        }}
      >
        <div style={{ marginTop: 20, textAlign: 'left', width: '100%' }}>
          <div style={{ fontWeight: 900, fontSize: 22, color: '#0f172a', lineHeight: 1.1 }}>Power Factor (PF)</div>
          <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>
            Panel Name: {metaInfo.panelName || 'Default'}
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: '#6b7280' }}>
            Device ID: {metaInfo.did || '-'}
          </div>
          {/* NOTE: pill removed to avoid duplicate “no records” messaging */}
        </div>

        <div style={{ justifySelf: 'end' }}>
          <UnifiedDateControls
            value={{
              start: dateRange.start,
              end: dateRange.end,
              shift: dateRange.meta?.shift || 'ALL',
              preset: dateRange.meta?.preset || '',
              aggregation: aggCodeToLabel[aggregation],
              interval: minutesToIntervalLabel(interval)
            }}
            onChange={(r) => {
              setAggregation(aggLabelToCode[r.aggregation] ?? 'avg');
              setInterval(parseIntervalLabelToMinutes(r.interval));
              setDateRange({
                start: r?.start || '',
                end: r?.end || '',
                label: r?.label || '',
                meta: { preset: r?.preset || '', shift: r?.shift || 'ALL' }
              });
              setRangeInitialized(true);
              setPage(0);
            }}
            aggregationOptions={['Average', 'Min', 'Max', 'Sum']}
            intervalOptions={['5 min', '15 min', '30 min', '1 hour']}
            maxSpanDays={93}
          />
        </div>
      </div>

      <ReactECharts
        ref={chartRef}
        option={option}
        notMerge
        lazyUpdate
        onEvents={onEvents}
        style={{ width: '100%', height: '100%' }}
        onChartReady={(inst) => {
          chartInstRef.current = inst;
          requestAnimationFrame(() => {
            inst.resize?.();
            if (!noDataInRange) {
              resetZoomToFullPage();
              applyBarSpecs(getVisibleCount() || pageData.tsMs.length || pageSize);
              setTimeout(() => {
                inst.resize?.();
                resetZoomToFullPage();
                applyBarSpecs(getVisibleCount() || pageData.tsMs.length || pageSize);
              }, 60);
            }
          });
        }}
        opts={{ renderer: 'canvas' }}
      />

      {/* Single “No records” overlay (kept) */}
      {noDataOverlay && (
        <div
          style={{
            position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:1, pointerEvents:'none'
          }}
        >
          <div style={{
            background:'rgba(255,255,255,0.92)', border:'1px solid #e5e7eb', borderRadius:12,
            padding:'10px 14px', fontSize:12, color:'#6b7280', boxShadow:'0 6px 20px rgba(0,0,0,0.06)'
          }}>
            No records found for {formatRangeLabel(dateRange)}. Try another date range or shift.
          </div>
        </div>
      )}

      {/* Pager */}
      {pageData.tsMs.length > 0 && (
        <div
          style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 8, zIndex: 6,
            display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.9)',
            border: '1px solid #e5e7eb', borderRadius: 12, padding: '6px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}
        >
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ padding: '6px 10px', borderRadius: 10, border:'1px solid #e5e7eb',
                     background: page === 0 ? '#f3f4f6' : '#ffffff', fontSize: 12, fontWeight: 600 }}
            title={`Prev ${pageSize}`}
          >Prev</button>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', minWidth: 90, textAlign: 'center' }}>
            Page {Math.min(page + 1, totalPagesDisplay)} / {totalPagesDisplay}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPagesDisplay - 1, p + 1))}
            disabled={page >= totalPagesDisplay - 1}
            style={{ padding: '6px 10px', borderRadius: 10, border:'1px solid #e5e7eb',
                     background: page >= totalPagesDisplay - 1 ? '#f3f4f6' : '#ffffff', fontSize: 12, fontWeight: 600 }}
            title={`Next ${pageSize}`}
          >Next</button>
        </div>
      )}

      {/* Status overlays */}
      {errState && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, maxWidth: 520, textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 800, marginBottom: 8, color: '#111827' }}>
              {errState.code === 401 ? 'Not authorized' : 'Error'}
            </div>
            <div style={{ color: '#6b7280' }}>{errState.msg}</div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Loading…</div>
        </div>
      )}
    </div>
  );
}
