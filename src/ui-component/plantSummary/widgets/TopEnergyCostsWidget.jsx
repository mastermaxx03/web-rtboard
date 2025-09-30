// src/ui-component/plantSummary/widgets/TopEnergyCostsWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTopEnergyCostsData } from '../hooks/useTopEnergyCostsData';

const TopEnergyCostsWidget = () => {
  const { data } = useTopEnergyCostsData();

  const formatCurrency = (value) => {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    });
  };

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateString = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return `<strong>${params.name}</strong><br/>
                Cost: <strong>${formatCurrency(params.value)}</strong><br/>
                <hr style="margin: 5px 0; border-color: #555;"/>
                Time: ${timeString}, ${dateString}`;
      }
    },
    series: [
      {
        // 1. CHART TYPE CHANGED to 'pie' to create a Donut Chart
        name: 'Top 5 Energy Costs',
        type: 'pie',
        // This creates the donut hole in the middle
        radius: ['50%', '70%'],
        avoidLabelOverlap: true,
        // The data structure for 'pie' needs name and value, which our hook already provides
        data: data,

        // 2. NEW LABEL and LABEL LINE configuration
        label: {
          show: true,
          position: 'outside',
          formatter: (params) => {
            // The label text will now be horizontal and readable
            return `${params.name}\n${formatCurrency(params.value)}`;
          },
          color: '#000', // Black text color
          fontWeight: 'bold',
          fontSize: 12,
          lineHeight: 16
        },
        // This adds the leader lines connecting the chart to the labels
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            color: '#333'
          }
        }
        // --- End of new configuration ---
      }
    ],
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
  };

  return <ReactECharts option={option} style={{ height: '100%' }} />;
};

export default TopEnergyCostsWidget;
