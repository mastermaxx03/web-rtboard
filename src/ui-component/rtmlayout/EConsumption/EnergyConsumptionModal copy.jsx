import React from 'react';
import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';
import MetricRow from './MetricRow'; // Import the new component
import {
  modalCardStyle,
  modalHeaderStyle,
  modalHeaderTitleStyle,
  modalHeaderControlsStyle,
  modalHeaderIconGroupStyle,
  modalContentStyle,
  modalFooterStyle,
  modalButtonStyle,
  modalButtonPrimaryStyle
} from '../../../styles/modalLayout';

export default function EnergyConsumptionModal({ data, onClose, onRefresh }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>{data.title || 'ENERGY CONSUMPTION'}</h2>
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

      {/* Content */}
      <div style={{ ...modalContentStyle, display: 'flex', flexDirection: 'column' }}>
        <MetricRow name="kVAh" value={data.totalKVAh} unit="Units" delta={data.deltaKVAh} previousValue={data.totalKVAh_previous} />
        <MetricRow name="kWh" value={data.totalKWH} unit="Units" delta={data.deltaKWH} previousValue={data.totalKWH_previous} />
        <MetricRow name="kVArh" value={data.totalKVARh} unit="Units" delta={data.deltaKVARh} previousValue={data.totalKVARh_previous} />
      </div>

      {/* Footer */}
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
