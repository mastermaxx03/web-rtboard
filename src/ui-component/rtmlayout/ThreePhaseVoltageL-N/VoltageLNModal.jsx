import React from 'react';

// --- Icon Imports ---
import { Tally5, History, Download, X, AlertTriangle, Siren, CheckCircle2 } from 'lucide-react';

// --- Project Imports ---
// Note: We'll need to create a specific PhasorChartLN component later if its logic differs
import PhasorChartLN, { getVoltageStatusLN } from './PhasorChartLN';
import MetricBarLN from './MetricBarChartLN';
import {
  modalCardStyle,
  modalHeaderStyle,
  modalHeaderTitleStyle,
  modalHeaderControlsStyle,
  modalHeaderIconGroupStyle,
  modalContentStyle,
  modalColumnStyle,
  modalTableStyle,
  modalTableTdStyle,
  modalTableTdRightStyle,
  modalFooterStyle,
  modalButtonStyle,
  modalButtonPrimaryStyle,
  modalTableThStyle,
  professionalTableStyle,
  professionalTableThStyle,
  professionalTableTdStyle,
  colorDotStyle
} from '../../../styles/modalLayout';

// --- Reusable Status Indicator Component ---
const StatusIndicator = ({ status }) => {
  const indicatorConfig = {
    acceptable: { Icon: CheckCircle2, color: '#169c33', bgColor: '#F0FDF4' },
    warning: { Icon: AlertTriangle, color: '#ffce56', bgColor: '#FFFBEB' },
    critical: { Icon: Siren, color: '#ff5252', bgColor: '#FFF1F2' }
  };
  const config = indicatorConfig[status];
  if (!config) return null;
  return (
    <div
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600
      }}
    >
      <config.Icon size={14} style={{ marginRight: '4px' }} />
      {status.toUpperCase()}
    </div>
  );
};

// --- Logic for Metric Bar Colors ---
// Note: These thresholds will likely need to be adjusted for L-N values
const metricThresholds = {
  'Max Dev': { warning: 2, critical: 4 },
  'Voltage Imbalance': { warning: 2, critical: 4 },
  'V AVG': { warning: 230, critical: 235 }
};
const statusColors = {
  acceptable: '#169c33',
  warning: '#ffce56',
  critical: '#ff5252'
};
const getMetricStatus = (label, value) => {
  const thresholds = metricThresholds[label];
  if (!thresholds) return 'acceptable';
  if (value > thresholds.critical) return 'critical';
  if (value > thresholds.warning) return 'warning';
  return 'acceptable';
};

// --- Main Component ---
export default function VoltageLNModal({ data, onClose }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };
  const centeredTdStyle = {
    ...modalTableTdStyle,
    textAlign: 'center'
  };
  const phaseColorMap = {
    VRN: '#ff5252', // Red
    VYN: '#ffce56', // Yellow
    VBN: '#3366FF' // Blue
  };

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>
          {/* --- CHANGE: Updated Title --- */}
          {data.title || '3 PHASE VOLTAGE L-N'} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {data.ref}</span>
        </h2>
        <div style={modalHeaderControlsStyle}>
          <span>{data.date}</span>
          <span>{data.time}</span>
          <div style={modalHeaderIconGroupStyle}>
            <Tally5 size={18} cursor="pointer" />
            <History size={18} cursor="pointer" />
            <Download size={18} cursor="pointer" />
            <X size={20} cursor="pointer" onClick={onClose} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={modalContentStyle}>
        {/* Left Column */}
        <div style={modalColumnStyle}>
          <div style={{ flexGrow: 1, minHeight: '400px' }}>
            {/* Note: This uses the L-L chart for now. We can create a specific L-N chart later. */}
            <PhasorChartLN volts={data.phasorVolts} timestamp={data.timestamp} />
          </div>
        </div>

        {/* Right Column */}
        <div style={modalColumnStyle}>
          {/* 1. Table is now first */}
          <table style={professionalTableStyle}>
            <thead>
              <tr>
                {/* 2. Removed fixed widths and centered all columns */}
                <th style={{ ...professionalTableThStyle, textAlign: 'center' }}>Tag</th>
                <th style={{ ...professionalTableThStyle, textAlign: 'center' }}>Value</th>
                <th style={{ ...professionalTableThStyle, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.phasorTable.map((row, index) => {
                const status = getVoltageStatusLN(data.phasorVolts[index]);
                const isLastRow = index === data.phasorTable.length - 1;
                const tdStyle = isLastRow ? { ...professionalTableTdStyle, borderBottom: 'none' } : professionalTableTdStyle;

                return (
                  <tr key={row.label} className="table-row-hover">
                    {/* Tag Cell with Color Dot */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span
                        style={{
                          ...colorDotStyle,
                          backgroundColor: phaseColorMap[row.label] || '#ccc'
                        }}
                      ></span>
                      {row.label}
                    </td>
                    {/* Value Cell */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{row.value} </td>
                    {/* Status Cell */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <StatusIndicator status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Spacer */}
          <div style={{ flexGrow: 1 }}></div>

          {/* 3. Metric bars are now compacted to prevent scrolling */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '15px', paddingBottom: '20px' }}>
            {data.imbalanceMetrics.map((metric) => {
              const numericValue = parseFloat(metric.value);
              const status = getMetricStatus(metric.label, numericValue);
              const color = statusColors[status];
              return (
                <div key={metric.label} style={{ width: '100%', alignSelf: 'center' }}>
                  <MetricBarLN label={metric.label} value={metric.value} percentage={metric.percentage} color={color} />
                </div>
              );
            })}
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
