import React from 'react';
import ReactECharts from 'echarts-for-react';

// --- ECharts modular imports ---
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export default function TotalConsumptionBarChart({ data, timestamp }) {
  const { totalKWH = 0, totalKVARh = 0, totalKVAh = 0 } = data || {};

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        let tooltipText = `Time: ${timestamp}<br/>`;
        let totalBreakdown = 0;
        params.forEach((param) => {
          // Only show items with a value in the tooltip
          if (param.value > 0) {
            tooltipText += `${param.marker} ${param.seriesName}: <strong>${param.value.toFixed(2)}</strong><br/>`;
            if (param.seriesName === 'KWH' || param.seriesName === 'KVArh') {
              totalBreakdown += param.value;
            }
          }
        });
        // If hovering over the stacked bar, add a total
        if (params.some((p) => p.seriesName === 'KWH' || p.seriesName === 'KVArh') && totalBreakdown > 0) {
          tooltipText += `Total: <strong>${totalBreakdown.toFixed(2)}</strong>`;
        }
        return tooltipText;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      data: ['kWh & kVArh', 'KVAh'],
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: 'KWH',
        type: 'bar',
        stack: 'breakdown', // This key groups the bars
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}'
        },
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#4A69BD' // Blue from image
        },
        // The first value corresponds to 'kWh + kVArh', the second to 'KVAh'
        data: [totalKWH, 0]
      },
      {
        name: 'KVArh',
        type: 'bar',
        stack: 'breakdown',
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}'
        },
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#82C96D' // Green from image
        },
        data: [totalKVARh, 0]
      },
      {
        name: 'KVAh',
        type: 'bar',
        label: {
          show: true,
          position: 'insideRight',
          formatter: '{c}'
        },
        itemStyle: {
          color: '#BDBDBD' // Grey from image
        },
        data: [0, totalKVAh]
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
