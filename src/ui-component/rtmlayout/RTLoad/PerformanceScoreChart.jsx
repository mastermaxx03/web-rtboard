import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
// --- CHANGE: Import TooltipComponent ---
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
// --- CHANGE: Register TooltipComponent ---
echarts.use([GaugeChart, TooltipComponent, CanvasRenderer]);

// --- CHANGE: Renamed component and added timestamp prop ---
export default function PerformanceScoreChart({ value = 0, timestamp = 'N/A' }) {
  const option = {
    // --- CHANGE: Added tooltip configuration ---
    tooltip: {
      formatter: `<b>Performance Score</b>: {c}%<br/>Time: ${timestamp}`
    },
    series: [
      {
        type: 'gauge',
        // Good practice to name the series
        name: 'Performance Score',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        itemStyle: {
          color: '#91CC75' // Green for the progress arc
        },
        progress: {
          show: true,
          width: 20
        },
        pointer: {
          show: true,
          length: '60%',
          width: 8,
          offsetCenter: [0, '-50%']
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#E0E0E0']]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 22,
          fontWeight: 'bold',
          offsetCenter: [0, '-20%'],
          formatter: '{value}%'
        },
        data: [
          {
            value: value
          }
        ]
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
