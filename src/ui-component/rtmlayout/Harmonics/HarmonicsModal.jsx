import React from 'react';
import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';
// Import our new reusable chart
import GaugeChart from './GaugeChart';
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

export default function HarmonicsModal({ data, onClose, onRefresh }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>
          {data.title || 'HARMONICS'} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {data.ref}</span>
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

      <div style={modalContentStyle}>
        {/* Left Column for THD-V */}
        <div style={modalColumnStyle}>
          <h3 style={chartTitleStyle}>THD-V %</h3>
          <div style={{ flexGrow: 1, minHeight: '300px' }}>
            {/* Use the GaugeChart with a blue color */}
            <GaugeChart name="THD-V" value={data.thdV.percentage} color="#5470C6" timestamp={data.timestamp} />
          </div>
        </div>

        {/* Right Column for THD-I */}
        <div style={modalColumnStyle}>
          <h3 style={chartTitleStyle}>THD-I %</h3>
          <div style={{ flexGrow: 1, minHeight: '300px' }}>
            {/* Use the GaugeChart with a yellow color */}
            <GaugeChart name="THD-I" value={data.thdI.percentage} color="#FAC858" timestamp={data.timestamp} />
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
