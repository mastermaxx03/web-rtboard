// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// // ---- ECharts modular (tree-shaken) imports ----
// import * as echarts from 'echarts/core';
// import { PieChart } from 'echarts/charts';
// import { TooltipComponent, LegendComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';
// echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

// // ID: DB-TPC-EC-01
// export default function TotalPowerChart(props) {
//   const { data: power = { kva: 0, kw: 0, kvar: 0 }, timestamp } = props;
//   const maxValue = 200; // A sensible max scale for the rings

//   const option = {
//     tooltip: {
//       trigger: 'item',
//       formatter: (params) => {
//         // params.name would be 'KVA', 'KW', etc.
//         // params.value would be the corresponding number
//         return `<b>${params.name}</b>: ${params.value}<br/>Time: ${timestamp}`;
//       }
//     },
//     legend: {
//       // --- CHANGE: Set this to true to display the legend ---
//       show: true,
//       orient: 'vertical',
//       left: 'top',
//       // Specify the items to show in the legend
//       data: ['KVA', 'KW', 'KVAr']
//     },
//     series: [
//       // Outer Ring (KVA)
//       {
//         name: 'KVA',
//         type: 'pie',
//         radius: ['75%', '90%'],
//         startAngle: 90,
//         clockwise: true,
//         label: {
//           show: false
//         },
//         labelLine: {
//           show: false
//         },
//         data: [
//           // The KVA segment
//           { value: power.kva, name: 'KVA', itemStyle: { color: '#91CC75' } },
//           // Green
//           // The "empty" remainder segment
//           {
//             value: maxValue - power.kva,
//             itemStyle: { color: '#e0e0e0' },
//             tooltip: { show: false }, // Hide tooltip for this segment
//             label: { show: false },
//             labelLine: { show: false }
//           }
//         ],
//         animationDuration: 300
//       },
//       // Inner Ring (KW + KVAr)
//       {
//         name: 'Power Components',
//         type: 'pie',
//         radius: ['55%', '70%'],
//         startAngle: 90,
//         clockwise: true,
//         label: {
//           show: false
//         },
//         labelLine: {
//           show: false
//         },
//         data: [
//           // The KW segment
//           { value: power.kw, name: 'KW', itemStyle: { color: '#5470C6' } }, // Blue
//           // The KVAr segment
//           { value: power.kvar, name: 'KVAr', itemStyle: { color: '#FAC858' } }, // Orange
//           // The "empty" remainder segment
//           {
//             value: Math.max(0, maxValue - (power.kw + power.kvar)),
//             itemStyle: { color: '#e0e0e0', opacity: 0.5 },
//             tooltip: { show: false }, // Hide tooltip for this segment
//             label: { show: false },
//             labelLine: { show: false }
//           }
//         ],
//         animationDuration: 300
//       }
//     ]
//   };

//   return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// }
import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

// ID: DB-TPC-EC-01
export default function TotalPowerChart(props) {
  const { data: power = { kva: 0, kw: 0, kvar: 0 }, timestamp } = props;
  const maxValue = 200; // A sensible max scale for the rings

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.name) {
          return `<b>${params.name}</b>: ${params.value}<br/>Time: ${timestamp || 'N/A'}`;
        }
        return '';
      }
    },
    legend: {
      show: true,
      orient: 'vertical',
      top: 'center',
      left: 10,
      data: ['KVA', 'KW', 'KVAr']
    },
    series: [
      // Outer Ring (KVA)
      {
        name: 'KVA',
        type: 'pie',
        // --- THE FIX IS HERE ---
        // This tells the whole series to use these colors in order. The legend will now correctly pick up green.
        color: ['#083d77', '#e0e0e0'],
        radius: ['75%', '90%'],
        startAngle: 90,
        clockwise: true,
        label: { show: false },
        labelLine: { show: false },
        data: [
          // The itemStyle is still good to have but the series-level color fixes the legend.
          { value: power.kva, name: 'KVA', itemStyle: { color: '#083d77' } }, // Green
          {
            value: Math.max(0, maxValue - power.kva),
            name: '',
            tooltip: { show: false },
            itemStyle: { color: '#e0e0e0' }
          }
        ],
        animationDuration: 300
      },
      // Inner Ring (KW + KVAr)
      {
        name: 'Power Components',
        type: 'pie',
        radius: ['55%', '70%'],
        startAngle: 90,
        clockwise: true,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: power.kw, name: 'KW', itemStyle: { color: '#5470C6' } }, // Blue
          { value: power.kvar, name: 'KVAr', itemStyle: { color: '#FAC858' } }, // Orange
          {
            value: Math.max(0, maxValue - (power.kw + power.kvar)),
            name: '',
            tooltip: { show: false },
            itemStyle: { color: '#e0e0e0', opacity: 0.5 }
          }
        ],
        animationDuration: 300
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
