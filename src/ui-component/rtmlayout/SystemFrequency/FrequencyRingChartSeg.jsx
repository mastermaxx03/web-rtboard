// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// // ---- ECharts modular (tree-shaken) imports ----
// import * as echarts from 'echarts/core';
// import { PieChart } from 'echarts/charts';
// import { TitleComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';
// echarts.use([PieChart, TitleComponent, CanvasRenderer]);

// export default function FrequencyRingChartSeg(props) {
//   const { value = 0 } = props;
//   const maxFreq = 55;
//   const gapValue = maxFreq * 0.1;
//   const option = {
//     // Use the title component to place text in the center
//     title: {
//       text: `${value.toFixed(1)} Hz`,
//       left: 'center',
//       top: 'center',
//       textStyle: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#333'
//       }
//     },
//     series: [
//       {
//         type: 'pie',
//         radius: ['80%', '100%'],
//         avoidLabelOverlap: false,
//         hoverAnimation: false,
//         roundCap: true,
//         label: {
//           show: false // Hide the default labels on the slices
//         },
//         data: [
//           { value: value, itemStyle: { color: '#5CE65C' } },
//           { value: maxFreq - value, itemStyle: { color: '#E0E0E0' } }
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
// --- CHANGE: Added TooltipComponent for a better hover experience ---
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// --- CHANGE: Enable TooltipComponent ---
echarts.use([PieChart, TitleComponent, TooltipComponent, CanvasRenderer]);

export default function FrequencyRingChartSeg(props) {
  const { value = 0, timestamp = '' } = props; // --- CHANGE: Added timestamp prop for tooltip ---
  const maxFreq = 60; // Adjusted maxFreq for a slightly more open range in the gauge
  // Removed gapValue as it's not directly used in the pie data for this style

  // Define a gradient color for the active part of the ring
  const gradientColor = new echarts.graphic.LinearGradient(
    0,
    0,
    0,
    1, // From top to bottom
    [
      { offset: 0, color: '#83bff6' }, // Light blue at the top
      { offset: 1, color: '#188df0' } // Darker blue at the bottom
    ]
  );

  // Fallback color in case the value is very low or 0
  const activeColor = value > 0 ? gradientColor : '#A0A0A0'; // Use a default gray if no value

  const option = {
    title: {
      text: `${value.toFixed(1)} Hz`,
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 28, // Slightly larger font for better visibility
        fontWeight: 'bold',
        color: '#333'
      }
    },
    // --- CHANGE: Added the tooltip configuration for detailed info on hover ---
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.name === 'Frequency') {
          return `
            <strong>Frequency:</strong> ${params.value.toFixed(1)} Hz<br/>
            <strong>Time:</strong> ${timestamp}
          `;
        }
        return null; // Hide tooltip for the grey background part
      },
      backgroundColor: 'rgba(50,50,50,0.7)', // Darker tooltip background
      borderColor: '#333',
      textStyle: {
        color: '#fff' // White text for tooltip
      },
      extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);' // Add shadow to tooltip
    },
    series: [
      // Background full circle (darker shade of gray) to give depth
      {
        type: 'pie',
        radius: ['80%', '100%'],
        center: ['50%', '50%'],
        silent: true, // Make it non-interactive
        data: [{ value: maxFreq, itemStyle: { color: '#EAEAEA' } }], // Lighter grey background
        label: { show: false },
        animation: false,
        itemStyle: {
          shadowBlur: 5,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowOffsetX: 0,
          shadowOffsetY: 0
        }
      },
      // The actual progress ring
      {
        type: 'pie',
        radius: ['80%', '100%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        hoverAnimation: false,
        startAngle: 90, // Start from the top for a gauge-like effect
        roundCap: true, // Rounded ends for a smoother progress bar
        label: {
          show: false // Hide the default labels on the slices
        },
        data: [
          {
            value: value,
            name: 'Frequency', // --- CHANGE: Added name for tooltip identification ---
            itemStyle: {
              color: activeColor, // Apply the gradient or fallback color
              shadowBlur: 10, // Outer shadow for a 'pop-out' effect
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowOffsetX: 0,
              shadowOffsetY: 0
            }
          },
          {
            value: maxFreq - value,
            name: 'Remaining', // --- CHANGE: Added name for tooltip identification ---
            itemStyle: {
              color: '#F3F3F3' // Light gray for the un-filled part
            }
          }
        ]
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
