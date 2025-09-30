// All bar-width + zoom helpers kept in one place.
export const SAFE_MIN_VISIBLE = 8;

export const computeBarSpec = (visibleCats, widthPx, pads = { left: 88, right: 110 }) => {
  const innerW = Math.max(640, widthPx) - (pads.left + pads.right);
  const perCat = innerW / Math.max(1, visibleCats);

  const totalBarsW = perCat * 0.6;
  let barWidth = Math.floor(totalBarsW / 3 - 2);
  barWidth = Math.max(4, Math.min(18, barWidth));

  const catGapPercent = 40;
  const barGapPercent = Math.max(8, Math.min(24, Math.round(((perCat * 0.1) / Math.max(1, barWidth)) * 100)));
  const imbWidth = Math.max(6, Math.min(24, Math.round(perCat * 0.5)));

  return { barWidth, barGapPercent, catGapPercent, imbWidth };
};

export const getVisibleCountFromInstance = (inst, totalCount) => {
  const n = totalCount || 0;
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

export const applyBarSpecToInstance = ({ inst, visible, dims }) => {
  const clamped = Math.max(visible, SAFE_MIN_VISIBLE);
  const { barWidth, barGapPercent, catGapPercent, imbWidth } = computeBarSpec(clamped, dims.width, {
    left: dims.sidePadLeft,
    right: dims.sidePadRight
  });

  const step = Math.max(1, Math.round(clamped / 12));
  const axisLabelObj =
    step === 1
      ? { show: true, interval: 0, showMinLabel: true, showMaxLabel: true, hideOverlap: false }
      : {
          show: true,
          interval: (i) => i % step === 0,
          formatter: (v, i) => (i % step === 0 ? v : ''),
          showMinLabel: true,
          showMaxLabel: true,
          hideOverlap: false
        };

  try {
    inst?.setOption(
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

export const visibleFromZoomEvt = (evt, total) => {
  const n = total || 0;
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
  return visible;
};
