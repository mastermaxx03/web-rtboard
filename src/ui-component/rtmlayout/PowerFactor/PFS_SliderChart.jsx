import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, MarkLineComponent, GraphicComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, TooltipComponent, MarkLineComponent, GraphicComponent, CanvasRenderer]);

// --- Main Component ---
export default function PFS_SliderChart({ value = 0, avgPF = 0 }) {
  const penaltyValue = -5;
  const incentiveValue = 3.5;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: `Avg. Power Factor: <b>${avgPF.toFixed(3)}</b><br/>Incentive/Penalty: <b>${value.toFixed(2)}%</b>`
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '40%',
      bottom: '30%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      min: penaltyValue,
      max: incentiveValue,
      position: 'bottom',
      axisLabel: {
        formatter: (val) => `${val}%`
      },
      axisTick: {
        show: true,
        length: 10,
        lineStyle: { color: '#333' }
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: [''],
      axisLine: { show: false },
      axisTick: { show: false }
    },
    graphic: [
      {
        type: 'text',
        left: '25%',
        top: '25%',
        style: { text: 'Penalty', textAlign: 'center', fill: '#333', fontSize: 16 }
      },
      {
        type: 'text',
        right: '25%',
        top: '25%',
        style: { text: 'Incentive', textAlign: 'center', fill: '#333', fontSize: 16 }
      }
    ],
    series: [
      // Penalty side: -5 → 0 (red → white)
      {
        name: 'Penalty Fill',
        type: 'bar',
        stack: 'gradient', // Use stack to combine bars
        data: [penaltyValue], // negative value
        barWidth: 40,
        barGap: '-100%', // overlap with next bar
        silent: true,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#D32F2F' }, // left end (-5) is red
            { offset: 1, color: '#FFFFFF' } // right end (0) is white
          ])
        },
        barBorderRadius: [20, 0, 0, 20]
      },
      // Incentive side: 0 → +3.5 (white → green)
      {
        name: 'Incentive Fill',
        type: 'bar',
        stack: 'gradient',
        data: [incentiveValue], // positive value
        barWidth: 40,
        barGap: '-100%',
        silent: true,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#FFFFFF' }, // left end (0) is white
            { offset: 1, color: '#388E3C' } // right end (+3.5) is green
          ])
        },
        barBorderRadius: [0, 20, 20, 0]
      },
      // The pointer for the real-time value
      {
        name: 'Current PF',
        type: 'bar',
        data: [],
        markLine: {
          silent: false,
          symbol: ['none', 'triangle'],
          symbolSize: [10, 15],
          symbolRotate: 180,
          lineStyle: {
            color: '#000',
            width: 0,
            type: 'solid'
          },
          data: [
            {
              name: 'Avg PF',
              xAxis: value,
              label: {
                show: false,
                formatter: `Avg PF → ${value.toFixed(2)}%`,
                color: '#000',
                fontSize: 10
              }
            }
          ]
        }
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '200px', width: '100%' }} />;
}
