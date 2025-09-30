// // import React from 'react';
// // import ReactECharts from 'echarts-for-react';

// // // ---- ECharts modular (tree-shaken) imports ----
// // import * as echarts from 'echarts/core';
// // // --- CHANGE: Import HeatmapChart ---
// // import { HeatmapChart } from 'echarts/charts';
// // // --- CHANGE: Import VisualMapComponent ---
// // import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, VisualMapComponent } from 'echarts/components';
// // import { CanvasRenderer } from 'echarts/renderers';

// // echarts.use([HeatmapChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, VisualMapComponent, CanvasRenderer]);

// // export default function ImbalanceHistoryChart({ data }) {
// //   // --- CHANGE: Data needs to be transformed for the heatmap ---
// //   const heatmapData = [];
// //   const yAxisLabels = ['KVAR Imbalance', 'KW Imbalance', 'KVA Imbalance']; // Order for the Y-axis
// //   const xAxisLabels = data.map((item) => item.time);

// //   data.forEach((item, timeIndex) => {
// //     // [xIndex, yIndex, value]
// //     heatmapData.push([timeIndex, 0, item.kvar_imbalance]);
// //     heatmapData.push([timeIndex, 1, item.kw_imbalance]);
// //     heatmapData.push([timeIndex, 2, item.kva_imbalance]);
// //   });

// //   const option = {
// //     tooltip: {
// //       position: 'top',
// //       // --- CHANGE: Custom formatter for the heatmap cell ---
// //       formatter: (params) => {
// //         return `
// //           <strong>Time: ${xAxisLabels[params.data[0]]}</strong><br/>
// //           ${yAxisLabels[params.data[1]]}: ${params.data[2]}%
// //         `;
// //       }
// //     },
// //     grid: {
// //       left: '10%', // Make more space for y-axis labels
// //       right: '10%', // Make space for the visualMap legend
// //       bottom: '10%',
// //       top: '5%'
// //     },
// //     xAxis: {
// //       type: 'category',

// //       splitArea: {
// //         show: false
// //       }
// //     },
// //     yAxis: {
// //       type: 'category',

// //       splitArea: {
// //         show: false
// //       }
// //     },
// //     // --- CHANGE: visualMap controls the color scale ---
// //     visualMap: {
// //       min: 0,
// //       max: 20, // Set a realistic max for imbalance percentage
// //       calculable: true,
// //       orient: 'vertical',
// //       left: 'right',
// //       bottom: '15%',
// //       inRange: {
// //         // Define the color gradient: green -> yellow -> red
// //         color: ['#91CC75', '#ffce56', '#ff5252']
// //       }
// //     },
// //     dataZoom: [
// //       {
// //         type: 'inside',
// //         start: 0,
// //         end: 100
// //       }
// //     ],
// //     series: [
// //       {
// //         // --- CHANGE: Series is now a heatmap ---
// //         name: 'Imbalance',
// //         type: 'heatmap',
// //         data: heatmapData,
// //         label: {
// //           show: false,
// //           formatter: '{c}%'
// //         },
// //         emphasis: {
// //           itemStyle: {
// //             shadowBlur: 10,
// //             shadowColor: 'rgba(0, 0, 0, 0.5)'
// //           }
// //         }
// //       }
// //     ]
// //   };

// //   return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// // }
// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// // ---- ECharts modular (tree-shaken) imports ----
// import * as echarts from 'echarts/core';
// import { HeatmapChart } from 'echarts/charts';
// import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, VisualMapComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';

// echarts.use([HeatmapChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, VisualMapComponent, CanvasRenderer]);

// export default function ImbalanceHistoryChart({ data }) {
//   // --- Create the text labels for both axes from the data ---
//   const yAxisLabels = ['KVAR Imbalance', 'KW Imbalance', 'KVA Imbalance'];
//   const xAxisLabels = data.map((item) => item.time);

//   // Transform the data into the [x, y, value] format required by the heatmap
//   const heatmapData = [];
//   data.forEach((item, timeIndex) => {
//     heatmapData.push([timeIndex, 0, item.kvar_imbalance]); // KVAR on bottom row (index 0)
//     heatmapData.push([timeIndex, 1, item.kw_imbalance]); // KW in middle row (index 1)
//     heatmapData.push([timeIndex, 2, item.kva_imbalance]); // KVA on top row (index 2)
//   });

