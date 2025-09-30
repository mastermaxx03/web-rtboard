import React from 'react';
import ReactECharts from 'echarts-for-react';

// --- ECharts modular imports ---
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

export default function BreakdownDonutChart({ data, timestamp }) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `<strong>${params.name}</strong>: ${params.value}%<br/>Time: ${timestamp}`;
      }
    },
    legend: {
      show: false // We are showing labels directly on the chart as per the design
    },
    series: [
      {
        name: 'Consumption Breakdown',
        type: 'pie',
        radius: ['50%', '70%'], // This creates the donut shape
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n[{d}%]' // {b} is name, {d} is percentage
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: data || [] // The data should be an array of {name: '', value: ''}
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
