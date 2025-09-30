import React from 'react';

// --- Icon Imports ---
import { Tally5, History, Download, X, AlertTriangle, Siren, CheckCircle2, RefreshCw } from 'lucide-react';

// --- Project Imports ---
import CurrentRingChart from './CurrentRingChart';
import MetricBar from './MetricBarChart'; // Assuming MetricBar is generic enough
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
//status indicatorrange
const NOMINAL_CURRENT = 2500;
const ACCEPTABLE_PCT = 0.15; // +/- 15%
const WARNING_PCT = 0.3; // +/- 30%

const getCurrentStatus = (current) => {
  const deviation = Math.abs(current - NOMINAL_CURRENT) / NOMINAL_CURRENT;
  if (deviation > WARNING_PCT) return 'critical';
  if (deviation > ACCEPTABLE_PCT) return 'warning';
  return 'acceptable';
};
// Note: These are placeholder thresholds for current
const metricThresholds = {
  'Max Dev': { warning: 20, critical: 40 },
  'Max Dev %': { warning: 10, critical: 15 },
  'I AVG': { warning: 250, critical: 280 }
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
export default function CurrentCompModal({ data, onClose, onRefresh }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };
  const centeredTdStyle = {
    ...modalTableTdStyle,
    textAlign: 'center'
  };
  const phaseColorMap = {
    IR: '#ff5252', // Red
    IY: '#ffce56', // Yellow
    IB: '#3366FF' // Blue
  };

  // Calculate derived values from the data prop
  const currents = {
    ir: data.currents.ir,
    iy: data.currents.iy,
    ib: data.currents.ib
  };
  const currentValues = Object.values(currents);
  const iAvg = data.avg_i || 0;
  const maxDev = (Math.max(...currentValues) - Math.min(...currentValues)).toFixed(2);
  const maxDevPct = ((maxDev / iAvg) * 100).toFixed(2);

  const tableData = [
    { label: 'IR', value: currents.ir },
    { label: 'IY', value: currents.iy },
    { label: 'IB', value: currents.ib }
  ];

  const metricsData = [
    { label: 'Max Dev', value: `${maxDev}A`, percentage: (maxDev / 300) * 100 },
    { label: 'Max Dev %', value: `${maxDevPct}%`, percentage: maxDevPct },
    { label: 'I AVG', value: `${iAvg}A`, percentage: (iAvg / 300) * 100 }
  ];

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>
          {data.title || '3PH LINE CURRENT CONSUMPTION'} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {data.ref}</span>
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
        {/* Left Column */}
        <div style={modalColumnStyle}>
          <div style={{ flexGrow: 1, minHeight: '400px' }}>
            <CurrentRingChart currents={currents} timestamp={data.timestamp} showTooltip={true} showTimestamp={true} showLabels={false} />
          </div>
        </div>

        {/* Right Column */}
        {/* --- UPDATED: Right Column Layout --- */}
        <div style={modalColumnStyle}>
          {/* --- The Table is now FIRST for better proximity to the chart --- */}
          <table style={professionalTableStyle}>
            <thead>
              <tr>
                <th style={{ ...professionalTableThStyle, textAlign: 'center' }}>Tag</th>
                <th style={{ ...professionalTableThStyle, textAlign: 'center' }}>Value</th>
                <th style={{ ...professionalTableThStyle, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => {
                const status = getCurrentStatus(row.value);
                const isLastRow = index === tableData.length - 1;
                // --- Style for the table cell, removing the bottom border for the last row ---
                const tdStyle = isLastRow ? { ...professionalTableTdStyle, borderBottom: 'none' } : professionalTableTdStyle;

                return (
                  <tr key={row.label} className="table-row-hover">
                    {/* Cell 1: Tag with Color Dot */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span
                        style={{
                          ...colorDotStyle,
                          backgroundColor: phaseColorMap[row.label] || '#ccc'
                        }}
                      ></span>
                      {row.label}
                    </td>
                    {/* Cell 2: Value (Right Aligned) */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{row.value} A</td>
                    {/* Cell 3: Status (Centered) */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <StatusIndicator status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Spacer to push metrics down */}
          <div style={{ flexGrow: 1 }}></div>

          {/* --- The Metric Bars are now SECOND --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '20px', paddingRight: '15px' }}>
            {metricsData.map((metric) => {
              const numericValue = parseFloat(metric.value);
              const status = getMetricStatus(metric.label, numericValue);
              const color = statusColors[status];
              return (
                <div key={metric.label} style={{ width: '100%', alignSelf: 'center' }}>
                  <MetricBar label={metric.label} value={metric.value} percentage={metric.percentage} color={color} />
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
