import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

export default function PhasePowerHistoryChart({ data }) {
  // Map the single data array into 9 separate arrays for each series
  const timeData = data.map((item) => item.time);
  const rKvaData = data.map((item) => item.r_kva);
  const rKwData = data.map((item) => item.r_kw);
  const rKvarData = data.map((item) => item.r_kvar);
  const yKvaData = data.map((item) => item.y_kva);
  const yKwData = data.map((item) => item.y_kw);
  const yKvarData = data.map((item) => item.y_kvar);
  const bKvaData = data.map((item) => item.b_kva);
  const bKwData = data.map((item) => item.b_kw);
  const bKvarData = data.map((item) => item.b_kvar);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      // --- CHANGE: Custom formatter to show specific series names ---
      formatter: (params) => {
        let tooltipHtml = `${params[0].axisValueLabel}<br/>`;
        // Use a Map to group series by their stack ID or name for cleaner tooltip
        const grouped = {};
        params.forEach((param) => {
          const key = param.seriesName.split('-')[0] + ' Phase';
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(param);
        });

        Object.keys(grouped).forEach((phase) => {
          grouped[phase].forEach((param) => {
            tooltipHtml += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
          });
        });

        return tooltipHtml;
      }
    },
    // --- CHANGE: The legend is now grouped by phase ---
    legend: {
      data: ['R-Phase', 'Y-Phase', 'B-Phase']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeData
    },
    yAxis: {
      type: 'value',
      name: 'Power'
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    series: [
      // --- R-Phase ---
      // --- CHANGE: All R-Phase series now share the same `name` for the legend ---
      { name: 'R-Phase', seriesName: 'R-KVA', type: 'bar', itemStyle: { color: '#ee6666' }, barWidth: '20%', data: rKvaData },
      {
        name: 'R-Phase',
        seriesName: 'R-KW',
        type: 'bar',
        stack: 'R-Phase',
        itemStyle: { color: '#ee6666' },
        barWidth: '20%',
        data: rKwData
      },
      {
        name: 'R-Phase',
        seriesName: 'R-KVAR',
        type: 'bar',
        stack: 'R-Phase',
        itemStyle: { color: '#ee6666' },
        barWidth: '20%',
        data: rKvarData
      },

      // --- Y-Phase ---
      // --- CHANGE: All Y-Phase series now share the same `name` for the legend ---
      { name: 'Y-Phase', seriesName: 'Y-KVA', type: 'bar', itemStyle: { color: '#ffce56' }, barWidth: '20%', data: yKvaData },
      {
        name: 'Y-Phase',
        seriesName: 'Y-KW',
        type: 'bar',
        stack: 'Y-Phase',
        itemStyle: { color: '#ffce56' },
        barWidth: '20%',
        data: yKwData
      },
      {
        name: 'Y-Phase',
        seriesName: 'Y-KVAR',
        type: 'bar',
        stack: 'Y-Phase',
        itemStyle: { color: '#ffce56' },
        barWidth: '20%',
        data: yKvarData
      },

      // --- B-Phase ---
      // --- CHANGE: All B-Phase series now share the same `name` for the legend ---
      { name: 'B-Phase', seriesName: 'B-KVA', type: 'bar', itemStyle: { color: '#36a2eb' }, barWidth: '20%', data: bKvaData },
      {
        name: 'B-Phase',
        seriesName: 'B-KW',
        type: 'bar',
        stack: 'B-Phase',
        itemStyle: { color: '#36a2eb' },
        barWidth: '20%',
        data: bKwData
      },
      {
        name: 'B-Phase',
        seriesName: 'B-KVAR',
        type: 'bar',
        stack: 'B-Phase',
        itemStyle: { color: '#36a2eb' },
        barWidth: '20%',
        data: bKvarData
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
