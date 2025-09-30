// // import React from 'react';
// // import ReactECharts from 'echarts-for-react';

// // // ---- ECharts modular (tree-shaken) imports ----
// // import * as echarts from 'echarts/core';
// // import { BarChart } from 'echarts/charts';
// // import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
// // import { CanvasRenderer } from 'echarts/renderers';
// // echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

// // // ID: DB-MDC-EC-01
// // export default function MaxDemandChart(props) {
// //   // --- CHANGE: The component now accepts `data` (aliased as `demand`) and `timestamp` ---
// //   const { data: demand = { kva: 0, kw: 0, kvar: 0 }, timestamp } = props;

// //   const option = {
// //     // --- CHANGE: The tooltip now has a custom formatter to include the timestamp ---
// //     tooltip: {
// //       trigger: 'axis',
// //       axisPointer: { type: 'shadow' },
// //       formatter: (params) => {
// //         // Start the tooltip with the timestamp
// //         let tooltipText = `<b>Time: ${timestamp || 'N/A'}</b><br/>`;
// //         // Add each series value (KVA, KW, KVAr)
// //         params.forEach((param) => {
// //           tooltipText += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
// //         });
// //         return tooltipText;
// //       }
// //     },

// //     grid: {
// //       left: '3%',
// //       right: '4%',
// //       bottom: '10%', // Make space for the legend
// //       containLabel: true
// //     },
// //     xAxis: {
// //       type: 'value',
// //       boundaryGap: [0, 0.01]
// //     },
// //     yAxis: {
// //       type: 'category',
// //       data: ['Max Demand'], // We can give this a label now
// //       axisTick: { show: false },
// //       axisLine: { show: false }
// //     },
// //     series: [
// //       {
// //         name: 'KVA',
// //         type: 'bar',
// //         data: [demand.kva],
// //         itemStyle: { color: '#C0C0C0' }, // Silver
// //         barWidth: '30%'
// //       },
// //       {
// //         name: 'KW',
// //         type: 'bar',
// //         stack: 'Power', // This ID stacks KW and KVAr together
// //         data: [demand.kw],
// //         itemStyle: { color: '#5470C6' }, // Blue
// //         barWidth: '30%'
// //       },
// //       {
// //         name: 'KVAr',
// //         type: 'bar',
// //         stack: 'Power', // Same stack ID
// //         data: [demand.kvar],
// //         itemStyle: { color: '#91CC75' }, // Green
// //         barWidth: '30%'
// //       }
// //     ]
// //   };

// //   return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// // }
// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// // ---- ECharts modular (tree-shaken) imports ----
// import * as echarts from 'echarts/core';
// import { BarChart } from 'echarts/charts';
// import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';
// echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

// // ID: DB-MDC-EC-01
// export default function MaxDemandChart(props) {
//   const { data: demand = { kva: 0, kw: 0, kvar: 0 }, timestamp } = props;

//   const option = {
//     tooltip: {
//       trigger: 'axis',
//       axisPointer: { type: 'shadow' },
//       // --- CHANGE: Added units to the tooltip formatter ---
//       formatter: (params) => {
//         let tooltipText = `<b>Time: ${timestamp || 'N/A'}</b><br/>`;
//         params.forEach((param) => {
//           if (param.value > 0) {
//             // Only show items with a value
//             const unit = param.seriesName.toLowerCase();
//             tooltipText += `${param.marker} ${param.seriesName}: ${param.value} ${unit}<br/>`;
//           }
//         });
//         return tooltipText;
//       }
//     },
//     // --- CHANGE: Added a legend for clarity ---
//     legend: {
//       show: true,
//       bottom: 0, // Positioned at the bottom
//       data: ['KVA', 'KW', 'KVAr']
//     },
//     grid: {
//       left: '3%',
//       right: '10%', // Increased right margin for labels
//       bottom: '10%',
//       containLabel: true
//     },
//     xAxis: {
//       type: 'value',
//       // --- CHANGE: Added a name to show units ---
//       name: 'Units (kVA, kW, kVAr)',
//       nameLocation: 'middle',
//       nameGap: 25
//     },
//     yAxis: {
//       type: 'category',
//       // --- CHANGE: Separated the bars into two distinct categories to prevent overlap ---
//       data: ['Actual Demand', 'Total Max Demand'],
//       axisTick: { show: false },
//       axisLine: { show: false }
//     },
//     series: [
//       {
//         name: 'KVA',
//         type: 'bar',
//         // --- CHANGE: Data is now mapped to the 'Total Max Demand' category ---
//         data: [null, demand.kva],
//         itemStyle: { color: '#C0C0C0' }, // Silver
//         barWidth: '30%',
//         // --- CHANGE: Added a data label to the end of the bar ---
//         label: {
//           show: true,
//           position: 'right',
//           formatter: '{c} kva',
//           color: '#333'
//         }
//       },
//       {
//         name: 'KW',
//         type: 'bar',
//         stack: 'Power',
//         // --- CHANGE: Data is now mapped to the 'Actual Demand' category ---
//         data: [demand.kw, null],
//         itemStyle: { color: '#5470C6' }, // Blue
//         barWidth: '30%',
//         // --- CHANGE: Added a data label inside the bar segment ---
//         label: {
//           show: true,
//           position: 'inside',
//           formatter: '{c} kw'
//         }
//       },
//       {
//         name: 'KVAr',
//         type: 'bar',
//         stack: 'Power',
//         // --- CHANGE: Data is now mapped to the 'Actual Demand' category ---
//         data: [demand.kvar, null],
//         itemStyle: { color: '#91CC75' }, // Green
//         barWidth: '30%',
//         // --- CHANGE: Added a data label inside the bar segment ---
//         label: {
//           show: true,
//           position: 'inside',
//           formatter: '{c} kvar'
//         }
//       },
//       // --- CHANGE: Added an invisible series to show the total for the stacked bar ---
//       {
//         name: 'Total',
//         type: 'bar',
//         stack: 'Power',
//         data: [0, null], // Has no value, just for the label
//         label: {
//           show: true,
//           position: 'right',
//           formatter: () => {
//             const total = (demand.kw || 0) + (demand.kvar || 0);
//             return `Total: ${total.toFixed(1)}`;
//           },
//           color: '#333'
//         },
//         tooltip: {
//           show: false // Hide this from the tooltip
//         }
//       }
//     ]
//   };

