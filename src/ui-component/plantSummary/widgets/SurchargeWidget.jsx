// src/ui-component/plantSummary/widgets/SurchargeWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useSurchargeData } from '../hooks/useSurchargeData';

const SurchargeWidget = () => {
  const { data } = useSurchargeData();

  // Calculate the total on every render to keep it in sync
  const totalSurcharge = data.reduce((sum, item) => sum + item.value, 0);

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

        return `<strong>${params.name}</strong><br/>
                Amount: <strong>${formatCurrency(params.value)}</strong><br/>
                <hr style="margin: 5px 0; border-color: #555;"/>
                Time: ${timeString}, ${dateString}`;
      }
    },
    // Use the title object to display the total in the center
    title: {
      text: 'Total',
      subtext: formatCurrency(totalSurcharge),
      left: 'center',
      top: '40%',
      textStyle: { fontSize: 16, color: '#666' },
      subtextStyle: { fontSize: 20, fontWeight: 'bold', color: '#333' }
    },
    series: [
      {
        name: 'Surcharges',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: true,
        data: data,
        label: {
          show: true,
          position: 'outside',
          formatter: (params) => `${params.name}\n${formatCurrency(params.value)}`,
          color: '#333',
          fontWeight: 'bold'
        },
        labelLine: {
          show: true,
          length: 20
        }
      }
    ],
    color: ['#3ba272', '#fc8452'] // Green and Orange colors
  };

  return <ReactECharts option={option} style={{ height: '100%' }} />;
};

export default SurchargeWidget;
