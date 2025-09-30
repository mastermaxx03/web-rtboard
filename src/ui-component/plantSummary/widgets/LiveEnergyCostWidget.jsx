// src/ui-component/plantSummary/widgets/LiveEnergyCostWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useLiveEnergyCostData } from '../hooks/useLiveEnergyCostData';

const LiveEnergyCostWidget = () => {
  const { data } = useLiveEnergyCostData();

  // Helper to format numbers as Indian currency
  const formatCurrency = (value) => {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });
  };

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateString = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return `${params.marker} <strong>${params.name}</strong><br/>
                Cost: <strong>${formatCurrency(params.value)}</strong><br/>
                <hr style="margin: 5px 0; border-color: #555;"/>
                Time: ${timeString}, ${dateString}`;
      }
    },
    series: [
      {
        name: 'Live Energy Cost',
        type: 'pie',
        radius: ['50%', '70%'], // Donut chart
        avoidLabelOverlap: true,
        data: data,
        label: {
          show: true,
          position: 'outside',
          formatter: (params) => {
            // Show name and formatted currency on two lines
            return `${params.name}\n${formatCurrency(params.value)}`;
          },
          color: '#333'
        },
        labelLine: {
          show: true,
          length: 15
        }
      }
    ],
    color: ['#F5A623', '#D0021B', '#f0c420'] // Grid, DG, Solar colors
  };

  return <ReactECharts option={option} style={{ height: '100%' }} />;
};

export default LiveEnergyCostWidget;
