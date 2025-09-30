// src/ui-component/plantSummary/widgets/CostSavingBenchmarkWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useCostSavingData } from '../hooks/useCostSavingData';

const CostSavingBenchmarkWidget = () => {
  const { percentage, amountSaved, benchmark } = useCostSavingData();

  const formatCurrency = (value) => {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });
  };

  const option = {
    // Tooltip configuration directly inside the series (this is the key for gauge charts)
    tooltip: {
      trigger: 'item', // 'item' is correct for gauge charts
      formatter: (params) => {
        // Guard clause for safety during re-renders, although 'item' trigger is more stable
        if (!params || params.value == null) {
          return '';
        }
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata'
        });
        const dateString = now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'Asia/Kolkata'
        });

        return `<strong>${params.name}</strong><br/>
                Value: <strong>${params.value}%</strong><br/>
                Benchmark: <strong>${benchmark}%</strong><br/>
                <hr style="margin: 5px 0; border-color: #555;"/>
                Time: ${timeString}, ${dateString}`;
      }
    },
    series: [
      {
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          itemStyle: { color: '#8A2BE2' } // Purple color
        },
        axisLine: { lineStyle: { width: 20, color: [[1, '#E6E6FA']] } }, // Light grey for the background
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        min: 0,
        max: benchmark,
        data: [{ value: percentage }],
        detail: { show: false }, // Hide the default number display
        // Nested title for two lines of text (SAVED, Amount)
        title: {
          offsetCenter: [0, '-10%'], // Adjust vertical position for "SAVED"
          text: 'SAVED',
          textStyle: { fontSize: 14, color: '#666' }
        },
        axisPointer: { show: false }, // Explicitly hide the axis pointer
        anchor: { show: false }, // No anchor point for simpler gauge
        markLine: { show: false } // No mark line
      }
    ],
    graphic: [
      // Using graphic elements to place the amount and "Cost Saving"
      {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text: formatCurrency(amountSaved),
          fill: '#333',
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center'
        },
        z: 10
      },
      {
        type: 'text',
        left: 'center',
        top: '60%', // Position it below the amount
        style: {
          text: 'Saved',
          fill: '#666',
          fontSize: 12,
          textAlign: 'center',
          fontWeight: 'bold'
        },
        z: 10
      }
    ]
  };

  // 1. UPDATED CSS for a clean, modern table layout
  const tableContainerStyle = {
    // Position at the bottom-right within the widget's padding.
    // Ensure it does not overflow.
    padding: '0 16px 16px 16px', // Adjust padding to match surrounding widget padding
    fontSize: '14px',
    color: '#555',
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'flex-end', // Align to bottom
    width: '100%', // Take full width
    boxSizing: 'border-box' // Include padding in width
  };

  const tableRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #f0f0f0' // Subtle line between rows
  };

  const tableValueStyle = {
    fontWeight: 'bold',
    color: '#333'
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flexGrow: 1, height: 'calc(100% - 100px)' }}>
        {' '}
        {/* Reserve space for the table */}
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* 2. THE MODERN TABLE, positioned at the bottom */}
      <div style={tableContainerStyle}>
        <div style={tableRowStyle}>
          <span>Current Value</span>
          <span style={tableValueStyle}>{percentage}%</span>
        </div>
        <div style={tableRowStyle}>
          <span>Max</span>
          <span style={tableValueStyle}>{benchmark}%</span>
        </div>
      </div>
    </div>
  );
};

export default CostSavingBenchmarkWidget;
