import React from 'react';
import ReactECharts from 'echarts-for-react';

// No longer need the separate message style
// const messageStyle = { ... };

export default function LoadFactorChart({ peakDemand, avgPower, timestamp }) {
  const loadFactor = peakDemand > 0 ? (avgPower / peakDemand) * 100 : 0;

  let statusColor;
  let statusMessage;

  if (loadFactor < 30) {
    statusColor = '#FF6347'; // Red
    statusMessage = 'Poor Utilization'; // Keep the message short and punchy for the UI
  } else if (loadFactor < 60) {
    statusColor = '#FFA500'; // Orange
    statusMessage = 'Moderate Utilization';
  } else if (loadFactor < 75) {
    statusColor = '#91CC75'; // Light Green
    statusMessage = 'Good Utilization';
  } else {
    statusColor = '#3CB371'; // Dark Green
    statusMessage = 'Excellent Utilization';
  }

  const option = {
    tooltip: {
      // Tooltip can still contain the full, detailed message
      formatter: () => `
        <strong>Load Factor:</strong> ${loadFactor.toFixed(2)}%<br/>
        <strong>Status:</strong> ${
          loadFactor < 30
            ? 'Poor utilization. Check for oversizing.'
            : loadFactor < 60
              ? 'Moderate. Potential for improvement.'
              : 'Good. The machine is well utilized.'
        }<br/>
        <strong>Time:</strong> ${timestamp}
      `
    },
    series: [
      {
        type: 'gauge',
        progress: { show: true, width: 20 }, // Made the ring slightly thicker
        axisLine: { lineStyle: { width: 20 } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },

        // --- THIS IS THE KEY CHANGE ---
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '5%'], // Nudge it down slightly to make room
          // The formatter now returns a rich text string
          formatter: function (value) {
            return (
              '{value|' +
              value.toFixed(1) +
              '%}\n\n' + // Main value
              '{status|' +
              statusMessage +
              '}' // Status message below
            );
          },
          // Define the styles for the parts we named ('value' and 'status')
          rich: {
            value: {
              fontSize: 32,
              fontWeight: 'bolder',
              color: '#333'
            },
            status: {
              fontSize: 14,
              color: '#666',
              padding: [5, 0]
            }
          }
        },
        data: [
          {
            value: loadFactor, // Use the raw value here
            itemStyle: {
              color: statusColor
            }
          }
        ]
      }
    ]
  };

  // The component's return is simple again
  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />;
}
