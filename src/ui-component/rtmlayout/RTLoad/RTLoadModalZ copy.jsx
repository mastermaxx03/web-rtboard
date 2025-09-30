import React from 'react';
import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';
import GaugeChart from '../Harmonics/GaugeChart';

// --- CHANGE 1: Import our new LoadFactorChart ---
import LoadFactorChart from './LoadFactorChart';

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
  fontSize: '1.75rem',
  fontWeight: 'bold',
  color: '#212529',
  lineHeight: 1.2
};

export default function RTLoadModal({ data, onClose, onRefresh }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>
          {data.title || 'REAL-TIME LOAD'} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {data.ref}</span>
        </h2>
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

      <div style={modalContentStyle}>
        <div style={modalColumnStyle}>
          <h3 style={chartTitleStyle}>RT Load %</h3>
          <div style={{ flexGrow: 1, maxHeight: '300px' }}>
            <GaugeChart name="RT Load" value={data.rtLoad.percentage} color="#91CC75" timestamp={data.timestamp} />
          </div>
        </div>

        <div style={modalColumnStyle}>
          {/* --- CHANGE 2: Replace the title --- */}
          <h3 style={chartTitleStyle}>Load Factor</h3>
          <div style={{ flexGrow: 1, minHeight: '355px' }}>
            {/* --- CHANGE 3: Replace PerformanceScoreChart with LoadFactorChart --- */}
            {/* Pass the required props: peakDemand, avgPower, and timestamp. */}
            <LoadFactorChart peakDemand={data.peakDemand} avgPower={data.avgPower} timestamp={data.timestamp} />
          </div>
        </div>
      </div>

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
