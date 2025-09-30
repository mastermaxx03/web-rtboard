// src/ui-component/historical/RTW15-H/components/ZonalView.jsx

import React, { useState, useEffect } from 'react';
import DonutChart from './DonutChart';
import MetricsTable from './MetricsTable';
import { getMockMachineData, getLoadBandDetails } from '../services/mockDataService';

const ZonalView = () => {
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [zone, setZone] = useState('All Zones');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const loadBandDetails = getLoadBandDetails();

  useEffect(() => {
    setData(getMockMachineData());
  }, []);

  const filteredData = data.filter((d) => {
    const dataDate = new Date(d.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timeRange === 'Current Day') {
      const isToday = dataDate.toDateString() === today.toDateString();
      if (!isToday) return false;
    } else if (timeRange === 'Last 7 Days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      if (dataDate < sevenDaysAgo) return false;
    } else if (timeRange === 'Last 30 Days') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      if (dataDate < thirtyDaysAgo) return false;
    } else if (timeRange === 'Custom') {
      const start = customStartDate ? new Date(customStartDate) : null;
      const end = customEndDate ? new Date(customEndDate) : null;
      if (start && dataDate < start) return false;
      if (end && dataDate > end) return false;
    }

    if (zone !== 'All Zones' && d.zone !== zone) {
      return false;
    }

    return true;
  });

  const aggregatedData = filteredData.reduce((acc, current) => {
    Object.keys(current.loadBands).forEach((band) => {
      acc[band] = (acc[band] || 0) + current.loadBands[band];
    });
    return acc;
  }, {});

  const totalHours = Object.values(aggregatedData).reduce((sum, hours) => sum + hours, 0);

  const chartData = loadBandDetails.map((band) => {
    const hours = aggregatedData[band.name] || 0;
    const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
    return {
      name: band.name,
      hours: hours,
      percentage: percentage
    };
  });

  const buttonStyle = (isActive) => ({
    padding: '8px 16px',
    margin: '0 4px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: isActive ? '#007BFF' : '#f8f8f8',
    color: isActive ? '#fff' : '#333',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'background-color 0.3s, color 0.3s'
  });

  const dateInputStyle = {
    padding: '8px',
    margin: '0 5px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  };

  const contentWrapperStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '40px',
    flexWrap: 'wrap',
    marginTop: '20px',
    maxWidth: '1200px',
    margin: '20px auto'
  };

  const chartContainerStyle = {
    flex: '1',
    minWidth: '400px',
    maxWidth: '500px'
  };

  const tableContainerStyle = {
    flex: '1',
    minWidth: '500px',
    maxWidth: '600px'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
        <div>
          <span>Time Range:</span>
          {['Current Day', 'Last 7 Days', 'Last 30 Days', 'Custom'].map((range) => (
            <button key={range} style={buttonStyle(timeRange === range)} onClick={() => setTimeRange(range)}>
              {range}
            </button>
          ))}
        </div>
        <div>
          <span>Zones:</span>
          {['All Zones', 'A', 'B', 'C', 'D'].map((z) => (
            <button key={z} style={buttonStyle(zone === z)} onClick={() => setZone(z)}>
              {z}
            </button>
          ))}
        </div>
      </div>
      {timeRange === 'Custom' && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <input type="date" style={dateInputStyle} value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
          to
          <input type="date" style={dateInputStyle} value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
        </div>
      )}
      <div style={contentWrapperStyle}>
        <div style={chartContainerStyle}>
          <DonutChart data={chartData} totalHours={totalHours} title={`Load Distribution in ${zone}`} />
        </div>
        <div style={tableContainerStyle}>
          <MetricsTable data={chartData} loadBandDetails={loadBandDetails} />
        </div>
      </div>
    </div>
  );
};

export default ZonalView;
