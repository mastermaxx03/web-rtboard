import React, { forwardRef } from 'react';
import ReactECharts from 'echarts-for-react';

import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

const VoltageDailyRangeChart = forwardRef(({ data }, ref) => {
  // This chart expects aggregated daily data
  const dateData = data.map((item) => item.date);
  const minData = data.map((item) => item.v_min);
  const maxData = data.map((item) => item.v_max);
  const avgData = data.map((item) => item.v_avg);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const date = params[0].axisValueLabel;
        const avg = params.find((p) => p.seriesName === 'VAVG')?.value;
        const min = params.find((p) => p.seriesName === 'V_MIN')?.value;
        // The max value is the difference between the 'max' line and the 'min' line
        const max = min + params.find((p) => p.seriesName === 'V_MAX_STACK')?.value;

        let tooltipHtml = `${date}<br/>`;
        if (avg !== undefined) tooltipHtml += `Avg: ${avg.toFixed(2)} V<br/>`;
        if (max !== undefined) tooltipHtml += `Max: ${max.toFixed(2)} V<br/>`;
        if (min !== undefined) tooltipHtml += `Min: ${min.toFixed(2)} V<br/>`;
        return tooltipHtml;
      }
    },
    legend: {
      data: ['VAVG', 'Voltage Range']
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
      data: dateData
    },
    yAxis: {
      type: 'value',
      name: 'Voltage (V)'
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
        name: 'VAVG',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#c23531' // A distinct color for the average line
        },
        data: avgData
      },
      {
        name: 'V_MIN',
        type: 'line',
        symbol: 'none',
        lineStyle: {
          width: 0 // Make the min line invisible
        },
        data: minData
      },
      {
        name: 'V_MAX_STACK', // This series represents the size of the range
        type: 'line',
        smooth: true,
        symbol: 'none',
        // We use a stack to create the area between min and max
        stack: 'voltage_range',
        lineStyle: {
          width: 0 // Make the max line invisible
        },
        areaStyle: {
          color: 'rgba(145, 204, 117, 0.4)' // Light green for the range area
        },
        // We calculate the difference between max and min to create the range area
        data: data.map((item) => (item.v_max - item.v_min).toFixed(2))
      }
    ]
  };

  return <ReactECharts ref={ref} echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
});

export default VoltageDailyRangeChart;
