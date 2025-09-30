// src/ui-component/historical/RTW15-H/index.jsx

import React, { useState } from 'react';
import LoadView from './components/LoadView';
import ZonalView from './components/ZonalView';

const RTW15H = () => {
  const [currentView, setCurrentView] = useState('load');

  const containerStyle = {
    fontFamily: 'sans-serif',
    padding: '20px',
    backgroundColor: '#f0f2f5',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  };

  const headerRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const titleStyle = {
    fontSize: '24px',
    color: '#333',
    margin: 0
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '10px'
  };

  const buttonStyle = (isActive) => ({
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: isActive ? '#007BFF' : '#fff',
    color: isActive ? '#fff' : '#333',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
  });

  const horizontalLineStyle = {
    border: 0,
    height: '1px',
    backgroundColor: '#ccc',
    margin: '20px 0'
  };

  return (
    <div style={containerStyle}>
      <div style={headerRowStyle}>
        <h1 style={titleStyle}>Machine Time Matrix</h1>
        <div style={buttonGroupStyle}>
          <button style={buttonStyle(currentView === 'load')} onClick={() => setCurrentView('load')}>
            Load View
          </button>
          <button style={buttonStyle(currentView === 'zonal')} onClick={() => setCurrentView('zonal')}>
            Zonal View
          </button>
        </div>
      </div>
      <hr style={horizontalLineStyle} />

      {/* The content below the line will now be handled by the respective views */}
      {currentView === 'load' ? <LoadView /> : <ZonalView />}
    </div>
  );
};

export default RTW15H;
