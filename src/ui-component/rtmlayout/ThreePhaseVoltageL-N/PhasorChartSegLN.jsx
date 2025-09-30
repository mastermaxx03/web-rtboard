import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
import { PolarComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, BarChart, PolarComponent, TooltipComponent, CanvasRenderer]);

// ---- Config ----
// --- CHANGE: Adjusted MAX_VOLT for Line-to-Neutral values ---
const MAX_VOLT = 300; 
// --- CHANGE: Updated phase names for Line-to-Neutral ---
const NAMES = ['VRN', 'VYN', 'VBN'];
const SOLID_COLORS = [
    '#ff5252', // VRN
    '#ffce56', // VYN
    '#36a2eb'  // VBN
];

// --- Main Component ---
export default function PhasorChartSegLN(props) {
  const { volts = [] } = props;

  const phasorOption = {
    animationDuration: 250,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}V'
    },
    polar: { radius: [0, '86%'] },
    angleAxis: {
      type: 'category',
      data: NAMES,
      startAngle: 90,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    radiusAxis: {
      type: 'value',
      min: 0,
      max: MAX_VOLT,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    series: [
      {
        type: 'bar',
        coordinateSystem: 'polar',
        data: volts.map((v, i) => ({
          value: v,
          name: NAMES[i],
          itemStyle: {
            color: SOLID_COLORS[i],
            borderColor: '#fff',
            borderWidth: 2
          }
        })),
        barCategoryGap: '0%',
        barGap: '0%',
        z: 2
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={phasorOption} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
