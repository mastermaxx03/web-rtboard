import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, TitleComponent, CanvasRenderer]);

// ID: DB-THDRC-EC-01
export default function THDIRingChart(props) {
  const { value = 0 } = props;
  const maxValue = 15; // Assuming THD-I is a percentage, max is 15%

  const option = {
    title: {
      text: `${value}%`,
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 20,
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
        hoverAnimation: false,
        data: [
          {
            value: value,
            itemStyle: { color: '#FAC858' } // Yellow
          },
          {
            value: maxValue - value,
            itemStyle: { color: '#E0E0E0' }
          }
        ]
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
