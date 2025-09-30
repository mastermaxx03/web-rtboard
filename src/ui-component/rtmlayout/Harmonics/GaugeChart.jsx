import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, TitleComponent, CanvasRenderer, TooltipComponent]);

// This reusable component takes a 'value' and a 'color'
export default function GaugeChart({ value = 0, color = '#5470C6', name = 'Value', timestamp = 'N/A' }) {
  const maxValue = 15; // A sensible max for THD %

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: () => {
        return `<b>${name}</b>: ${value}%<br/>Time: ${timestamp}`;
      }
    },
    title: {
      text: `${value.toFixed(2)}%`,
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['80%', '100%'],
        startAngle: 90,
        label: { show: false },
        hoverOffset: 0,
        data: [
          {
            value: value,
            // The color is now passed in as a prop
            itemStyle: { color: color }
          },
          {
            value: Math.max(0, maxValue - value),
            itemStyle: { color: '#E0E0E0' },
            tooltip: { show: false }
          }
        ]
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
