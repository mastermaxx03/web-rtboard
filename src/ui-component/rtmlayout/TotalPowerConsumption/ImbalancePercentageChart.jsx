// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// // ---- ECharts modular imports ----
// import * as echarts from 'echarts/core';
// import { BarChart } from 'echarts/charts';
// import { GridComponent, TooltipComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';
// echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

// export default function ImbalancePercentageChart({ data = {} }) {
//   const { kvaImbalance, kwImbalance, kvarImbalance } = data;

//   const option = {
//     grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
//     tooltip: {
//       trigger: 'axis',
//       axisPointer: { type: 'shadow' }
//     },
//     xAxis: {
//       type: 'category',
//       data: ['kW Imb %', 'kVAr Imb %', 'kVA Imb %'], // Sequence as requested
//       axisTick: { alignWithLabel: true }
//     },
//     yAxis: {
//       type: 'value',
//       axisLabel: { formatter: '{value} %' }
//     },
//     series: [
//       {
//         name: 'Imbalance',
//         type: 'bar',
//         barWidth: '40%',
//         data: [kwImbalance, kvarImbalance, kvaImbalance],
//         itemStyle: { color: '#F59E0B' } // Orange for warning/imbalance
//       }
//     ]
//   };

//   return <ReactECharts echarts={echarts} option={option} style={{ height: '100%', width: '100%' }} />;
// }
import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular imports ----
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

// ADDED: Thresholds and status colors for imbalance
const THRESHOLDS = {
  acceptable: 5, // Less than 5% is acceptable
  warning: 10 // Between 5% and 10% is a warning
};
const STATUS_COLORS = {
  acceptable: '#22C55E', // Green
  warning: '#F59E0B', // Orange/Yellow
  critical: '#EF4444' // Red
};

// ADDED: Helper function to determine the status of a value
const getStatus = (value) => {
  if (value > THRESHOLDS.warning) return 'critical';
  if (value > THRESHOLDS.acceptable) return 'warning';
  return 'acceptable';
};

export default function ImbalancePercentageChart({ data = {} }) {
  const { kvaImbalance = 0, kwImbalance = 0, kvarImbalance = 0 } = data;

  // CHANGED: The data for the series is now an array of objects
  // This allows us to set a specific color for each individual bar.
  const seriesData = [
    {
      value: kwImbalance,
      itemStyle: {
        color: STATUS_COLORS[getStatus(kwImbalance)]
      }
    },
    {
      value: kvarImbalance,
      itemStyle: {
        color: STATUS_COLORS[getStatus(kvarImbalance)]
      }
    },
    {
      value: kvaImbalance,
      itemStyle: {
        color: STATUS_COLORS[getStatus(kvaImbalance)]
      }
    }
  ];

  const option = {
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const param = params[0];
        const status = getStatus(param.value);
        const color = STATUS_COLORS[status];
        return `${param.name}<br/>
                  <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>
                  Value: <strong>${param.value.toFixed(2)}%</strong><br/>
                  Status: <strong style="color:${color};">${status.charAt(0).toUpperCase() + status.slice(1)}</strong>`;
      }
    },
    xAxis: {
      type: 'category',
      data: ['kW Imb %', 'kVAr Imb %', 'kVA Imb %'],
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value} %' }
    },
    series: [
      {
        name: 'Imbalance',
        type: 'bar',
        barWidth: '40%',
        data: seriesData // Use the new data array with dynamic colors
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} style={{ height: '100%', width: '100%' }} />;
}
