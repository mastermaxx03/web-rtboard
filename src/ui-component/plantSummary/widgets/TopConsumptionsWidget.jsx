// src/ui-component/plantSummary/widgets/TopConsumptionsWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTopConsumptionsData } from '../hooks/useTopConsumptionsData';

const TopConsumptionsWidget = () => {
  const { data } = useTopConsumptionsData();

  const option = {
    // --- UPDATED TOOLTIP CONFIGURATION ---
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        // Get the current date and time
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false // 24-hour format
        });
        const dateString = now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        // Build the full tooltip string with the timestamp
        return `${params.marker} <strong>${params.name}</strong><br/>
                Consumption: <strong>${params.value}%</strong><br/>
                <hr style="margin: 5px 0; border-color: #555;"/>
                Time: ${timeString}, ${dateString}`;
      }
    },
    // --- END OF UPDATE ---

    series: [
      {
        name: 'Top Consumptions',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        data: data,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n[{d}%]',
          overflow: 'truncate',
          fontSize: 12,
          fontWeight: 'bold',
          lineHeight: 16,
          color: '#333'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 15,
          lineStyle: {
            color: '#999'
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],
    color: ['#4A90E2', '#7ED321', '#F5A623', '#D0021B', '#50E3C2', '#9B9B9B']
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

export default TopConsumptionsWidget;
