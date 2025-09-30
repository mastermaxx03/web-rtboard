import React from 'react';
import { useEnergyChargesData } from '../hooks/useEnergyChargesData';

const EnergyChargesWidget = () => {
  const { costPerKwh, percentageChange, direction } = useEnergyChargesData();

  const formatCurrency = (value) => {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });
  };

  const trendColor = direction === 'up' ? '#D32F2F' : '#4CAF50'; // Red for up, Green for down
  const trendIcon = direction === 'up' ? '▲' : '▼';

  // --- Styles ---
  const containerStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  };

  // NEW STYLE for the "Cost/kwh" heading
  const headingStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '5px'
  };

  const valueStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  };

  const trendContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: trendColor
  };

  const iconStyle = {
    marginRight: '5px'
  };

  return (
    <div style={containerStyle}>
      {/* ADDED HEADING HERE */}
      <div style={headingStyle}>Cost/kwh</div>

      <div style={valueStyle}>{formatCurrency(costPerKwh)}</div>

      {direction !== 'neutral' && (
        <div style={trendContainerStyle}>
          <span style={iconStyle}>{trendIcon}</span>
          <span>{Math.abs(percentageChange)}%</span>
        </div>
      )}
    </div>
  );
};

export default EnergyChargesWidget;
