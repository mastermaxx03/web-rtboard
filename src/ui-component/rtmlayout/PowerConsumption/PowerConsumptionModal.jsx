import React from 'react';

// --- Icon Imports ---
import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';

// --- Project Imports ---
import PowerConsumptionChart from './PowerConsumptionChart'; // The chart for the left column
import MetricBar from './MetricBar'; // A reusable metric bar, adjust path if needed
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
export default function PowerConsumptionModal({ data, onClose, onRefresh }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  // --- Calculate derived values for the metric bars ---
  const { kw, kva, kvar } = data.phases;
  const kwImbalance = data.kw_avg > 0 ? ((Math.max(...kw) - Math.min(...kw)) / data.kw_avg) * 100 : 0;
  const kvaImbalance = data.kva_avg > 0 ? ((Math.max(...kva) - Math.min(...kva)) / data.kva_avg) * 100 : 0;
  const kvarImbalance = data.kvar_avg > 0 ? ((Math.max(...kvar) - Math.min(...kvar)) / data.kvar_avg) * 100 : 0;

  const metricsData = [
    { label: 'KW-Imb %', value: `${kwImbalance.toFixed(2)}%`, percentage: kwImbalance },
    { label: 'KVA-Imb %', value: `${kvaImbalance.toFixed(2)}%`, percentage: kvaImbalance },
    { label: 'KVAr-Imb %', value: `${kvarImbalance.toFixed(2)}%`, percentage: kvarImbalance }
  ];

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>
          {data.title || 'POWER CONSUMPTION'} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {data.ref}</span>
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

      {/* Content */}
      <div style={modalContentStyle}>
        {/* Left Column - Grouped Bar Chart */}
        <div style={modalColumnStyle}>
          <div style={{ flexGrow: 1, minHeight: '400px' }}>
            <PowerConsumptionChart data={data.phases} timestamp={data.timestamp} />
          </div>
        </div>

        {/* Right Column - Imbalance Metric Bars */}
        <div style={{ ...modalColumnStyle, justifyContent: 'center', gap: '20px' }}>
          {metricsData.map((metric) => {
            // --- THIS IS THE FIX ---
            // 1. Construct the tooltip text string. The '\n' creates a line break.
            const tooltipText = `Value: ${metric.value}\nTime: ${data.timestamp}`;

            return (
              <MetricBar
                key={metric.label}
                label={metric.label}
                value={metric.value}
                percentage={metric.percentage}
                color="#4A90E2"
                // 2. Pass the constructed text to the MetricBar component.
                tooltipText={tooltipText}
              />
            );
          })}
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
