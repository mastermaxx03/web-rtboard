import React from 'react';

// --- Icon Imports ---
import { Tally5, History, Download, X, RefreshCw, Calendar } from 'lucide-react';

// --- Project Imports ---
import BreakdownDonutChart from './BreakdownDonutChart';
import TotalConsumptionBarChart from './TotalConsumptionBarChart';

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

// --- Main Component ---
export default function EnergyConsumptionModal({ data, onClose, onRefresh }) {
  // Prevents the modal from closing when clicking inside it
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  const {
    title = 'ENERGY CONSUMPTION',
    ref = '8',
    date = 'N/A',
    time = 'N/A',
    timestamp = '',
    totalKVAh = 0,
    totalKWH = 0,
    totalKVARh = 0,
    breakdown = []
  } = data || {};

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>
          {title} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {ref}</span>
        </h2>
        <div style={modalHeaderControlsStyle}>
          <span>{date}</span>
          <span>{time}</span>
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
      <div style={{ ...modalContentStyle, display: 'flex', gap: '20px', flexGrow: 1 }}>
        {/* --- Left Column --- */}
        <div style={modalColumnStyle}>
          <h3 style={{ textAlign: 'center', fontWeight: 'bold' }}>TOTAL ENERGY CONSUMPTION</h3>
          <div
            style={{
              border: '4px solid #e0e0e0',
              padding: '15px',
              textAlign: 'center',
              margin: '10px 0',
              borderRadius: '8px',
              backgroundColor: '#fafafa'
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{totalKVAh.toFixed(2)} KVAh</div>
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <TotalConsumptionBarChart data={{ totalKWH, totalKVARh, totalKVAh }} timestamp={timestamp} />
          </div>
        </div>

        {/* --- Right Column --- */}
        <div style={modalColumnStyle}>
          <h3 style={{ textAlign: 'center', fontWeight: 'bold' }}>ENERGY CONSUMPTION BREAKDOWN (%)</h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              margin: '3px 0',
              padding: '2px',
              gap: '1px'
            }}
          >
            {/* <button style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={16} /> Date
            </button>
            <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
              <button>A</button>
              <button>H</button>
              <button>{'>'}</button>
            </div> */}
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <BreakdownDonutChart data={breakdown} timestamp={timestamp} />
          </div>
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
