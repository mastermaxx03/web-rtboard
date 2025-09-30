// RTW4H_PFGroup.jsx
// Full-day (96 × 15-min) — Currents vs FLC
// - TOP: Ir/Iy/Ib (A) bars + Iavg line over extra-light %FLC bands
// - BOTTOM: % Max Deviation (A) line+area (left), Phase Imbalance (A) bars (right)
// - Perfect vertical alignment at any allowed zoom
// - Max zoom-in capped; X labels forced visible at max zoom
// - Y ticks fixed at 0/25/50/75/100/125%
// - Neighbor categories never touch

import React, { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import ReactECharts from 'echarts-for-react';

export default function RTW4H_PFGroup({
  timeSlots, // 96 × "HH:MM"
  Ir,
  Iy,
  Ib, // arrays (A)
  flc = 650,
  devPct = 12,
  maxDeviationA
}) {
  const chartRef = useRef(null);
  const instRef = useRef(null);

  const [dims, setDims] = useState({
    width: 1200,
    height: 700,
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

  // ▶ Max zoom-in cap: minimum categories visible (8 = 2 hours of 15-min slots)
  const SAFE_MIN_VISIBLE = 8;

  const viewportH = () =>
    window.visualViewport && typeof window.visualViewport.height === 'number' ? window.visualViewport.height : window.innerHeight;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // widths (same for Ir/Iy/Ib so Iy stays centered)
  // — 60% of each category is used by the three phase bars => 40% empty space
  const computeBarWidths = (visible, widthPx) => {
    const innerW = Math.max(640, widthPx) - (dims.sidePadLeft + dims.sidePadRight);
    const perSlot = innerW / Math.max(1, visible);
    const topBar = clamp(Math.round((perSlot * 0.6) / 3), 4, 18);
    const imbBar = clamp(Math.round(perSlot * 0.5), 6, 24);
    return { topBar, imbBar };
  };

  const getVisibleSlots = (n) => {
    const inst = instRef.current;
    if (!inst || !n) return n;
    const dz = (inst.getOption()?.dataZoom || [])[0] || {};
    let s = 0,
      e = n - 1;
    if (dz.startValue != null || dz.endValue != null) {
      s = Math.max(0, Math.min(n - 1, dz.startValue ?? 0));
      e = Math.max(0, Math.min(n - 1, dz.endValue ?? n - 1));
    } else {
      const ps = (dz.start ?? 0) / 100,
        pe = (dz.end ?? 100) / 100;
      s = Math.floor(ps * (n - 1));
      e = Math.ceil(pe * (n - 1));
    }
    return Math.max(1, e - s + 1);
  };

  // adaptive X ticks (shared for both axes)
  const visibleStepRef = useRef(4);

  const applyBarWidthsAndTicks = (visible) => {
    const clamped = Math.max(visible, SAFE_MIN_VISIBLE);
    const { topBar, imbBar } = computeBarWidths(clamped, dims.width);

    // pick a step that yields ~12 labels across the viewport
    const step = Math.max(1, Math.round(clamped / 12));
    visibleStepRef.current = step;

    // at max zoom, force every label
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

    instRef.current?.setOption(
      {
        series: [
          // small intra-phase gap, big inter-category gap — categories never touch
          { id: 'ir', barWidth: topBar, barGap: '12%', barCategoryGap: '60%' },
          { id: 'iy', barWidth: topBar, barGap: '12%', barCategoryGap: '60%' },
          { id: 'ib', barWidth: topBar, barGap: '12%', barCategoryGap: '60%' },
          { id: 'imb', barWidth: imbBar, barCategoryGap: '62%' }
        ],
        xAxis: [{ axisLabel: axisLabelObj }, { axisLabel: axisLabelObj }]
      },
      { lazyUpdate: true }
    );
  };

  const recalc = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = viewportH();

    const totalH = clamp(vh - 120, 600, 860);

    const bottomGridHeight = 170;
    const bottomGridBottom = 28;
    const topGridTop = 56;
    const gapBetween = 16;
    const paddings = topGridTop + gapBetween + bottomGridHeight + bottomGridBottom;
    const topGridHeight = clamp(totalH - paddings, 330, 520);

    const sidePadLeft = 88;
    const sidePadRight = 110;

    const font = vw < 900 ? 11 : 12;
    const nameFont = vw < 900 ? 12 : 13;
    const symbol = vw < 900 ? 4 : 6;

    setDims({
      width: vw,
      height: totalH,
      font,
      nameFont,
      symbol,
      topGridTop,
      topGridHeight,
      bottomGridHeight,
      bottomGridBottom,
      sidePadLeft,
      sidePadRight
    });

    requestAnimationFrame(() => {
      instRef.current?.resize();
      const vis = getVisibleSlots(slots.length);
      applyBarWidthsAndTicks(vis);
    });
  };

  useLayoutEffect(() => {
    recalc();
    const on = () => requestAnimationFrame(recalc);
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', on);
    };
  }, []);

  useEffect(() => {
    instRef.current?.resize();
  }, [dims.width, dims.height]);

  // --- data + pretty local time (no GMT)
  const two = (n) => String(n).padStart(2, '0');

  const { slots, prettySlots, rA, yA, bA } = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const dObjs = Array.from({ length: 96 }, (_, i) => new Date(base.getTime() + i * 15 * 60 * 1000));
    const fallbackLabels = dObjs.map((d) => `${two(d.getHours())}:${two(d.getMinutes())}`);

    const dtf = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const pretty = dObjs.map(dtf.format);

    const useLabels = timeSlots && timeSlots.length === 96 ? timeSlots : fallbackLabels;

    // Demo values spanning bands
    const synth = (i, phaseShift = 0) => {
      let meanPct, ampPct;
      if (i < 24) {
        meanPct = 0.8;
        ampPct = 0.08;
      } else if (i < 48) {
        meanPct = 0.96;
        ampPct = 0.06;
      } else if (i < 72) {
        meanPct = 1.1;
        ampPct = 0.06;
      } else {
        meanPct = 1.22;
        ampPct = 0.02;
      }
      const baseV = meanPct * flc;
      const wig = ampPct * flc * Math.sin((i + phaseShift) / 6);
      return Math.min(flc * 1.24, Math.max(0, baseV + wig));
    };

    let rr, yy, bb;
    if (!Ir || !Iy || !Ib || useLabels.length === 0) {
      rr = Array.from({ length: 96 }, (_, i) => synth(i, 0));
      yy = Array.from({ length: 96 }, (_, i) => synth(i, 1.8));
      bb = Array.from({ length: 96 }, (_, i) => synth(i, 3.2));
    } else {
      rr = Ir;
      yy = Iy;
      bb = Ib;
    }
    return { slots: useLabels, prettySlots: pretty, rA: rr, yA: yy, bA: bb };
  }, [timeSlots, Ir, Iy, Ib, flc]);

  const iAvg = useMemo(
    () =>
      slots.map((_, i) => {
        const v = [rA[i], yA[i], bA[i]].filter(Number.isFinite);
        return v.length ? v.reduce((a, c) => a + c, 0) / v.length : null;
      }),
    [slots, rA, yA, bA]
  );

  const devComputed = useMemo(
    () =>
      slots.map((_, i) => {
        const v = [rA[i], yA[i], bA[i]].filter(Number.isFinite);
        if (v.length < 2) return null;
        const avg = v.reduce((a, c) => a + c, 0) / v.length;
        return Math.max(...v.map((x) => Math.abs(x - avg)));
      }),
    [slots, rA, yA, bA]
  );

  const devData = useMemo(
    () => (maxDeviationA?.length === slots.length ? maxDeviationA : devComputed),
    [maxDeviationA, devComputed, slots.length]
  );

  const phaseImbA = useMemo(
    () =>
      slots.map((_, i) => {
        const v = [rA[i], yA[i], bA[i]].filter(Number.isFinite);
        if (!v.length) return null;
        return Math.max(...v) - Math.min(...v);
      }),
    [slots, rA, yA, bA]
  );

  // colors
  const CR = '#E53935',
    CY = '#F59E0B',
    CB = '#1E40AF',
    AVG = '#00897B';
  const IMB = '#3B82F6',
    DEV = '#EF4444';

  // ─────────────────────────────────────────────────────────────
  // BAND COLORS + TOOLTIP OPACITY (tweak here later)
  // Darken green/yellow/blue bands slightly; make red band a bit lighter.
  const BAND_Y = '#FFF3C4'; // was #FFFBEA (Yellow)  → slightly darker
  const BAND_B = '#DCEBFF'; // was #EDF5FF (Blue)    → slightly darker
  const BAND_G = '#DBF1D6'; // was #EAF9E7 (Green)   → slightly darker
  const BAND_R = '#FFF1F1'; // was #FFECEC (Red)     → slightly lighter
  // Tooltip background opacity (RGBA): increase alpha to reduce transparency.
  const TOOLTIP_BG = 'rgba(255,255,255,0.85)'; // was '#fff' / lower alpha → more opaque
  // ─────────────────────────────────────────────────────────────

  // initial hourly seed
  const hourStep = useMemo(() => Math.max(1, Math.round((timeSlots?.length || 96) / 24)), [timeSlots?.length]);
  visibleStepRef.current = hourStep;

  const initialWidths = useMemo(
    () => computeBarWidths(timeSlots?.length || 96, Math.max(640, dims.width)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dims.width, timeSlots?.length]
  );

  const devMax = Math.max(5, Math.ceil((Math.max(...devData.filter(Number.isFinite)) || 1) / 5) * 5);
  const imbMax = Math.max(10, Math.ceil((Math.max(...phaseImbA.filter(Number.isFinite)) || 1) / 10) * 10);

  // initial state for x labels (will be overridden on zoom)
  const tickFmtInit = (v, i) => (i % visibleStepRef.current === 0 ? v : '');
  const intervalInit = (i) => i % visibleStepRef.current === 0;

  // left Y axis: FIX tick interval and format as %
  const pctFormatter = (v) => `${Math.round((v / flc) * 100)}%`;

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

      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          filterMode: 'none',
          minValueSpan: SAFE_MIN_VISIBLE,
          zoomLock: false,
          moveOnMouseWheel: true,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          throttle: 0
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

      xAxis: [
        {
          type: 'category',
          gridIndex: 0,
          boundaryGap: true,
          name: 'TIME',
          nameLocation: 'middle',
          nameGap: 26,
          nameTextStyle: { color: '#374151', fontWeight: 600, fontSize: dims.nameFont },
          data: slots,
          axisLabel: {
            show: true,
            color: '#6B7280',
            fontSize: dims.font,
            margin: 12,
            formatter: tickFmtInit,
            interval: intervalInit,
            showMinLabel: true,
            showMaxLabel: true,
            hideOverlap: false
          },
          axisTick: { show: false, alignWithLabel: true },
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
          data: slots,
          axisLabel: {
            show: true,
            color: '#6B7280',
            fontSize: dims.font,
            margin: 12,
            formatter: tickFmtInit,
            interval: intervalInit,
            showMinLabel: true,
            showMaxLabel: true,
            hideOverlap: false
          },
          axisTick: { show: false, alignWithLabel: true },
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
          max: flc * 1.25,
          interval: flc * 0.25, // force ticks at 0/25/50/75/100/125%
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
        backgroundColor: TOOLTIP_BG, // ← opacity controlled here
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#111827', fontSize: dims.font },
        extraCssText: 'box-shadow:0 10px 28px rgba(0,0,0,0.14);padding:12px;border-radius:12px;',
        formatter: (p) => {
          const i = p?.[0]?.dataIndex ?? 0;
          const r = rA[i],
            y = yA[i],
            b = bA[i],
            avg = iAvg[i];
          const imb = phaseImbA[i],
            dev = devData[i];

          const pctN = (a) => Math.round((a / flc) * 100);
          const pct = (a) => `${pctN(a)}%`;
          const pAvg = pctN(avg);
          const zone = pAvg <= 100 ? 'ACCEPTABLE' : pAvg <= 125 ? 'WARNING' : 'CRITICAL';
          const zoneCol = pAvg <= 100 ? '#16a34a' : pAvg <= 125 ? '#f59e0b' : '#ef4444';

          const row = (k, v, c) =>
            `<div style="display:flex;gap:10px;align-items:center;margin:2px 0">
               <span style="width:10px;height:10px;background:${c};border-radius:2px"></span>
               <span style="flex:1;color:#6b7280">${k}</span>
               <span style="font-weight:800;color:#111827">${pct(v)}</span>
               <span style="width:64px;text-align:right;color:#6b7280">${Math.round(v)} A</span>
             </div>`;

          const when = prettySlots[i] || slots[i] || '';
          return `
            <div style="min-width:260px">
              <div style="font-size:12px;color:#6b7280;margin-bottom:6px">${when}</div>
              <div style="font-weight:800;margin-bottom:6px">Iavg: ${Math.round(avg)} A (${pct(avg)})</div>
              ${row('Ir', r, '${CR}')}
              ${row('Iy', y, '${CY}')}
              ${row('Ib', b, '${CB}')}
              <div style="margin-top:6px;border-top:1px solid #E5E7EB;padding-top:6px;font-size:12px;color:#6b7280">
                <div style="display:flex;justify-content:space-between"><span>Phase Imbalance</span><span style="font-weight:700;color:${IMB}">${imb?.toFixed(0) ?? '-'} A</span></div>
                <div style="display:flex;justify-content:space-between"><span>Max Deviation</span><span style="font-weight:700;color:${DEV}">${dev?.toFixed(0) ?? '-'} A</span></div>
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
        // % bands
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
              [{ yAxis: flc * 0.0, itemStyle: { color: BAND_Y } }, { yAxis: flc * 0.25 }],
              [{ yAxis: flc * 0.25, itemStyle: { color: BAND_B } }, { yAxis: flc * 0.75 }],
              [{ yAxis: flc * 0.75, itemStyle: { color: BAND_G } }, { yAxis: flc * 1.0 }],
              [{ yAxis: flc * 1.0, itemStyle: { color: BAND_R } }, { yAxis: flc * 1.25 }]
            ]
          }
        },

        // TOP bars — intra-phase gap + big category gap (never touches neighbor slot)
        {
          id: 'ir',
          name: 'Ir (A)',
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          clip: true,
          barWidth: initialWidths.topBar,
          barGap: '12%',
          barCategoryGap: '60%',
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
          barWidth: initialWidths.topBar,
          barGap: '12%',
          barCategoryGap: '60%',
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
          barWidth: initialWidths.topBar,
          barGap: '12%',
          barCategoryGap: '60%',
          itemStyle: { color: CB },
          data: bA,
          z: 3
        },

        // Iavg + reference lines
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
                yAxis: flc,
                lineStyle: { color: '#111827', type: 'dashed', width: 2 },
                label: {
                  formatter: `FLC (${flc} A)`,
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
                yAxis: flc * 1.25,
                lineStyle: { color: '#EF4444', type: 'dashed', width: 1.6 },
                label: {
                  formatter: `125% (${Math.round(flc * 1.25)} A)`,
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

        // BOTTOM series
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
          barWidth: initialWidths.imbBar,
          barGap: '30%',
          barCategoryGap: '62%',
          itemStyle: { color: IMB },
          data: phaseImbA,
          z: 2
        }
      ]
    }),
    [dims, slots, prettySlots, rA, yA, bA, iAvg, devData, phaseImbA, flc, devPct, initialWidths, devMax, imbMax]
  );

  const onEvents = {
    datazoom: () => {
      const vis = getVisibleSlots(slots.length);
      applyBarWidthsAndTicks(vis);
    }
  };

  return (
    <div style={{ width: '100%', height: `${dims.height}px`, background: '#fff' }}>
      <ReactECharts
        ref={chartRef}
        option={option}
        lazyUpdate
        onEvents={onEvents}
        style={{ width: '100%', height: '100%' }}
        onChartReady={(inst) => {
          instRef.current = inst;
          requestAnimationFrame(() => {
            inst.resize();
            const vis = getVisibleSlots(slots.length);
            applyBarWidthsAndTicks(vis);
          });
        }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