//   return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// }
import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

// ID: DB-MDC-EC-01
export default function MaxDemandChart(props) {
  const { data: demand = { kva: 0, kw: 0, kvar: 0 }, timestamp } = props;

  // Calculate the total for the stacked bar for the Total label
  const actualDemandTotal = (demand.kw || 0) + (demand.kvar || 0);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        let tooltipText = `<b>Time: ${timestamp || 'N/A'}</b><br/>`;
        params.forEach((param) => {
          if (param.value > 0 && param.seriesName !== 'Total Actual Demand Spacer') {
            // Exclude the spacer from tooltip
            const unit = param.seriesName.toLowerCase();
            tooltipText += `${param.marker} ${param.seriesName}: ${param.value} ${unit}<br/>`;
          }
        });
        return tooltipText;
      }
    },
    legend: {
      show: true,
      bottom: 0,
      // --- CHANGE: Exclude 'Total Actual Demand Spacer' from the legend ---
      data: ['KVA', 'KW', 'KVAr']
    },
    grid: {
      left: '3%',
      right: '15%',
      // By setting explicit top/bottom padding, we control the vertical space
      // and ensure the bars and labels align properly in the center.
      top: '12%', // Provides space at the top
      bottom: '20%', // Provides space for the legend and x-axis title
      containLabel: true
    },
    xAxis: {
      type: 'value',

      nameLocation: 'middle',
      nameGap: 30, // Increased gap to prevent overlap with legend
      max: Math.max(demand.kva, actualDemandTotal) * 1.2
    },
    yAxis: {
      type: 'category',
      data: ['Actual Demand', 'Total Max Demand'],
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [
      {
        name: 'KVA',
        type: 'bar',
        data: [null, demand.kva],
        itemStyle: { color: '#C0C0C0' }, // Silver
        barWidth: '30%',
        label: {
          show: true,
          position: 'insideRight',
          formatter: '{c} kva',
          color: '#333'
        }
      },
      {
        name: 'KW',
        type: 'bar',
        stack: 'Power',
        data: [demand.kw, null],
        itemStyle: { color: '#5470C6' }, // Blue
        barWidth: '30%',
        label: {
          show: true,
          position: 'insideRight', // --- CHANGE: Position insideRight to prevent overlap ---
          formatter: '{c} kw',
          color: '#fff' // White text for better contrast
        }
      },
      {
        name: 'KVAr',
        type: 'bar',
        stack: 'Power',
        data: [demand.kvar, null],
        itemStyle: { color: '#91CC75' }, // Green
        barWidth: '30%',
        label: {
          show: true,
          position: 'insideRight', // --- CHANGE: Position insideRight to prevent overlap ---
          formatter: '{c} kvar',
          color: '#fff' // White text for better contrast
        }
      },
      // --- CHANGE: Use a transparent bar at the end of the stack for the total label ---
      {
        name: 'Total Actual Demand Spacer', // Give it a distinct name
        type: 'bar',
        stack: 'Power',
        data: [0, null], // This bar has no value, it's just for the label
        itemStyle: {
          color: 'rgba(0,0,0,0)' // Make it transparent
        },
        label: {
          show: false,
          position: 'right', // Position the label after the stacked bars
          formatter: `Total: ${actualDemandTotal.toFixed(1)}`, // Display the pre-calculated total
          color: '#333',
          offset: [10, 0] // Add a slight offset to move it further right
        },
        tooltip: {
          show: false // Crucial: Hide this series from the tooltip to avoid confusion
        },
        z: 10 // Bring this label to the front
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
