// Main chart component. Zoom + bar-width syncing done via helpers.
import React, { useMemo, useRef, useState, useLayoutEffect, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { usePagedTelemetry } from './hooks/usePagedTelemetry';
import {
  computeBarSpec,
  getVisibleCountFromInstance,
  applyBarSpecToInstance,
  visibleFromZoomEvt,
  SAFE_MIN_VISIBLE
} from './utils/chartSizing';
import { BAND_B, BAND_G, BAND_R, BAND_Y, CB, CR, CY, DEV, IMB, AVG } from './utils/constants';

/* local date package (no imports from alert page) */
import DatePackage from './date/DatePackage';
import { ShiftSettingsProvider } from './date/ShiftSettingsContext';

/* ------- Small, local URL helpers (write + read) ------- */
function getDidFromURL() {
  try {
    if (typeof window === 'undefined') return '';
    const s = new URLSearchParams(window.location.search);
    return s.get('did') || '';
  } catch {
    return '';
  }
}
function setDidInURL(nextDid, { replace = false } = {}) {
  try {
    if (typeof window === 'undefined' || !nextDid) return;
    const url = new URL(window.location.href);
    url.searchParams.set('did', String(nextDid));
    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  } catch {
    // ignore
  }
}
function ensureDidInURL(defaultDid) {
  const cur = getDidFromURL();
  if (!cur && defaultDid) setDidInURL(defaultDid, { replace: true });
}

/* ------- FLC helpers (URL -> localStorage -> prop) ------- */
function getNumFromURL(key) {
  try {
    if (typeof window === 'undefined') return undefined;
    const raw = new URLSearchParams(window.location.search).get(key);
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}
function readFlcForDid(did, propFallback) {
  // 1) allow runtime override via ?flc=XXXX
  const urlFlc = getNumFromURL('flc');
  if (Number.isFinite(urlFlc) && urlFlc > 0) return urlFlc;

  // 2) per-device persisted value in localStorage
  try {
    if (did) {
      const raw = localStorage.getItem('flcByDid');
      const obj = raw ? JSON.parse(raw) : {};
      const n = Number(obj?.[did]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    /* ignore */
  }

  // 3) fall back to prop
  const pf = Number(propFallback);
  return Number.isFinite(pf) && pf > 0 ? pf : undefined;
}
// Exported helper so you can set via console if needed:
// saveFlcForDid('E_AA_Z_B_Y_P0003_D1', 6200)
export function saveFlcForDid(did, value) {
  try {
    if (!did || !Number.isFinite(value) || value <= 0) return;
    const raw = localStorage.getItem('flcByDid');
    const obj = raw ? JSON.parse(raw) : {};
    obj[did] = value;
    localStorage.setItem('flcByDid', JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

/* ------- Lanes so picker/legends never collide with series ------- */
const HEADER_LANE = 96; // space for title + DatePackage (header)
const MID_LEGEND = 28; // gap between top & bottom grids where TOP legend sits
const BOTTOM_LANE = 44; // reserved space under bottom grid for its legend
const TOP_FRACTION = 0.6;

export default function RTW4H({
  limit,
  did = 'E_AA_Z_A_Z_P0001_D1',
  from = 1754015166, // inclusive, unix seconds
  to = 1754792766, // inclusive, unix seconds
  timeFrame = '15s', // '15s' | '15m' | '1h' | '1d'
  segment = 'current',
  pageSize = 180, // tweak for smoothness
  flc = 5000,
  autoScaleFLC = false
}) {
  const instRef = useRef(null);

  /* 1) On first mount, make sure the URL has ?did=... (use prop default) */
  useEffect(() => {
    ensureDidInURL(did);
  }, [did]);

  /* 2) Prefer DID from URL over prop */
  const didFromURL = getDidFromURL();
  const resolvedDid = didFromURL || did;

  /* 3) Keep URL in sync with the resolved DID (e.g., if prop changes) */
  useEffect(() => {
    if (resolvedDid) setDidInURL(resolvedDid, { replace: true });
  }, [resolvedDid]);

  // Date range from the local DatePackage (ISO strings)
  const [dateSel, setDateSel] = useState({ start: '', end: '', label: '', meta: null });
  const toSec = (iso) => (iso ? Math.floor(new Date(iso).getTime() / 1000) : undefined);

  // layout state
  const [dims, setDims] = useState({
    width: 800,
    height: 640,
    font: 12,
    nameFont: 13,
    symbol: 5,
    topGridTop: 56,
    midGap: 28,
    bottomLane: 40,
    topGridHeight: 420,
    bottomGridHeight: 170,
    sidePadLeft: 88,
    sidePadRight: 110
  });

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const getVVH = () => window.visualViewport?.height ?? window.innerHeight;

  const recalc = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = getVVH();
    const totalH = clamp(vh - 120, 560, 860);

    // compute top grid height so both panes + gaps fit exactly
    const topGridHeight = clamp(totalH - (dims.topGridTop + dims.midGap + dims.bottomGridHeight + dims.bottomLane), 330, 520);

    setDims((d) => ({
      ...d,
      width: vw,
      height: totalH,
      font: vw < 900 ? 11 : 12,
      nameFont: vw < 900 ? 12 : 13,
      symbol: vw < 900 ? 4 : 6,
      topGridHeight
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // prefer picker’s range, fall back to props
  const resolvedFrom = dateSel.start ? toSec(dateSel.start) : from;
  const resolvedTo = dateSel.end ? toSec(dateSel.end) : to;

  const {
    state: { page, loading, err, totalPages },
    setters: { setPage },
    arrays: { xLabels, prettyLabels, rA, yA, bA, iAvg, devData, phaseImbA }
  } = usePagedTelemetry({
    did: resolvedDid, // <-- uses DID from URL (or prop default)
    from: resolvedFrom,
    to: resolvedTo,
    timeFrame,
    segment,
    limit,
    pageSize
  });

  /* --------- Device-aware FLC: URL -> localStorage -> prop --------- */
  const [flcForDevice, setFlcForDevice] = useState(() => readFlcForDid(resolvedDid, flc) ?? 0);

  useEffect(() => {
    setFlcForDevice(readFlcForDid(resolvedDid, flc) ?? 0);
  }, [resolvedDid, flc]);

  const effFLC = useMemo(() => {
    const base = Number.isFinite(flcForDevice) && flcForDevice > 0 ? flcForDevice : Number(flc) || 0;
    if (!autoScaleFLC) return base || 500; // safe visual fallback
    const mx = Math.max(...iAvg.filter(Number.isFinite));
    if (!Number.isFinite(mx)) return base || 500;
    const snapped = Math.ceil(mx / 50) * 50;
    return Math.max(base || 50, snapped);
  }, [autoScaleFLC, flcForDevice, flc, iAvg]);

  const devMax = Math.max(5, Math.ceil((Math.max(...devData.filter(Number.isFinite)) || 1) / 5) * 5);
  const imbMax = Math.max(10, Math.ceil((Math.max(...phaseImbA.filter(Number.isFinite)) || 1) / 10) * 10);
  const pctFormatter = (v) => `${Math.round((v / effFLC) * 100)}%`;

  const initialSpec = useMemo(
    () => computeBarSpec(xLabels.length || pageSize, dims.width, { left: dims.sidePadLeft, right: dims.sidePadRight }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [xLabels.length, dims.width]
  );

  // keep widths in sync with zoom + resize
  useEffect(() => {
    const inst = instRef.current;
    const n = xLabels.length;
    if (!inst || !n) return;
    requestAnimationFrame(() => {
      inst.resize?.();
      try {
        inst.dispatchAction({ type: 'dataZoom', startValue: 0, endValue: n - 1 });
      } catch {}
      applyBarSpecToInstance({ inst, visible: n, dims });
      setTimeout(() => {
        inst.resize?.();
        const visible = getVisibleCountFromInstance(inst, n) || n;
        applyBarSpecToInstance({ inst, visible, dims });
      }, 80);
    });
  }, [xLabels.length, page, dims.width]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- lane-aware grid positions ---------- */
  const { g1Top, g1H, g2Top, g2H } = useMemo(() => {
    const avail = Math.max(320, dims.height) - HEADER_LANE - BOTTOM_LANE - MID_LEGEND;
    const _g1Top = HEADER_LANE;
    const _g1H = Math.max(220, Math.round(avail * TOP_FRACTION));
    const _g2Top = _g1Top + _g1H + MID_LEGEND;
    const _g2H = Math.max(120, Math.round(dims.height - _g2Top - BOTTOM_LANE));
    return { g1Top: _g1Top, g1H: _g1H, g2Top: _g2Top, g2H: _g2H };
  }, [dims.height]);

  const option = useMemo(
    () => ({
      backgroundColor: '#fff',
      useDirtyRect: true,

      grid: [
        { top: g1Top, left: 70, right: 28, height: g1H, containLabel: true },
        { top: g2Top, left: 70, right: 28, height: g2H, containLabel: true }
      ],
      legend: [
        {
          type: 'plain',
          right: 18,
          top: g1Top + g1H + 4,
          orient: 'horizontal',
          align: 'right',
          itemWidth: 12,
          itemHeight: 10,
          itemGap: 14,
          icon: 'roundRect',
          textStyle: { color: '#374151', fontSize: '14px', fontWeight: 600 },
          data: ['Ir (A)', 'Iy (A)', 'Ib (A)', 'Iavg (A)']
        },
        {
          type: 'plain',
          right: 18,
          bottom: Math.max(6, BOTTOM_LANE - 40),
          orient: 'horizontal',
          align: 'right',
          itemWidth: 12,
          itemHeight: 10,
          itemGap: 14,
          icon: 'roundRect',
          textStyle: { color: '#374151', fontSize: '14px', fontWeight: 600 },
          data: ['Phase Imbalance (A)', '% Max Deviation (A)']
        }
      ],

      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          filterMode: 'none',
          minValueSpan: SAFE_MIN_VISIBLE,
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
          axisLabel: { color: '#6B7280', fontSize: dims.font, margin: 8, formatter: (v) => `${Math.round((v / effFLC) * 100)}%` },
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
        // background bands
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
          barWidth: computeBarSpec(Math.max(xLabels.length, SAFE_MIN_VISIBLE), Math.max(640, dims.width), {
            left: dims.sidePadLeft,
            right: dims.sidePadRight
          }).imbWidth,
          barGap: '30%',
          barCategoryGap: '62%',
          itemStyle: { color: IMB },
          data: phaseImbA,
          z: 2
        }
      ]
    }),
    [dims, xLabels, rA, yA, bA, iAvg, devData, phaseImbA, effFLC, devMax, imbMax, initialSpec, g1Top, g1H, g2Top, g2H, prettyLabels]
  );

  const onEvents = {
    datazoom: (evt) => {
      const n = xLabels.length || 0;
      const visible = visibleFromZoomEvt(evt, n);
      applyBarSpecToInstance({ inst: instRef.current, visible, dims });
    }
  };

  const totalPagesDisplay = totalPages;

  return (
    <ShiftSettingsProvider>
      <div
        style={{
          width: '100%',
          height: `${dims.height}px`,
          background: '#fff',
          borderRadius: 12,
          position: 'relative'
        }}
      >
        {/* Header lane: title + Date picker as a small card */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 16,
            right: 16,
            height: HEADER_LANE - 16,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            zIndex: 6
          }}
        >
          <div style={{ fontWeight: 800, color: '#0f172a' }}>Current vs Deviation</div>
          <div
            style={{
              justifySelf: 'end',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '6px 8px',
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)'
            }}
          >
            <DatePackage
              start={dateSel.start || null}
              end={dateSel.end || null}
              onChange={(sel) => {
                // Reset paging when the date range changes
                setPage(0);
                setDateSel(sel || { start: '', end: '', label: '', meta: null });
              }}
            />
          </div>
        </div>

        <ReactECharts
          ref={instRef}
          option={option}
          notMerge
          lazyUpdate
          onEvents={onEvents}
          style={{ width: '100%', height: '100%', visibility: err ? 'hidden' : 'visible' }}
          opts={{ renderer: 'canvas' }}
          onChartReady={(inst) => {
            instRef.current = inst;
            requestAnimationFrame(() => {
              inst.resize?.();
              const n = xLabels.length || 1;
              try {
                inst.dispatchAction({ type: 'dataZoom', startValue: 0, endValue: n - 1 });
              } catch {}
              applyBarSpecToInstance({ inst, visible: n, dims });
            });
          }}
        />

        {/* Pager bubble (sits above bottom lane, centered) */}
        {xLabels.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: Math.max(6, BOTTOM_LANE - 28),
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
    </ShiftSettingsProvider>
  );
}
