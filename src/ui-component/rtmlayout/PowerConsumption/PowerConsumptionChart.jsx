import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

// ID: DB-PCC-EC-01
// --- CHANGE: Component now accepts a timestamp prop ---
export default function PowerConsumptionChart({ data = { kw: [], kva: [], kvar: [] }, timestamp }) {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },

      formatter: (params) => {
        let tooltipText = timestamp ? `Time: ${timestamp}<br/>` : '';
        params.forEach((param) => {
          tooltipText += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
        });
        return tooltipText;
      }
    },
    legend: {
      data: ['kVA', 'kW', 'KVAr'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%', // Adjusted to make space for the legend
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['R-Ph', 'Y-Ph', 'B-Ph']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'kVA',
        type: 'bar',
        data: data.kva,
        itemStyle: { color: '#C0C0C0' } // Silver
      },
      {
        name: 'kW',
        type: 'bar',
        stack: 'powerStack', // This ID groups kW and KVAr into a stacked bar
        data: data.kw,
        itemStyle: { color: '#5470C6' } // Blue
      },
      {
        name: 'KVAr',
        type: 'bar',
        stack: 'powerStack', // Same stack ID
        data: data.kvar,
        itemStyle: { color: '#91CC75' } // Green
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
