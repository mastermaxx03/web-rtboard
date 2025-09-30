// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// // ---- ECharts modular (tree-shaken) imports ----
// import * as echarts from 'echarts/core';
// import { BarChart } from 'echarts/charts';
// import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';

// echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent, CanvasRenderer]);

// // The component now accepts the two threshold values as props
// export default function TotalPowerHistoryChart({ data, contractDemand, seventyFivePercentDemand }) {
//   const timeData = data.map((item) => item.time);
//   const kvaData = data.map((item) => item.kva);
//   const kwData = data.map((item) => item.kw);
//   const kvarData = data.map((item) => item.kvar);

//   const option = {
//     tooltip: {
//       trigger: 'axis',
//       axisPointer: { type: 'shadow' },
//       // --- CHANGE: The main tooltip formatter is now updated ---
//       formatter: (params) => {
//         let tooltipHtml = `${params[0].axisValueLabel}<br/>`;
//         // Build the dynamic part of the tooltip for the bars
//         params.forEach((param) => {
//           // Check if the value is an object (for the highlighted bar) or a number
//           const value = typeof param.value === 'object' ? param.value.value : param.value;
//           tooltipHtml += `${param.marker} ${param.seriesName}: ${value}<br/>`;
//         });

//         // --- CHANGE: Append the static contract demand values with colored markers ---
//         const markerStyle = `display:inline-block;margin-right:5px;width:12px;height:3px;background-color:`;
//         const contractDemandMarker = `<span style="${markerStyle}#ff5252;vertical-align:middle;"></span>`;
//         const seventyFiveDemandMarker = `<span style="${markerStyle}#ffce56;vertical-align:middle;"></span>`;

//         tooltipHtml += `<div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #eee;">`;
//         tooltipHtml += `${contractDemandMarker}Contract Demand: ${contractDemand}<br/>`;
//         tooltipHtml += `${seventyFiveDemandMarker}75% Demand: ${seventyFivePercentDemand}`;
//         tooltipHtml += `</div>`;

//         return tooltipHtml;
//       }
//     },
//     legend: {
//       data: ['KVA', 'KW', 'KVAR']
//     },
//     grid: {
//       left: '3%',
//       right: '4%',
//       bottom: '10%',
//       containLabel: true
//     },
//     xAxis: {
//       type: 'category',
//       data: timeData
//     },
//     // Simplified to a single Y-axis
//     yAxis: {
//       type: 'value',
//       name: 'Power'
//     },
//     dataZoom: [
//       {
//         type: 'inside',
//         start: 0,
//         end: 100
//       }
//     ],
//     series: [
//       {
//         name: 'KVA',
//         type: 'bar',
//         itemStyle: { color: '#C0C0C0' }, // Default grey color
//         barWidth: '30%',
//         data: kvaData,
//         markLine: {
//           silent: false, // Make the line interactive
//           symbol: 'none',
//           lineStyle: {
//             type: 'dashed'
//           },
//           tooltip: {
//             formatter: (params) => `${params.name}: ${params.value}`
//           },
//           data: [
//             {
//               yAxis: contractDemand,
//               name: 'Contract Demand',
//               lineStyle: { color: '#ff5252', width: 2 }
//             },
//             {
//               yAxis: seventyFivePercentDemand,
//               name: '75% Demand',
//               lineStyle: { color: '#ffce56', width: 2 }
//             }
//           ]
//         }
//       },
//       {
//         name: 'KW',
//         type: 'bar',
//         stack: 'powerComponents',
//         itemStyle: { color: '#5470C6' },
//         barWidth: '30%',
//         data: kwData
//       },
//       {
//         name: 'KVAR',
//         type: 'bar',
//         stack: 'powerComponents',
//         itemStyle: { color: '#91CC75' },
//         barWidth: '30%',
//         data: kvarData
//       }
//     ]
//   };

//   return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// }
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { createStandardTooltipFormatter } from './chartHelpers';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
// --- CHANGE: Import MarkPointComponent ---
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer
]);

// The component now accepts the two threshold values as props
export default function TotalPowerHistoryChartX({ data, contractDemand, seventyFivePercentDemand }) {
  const timeData = data.map((item) => item.time);
  const kvaData = data.map((item) => item.kva);
  const kwData = data.map((item) => item.kw);
  const kvarData = data.map((item) => item.kvar);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter: (params) => createStandardTooltipFormatter(params, data, { contractDemand, seventyFivePercentDemand })
    },
    legend: {
      data: ['Apparent Power', 'Real Power', 'Reactive Power']
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
        name: 'Apparent Power',
        type: 'bar',
        itemStyle: { color: '#C0C0C0' }, // Default grey color
        barWidth: '30%',
        data: kvaData,
        markLine: {
          silent: false,
          symbol: 'none',
          lineStyle: {
            type: 'dashed'
          },
          tooltip: {
            formatter: (params) => `${params.name}: ${params.value}`
          },
          data: [
            {
              yAxis: contractDemand,
              name: 'Contract Demand',
              lineStyle: { color: '#ff5252', width: 2 }
            },
            {
              yAxis: seventyFivePercentDemand,
              name: '75% Demand',
              lineStyle: { color: '#ffce56', width: 2 }
            }
          ]
        },
        // --- CHANGE: Added markPoint to label the maximum KVA bar ---
        markPoint: {
          symbol: 'pin', // Use a pin shape for the marker
          symbolSize: 50,
          data: [
            {
              type: 'max', // Automatically find the maximum value in this series
              name: 'Max Demand'
            }
          ],
          label: {
            show: true,
            formatter: '{b}', // Display the name ('Max Demand')
            color: '#000',
            fontSize: 12
          }
        }
      },
      {
        name: 'Real Power',
        type: 'bar',
        stack: 'powerComponents',
        itemStyle: { color: '#5470C6' },
        barWidth: '30%',
        data: kwData
      },
      {
        name: 'Reactive Power',
        type: 'bar',
        stack: 'powerComponents',
        itemStyle: { color: '#91CC75' },
        barWidth: '30%',
        data: kvarData
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
