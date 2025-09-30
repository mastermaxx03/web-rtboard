import { BAND_B, BAND_G, BAND_R, BAND_Y, CB, CR, CY, DEV, IMB, AVG } from './constants';

export function buildOptions({ dims, xLabels, prettyLabels, rA, yA, bA, iAvg, devData, phaseImbA, effFLC, devMax, imbMax, initialSpec }) {
  const pctFormatter = (v) => `${Math.round((v / effFLC) * 100)}%`;

  return {
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
        const row = (name, val, col) => `
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
            ${row('Ir', r, CR)}
            ${row('Iy', y, CY)}
            ${row('Ib', b, CB)}
            <div style="margin-top:6px;border-top:1px solid #E5E7EB;padding-top:6px;font-size:12px;color:#6b7280">
              <div style="display:flex;justify-content:space-between"><span>Phase Imbalance</span><span style="font-weight:700;color:${IMB}">${imb?.toFixed?.(0) ?? '-'} A</span></div>
              <div style="display:flex;justify-content:space-between"><span>Max Deviation</span><span style="font-weight:700;color:${DEV}">${dev?.toFixed?.(0) ?? '-'} A</span></div>
              <div style="margin-top:6px">ZONE:
                <span style="display:inline-block;padding:2px 10px;margin-left:6px;border-radius:999px;background:${zoneCol}1A;color:${zoneCol};font-weight:800;">${zone}</span>
              </div>
            </div>
          </div>`;
      }
    },
    series: [
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
        barWidth: Math.max(
          Math.round(((Math.max(640, dims.width) - (dims.sidePadLeft + dims.sidePadRight)) / Math.max(1, xLabels.length)) * 0.5),
          6
        ),
        barGap: '30%',
        barCategoryGap: '62%',
        itemStyle: { color: IMB },
        data: phaseImbA,
        z: 2
      }
    ]
  };
}
