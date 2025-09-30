// RTW4H_PFGroup.jsx
// Currents vs FLC using your coworker's pagination/zoom pattern
// (fixes “all points bunched at one place” + freezing).

import React, { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { getTelemetry } from './utils/historicalApi';

// color tokens
const CR = '#E53935',
  CY = '#F59E0B',
  CB = '#1E40AF',
  AVG = '#00897B';
const IMB = '#3B82F6',
  DEV = '#EF4444';
const BAND_Y = '#FFF3C4',
  BAND_B = '#DCEBFF',
  BAND_G = '#DBF1D6',
  BAND_R = '#FFF1F1';

// ▶ keep max zoom-in sane (same as your old pattern)
const SAFE_MIN_VISIBLE = 8;

export default function RTW4H_PFGroup({
  // API params
  apiBaseIgnored, // kept only to match previous prop surface (we read base in axios)
  did = 'E_AA_Z_A_Z_P0001_D1',
  from,
  to,
  timeFrame = '15m',
  segment = 'current',
  limit,
  // chart params
  flc = 650,
  autoScaleFLC = false,
  // ux
  pageSize = 120 // how many points per page to render (keeps it smooth)
}) {
  const wrapRef = useRef(null);
  const instRef = useRef(null);

  const [dims, setDims] = useState({
    width: 800,
    height: 640,
    font: 12,
    nameFont: 13,
    symbol: 5,
    topGridTop: 56,
    topGridHeight: 420,
    bottomGridHeight: 170,
    bottomGridBottom: 28,
    sidePadLeft: 88,
    sidePadRight: 110
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [rows, setRows] = useState([]); // normalized rows (ordered)
  const [page, setPage] = useState(0); // pagination

  /* -------------------------- layout / resize -------------------------- */

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const getVVH = () => window.visualViewport?.height ?? window.innerHeight;

  const recalc = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = getVVH();
    const totalH = clamp(vh - 120, 560, 860);

    setDims((d) => ({
      ...d,
      width: vw,
      height: totalH,
      font: vw < 900 ? 11 : 12,
      nameFont: vw < 900 ? 12 : 13,
      symbol: vw < 900 ? 4 : 6,
      topGridTop: 56,
      topGridHeight: clamp(totalH - (56 + 16 + 170 + 28), 330, 520),
      bottomGridHeight: 170,
      bottomGridBottom: 28
    }));

    requestAnimationFrame(() => instRef.current?.resize?.());
  };

  useLayoutEffect(() => {
    recalc();
    const on = () => requestAnimationFrame(recalc);
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    window.visualViewport?.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
      window.visualViewport?.removeEventListener('resize', on);
    };
  }, []);

  /* ------------------------------ fetch ------------------------------- */

  // normalize API rows (accepts common key variants)
  const toMs = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
    const d = new Date(v);
    return Number.isFinite(+d) ? +d : null;
  };

  const num = (o, keys) => {
    for (const k of keys) if (o?.[k] != null && isFinite(Number(o[k]))) return Number(o[k]);
    return null;
  };

  const normalize = (arr) => {
    if (!Array.isArray(arr)) return [];
    const TS = ['TS', 'timestamp', 'time', 'Time', 'TIME', 'ts'];
    const IR = ['IR', 'Ir', 'ir', 'iR'];
    const IY = ['IY', 'Iy', 'iy', 'iY'];
    const IB = ['IB', 'Ib', 'ib', 'iB'];

    const out = arr
      .map((r) => ({
        t: toMs(r?.TS ?? r?.timestamp ?? r?.time ?? r?.Time ?? r?.TIME ?? r?.ts),
        r: num(r, IR),
        y: num(r, IY),
        b: num(r, IB)
      }))
      .filter((x) => x.t != null);

    // sort by time (just in case)
    out.sort((a, b) => a.t - b.t);
    return out;
  };

  useEffect(() => {
    let ab = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await getTelemetry({ did, from, to, timeFrame, segment, limit });
        const norm = normalize(data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [did, from, to, timeFrame, segment, limit]);

  /* ------------------------- paging + derived ------------------------- */

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [totalPages, page]);

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

  // optional autoscale to roughly the max Iavg
  const effFLC = useMemo(() => {
    if (!autoScaleFLC) return flc;
    const mx = Math.max(...iAvg.filter(Number.isFinite));
    if (!Number.isFinite(mx)) return flc;
    // snap to nearest 50 A above
    const snapped = Math.ceil(mx / 50) * 50;
    return Math.max(50, snapped);
  }, [autoScaleFLC, flc, iAvg]);

  /* --------------------- bars / zoom widths like RTW8H --------------------- */

  const computeBarSpec = (visibleCats, widthPx) => {
    const innerW = Math.max(640, widthPx) - (dims.sidePadLeft + dims.sidePadRight);
    const perCat = innerW / Math.max(1, visibleCats);
    // 3 top bars in a category (Ir, Iy, Ib): occupy ~60% → rest empty (never touching neighbors)
    const totalBarsW = perCat * 0.6;
    let barWidth = Math.floor(totalBarsW / 3 - 2); // leave small intra-phase gap
    barWidth = Math.max(4, Math.min(18, barWidth));
    const catGapPercent = 40; // big inter-category gap
    const barGapPercent = Math.max(8, Math.min(24, Math.round(((perCat * 0.1) / Math.max(1, barWidth)) * 100)));
    const imbWidth = Math.max(6, Math.min(24, Math.round(perCat * 0.5)));
    return { barWidth, barGapPercent, catGapPercent, imbWidth };
  };

  const visibleStepRef = useRef(4); // ← keep last chosen label step

  const getVisibleCount = () => {
    const inst = instRef.current;
    const n = xLabels.length || 0;
    if (!inst || !n) return n;
    let opt;
    try {
      opt = inst.getOption();
    } catch {
      return n;
    }
    const dz = (Array.isArray(opt?.dataZoom) ? opt.dataZoom : [])[0] || {};
    let start = 0,
      end = n - 1;
    if (dz.startValue != null || dz.endValue != null) {
      start = Math.max(0, Math.min(n - 1, dz.startValue ?? 0));
      end = Math.max(0, Math.min(n - 1, dz.endValue ?? n - 1));
    } else if (dz.start != null || dz.end != null) {
      const s = Math.max(0, Math.min(100, dz.start ?? 0)) / 100;
      const e = Math.max(0, Math.min(100, dz.end ?? 100)) / 100;
      start = Math.floor(s * (n - 1));
      end = Math.ceil(e * (n - 1));
    }
    return Math.max(1, end - start + 1);
  };

  // ▶ This now mirrors the old component: recompute bar widths + label steps, then setOption
  const applyBarSpec = (visible) => {
    const clamped = Math.max(visible, SAFE_MIN_VISIBLE);
    const { barWidth, barGapPercent, catGapPercent, imbWidth } = computeBarSpec(clamped, dims.width);

    // choose a step that yields ~12 labels across; at max zoom force all labels
    const step = Math.max(1, Math.round(clamped / 12));
    visibleStepRef.current = step;

    const axisLabelObj =
      step === 1
        ? { show: true, interval: 0, formatter: (v) => v, showMinLabel: true, showMaxLabel: true, hideOverlap: false }
        : {
            show: true,
            interval: (i) => i % step === 0,
            formatter: (v, i) => (i % step === 0 ? v : ''),
            showMinLabel: true,
            showMaxLabel: true,
            hideOverlap: false
          };

    try {
      instRef.current?.setOption(
        {
          series: [
            { id: 'ir', barWidth, barGap: `${barGapPercent}%`, barCategoryGap: `${catGapPercent}%` },
            { id: 'iy', barWidth, barGap: `${barGapPercent}%`, barCategoryGap: `${catGapPercent}%` },
            { id: 'ib', barWidth, barGap: `${barGapPercent}%`, barCategoryGap: `${catGapPercent}%` },
            { id: 'imb', barWidth: imbWidth, barCategoryGap: '62%' }
          ],
          xAxis: [{ axisLabel: axisLabelObj }, { axisLabel: axisLabelObj }]
        },
        { lazyUpdate: true }
      );
    } catch {}
  };

  useEffect(() => {
    const inst = instRef.current;
    const n = xLabels.length;
    if (!inst || !n) return;
    requestAnimationFrame(() => {
      inst.resize?.();
      // zoom to page content and re-apply widths
      try {
        inst.dispatchAction({ type: 'dataZoom', startValue: 0, endValue: n - 1 });
      } catch {}
      applyBarSpec(n);
      setTimeout(() => {
        inst.resize?.();
        try {
          inst.dispatchAction({ type: 'dataZoom', startValue: 0, endValue: n - 1 });
        } catch {}
        applyBarSpec(getVisibleCount() || n);
      }, 80);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xLabels.length, page, dims.width]);

  const initialSpec = useMemo(
    () => computeBarSpec(xLabels.length || pageSize, dims.width),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [xLabels.length, dims.width]
  );

  /* ----------------------------- chart opts ----------------------------- */

  const devMax = Math.max(5, Math.ceil((Math.max(...devData.filter(Number.isFinite)) || 1) / 5) * 5);
  const imbMax = Math.max(10, Math.ceil((Math.max(...phaseImbA.filter(Number.isFinite)) || 1) / 10) * 10);

  const pctFormatter = (v) => `${Math.round((v / effFLC) * 100)}%`;

  const option = useMemo(
    () => ({
      backgroundColor: '#fff',
      useDirtyRect: true,

      grid: [
        { top: dims.topGridTop, left: dims.sidePadLeft, right: dims.sidePadRight, height: dims.topGridHeight, containLabel: false },
        {
          left: dims.sidePadLeft,
          right: dims.sidePadRight,
          height: dims.bottomGridHeight,
          bottom: dims.bottomGridBottom,
          containLabel: false
        }
      ],

      legend: {
        type: 'scroll',
        top: 10,
        left: dims.sidePadLeft,
        right: dims.sidePadRight,
        textStyle: { color: '#374151', fontSize: dims.font },
        itemWidth: 14,
        itemHeight: 8,
        data: ['Ir (A)', 'Iy (A)', 'Ib (A)', 'Iavg (A)', 'Phase Imbalance (A)', '% Max Deviation (A)']
      },

      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          filterMode: 'none',
          minValueSpan: 8,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          throttle: 16
        }
      ],

      xAxis: [
        {
          type: 'category',
          gridIndex: 0,
          boundaryGap: true,
          name: 'TIME',
          nameLocation: 'middle',
          nameGap: 26,
          nameTextStyle: { color: '#374151', fontWeight: 600, fontSize: dims.nameFont },
          data: xLabels,
          axisLabel: { color: '#6B7280', fontSize: dims.font, margin: 12 },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: '#E5E7EB' } }
        },
        {
          type: 'category',
          gridIndex: 1,
          boundaryGap: true,
          name: 'TIME',
          nameLocation: 'middle',
          nameGap: 26,
          nameTextStyle: { color: '#374151', fontWeight: 600, fontSize: dims.nameFont },
          data: xLabels,
          axisLabel: { color: '#6B7280', fontSize: dims.font, margin: 12 },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: '#E5E7EB' } }
        }
      ],

      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          name: '% of FLC (A)',
          nameLocation: 'middle',
          nameGap: 38,
          nameTextStyle: { color: '#111827', fontWeight: 700, fontSize: dims.nameFont },
          min: 0,
          max: effFLC * 1.25,
          interval: effFLC * 0.25,
          axisLabel: { color: '#6B7280', fontSize: dims.font, margin: 8, formatter: pctFormatter },
          splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
          axisLine: { show: false }
        },
        {
          type: 'value',
          gridIndex: 1,
          name: '% Max Deviation (A)',
          nameLocation: 'middle',
          nameGap: 28,
          nameTextStyle: { color: '#111827', fontWeight: 700, fontSize: dims.nameFont },
          min: 0,
          max: devMax,
          axisLabel: { color: '#6B7280', fontSize: dims.font },
          splitLine: { lineStyle: { color: '#F1F5F9' } },
          axisLine: { show: false }
        },
        {
          type: 'value',
          gridIndex: 1,
          position: 'right',
          name: 'Phase Imbalance (A)',
          nameLocation: 'middle',
          nameGap: 28,
          nameTextStyle: { color: '#111827', fontWeight: 700, fontSize: dims.nameFont },
          min: 0,
          max: imbMax,
          axisLabel: { color: '#6B7280', fontSize: dims.font },
          splitLine: { show: false },
          axisLine: { show: false }
        }
      ],

      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#111827', fontSize: dims.font },
        extraCssText: 'box-shadow:0 10px 28px rgba(0,0,0,0.14);padding:12px;border-radius:12px;',
        formatter: (p) => {
          if (!p?.length) return '';
          const i = p[0].dataIndex;
          const r = rA[i],
            y = yA[i],
            b = bA[i],
            avg = iAvg[i];
          const imb = phaseImbA[i],
            dev = devData[i];
          const pctN = (a) => (a == null ? '-' : Math.round((a / effFLC) * 100));
          const pct = (a) => (a == null ? '-' : `${pctN(a)}%`);
          const zone = typeof avg === 'number' ? (avg <= effFLC ? 'ACCEPTABLE' : avg <= effFLC * 1.25 ? 'WARNING' : 'CRITICAL') : '—';
          const zoneCol = zone === 'ACCEPTABLE' ? '#16a34a' : zone === 'WARNING' ? '#f59e0b' : zone === 'CRITICAL' ? '#ef4444' : '#6b7280';
          const dotRow = (name, val, col) => `
          <div style="display:flex;gap:10px;align-items:center;margin:2px 0">
            <span style="width:10px;height:10px;background:${col};border-radius:2px"></span>
            <span style="flex:1;color:#6b7280">${name}</span>
            <span style="font-weight:800;color:#111827">${pct(val)}</span>
            <span style="width:64px;text-align:right;color:#6b7280">${val == null ? '-' : Math.round(val)} A</span>
          </div>`;
          return `
          <div style="min-width:260px">
            <div style="font-size:12px;color:#6b7280;margin-bottom:6px">${prettyLabels[i]}</div>
            <div style="font-weight:800;margin-bottom:6px">Iavg: ${avg == null ? '-' : Math.round(avg)} A (${pct(avg)})</div>
            ${dotRow('Ir', r, '${CR}')}
            ${dotRow('Iy', y, '${CY}')}
            ${dotRow('Ib', b, '${CB}')}
            <div style="margin-top:6px;border-top:1px solid #E5E7EB;padding-top:6px;font-size:12px;color:#6b7280">
              <div style="display:flex;justify-content:space-between"><span>Phase Imbalance</span><span style="font-weight:700;color:${IMB}">${imb?.toFixed?.(0) ?? '-'} A</span></div>
              <div style="display:flex;justify-content:space-between"><span>Max Deviation</span><span style="font-weight:700;color:${DEV}">${dev?.toFixed?.(0) ?? '-'} A</span></div>
              <div style="margin-top:6px">ZONE:
                <span style="display:inline-block;padding:2px 10px;margin-left:6px;border-radius:999px;background:${zoneCol}1A;color:${zoneCol};font-weight:800;">
                  ${zone}
                </span>
              </div>
            </div>
          </div>`;
        }
      },

      series: [
        // background % bands
        {
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: [],
          silent: true,
          itemStyle: { opacity: 0 },
          z: 1,
          markArea: {
            silent: true,
            itemStyle: { opacity: 1 },
            data: [
              [{ yAxis: effFLC * 0.0, itemStyle: { color: BAND_Y } }, { yAxis: effFLC * 0.25 }],
              [{ yAxis: effFLC * 0.25, itemStyle: { color: BAND_B } }, { yAxis: effFLC * 0.75 }],
              [{ yAxis: effFLC * 0.75, itemStyle: { color: BAND_G } }, { yAxis: effFLC * 1.0 }],
              [{ yAxis: effFLC * 1.0, itemStyle: { color: BAND_R } }, { yAxis: effFLC * 1.25 }]
            ]
          }
        },

        // top bars
        {
          id: 'ir',
          name: 'Ir (A)',
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          clip: true,
          barWidth: initialSpec.barWidth,
          barGap: `${initialSpec.barGapPercent}%`,
          barCategoryGap: `${initialSpec.catGapPercent}%`,
          itemStyle: { color: CR },
          data: rA,
          z: 3
        },
        {
          id: 'iy',
          name: 'Iy (A)',
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          clip: true,
          barWidth: initialSpec.barWidth,
          barGap: `${initialSpec.barGapPercent}%`,
          barCategoryGap: `${initialSpec.catGapPercent}%`,
          itemStyle: { color: CY },
          data: yA,
          z: 4
        },
        {
          id: 'ib',
          name: 'Ib (A)',
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          clip: true,
          barWidth: initialSpec.barWidth,
          barGap: `${initialSpec.barGapPercent}%`,
          barCategoryGap: `${initialSpec.catGapPercent}%`,
          itemStyle: { color: CB },
          data: bA,
          z: 3
        },

        // Iavg
        {
          name: 'Iavg (A)',
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          clip: true,
          smooth: true,
          symbol: 'circle',
          symbolSize: dims.symbol,
          lineStyle: { width: 2.5, color: AVG },
          itemStyle: { color: AVG },
          data: iAvg,
          z: 5,
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                yAxis: effFLC,
                lineStyle: { color: '#111827', type: 'dashed', width: 2 },
                label: {
                  formatter: `FLC (${effFLC} A)`,
                  color: '#111827',
                  backgroundColor: '#fff',
                  padding: [1, 5],
                  borderRadius: 6,
                  borderColor: '#E5E7EB',
                  borderWidth: 1,
                  position: 'insideEndTop',
                  distance: 4
                }
              },
              {
                yAxis: effFLC * 1.25,
                lineStyle: { color: '#EF4444', type: 'dashed', width: 1.6 },
                label: {
                  formatter: `125% (${Math.round(effFLC * 1.25)} A)`,
                  color: '#B91C1C',
                  backgroundColor: '#fff',
                  padding: [1, 5],
                  borderRadius: 6,
                  borderColor: '#E5E7EB',
                  borderWidth: 1,
                  position: 'insideEndTop',
                  distance: 4
                }
              }
            ]
          }
        },

        // bottom pane
        {
          name: '% Max Deviation (A)',
          type: 'line',
          xAxisIndex: 1,
          yAxisIndex: 1,
          clip: true,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { width: 2, color: DEV },
          itemStyle: { color: DEV },
          areaStyle: { opacity: 0.15, color: '#FFFFFF' },
          data: devData,
          z: 3
        },

        {
          id: 'imb',
          name: 'Phase Imbalance (A)',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 2,
          clip: true,
          barWidth: computeBarSpec(Math.max(xLabels.length, 8), Math.max(640, dims.width)).imbWidth,
          barGap: '30%',
          barCategoryGap: '62%',
          itemStyle: { color: IMB },
          data: phaseImbA,
          z: 2
        }
      ]
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [dims, xLabels, rA, yA, bA, iAvg, devData, phaseImbA, effFLC, devMax, imbMax, initialSpec]
  );

  const onEvents = {
    datazoom: (evt) => {
      const n = xLabels.length || 0;
      const b = Array.isArray(evt?.batch) ? evt.batch[0] : evt || {};
      let visible = n;

      if (b.startValue != null || b.endValue != null) {
        const s = Math.max(0, Math.min(n - 1, b.startValue ?? 0));
        const e = Math.max(0, Math.min(n - 1, b.endValue ?? n - 1));
        visible = Math.max(1, e - s + 1);
      } else if (b.start != null || b.end != null) {
        const sPct = Math.max(0, Math.min(100, b.start ?? 0)) / 100;
        const ePct = Math.max(0, Math.min(100, b.end ?? 100)) / 100;
        const s = Math.floor(sPct * (n - 1));
        const e = Math.ceil(ePct * (n - 1));
        visible = Math.max(1, e - s + 1);
      }

      applyBarSpec(visible);
    }
  };

  /* -------------------------------- render -------------------------------- */

  const totalPagesDisplay = Math.max(1, Math.ceil((rows.length || 0) / pageSize));
  const noData = !loading && rows.length === 0;

  return (
    <div ref={wrapRef} style={{ width: '100%', height: `${dims.height}px`, background: '#fff', borderRadius: 12, position: 'relative' }}>
      {/* header */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 16,
          right: 16,
          zIndex: 6,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center'
        }}
      >
        <div style={{ textAlign: 'center', width: '100%' }}>
          {/* <div style={{ fontWeight: 900, fontSize: 22, color: '#0f172a', lineHeight: 1.1 }}>Currents vs FLC</div> */}
          {/* <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>Device ID: {did}</div> */}
          {noData && <div style={{ marginTop: 6, fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>No data in range.</div>}
        </div>
      </div>

      <ReactECharts
        key={`rtw4h_${page}_${xLabels.length}`}
        ref={instRef}
        option={option}
        notMerge={true}
        lazyUpdate
        onEvents={onEvents}
        style={{ width: '100%', height: '100%', visibility: err ? 'hidden' : 'visible' }}
        opts={{ renderer: 'canvas' }}
        onChartReady={(inst) => {
          // IMPORTANT: store the *echarts instance* (not the React wrapper)
          instRef.current = inst;
          // apply initial widths once the instance is ready
          requestAnimationFrame(() => {
            inst.resize?.();
            const n = xLabels.length || 1;
            try {
              inst.dispatchAction({ type: 'dataZoom', startValue: 0, endValue: n - 1 });
            } catch {}
            applyBarSpec(n);
          });
        }}
      />

      {/* pager */}
      {xLabels.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 8,
            zIndex: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: '6px 10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: page === 0 ? '#f3f4f6' : '#ffffff',
              fontSize: 12,
              fontWeight: 600
            }}
            title={`Prev ${pageSize}`}
          >
            Prev
          </button>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', minWidth: 90, textAlign: 'center' }}>
            Page {Math.min(page + 1, totalPagesDisplay)} / {totalPagesDisplay}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPagesDisplay - 1, p + 1))}
            disabled={page >= totalPagesDisplay - 1}
            style={{
              padding: '6px 10px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: page >= totalPagesDisplay - 1 ? '#f3f4f6' : '#ffffff',
              fontSize: 12,
              fontWeight: 600
            }}
            title={`Next ${pageSize}`}
          >
            Next
          </button>
        </div>
      )}

      {/* overlays */}
      {err && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 18,
              maxWidth: 520,
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8, color: '#111827' }}>Error</div>
            <div style={{ color: '#6b7280' }}>{String(err)}</div>
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
