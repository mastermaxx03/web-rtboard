// // import React from 'react';
// // import ReactECharts from 'echarts-for-react';

// // // ---- ECharts modular (tree-shaken) imports ----
// // import * as echarts from 'echarts/core';
// // import { PieChart } from 'echarts/charts';
// // // --- CHANGE: Imported the TooltipComponent ---
// // import { TitleComponent, TooltipComponent } from 'echarts/components';
// // import { CanvasRenderer } from 'echarts/renderers';
// // // --- CHANGE: Enabled the TooltipComponent ---
// // echarts.use([PieChart, TitleComponent, TooltipComponent, CanvasRenderer]);

// // // --- CHANGE: Component now accepts a timestamp prop ---
// // export default function FrequencyRingChart({ value = 0, timestamp = '' }) {
// //   const maxFreq = 55;

// //   const option = {
// //     title: {
// //       text: `${value.toFixed(1)} Hz`,
// //       left: 'center',
// //       top: 'center',
// //       textStyle: {
// //         fontSize: 24,
// //         fontWeight: 'bold',
// //         color: '#333'
// //       }
// //     },
// //     // --- CHANGE: Added the tooltip configuration ---
// //     tooltip: {
// //       trigger: 'item',
// //       formatter: (params) => {
// //         // This condition ensures the tooltip only shows for the colored part of the ring
// //         if (params.name === 'Frequency') {
// //           return `
// //             Value: ${params.value.toFixed(1)} Hz<br/>
// //             Time: ${timestamp}
// //           `;
// //         }
// //         return null; // Hide tooltip for the grey background part
// //       }
// //     },
// //     series: [
// //       {
// //         type: 'pie',
// //         radius: ['80%', '100%'],
// //         avoidLabelOverlap: false,
// //         hoverAnimation: false,
// //         roundCap: true,
// //         label: {
// //           show: false
// //         },
// //         data: [
// //           // --- CHANGE: Added a name to the data point to identify it in the tooltip ---
// //           { value: value, name: 'Frequency', itemStyle: { color: '#5CE65C' } },
// //           { value: maxFreq - value, name: 'Max', itemStyle: { color: '#E0E0E0' } }
// //         ]
// //       }
// //     ]
// //   };

// //   return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// // }
// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// // ---- ECharts modular (tree-shaken) imports ----
// import * as echarts from 'echarts/core';
// import { PieChart } from 'echarts/charts';
// import { TitleComponent, TooltipComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';

// echarts.use([PieChart, TitleComponent, TooltipComponent, CanvasRenderer]);

// export default function FrequencyRingChart({ value = 0, timestamp = '' }) {
//   const maxFreq = 60; // Increased maxFreq slightly for better visual range if needed, adjust as per actual max.

//   // Define a gradient color for the active part of the ring
//   const gradientColor = new echarts.graphic.LinearGradient(
//     0,
//     0,
//     0,
//     1, // From top to bottom
//     [
//       { offset: 0, color: '#83bff6' }, // Light blue at the top
//       { offset: 0.5, color: '#188df0' }, // Mid blue
//       { offset: 1, color: '#188df0' } // Darker blue at the bottom
//     ]
//   );

//   // Fallback color in case the value is very low or 0
//   const activeColor = value > 0 ? gradientColor : '#A0A0A0'; // Use a default gray if no value

