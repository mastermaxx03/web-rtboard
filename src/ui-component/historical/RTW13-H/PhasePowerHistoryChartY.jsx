import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

export default function PhasePowerHistoryChartY({ data }) {
  const timeData = data.map((item) => item.time);
  const rKvaData = data.map((item) => item.r_kva);
  const yKvaData = data.map((item) => item.y_kva);
  const bKvaData = data.map((item) => item.b_kva);

  const phaseColors = {
    'R-Phase': '#ee6666', // Red
    'Y-Phase': '#FAC858', // Yellow
    'B-Phase': '#5470C6' // Blue
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: (params) => {
        let tooltipHtml = `${params[0].axisValueLabel}<br/>`;
        const originalDataPoint = data.find((d) => d.time === params[0].axisValueLabel);

        if (originalDataPoint) {
          const orderedPhases = ['R-Phase', 'Y-Phase', 'B-Phase'];

          orderedPhases.forEach((phaseName) => {
            const param = params.find((p) => p.seriesName === phaseName);
            if (param) {
              const phase = phaseName.split('-')[0].toLowerCase();
              const color = phaseColors[phaseName];
              const marker = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;

              tooltipHtml += `
                    <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #eee;">
                        <strong>${marker} ${phaseName}</strong>&nbsp;&nbsp;
                        KVA: ${originalDataPoint[`${phase}_kva`]}&nbsp;&nbsp;
                        KW: ${originalDataPoint[`${phase}_kw`]}&nbsp;&nbsp;
                        KVAR: ${originalDataPoint[`${phase}_kvar`]}
                    </div>
                    `;
            }
          });
        }
        return tooltipHtml;
      }
    },
    legend: {
      data: [
        { name: 'R-Phase', itemStyle: { color: phaseColors['R-Phase'] } },
        { name: 'Y-Phase', itemStyle: { color: phaseColors['Y-Phase'] } },
        { name: 'B-Phase', itemStyle: { color: phaseColors['B-Phase'] } }
      ]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData
    },
    yAxis: {
      type: 'value',
      name: 'Power (KVA)',
      // --- CHANGE: Re-enabled the axis labels as they are no longer misleading ---
      axisLabel: {
        show: true
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    // --- CHANGE: Series updated from a stacked area to a multi-line chart ---
    series: [
      {
        name: 'R-Phase',
        type: 'line',
        // stack: 'Total', // <-- Removed stack
        smooth: true,
        // lineStyle: { width: 0 }, // <-- Removed to show the line
        showSymbol: false,
        // areaStyle: { color: phaseColors['R-Phase'] }, // <-- Removed areaStyle
        itemStyle: { color: phaseColors['R-Phase'] }, // <-- Added to color the line
        emphasis: { focus: 'series' },
        data: rKvaData
      },
      {
        name: 'Y-Phase',
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: phaseColors['Y-Phase'] },
        emphasis: { focus: 'series' },
        data: yKvaData
      },
      {
        name: 'B-Phase',
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: phaseColors['B-Phase'] },
        emphasis: { focus: 'series' },
        data: bKvaData
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
