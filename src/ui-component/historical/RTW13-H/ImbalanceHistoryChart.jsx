import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

export default function ImbalanceHistoryChartX({ data }) {
  const timeData = data.map((item) => item.time);
  const kvaImbalanceData = data.map((item) => item.kva_imbalance);
  const kwImbalanceData = data.map((item) => item.kw_imbalance);
  const kvarImbalanceData = data.map((item) => item.kvar_imbalance);

  const option = {
    tooltip: {
      trigger: 'axis',
      // --- CHANGE: Added a custom formatter to add '%' to the value ---
      formatter: (params) => {
        let tooltipHtml = `${params[0].axisValueLabel}<br/>`;
        params.forEach((param) => {
          tooltipHtml += `${param.marker} ${param.seriesName}: ${param.value}%<br/>`;
        });
        return tooltipHtml;
      }
    },
    legend: {
      data: ['KVA Imbalance ', 'KW Imbalance ', 'KVAr Imbalance ']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData
    },
    yAxis: {
      type: 'value',
      name: 'Imbalance %',
      min: 0,
      max: 100 // Set Y-axis to a 0-100 scale
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
        name: 'KVA Imbalance ',
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#8A2BE2' }, // Purple
        data: kvaImbalanceData
      },
      {
        name: 'KW Imbalance ',
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#008B8B' }, // Teal
        data: kwImbalanceData
      },
      {
        name: 'KVAr Imbalance ',
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: { color: '#FF8C00' }, // Dark Orange
        data: kvarImbalanceData
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
