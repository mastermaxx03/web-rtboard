import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

export default function TotalPowerHistoryChart({ data }) {
  const timeData = data.map((item) => item.time);
  const kvaData = data.map((item) => item.kva);
  const kwData = data.map((item) => item.kw);
  const kvarData = data.map((item) => item.kvar);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['KVA', 'KW', 'KVAR']
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
      {
        name: 'KVA',
        type: 'bar',
        itemStyle: { color: '#C0C0C0' }, // Grey
        barWidth: '30%',
        data: kvaData
      },
      {
        name: 'KW',
        type: 'bar',
        stack: 'powerComponents', // This ID makes it stack with KVAR
        itemStyle: { color: '#5470C6' }, // Blue
        barWidth: '30%',
        data: kwData
      },
      {
        name: 'KVAR',
        type: 'bar',
        stack: 'powerComponents', // Same ID to stack on top of KW
        itemStyle: { color: '#91CC75' }, // Green
        barWidth: '30%',
        data: kvarData
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
