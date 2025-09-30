import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([GaugeChart, CanvasRenderer]);

// ID: DB-PGC-EC-01
export default function PerformanceGaugeChart(props) {
  const { value = 0 } = props;

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        itemStyle: {
          color: '#91CC75' // Green for the progress arc
        },
        progress: {
          show: true,
          width: 20
        },
        pointer: {
          show: true,
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 8,
          offsetCenter: [0, '-50%'],
          itemStyle: {
            color: '#333'
          }
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#E0E0E0']]
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 18,
          fontWeight: 'bold',
          offsetCenter: [0, '-20%'],
          formatter: '{value}%'
        },
        data: [
          {
            value: value
          }
        ]
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
