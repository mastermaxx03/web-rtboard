// src/ui-component/historical/RTW15-H/components/MetricsTable.jsx

import React from 'react';

const MetricsTable = ({ data, loadBandDetails }) => {
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

  // Map the aggregated data to the fixed order of load bands
  const tableData = loadBandDetails.map((band) => {
    const found = data.find((d) => d.name === band.name);
    return {
      name: band.name,
      logic: band.logic,
      hours: found?.hours?.toFixed(2) || '0.00',
      percentage: found?.percentage?.toFixed(2) || '0.00'
    };
  });

  const tableContainerStyle = {
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: 'auto',
    marginTop: '30px' // Added some top margin for spacing
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    fontSize: '14px'
  };

  const thStyle = {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    textAlign: 'left',
    borderBottom: '1px solid #dee2e6',
    fontWeight: 'bold'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #dee2e6'
  };

  const colorBoxStyle = (color) => ({
    width: '12px',
    height: '12px',
    display: 'inline-block',
    marginRight: '8px',
    backgroundColor: color,
    border: '1px solid #ccc'
  });

  return (
    <div style={tableContainerStyle}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', color: '#555' }}>Metrics Summary</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Load Band</th>
            <th style={thStyle}>Logic</th>
            <th style={thStyle}>Hours</th>
            <th style={thStyle}>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((item, index) => (
            <tr key={index}>
              <td style={tdStyle}>
                <div style={colorBoxStyle(colorMap[item.name])}></div>
                {item.name}
              </td>
              <td style={tdStyle}>{item.logic}</td>
              <td style={tdStyle}>{item.hours}</td>
              <td style={tdStyle}>{item.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MetricsTable;
