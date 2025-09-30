// src/ui-component/historical/RTW15-H/components/DonutChart.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';

const DonutChart = ({ data, totalHours, title }) => {
  // Define a consistent color map for the load bands with new descriptive names
  const colorMap = {
    'Power Off': '#cccccc',
    'Poor Idle': '#fcf69b',
    Idle: '#add8e6',
    Optimal: '#98fb98',
    'Near Full Load': '#186418',
    Overload: '#ffa500',
    'Critical Overload': '#ff4500'
  };

  const options = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} Hours ({d}%)'
    },
    series: [
      {
        name: 'Load Bands',
        type: 'pie',
        radius: ['60%', '80%'], // Slightly thicker ring as per new design
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 12, // Rounded corners for segments
          // White border between segments for separation
          borderWidth: 5 // Thicker border
        },
        label: {
          show: true, // Show labels on segments
          position: 'outside', // Labels outside the segments
          formatter: '{b}\n[{d}%]', // Format: Name [Percentage%]
          color: '#333', // Label color
          fontSize: 12,
          fontWeight: 'bold',
          alignTo: 'labelLine', // Align text to label line
          overflow: 'truncate', // Truncate long labels
          edgeDistance: '10%', // Distance from the edge of the chart
          lineHeight: 18 // Line height for multi-line labels
        },
        labelLine: {
          show: true,
          length: 15, // Length of the first segment of the label line
          length2: 15, // Length of the second segment
          smooth: true // Smooth label lines
        },
        data: data.map((item) => ({
          name: item.name,
          value: parseFloat(item.hours.toFixed(2)),
          itemStyle: { color: colorMap[item.name] } // Use the defined color map
        }))
      }
    ],
    graphic: {
      type: 'text',
      left: 'center',
      top: 'center',
      style: {
        text: `${totalHours?.toFixed(2) || 0.0}\nHours`,
        textAlign: 'center',
        font: '24px sans-serif',
        fill: '#333'
      }
    }
  };

  const legendContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '20px',
    padding: '0 20px'
  };

  const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    margin: '5px 10px'
  };

  const colorBoxStyle = (color) => ({
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    backgroundColor: color,
    marginRight: '5px',
    border: '1px solid #ccc'
  });

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: 'auto' }}>
      <h3 style={{ textAlign: 'center', margin: '20px 0', fontSize: '18px', color: '#555' }}>{title}</h3>
      <div style={{ height: '400px' }}>
        {' '}
        {/* Increased height to accommodate outside labels */}
        <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
      </div>
      {/* Keeping the external legend for clarity, though labels are on the chart now */}
      <div style={legendContainerStyle}>
        {data
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((item, index) => (
            <div key={index} style={legendItemStyle}>
              <div style={colorBoxStyle(colorMap[item.name])}></div>
              <span>{item.name}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DonutChart;
