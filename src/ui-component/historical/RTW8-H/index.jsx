// src/views/rtw/RTW8H.jsx
import React, { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { fetchHistoricalData } from '../../../utils/historical';

// ⬇️ NEW: unified control (date+presets+shift+aggregation+interval in one)
import UnifiedDateControls from '../Date Component/Date5';

const PALETTE = {
  kvah:  { fill: ['#78e86eff', '#78e86eff'] },
  kwh:   { fill: ['#f77a37ff', '#f77a37ff'] },
  kvarh: { fill: ['#7fafcdff', '#7fafcdff'] },
};

export default function RTW8H({
  timeSlots, kWh, kVArh, kVAh,
  yMin = 0, yMax = null, timeBase = 'utc',
  pageSize = 96,
}) {
  const wrapperRef = useRef(null);
  const chartInstRef = useRef(null);

  const [dims, setDims] = useState({ width: 800, height: 560, font: 12, nameFont: 13 });
  const [loading, setLoading] = useState(false);
  const [errState, setErrState] = useState(null);

  const [remote, setRemote] = useState({ ts: [], kWh: [], kVArh: [], kVAh: [] });
  const [metaInfo, setMetaInfo] = useState({ did: '', panelName: '' });

  const [dateRange, setDateRange] = useState({ start: '', end: '', label: '', meta: null });
  const [rangeInitialized, setRangeInitialized] = useState(false);

  const [page, setPage] = useState(0);

  // Aggregation + interval state (kept exactly as before)
  const [agg, setAgg] = useState('avg');           // 'avg' | 'min' | 'max' | 'sum'
  const [intervalMin, setIntervalMin] = useState(15); // minutes

  // Mappings between Unified control labels and internal codes
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
    if (unit === 's') return Math.max(1, Math.round(n / 60)); // seconds → minutes (floor to >=1)
    return 15;
  };
  const minutesToIntervalLabel = (m) => (m % 60 === 0 ? `${m / 60} hour` : `${m} min`);

  const useUTC = timeBase === 'utc';
  const dGet = {
    Y: d => (useUTC ? d.getUTCFullYear() : d.getFullYear()),
    D: d => (useUTC ? d.getUTCDate()    : d.getDate()),
    h: d => (useUTC ? d.getUTCHours()   : d.getHours()),
    m: d => (useUTC ? d.getUTCMinutes() : d.getMinutes()),
  };

  const fmtFull = (d) => {
    const day = dGet.D(d);
    const month = d.toLocaleString(undefined, { month: 'long', timeZone: useUTC ? 'UTC' : undefined });
    const year = dGet.Y(d);
    const h24 = dGet.h(d);
    const ap  = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const mm  = String(dGet.m(d)).padStart(2, '0');
    return `${day} ${month} ${year} ${h12}:${mm} ${ap}`;
  };

  // sizing
  useEffect(() => {
    const prevH = document.documentElement.style.overflow;
    const prevB = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prevH; document.body.style.overflow = prevB; };
  }, []);

  const getVVH = () =>
    (window.visualViewport && typeof window.visualViewport.height === 'number')
      ? window.visualViewport.height : window.innerHeight;

  const recalc = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = getVVH();
    const availableH = Math.max(440, Math.floor(vh - rect.top - 8));
    const w = Math.max(320, Math.floor(vw));
    const font = w < 480 ? 10 : w < 768 ? 11 : 12;
    const nameFont = w < 480 ? 11 : w < 768 ? 12 : 13;
    setDims({ width: w, height: availableH, font, nameFont });

    requestAnimationFrame(() => {
      chartInstRef.current?.resize?.();
      if (!noDataInRange) {
        const visible = getVisibleCount() || pageData.ts.length || pageSize;
        applyBarSpec(visible);
      }
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

  // helpers
  const toMs = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
    const d = new Date(v);
    return isNaN(+d) ? null : +d;
  };

  const buildRangeFromTs = (tsArr) => {
    if (!tsArr.length) return null;
    const minMs = Math.min(...tsArr);
    const maxMs = Math.max(...tsArr);
    const minD = new Date(minMs);
    const maxD = new Date(maxMs);

    const start = useUTC
      ? new Date(Date.UTC(minD.getUTCFullYear(), minD.getUTCMonth(), minD.getUTCDate(), 0,0,0,0))
      : new Date(minD.getFullYear(), minD.getMonth(), minD.getDate(), 0,0,0,0);

    const end = useUTC
      ? new Date(Date.UTC(maxD.getUTCFullYear(), maxD.getUTCMonth(), maxD.getUTCDate(), 23,59,59,999))
      : new Date(maxD.getFullYear(), maxD.getMonth(), maxD.getDate(), 23,59,59,999);

    return { start: start.toISOString(), end: end.toISOString(), label: '', meta: { preset: 'fromAPI', shift: 'ALL' } };
  };

  // NOTE: return null for missing values (NOT 0). This lets us detect "no data".
  const normalizeIncomingRows = (rows) => {
    if (!Array.isArray(rows)) return { ts: [], kWh: [], kVArh: [], kVAh: [] };
    const tsKeys    = ['timestamp','ts','TS','time','TIME','Time'];
    const kwhKeys   = ['kWh','KWH','kwh'];
    const kvahKeys  = ['kVAh','KVAH','kvah'];
    const kvarhKeys = ['kVArh','KVARH','kvarh'];

    const getNum = (o, keys) => { 
      for (const k of keys) {
        if (o?.[k] != null && isFinite(Number(o[k]))) return Number(o[k]);
      }
      return null; // <— important
    };

    const ts = rows.map((r,i) => {
      let raw = r; for (const k of tsKeys) if (r && r[k]!=null) { raw = r[k]; break; }
      const ms = toMs(raw); if (ms!=null) return ms;
      const base = new Date(); base.setHours(0,0,0,0); return +base + i*15*60*1000;
    });
    return { 
      ts, 
      kWh:  rows.map(r=>getNum(r,kwhKeys)), 
      kVArh:rows.map(r=>getNum(r,kvarhKeys)), 
      kVAh: rows.map(r=>getNum(r,kvahKeys)) 
    };
  };

  // fetch
  useEffect(() => {
    if (Array.isArray(timeSlots) && Array.isArray(kWh) && Array.isArray(kVArh) && Array.isArray(kVAh)) return;

    const c = new AbortController();
    setLoading(true);
    setErrState(null);

    const params = {
      from: dateRange.start || null,
      to: dateRange.end || null,
      aggregation: agg,            // 'avg' | 'min' | 'max' | 'sum'
      intervalMinutes: intervalMin // number
    };

    (async () => {
      try {
        const resp = await fetchHistoricalData(params, { signal: c.signal });
        const rows = Array.isArray(resp) ? resp : (resp?.data ?? []);
        const packed = normalizeIncomingRows(rows);
        setRemote(packed);

        const did = resp?.meta?.did || rows?.[0]?.did || '';
        const panelName = resp?.meta?.panelName || rows?.[0]?.panelName || 'Default';
        setMetaInfo({ did, panelName });

        if (!rangeInitialized && packed.ts.length) {
          const apiRange = buildRangeFromTs(packed.ts);
          if (apiRange) setDateRange(apiRange);
          setRangeInitialized(true);
          setPage(0);
        }
      } catch (err) {
        const code = err?.response?.status || 0;
        const msg  = err?.response?.data?.message || err?.message || 'Request failed';
        setErrState({ code, msg: code === 401 ? 'Not authorized. Please sign in again.' : msg });
        setRemote({ ts: [], kWh: [], kVArh: [], kVAh: [] });
        setMetaInfo({ did: '', panelName: '' });
      } finally {
        setLoading(false);
      }
    })();

    return () => c.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeBase, dateRange.start, dateRange.end, rangeInitialized, agg, intervalMin]);

  // data precedence
  const effective = useMemo(() => {
    if (Array.isArray(timeSlots) && Array.isArray(kWh) && Array.isArray(kVArh) && Array.isArray(kVAh)) {
      const ts = timeSlots.map((t,i) => {
        const ms = toMs(t); if (ms!=null) return ms;
        if (typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t)) {
          const [H,M] = t.split(':').map(Number);
          const now = new Date();
          return useUTC ? +new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), H, M, 0, 0))
                        : +new Date(now.getFullYear(), now.getMonth(), now.getDate(), H, M, 0, 0);
        }
        const base = new Date(); base.setHours(0,0,0,0); return +base + i*15*60*1000;
      });
      return { ts, kWh, kVArh, kVAh };
    }
    return remote;
  }, [timeSlots, kWh, kVArh, kVAh, remote, timeBase]);

  // helper to detect if an array has at least one numeric value
  const hasValues = (arr) => Array.isArray(arr) && arr.some(v => v != null && isFinite(v));

  // pagination
  const total = effective.ts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [safePage, setSafePage] = useState(0);
  useEffect(() => { const sp = Math.min(page, totalPages - 1); setSafePage(sp); if (page !== sp) setPage(sp); /* eslint-disable-next-line */ }, [totalPages, page]);

  const pageData = useMemo(() => {
    const start = safePage * pageSize;
    const end = Math.min(total, start + pageSize);
    return {
      ts:   effective.ts.slice(start, end),
      kWh:  effective.kWh.slice(start, end),
      kVArh:effective.kVArh.slice(start, end),
      kVAh: effective.kVAh.slice(start, end),
    };
  }, [effective, safePage, pageSize, total]);

  const hasAnyValuesAll = hasValues(effective.kWh) || hasValues(effective.kVArh) || hasValues(effective.kVAh);
  const hasAnyValuesPage = hasValues(pageData.kWh) || hasValues(pageData.kVArh) || hasValues(pageData.kVAh);

  // ❗ No-data logic: empty timestamps OR all series have no numeric values
  const noDataInRange =
    !loading &&
    (dateRange.start || dateRange.end) &&
    (
      effective.ts.length === 0 ||
      !hasAnyValuesAll
    );

  // bars / zoom
  const computeBarSpec = (visibleCats, widthPx) => {
    const innerW = Math.max(320, widthPx) - (70 + 36);
    const perCat = innerW / Math.max(1, visibleCats);
    const occ = 0.72, bars = 3;
    const totalBarsW = perCat * occ;
    let barWidth = Math.floor(totalBarsW / bars - 2);
    barWidth = Math.max(3, Math.min(18, barWidth));
    const gapPx = Math.max(1, Math.min(16, Math.round(perCat * 0.04)));
    const barGapPercent = Math.max(4, Math.min(80, Math.round((gapPx / Math.max(1, barWidth)) * 100)));
    const catGapPercent = 100 - Math.round(occ * 100);
    return { barWidth, barGapPercent, catGapPercent };
  };

  const getVisibleCount = () => {
    const inst = chartInstRef.current; const n = pageData.ts.length || 0;
    if (!inst || !n) return n;
    let opt; try { opt = inst.getOption(); } catch { return n; }
    const dz = (Array.isArray(opt?.dataZoom) ? opt.dataZoom : [])[0] || {};
    let start = 0, end = n - 1;
    if (dz.startValue != null || dz.endValue != null) {
      start = Math.max(0, Math.min(n-1, dz.startValue ?? 0));
      end   = Math.max(0, Math.min(n-1, dz.endValue   ?? (n-1)));
    } else if (dz.start != null || dz.end != null) {
      const s = Math.max(0, Math.min(100, dz.start ?? 0)) / 100;
      const e = Math.max(0, Math.min(100, dz.end   ?? 100)) / 100;
      start = Math.floor(s*(n-1)); end = Math.ceil(e*(n-1));
    }
    return Math.max(1, end - start + 1);
  };

  const applyBarSpec = (visible) => {
    const { barWidth, barGapPercent, catGapPercent } = computeBarSpec(visible, dims.width);
    try {
      chartInstRef.current?.setOption({
        series: [
          { id:'kvah',  barWidth, barGap:`${barGapPercent}%`, barCategoryGap:`${catGapPercent}%`, barMaxWidth:18, barMinWidth:3 },
          { id:'kwh',   barWidth, barGap:`${barGapPercent}%`, barCategoryGap:`${catGapPercent}%`, barMaxWidth:18, barMinWidth:3 },
          { id:'kvarh', barWidth, barGap:`${barGapPercent}%`, barCategoryGap:`${catGapPercent}%`, barMaxWidth:18, barMinWidth:3 },
        ],
      }, { lazyUpdate: true });
    } catch {}
  };

  const resetZoomToFullPage = () => {
    const inst = chartInstRef.current; const n = pageData.ts.length;
    if (!inst || !n) return;
    try { inst.dispatchAction({ type: 'dataZoom', startValue: 0, endValue: n - 1 }); } catch {}
  };

  useEffect(() => {
    const inst = chartInstRef.current;
    if (!inst || !pageData.ts.length || noDataInRange) return;
    requestAnimationFrame(() => {
      inst.resize?.();
      resetZoomToFullPage();
      applyBarSpec(pageData.ts.length);
      setTimeout(() => {
        inst.resize?.();
        resetZoomToFullPage();
        applyBarSpec(getVisibleCount() || pageData.ts.length);
      }, 80);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageData.ts, page, noDataInRange]);

  const initialSpec = useMemo(
    () => computeBarSpec((pageData.ts?.length || pageSize), dims.width),
    [pageData.ts?.length, dims.width, pageSize]
  );

  const xLabels = useMemo(() => pageData.ts.map(ms => {
    const d = new Date(ms); const hh = String(dGet.h(d)).padStart(2,'0'); const mm = String(dGet.m(d)).padStart(2,'0');
    return `${hh}:${mm}`;
  }), [pageData.ts, timeBase]);

  const prettySlots = useMemo(() => pageData.ts.map(ms => fmtFull(new Date(ms))), [pageData.ts, timeBase]);

  const GRID_BOTTOM = 108;
  const GRID_TOP = 96;

  const option = useMemo(() => {
    const base = {
      backgroundColor: '#fafafb',
      useDirtyRect: true,
      animationDuration: 300,
      grid: { top: GRID_TOP, left: 70, right: 36, bottom: GRID_BOTTOM },
      legend: noDataInRange ? [] : {
        type: 'plain', bottom: 8, right: 12, itemWidth: 12, itemHeight: 10, itemGap: 12, icon: 'roundRect',
        textStyle: { color: '#1f2937', fontSize: '15px', fontWeight: 600 },
        data: ['kVAh', 'kWh', 'kVArh'],
      },
      dataZoom: noDataInRange ? [] : [{
        type: 'inside', xAxisIndex: 0, filterMode: 'none', zoomOnMouseWheel: true, moveOnMouseMove: true, pinch: true, throttle: 16,
        startValue: 0, endValue: Math.max(0, (pageData.ts?.length || 1) - 1)
      }],
      xAxis: {
        type: 'category', name: 'TIME', nameLocation: 'middle', nameGap: 26,
        nameTextStyle: { color: '#1f2937', fontWeight: 700, fontSize: '20px' },
        data: xLabels,
        axisLabel: { color: noDataInRange ? '#e5e7eb' : '#6b7280', fontSize: dims.font, show: !noDataInRange },
        axisTick: { show: !noDataInRange },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value', name: 'Energy (units)', nameLocation: 'middle', nameGap: 44,
        nameTextStyle: { color: '#1f2937', fontWeight: 700, fontSize: '20px' },
        min: yMin, max: yMax,
        axisLabel: { color: noDataInRange ? '#e5e7eb' : '#6b7280', fontSize: dims.font, show: !noDataInRange },
        splitLine: { lineStyle: { color: noDataInRange ? '#f6f7fb' : '#eef2f7' } },
      },
      tooltip: noDataInRange ? { show: false } : {
        trigger: 'axis',
        axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148,163,184,0.14)' } },
        backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1,
        textStyle: { color: '#111827', fontSize: dims.font },
        extraCssText: 'box-shadow:0 10px 30px rgba(0,0,0,0.12);padding:12px 14px;border-radius:12px;',
        formatter: (params) => {
          if (!params?.length) return '';
          const i = params[0].dataIndex;
          const dot = (c) => `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};margin-right:8px"></span>`;
          const row = (name, val, col, units) =>
            `<div style="display:flex;justify-content:space-between;margin:4px 0">
               <span style="display:flex;align-items:center;color:#6b7280">${dot(col)}${name}</span>
               <span style="font-weight:700;color:${col}">${typeof val==='number' ? val.toFixed(2)+' '+units : '-'}</span>
             </div>`;
          return `
            <div style="min-width:260px">
              <div style="font-weight:800;margin-bottom:8px">${prettySlots[i]}</div>
              ${row('kVAh',  pageData.kVAh[i],  PALETTE.kvah.fill[0],  'kVAh')}
              ${row('kWh',   pageData.kWh[i],   PALETTE.kwh.fill[0],   'kWh')}
              ${row('kVArh', pageData.kVArh[i], PALETTE.kvarh.fill[0], 'kVArh')}
            </div>`;
        },
      },
      series: noDataInRange ? [] : [
        { id:'kvah',  name:'kVAh',  type:'bar', data: pageData.kVAh,
          barWidth: initialSpec.barWidth, barGap:`${initialSpec.barGapPercent}%`, barCategoryGap:`${initialSpec.catGapPercent}%`,
          barMaxWidth:18, barMinWidth:3,
          itemStyle:{ borderRadius:[6,6,0,0], shadowBlur:4, shadowColor:'rgba(0,0,0,0.06)', shadowOffsetY:2,
            color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:PALETTE.kvah.fill[0]},{offset:1,color:PALETTE.kvah.fill[1]}] } },
          emphasis:{ focus:'series' }, z:2 },
        { id:'kwh',   name:'kWh',   type:'bar', data: pageData.kWh,
          barWidth: initialSpec.barWidth, barGap:`${initialSpec.barGapPercent}%`, barCategoryGap:`${initialSpec.catGapPercent}%`,
          barMaxWidth:18, barMinWidth:3,
          itemStyle:{ borderRadius:[6,6,0,0], shadowBlur:4, shadowColor:'rgba(0,0,0,0.06)', shadowOffsetY:2,
            color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:PALETTE.kwh.fill[0]},{offset:1,color:PALETTE.kwh.fill[1]}] } },
          emphasis:{ focus:'series' }, z:2 },
        { id:'kvarh', name:'kVArh', type:'bar', data: pageData.kVArh,
          barWidth: initialSpec.barWidth, barGap:`${initialSpec.barGapPercent}%`, barCategoryGap:`${initialSpec.catGapPercent}%`,
          barMaxWidth:18, barMinWidth:3,
          itemStyle:{ borderRadius:[6,6,0,0], shadowBlur:4, shadowColor:'rgba(0,0,0,0.06)', shadowOffsetY:2,
            color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:PALETTE.kvarh.fill[0]},{offset:1,color:PALETTE.kvarh.fill[1]}] } },
          emphasis:{ focus:'series' }, z:2 },
      ],
    };

    return base;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xLabels, prettySlots, pageData, yMin, yMax, dims, initialSpec, noDataInRange]);

  const onEvents = {
    datazoom: () => { if (!noDataInRange) { const v = getVisibleCount() || pageData.ts.length || 1; applyBarSpec(v); } },
  };

  // render
  const totalPagesDisplay = Math.max(1, Math.ceil((effective.ts.length || 0) / pageSize));

  const formatRangeLabel = (r) => {
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
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width:'100%', height:`${dims.height}px`, background:'#fafafb', overflow:'hidden',
        borderRadius:12, position:'relative'
      }}
    >
      {/* header: title (1fr) | UnifiedDateControls (date+agg+interval inside) */}
      <div
        style={{
          position:'absolute', top:10, left:16, right:16, zIndex:6,
          display:'grid', gridTemplateColumns:'1fr auto', alignItems:'start', gap:16
        }}
      >
        <div style={{ textAlign:'left', width:'100%' }}>
          <div style={{ fontWeight:900, fontSize:22, color:'#0f172a', lineHeight:1.1 }}>Energy Consumption</div>
          <div style={{ marginTop:4, fontSize:12, color:'#6b7280' }}>Panel Name: {metaInfo.panelName || 'Default'}</div>
          <div style={{ marginTop:2, fontSize:12, color:'#6b7280' }}>Device ID: {metaInfo.did || '-'}</div>
        </div>

        {/* ⬇️ Single smart control */}
        <UnifiedDateControls
          value={{
            start: dateRange.start,
            end: dateRange.end,
            shift: dateRange.meta?.shift || 'ALL',
            preset: dateRange.meta?.preset || '',
            aggregation: aggCodeToLabel[agg],
            interval: minutesToIntervalLabel(intervalMin)
          }}
          onChange={(r) => {
            // Map aggregation + interval to this component's state
            setAgg(aggLabelToCode[r.aggregation] ?? 'avg');
            setIntervalMin(parseIntervalLabelToMinutes(r.interval));

            // Date range
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

      <ReactECharts
        key={`rtw8h_${page}_${pageData.ts.length}`}
        option={option}
        notMerge={true}
        lazyUpdate
        onEvents={onEvents}
        style={{ width:'100%', height:'100%', visibility: errState ? 'hidden' : 'visible' }}
        onChartReady={(inst) => {
          chartInstRef.current = inst;
          requestAnimationFrame(() => {
            inst.resize?.();
            if (!noDataInRange) {
              resetZoomToFullPage();
              applyBarSpec(getVisibleCount() || pageData.ts.length || pageSize);
              setTimeout(() => {
                inst.resize?.();
                resetZoomToFullPage();
                applyBarSpec(getVisibleCount() || pageData.ts.length || pageSize);
              }, 60);
            }
          });
        }}
        opts={{ renderer: 'canvas' }}
      />

      {/* Single, clean "no records" overlay */}
      {noDataInRange && !errState && !loading && (
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
            No records found{(dateRange.start || dateRange.end) ? ` for ${formatRangeLabel(dateRange)}` : ''}. Try another date range or shift.
          </div>
        </div>
      )}

      {/* Pager only if there are actual values on the page */}
      {pageData.ts.length > 0 && hasAnyValuesPage && !noDataInRange && (
        <div
          style={{
            position:'absolute', left:'50%', transform:'translateX(-50%)', bottom:8, zIndex:6,
            display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.9)',
            border:'1px solid #e5e7eb', borderRadius:12, padding:'6px 10px', boxShadow:'0 4px 16px rgba(0,0,0,0.06)'
          }}
        >
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ padding:'6px 10px', borderRadius:10, border:'1px solid #e5e7eb',
                     background: page === 0 ? '#f3f4f6' : '#ffffff', fontSize:12, fontWeight:600 }}
            title={`Prev ${pageSize}`}
          >Prev</button>

          <div style={{ fontSize:12, fontWeight:700, color:'#374151', minWidth:90, textAlign:'center' }}>
            Page {Math.min(page + 1, totalPagesDisplay)} / {totalPagesDisplay}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPagesDisplay - 1, p + 1))}
            disabled={page >= totalPagesDisplay - 1}
            style={{ padding:'6px 10px', borderRadius:10, border:'1px solid #e5e7eb',
                     background: page >= totalPagesDisplay - 1 ? '#f3f4f6' : '#ffffff', fontSize:12, fontWeight:600 }}
            title={`Next ${pageSize}`}
          >Next</button>
        </div>
      )}

      {errState && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:3 }}>
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:18, maxWidth:520, textAlign:'center',
                        boxShadow:'0 10px 30px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight:800, marginBottom:8, color:'#111827' }}>
              {errState.code === 401 ? 'Not authorized' : 'Error'}
            </div>
            <div style={{ color:'#6b7280' }}>{errState.msg}</div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
          <div style={{ fontSize:13, color:'#6b7280' }}>Loading…</div>
        </div>
      )}
    </div>
  );
}
