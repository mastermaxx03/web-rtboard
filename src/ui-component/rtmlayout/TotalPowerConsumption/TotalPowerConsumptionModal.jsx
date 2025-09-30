import React, { useState } from 'react';

// --- Icon Imports ---
import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';

// --- Project Imports ---
import TotalPowerChart from './TotalPowerChart'; // The two-ring donut
import PowerConsumptionChart from './PowerConsumptionChart'; // The stacked bar chart
import ImbalancePercentageChart from './ImbalancePercentageChart'; // The imbalance bar chart
import SegmentedControl from '../../../ui-component/common/SegmentedControl'; // The reusable toggle
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
  marginBottom: '16px'
};

export default function TotalPowerConsumptionModal({ data, onClose, onRefresh }) {
  const [activeChart, setActiveChart] = useState('distribution'); // 'distribution' or 'imbalance'

  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  // Prepare data for the child components, with fallbacks for safety
  const distributionData = {
    kw: data?.phases?.kw || [],
    kva: data?.phases?.kva || [],
    kvar: data?.phases?.kvar || []
  };

  const imbalanceData = {
    kwImbalance: data?.kwImbalance || 0,
    kvaImbalance: data?.kvaImbalance || 0,
    kvarImbalance: data?.kvarImbalance || 0
  };

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>{data.title || 'TOTAL POWER CONSUMPTION'}</h2>
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
      <div style={modalContentStyle}>
        {/* Left Column - Toggled Charts */}
        <div style={{ ...modalColumnStyle, gap: '16px' }}>
          <div style={{ ...modalColumnStyle, gap: '16px', alignItems: 'flex-start' }}>
            <SegmentedControl
              options={[
                { id: 'distribution', label: 'Power Distribution' },
                { id: 'imbalance', label: 'Imbalance %' }
              ]}
              activeOptionId={activeChart}
              onSelect={setActiveChart}
            />
          </div>
          <div style={{ flexGrow: 1, minHeight: '300px' }}>
            {activeChart === 'distribution' ? (
              <PowerConsumptionChart data={distributionData} />
            ) : (
              <ImbalancePercentageChart data={imbalanceData} />
            )}
          </div>
        </div>

        {/* Right Column - Donut Chart */}
        <div style={modalColumnStyle}>
          <h3 style={chartTitleStyle}>Total Power Consumption</h3>
          <div style={{ flexGrow: 1, minHeight: '300px' }}>
            <TotalPowerChart data={data.totalPower} />
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
