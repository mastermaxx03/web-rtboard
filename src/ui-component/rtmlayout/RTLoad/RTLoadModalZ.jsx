import React from 'react';
import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';
// --- CHANGED: Import the new reusable chart ---
import StyledGaugeChart from './StyledGaugeChart';

import {
  modalCardStyle,
  modalHeaderStyle,
  modalHeaderTitleStyle,
  modalHeaderControlsStyle,
  modalHeaderIconGroupStyle,
  modalContentStyle,
  modalColumnStyle,
  modalFooterStyle,
  modalButtonStyle,
  modalButtonPrimaryStyle
} from '../../../styles/modalLayout';

const chartTitleStyle = {
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '1rem',
  color: '#343a40',
  marginBottom: '8px'
};

const metricsContainerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%',
  padding: '20px 0',
  borderTop: '1px solid #e9ecef',
  borderBottom: '1px solid #e9ecef',
  backgroundColor: '#f8f9fa'
};

const metricBoxStyle = {
  textAlign: 'center'
};

const metricLabelStyle = {
  fontSize: '0.75rem',
  color: '#6c757d',
  marginBottom: '4px',
  textTransform: 'uppercase',
  fontWeight: '600'
};

const metricValueStyle = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
  color: '#212529',
  lineHeight: 1.2
};

export default function RTLoadModal({ data, onClose, onRefresh }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  // --- ADDED: Logic for Load Factor is now inside the modal ---
  const loadFactor = data.peakDemand > 0 ? (data.avgPower / data.peakDemand) * 100 : 0;
  let statusColor;
  let statusMessage;

  if (loadFactor < 30) {
    statusColor = '#FF6347'; // Red
    statusMessage = 'Poor Utilization';
  } else if (loadFactor < 60) {
    statusColor = '#FFA500'; // Orange
    statusMessage = 'Moderate Utilization';
  } else if (loadFactor < 75) {
    statusColor = '#91CC75'; // Light Green
    statusMessage = 'Good Utilization';
  } else {
    statusColor = '#3CB371'; // Dark Green
    statusMessage = 'Excellent Utilization';
  }

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header (Unchanged) */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>{data.title || 'REAL-TIME LOAD & LOAD FACTOR'}</h2>
        <div style={modalHeaderControlsStyle}>
          <span>{data.date}</span>
          <span>{data.time}</span>
          <div style={modalHeaderIconGroupStyle}>
            <Tally5 size={18} cursor="pointer" />
            <History size={18} cursor="pointer" />
            <Download size={18} cursor="pointer" />
            <RefreshCw size={18} cursor="pointer" onClick={onRefresh} />
            <X size={20} cursor="pointer" onClick={onClose} />
          </div>
        </div>
      </div>

      {/* Top Metrics Bar (Unchanged) */}
      <div style={metricsContainerStyle}>
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Rated Load</div>
          <div style={metricValueStyle}>{data.ratedLoad} kW</div>
        </div>
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Realtime Load</div>
          <div style={metricValueStyle}>{data.realtimeLoad} kW</div>
        </div>
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>RT Load %</div>
          <div style={metricValueStyle}>{data.rtLoad.percentage}%</div>
        </div>
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Peak Demand</div>
          <div style={metricValueStyle}>{data.peakDemand} kW</div>
        </div>
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Average Power</div>
          <div style={metricValueStyle}>{data.avgPower} kW</div>
        </div>
      </div>

      {/* Content (Charts are now consistent and smaller) */}
      <div style={modalContentStyle}>
        <div style={modalColumnStyle}>
          <h3 style={chartTitleStyle}>RT Load %</h3>
          {/* --- CHANGED: Height is reduced to prevent scrolling --- */}
          <div style={{ height: '250px' }}>
            <StyledGaugeChart
              value={data.rtLoad.percentage}
              statusMessage="Real-Time"
              statusColor="#66BB6A" // A consistent green for RT Load
            />
          </div>
        </div>

        <div style={modalColumnStyle}>
          <h3 style={chartTitleStyle}>Load Factor</h3>
          {/* --- CHANGED: Height is reduced and using the new reusable component --- */}
          <div style={{ height: '250px' }}>
            <StyledGaugeChart value={loadFactor} statusMessage={statusMessage} statusColor={statusColor} />
          </div>
        </div>
      </div>

      {/* Footer (Unchanged) */}
      <div style={modalFooterStyle}>
        <button style={modalButtonPrimaryStyle} onClick={onClose}>
          Okay
        </button>
        <button style={modalButtonStyle} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
