import React, { forwardRef } from 'react'; // --- CHANGE 1: Import forwardRef ---
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent, CanvasRenderer]);

// --- CHANGE 2: Wrap the component in forwardRef to accept the ref from the parent ---
const VoltageDeviationChart = forwardRef(({ data, thresholds }, ref) => {
  const timeData = data.map((item) => item.time);
  const deviationData = data.map((item) => item.deviation);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Max D']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%', // We can reduce the bottom margin now
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeData
    },
    yAxis: {
      type: 'value',
      name: 'Max D %'
    },
    dataZoom: [
      {
        // --- CHANGE 3: Changed type to 'inside' to enable mouse gestures ---
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: 'Max D Bar',
        type: 'bar',
        itemStyle: { color: '#91CC75' },
        showInLegend: false,
        data: deviationData
      },
      {
        name: 'Max D',
        type: 'line',
        smooth: true,
        data: deviationData,
        markLine: {
          symbol: 'none',
          data: [
            {
              name: 'Critical',
              yAxis: thresholds.critical,
              lineStyle: { color: '#ee6666', type: 'dashed' }
            },
            {
              name: 'Warning',
              yAxis: thresholds.warning,
              lineStyle: { color: '#FAC858', type: 'dashed' }
            },
            {
              name: 'Acceptable',
              yAxis: thresholds.acceptable,
              lineStyle: { color: '#91CC75', type: 'dashed' }
            }
          ]
        }
      }
    ]
  };

  // --- CHANGE 4: Pass the ref to the ReactECharts component ---
  return <ReactECharts ref={ref} echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
});

export default VoltageDeviationChart;
