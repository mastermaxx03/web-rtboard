import React from 'react';
import ReactECharts from 'echarts-for-react';

import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

export default function TotalPowerChart({ data = { kva: 0, kw: 0, kvar: 0 } }) {
  const maxValue = data.kva > 0 ? data.kva : 100;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '<b>{b}</b>: {c}'
    },
    legend: {
      show: false
    },
    series: [
      // CHANGED: The Inner Ring is now defined FIRST so it's drawn at the bottom.
      {
        name: 'Power Components',
        type: 'pie',
        radius: ['55%', '70%'],
        startAngle: 90,
        clockwise: true,
        // Labels for this ring are positioned INSIDE
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}', // Just show the name (kW or KVAr)
          fontSize: 11,
          fontWeight: 'bold',
          color: '#000' // White text for readability
        },
        // No leader lines needed for inside labels
        labelLine: {
          show: false
        },
        data: [
          { value: data.kw, name: 'KW', itemStyle: { color: '#D0F0C0' } }, // Pink/Purple
          { value: data.kvar, name: 'KVAr', itemStyle: { color: '#E5E4E2' } }, // Gray
          {
            value: Math.max(0, maxValue - (data.kw + data.kvar)),
            name: '',
            tooltip: { show: false },
            itemStyle: { color: '#000', opacity: 0.5 },
            label: { show: false }
          }
        ]
      },
      // CHANGED: The Outer Ring is now defined SECOND so it's drawn on top (but around the inner).
      {
        name: 'KVA',
        type: 'pie',
        radius: ['75%', '90%'],
        startAngle: 90,
        clockwise: true,
        // Labels for this ring are positioned OUTSIDE
        label: {
          show: true,
          position: 'outer',
          formatter: '{b}\n{c}',
          alignTo: 'labelLine',
          color: '#334155'
        },
        // Normal leader lines
        labelLine: {
          show: true
        },
        data: [
          { value: data.kva, name: 'KVA', itemStyle: { color: '#CCCCFF' } }, // Green
          {
            value: Math.max(0, maxValue - data.kva),
            name: '',
            tooltip: { show: false },
            itemStyle: { color: '#F1F5F9' },
            label: { show: false },
            labelLine: { show: false }
          }
        ]
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
