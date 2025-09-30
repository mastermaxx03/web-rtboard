import React from 'react';
import ReactECharts from 'echarts-for-react';

import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([GaugeChart, TooltipComponent, CanvasRenderer]);

export default function StyledGaugeChart({ value = 0, statusMessage = '', statusColor = '#333', unit = '%' }) {
  const option = {
    tooltip: {
      formatter: `{a|${statusMessage}}<br>{b|Value}: {c|${value.toFixed(2)}${unit}}`,
      backgroundColor: 'rgba(50,50,50,0.8)',
      borderColor: '#333',
      textStyle: {
        color: '#fff'
      },
      rich: {
        a: { fontWeight: 'bold' },
        b: { color: '#ccc' },
        c: { fontWeight: 'bold' }
      }
    },
    series: [
      {
        type: 'gauge',
        progress: { show: true, width: 20 },
        axisLine: { lineStyle: { width: 20 } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '5%'],
          formatter: function (val) {
            return '{value|' + val.toFixed(1) + unit + '}\n\n' + '{status|' + statusMessage + '}';
          },
          rich: {
            value: { fontSize: 32, fontWeight: 'bolder', color: '#333' },
            status: { fontSize: 14, color: '#666', padding: [5, 0] }
          }
        },
        data: [
          {
            value: value,
            itemStyle: { color: statusColor }
          }
        ]
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />;
}
