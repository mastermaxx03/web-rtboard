import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

// ID: DB-MDC-EC-01
export default function MaxDemandChart(props) {
  // This component receives its data from its parent.
  const { demand = { kva: 0, kw: 0, kvar: 0 } } = props;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },

    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%', // Make space for the legend
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      data: [''], // We only have one category, so the label is empty
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [
      {
        name: 'KVA',
        type: 'bar',
        data: [demand.kva],
        itemStyle: { color: '#C0C0C0' },
        barWidth: '30%'
      },
      {
        name: 'KW',
        type: 'bar',
        stack: 'Power', // This ID stacks KW and KVAr together
        data: [demand.kw],
        itemStyle: { color: '#5470C6' },
        barWidth: '30%'
      },
      {
        name: 'KVAr',
        type: 'bar',
        stack: 'Power', // Same stack ID
        data: [demand.kvar],
        itemStyle: { color: '#91CC75' },
        barWidth: '30%'
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
