import { useMemo, useRef } from 'react';
import { SAFE_MIN_VISIBLE } from '../utils/constants';

export function useBarZoomSpec({ dims, xLabels, pageSize }) {
  const instRef = useRef(null);
  const visibleStepRef = useRef(4);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const computeBarSpec = (visibleCats, widthPx) => {
    const innerW = Math.max(640, widthPx) - (dims.sidePadLeft + dims.sidePadRight);
    const perCat = innerW / Math.max(1, visibleCats);
    const totalBarsW = perCat * 0.6;
    let barWidth = Math.floor(totalBarsW / 3 - 2);
    barWidth = clamp(barWidth, 4, 18);
    const catGapPercent = 40;
    const barGapPercent = clamp(Math.round(((perCat * 0.1) / Math.max(1, barWidth)) * 100), 8, 24);
    const imbWidth = clamp(Math.round(perCat * 0.5), 6, 24);
    return { barWidth, barGapPercent, catGapPercent, imbWidth };
  };

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

  const applyBarSpec = (visible) => {
    const clamped = Math.max(visible, SAFE_MIN_VISIBLE);
    const { barWidth, barGapPercent, catGapPercent, imbWidth } = computeBarSpec(clamped, dims.width);

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

  const initialSpec = useMemo(
    () => computeBarSpec(xLabels.length || pageSize, dims.width),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [xLabels.length, dims.width]
  );

  const onDataZoom = (evt) => {
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
  };

  return { instRef, applyBarSpec, getVisibleCount, initialSpec, onDataZoom };
}
