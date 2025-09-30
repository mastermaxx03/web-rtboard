// src/ui-component/plantSummary/widgets/EnergyLossCostingWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergyLossData } from '../hooks/useEnergyLossData';

const EnergyLossCostingWidget = () => {
  const { cost, benchmark } = useEnergyLossData();

  const chartData = [
    {
      name: 'Energy Loss',
      value: cost,
      itemStyle: { color: '#61a0a8' },
      label: { show: true },
      labelLine: { show: true }
    },
    {
      name: 'Buffer',
      value: Math.max(0, benchmark - cost),
      itemStyle: { color: '#E0E0E0' },
      label: { show: false },
      labelLine: { show: false },
      tooltip: { show: false }
    }
  ];

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
      // The formatter only works for the 'Energy Loss' slice because we disabled it for 'Buffer'
      formatter: (params) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateString = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const percentage = ((params.value / benchmark) * 100).toFixed(2);

        return `<strong>${params.name}</strong><br/>
                Cost: <strong>${formatCurrency(params.value)}</strong> (${percentage}%)<br/>
                Benchmark: ${formatCurrency(benchmark)}<br/>
                <hr style="margin: 5px 0; border-color: #555;"/>
                Time: ${timeString}, ${dateString}`;
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: true,
        // Remove the default animation for a smoother real-time update
        animation: false,
        data: chartData,
        label: {
          position: 'outside',
          formatter: (params) => formatCurrency(params.value),
          color: '#333',
          fontWeight: 'bold'
        },
        labelLine: {
          length: 20
        }
      }
    ]
  };

  // 1. NEW STYLES for the modern table display
  const infoTableStyle = {
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px solid #eee'
  };

  const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    color: '#555',
    padding: '4px 0'
  };

  const valueStyle = {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333'
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexGrow: 1 }}>
        <ReactECharts option={option} style={{ height: '100%' }} />
      </div>

      {/* 2. UPDATED JSX for the modern table */}
      <div style={infoTableStyle}>
        <div style={infoRowStyle}>
          <span>Current Loss</span>
          <span style={valueStyle}>{formatCurrency(cost)}</span>
        </div>
        <div style={infoRowStyle}>
          <span>Benchmark (Max) </span>
          <span style={valueStyle}> {formatCurrency(benchmark)}</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyLossCostingWidget;