//   const option = {
//     title: {
//       text: `${value.toFixed(1)} Hz`,
//       left: 'center',
//       top: 'center',
//       textStyle: {
//         fontSize: 28, // Slightly larger font
//         fontWeight: 'bold',
//         color: '#333'
//         // Optional: Add a subtle text shadow for depth
//         // shadowColor: 'rgba(0, 0, 0, 0.3)',
//         // shadowBlur: 5,
//         // shadowOffsetX: 0,
//         // shadowOffsetY: 2
//       }
//     },
//     tooltip: {
//       trigger: 'item',
//       formatter: (params) => {
//         if (params.name === 'Frequency') {
//           return `
//             <strong>Frequency:</strong> ${params.value.toFixed(1)} Hz<br/>
//             <strong>Time:</strong> ${timestamp}
//           `;
//         }
//         return null;
//       },
//       backgroundColor: 'rgba(50,50,50,0.7)', // Darker tooltip background
//       borderColor: '#333',
//       textStyle: {
//         color: '#fff' // White text for tooltip
//       },
//       extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);' // Add shadow to tooltip
//     },
//     series: [
//       // Background full circle (darker shade of gray) to give depth
//       {
//         type: 'pie',
//         radius: ['80%', '100%'],
//         center: ['50%', '50%'],
//         silent: true, // Make it non-interactive
//         data: [{ value: maxFreq, itemStyle: { color: '#EAEAEA' } }], // Lighter grey background
//         label: { show: false },
//         animation: false,
//         // Add a subtle inner shadow to make it look inset
//         itemStyle: {
//           shadowBlur: 5,
//           shadowColor: 'rgba(0, 0, 0, 0.1)',
//           shadowOffsetX: 0,
//           shadowOffsetY: 0
//         }
//       },
//       // The actual progress ring
//       {
//         type: 'pie',
//         radius: ['80%', '100%'],
//         center: ['50%', '50%'],
//         avoidLabelOverlap: false,
//         hoverAnimation: false,
//         startAngle: 180, // Start the ring from the bottom-left if desired, or 90 for top
//         endAngle: 0, // Not needed with roundCap if it's a full circle progress, but good for partials
//         roundCap: true, // Gives nice rounded ends to the progress bar
//         label: {
//           show: false
//         },
//         data: [
//           {
//             value: value,
//             name: 'Frequency',
//             itemStyle: {
//               color: activeColor, // Apply the gradient or fallback color
//               // Add a subtle outer shadow to make it pop
//               shadowBlur: 10,
//               shadowColor: 'rgba(0, 0, 0, 0.2)',
//               shadowOffsetX: 0,
//               shadowOffsetY: 0
//             }
//           },
//           {
//             value: maxFreq - value,
//             name: 'Remaining', // Name for the unused part of the ring
//             itemStyle: {
//               color: '#F3F3F3' // Light gray for the un-filled part
//             }
//             // Add a subtle inner shadow to match the background if you want an "inset" effect
//             // itemStyle: {
//             //   color: '#F3F3F3',
//             //   shadowBlur: 3,
//             //   shadowColor: 'rgba(0, 0, 0, 0.1) inset',
//             //   shadowOffsetX: 0,
//             //   shadowOffsetY: 0
//             // }
//           }
//         ]
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
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, TitleComponent, TooltipComponent, CanvasRenderer]);

export default function FrequencyRingChart({ value = 0, timestamp = '' }) {
  const maxFreq = 60;

  const gradientColor = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: '#83bff6' }, // Light blue
    { offset: 1, color: '#188df0' } // Darker blue
  ]);

  const option = {
    title: {
      text: `${value.toFixed(1)} Hz`,
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.name === 'Frequency') {
          return `
            <strong>Frequency:</strong> ${params.value.toFixed(1)} Hz<br/>
            <strong>Time:</strong> ${timestamp}
          `;
        }
        return null;
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['80%', '100%'],
        center: ['50%', '50%'],
        // --- KEY CHANGE 1: Set the starting point to the top ---
        startAngle: 90,
        // --- KEY CHANGE 2: Ensure ends are rounded for a smooth look ---
        roundCap: true,
        hoverAnimation: false,
        label: {
          show: false
        },
        data: [
          {
            value: value,
            name: 'Frequency',
            itemStyle: {
              color: gradientColor
            }
          },
          {
            value: maxFreq - value,
            name: 'Remaining',
            itemStyle: {
              color: '#E0E0E0'
            }
          }
        ]
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
