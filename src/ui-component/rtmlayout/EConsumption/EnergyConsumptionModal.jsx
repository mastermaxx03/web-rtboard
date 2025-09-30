import React from 'react';
import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';
import KpiCard from './KpiCard'; // Import the new component
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

const styles = {
  // New styles for the 3-card layout
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    padding: '24px'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px'
  }
};

export default function EnergyConsumptionModal({ data, onClose, onRefresh }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  // Extract the data for each card for clarity
  const { kwhData, kvarhData, kvahData } = data;

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

      {/* Content - Replaced with the new 3-card layout */}
      <div style={{ ...modalContentStyle, ...styles.container }}>
        <div style={styles.topRow}>
          <KpiCard
            title="Real Energy (kWh)"
            currentValue={kwhData.current}
            previousValue={kwhData.previous}
            deltaValue={kwhData.delta}
            unit="Units"
            width="450px"
            height="960px"
          />
          <KpiCard
            title="Reactive Energy (kVArh)"
            currentValue={kvarhData.current}
            previousValue={kvarhData.previous}
            deltaValue={kvarhData.delta}
            unit="Units"
            width="450px"
            height="960px"
          />
        </div>
        <div>
          <KpiCard
            title="Apparent Energy (kVAh)"
            currentValue={kvahData.current}
            previousValue={kvahData.previous}
            deltaValue={kvahData.delta}
            unit="Units"
            width="500px"
            height="960px"
          />
        </div>
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
