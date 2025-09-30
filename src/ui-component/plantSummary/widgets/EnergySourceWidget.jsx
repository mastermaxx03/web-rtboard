// src/ui-component/plantSummary/widgets/EnergySourceWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergySourceData } from '../hooks/useEnergySourceData';

const EnergySourceWidget = () => {
  // 1. Get the data from our dedicated hook
  const { data } = useEnergySourceData();

  // 2. Define the ECharts configuration object
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        // ... (The custom tooltip formatter remains the same)
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const dateString = now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        return `${params.marker} <strong>${params.name}</strong><br/>
                Value: <strong>${params.value}%</strong><br/>
                <hr style="margin: 5px 0; border-color: #555;"/>
                Time: ${timeString}, ${dateString}`;
      }
    },
    series: [
      {
        name: 'Energy Source',
        type: 'pie',
        radius: ['40%', '70%'], // Make it a donut chart for a modern look
        center: ['50%', '50%'], // Center the chart now that the legend is gone
        data: data,
        avoidLabelOverlap: true, // Prevents labels from crashing into each other

        // --- NEW LABEL CONFIGURATION ---
        label: {
          show: true,
          formatter: '{b}\n{d}%', // Show Name on one line, Percentage on the next
          fontSize: 14,
          fontWeight: 'bold',
          lineHeight: 20
        },
        // Style for the lines pointing from the slice to the label
        labelLine: {
          show: true
        },
        // --- END OF NEW CONFIGURATION ---

        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],
    color: ['#4A90E2', '#F5A623', '#D0021B']
  };

  // 3. Render the chart
  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

export default EnergySourceWidget;