//   const option = {
//     tooltip: {
//       position: 'top',
//       formatter: (params) => {
//         // Use the label arrays to show the correct text in the tooltip
//         return `
//           <strong>Time: ${xAxisLabels[params.data[0]]}</strong><br/>
//           ${yAxisLabels[params.data[1]]}: ${params.data[2]}%
//         `;
//       }
//     },
//     grid: {
//       left: '12%', // Increased space for longer labels
//       right: '10%',
//       bottom: '10%',
//       top: '5%'
//     },
//     xAxis: {
//       type: 'category',
//       // --- FIX: Use the `xAxisLabels` array to display the formatted time ---
//       data: xAxisLabels,
//       splitArea: {
//         show: true
//       }
//     },
//     yAxis: {
//       type: 'category',
//       // --- FIX: Use the `yAxisLabels` array to display the metric names ---
//       data: yAxisLabels,
//       splitArea: {
//         show: true
//       }
//     },
//     visualMap: {
//       min: 0,
//       max: 20,
//       calculable: true,
//       orient: 'vertical',
//       left: 'right',
//       bottom: '15%',
//       inRange: {
//         color: ['#91CC75', '#ffce56', '#ff5252'] // Green -> Yellow -> Red
//       }
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
//         name: 'Imbalance',
//         type: 'heatmap',
//         data: heatmapData,
//         label: {
//           show: false,
//           formatter: '{c}%'
//         },
//         emphasis: {
//           itemStyle: {
//             shadowBlur: 10,
//             shadowColor: 'rgba(0, 0, 0, 0.5)'
//           }
//         }
//       }
//     ]
//   };

//   return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// }
import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { HeatmapChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([HeatmapChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, VisualMapComponent, CanvasRenderer]);

export default function ImbalanceChart({ data, isFocused, onChartClick }) {
  const getChartOptions = () => {
    const yAxisLabels = ['KVAR Imbalance', 'KW Imbalance', 'KVA Imbalance'];
    const xAxisLabels = data.map((item) => item.time);
    const heatmapData = [];
    data.forEach((item, timeIndex) => {
      heatmapData.push([timeIndex, 0, item.kvar_imbalance]);
      heatmapData.push([timeIndex, 1, item.kw_imbalance]);
      heatmapData.push([timeIndex, 2, item.kva_imbalance]);
    });
    const dataZoomConfig = [{ type: 'inside', start: 0, end: 100 }];
    if (isFocused) {
      dataZoomConfig.push({ type: 'slider', start: 0, end: 100, height: 25 });
    }

    return {
      tooltip: {
        position: 'top',
        formatter: (params) => `<strong>Time: ${xAxisLabels[params.data[0]]}</strong><br/>${yAxisLabels[params.data[1]]}: ${params.data[2]}%`,
      },
      grid: { left: '12%', right: '10%', bottom: '90px', top: '5%' },
      xAxis: { type: 'category', data: xAxisLabels, splitArea: { show: true } },
      yAxis: { type: 'category', data: yAxisLabels, splitArea: { show: true } },
      visualMap: {
        min: 0,
        max: 20,
        calculable: true,
        orient: 'vertical',
        left: 'right',
        bottom: '15%',
        inRange: { color: ['#91CC75', '#ffce56', '#ff5252'] },
      },
      dataZoom: dataZoomConfig,
      series: [{
        name: 'Imbalance', type: 'heatmap', data: heatmapData, label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      }],
    };
  };

  const style = {
    height: isFocused ? 'calc(100vh - 150px)' : '350px',
    width: '100%',
    cursor: isFocused ? 'default' : 'pointer',
  };

  const handleChartClick = (params) => {
    if (params.componentType === 'series' && onChartClick) {
      onChartClick();
    }
  };

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>Power Imbalance</h3>
      <ReactECharts echarts={echarts} option={getChartOptions()} style={style} onEvents={{ 'click': handleChartClick }} notMerge lazyUpdate />
    </div>
  );
}