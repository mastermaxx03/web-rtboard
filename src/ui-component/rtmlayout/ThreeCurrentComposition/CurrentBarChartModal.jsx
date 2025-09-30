// CurrentBarChartModal.js
import React from 'react';
import { X, Download, History, AlertTriangle, Siren, CheckCircle2 } from 'lucide-react';

import HorizontalBarChartWithAverage from './HorizontalBarChartWithAverage';
import {
  modalCardStyle,
  modalHeaderStyle,
  modalHeaderTitleStyle,
  modalHeaderControlsStyle,
  modalHeaderIconGroupStyle,
  modalButtonPrimaryStyle,
  modalContentStyle,
  modalFooterStyle,
  modalButtonStyle,
  modalColumnStyle,
  professionalTableStyle,
  professionalTableThStyle,
  professionalTableTdStyle,
  colorDotStyle
} from '../../../styles/modalLayout'; // Adjust path as needed

// FIXED: Full StatusIndicator component is now included.
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

// ===================================================================================
// THRESHOLD CONFIGURATION (Mock data, easily replaceable)
// ===================================================================================
const MOCK_THRESHOLDS = {
  current: { nominal: 2500, warning_pct: 15, critical_pct: 30 },
  summary: {
    avgCurrent: { warning: 2800, critical: 3200 },
    maxDevPct: { warning: 5, critical: 10 },
    maxDev: { warning: 150, critical: 250 }
  }
};
const STATUS_COLORS = { acceptable: '#169c33', warning: '#ffce56', critical: '#ff5252', default: '#1e293b' };

// ===================================================================================
// HELPER FUNCTIONS TO DETERMINE STATUS
// ===================================================================================
const getCurrentStatus = (value, thresholds) => {
  const { nominal, warning_pct, critical_pct } = thresholds.current;
  const deviation = (Math.abs(value - nominal) / nominal) * 100;
  if (deviation > critical_pct) return 'critical';
  if (deviation > warning_pct) return 'warning';
  return 'acceptable';
};
const getSummaryStatus = (label, value, thresholds) => {
  const config = thresholds.summary[label];
  if (!config) return 'default';
  if (value > config.critical) return 'critical';
  if (value > config.warning) return 'warning';
  return 'acceptable';
};

// ===================================================================================
// MAIN MODAL COMPONENT
// ===================================================================================
const CurrentBarChartModal = ({ data, onClose }) => {
  if (!data) return null;

  const handleCardClick = (e) => e.stopPropagation();

  // Prepare data for table
  const tableData = [
    { label: 'IR', value: parseFloat(data.currents.ir) },
    { label: 'IY', value: parseFloat(data.currents.iy) },
    { label: 'IB', value: parseFloat(data.currents.ib) }
  ];
  const phaseColorMap = { IR: '#ff5252', IY: '#ffce56', IB: '#3366FF' };

  // Prepare data for summary stats
  const maxDev = parseFloat(data.max_dev);
  const avgI = parseFloat(data.avg_i);
  const maxDevPct = avgI > 0 ? (maxDev / avgI) * 100 : 0;

  const avgCurrentStatus = getSummaryStatus('avgCurrent', avgI, MOCK_THRESHOLDS);
  const maxDevStatus = getSummaryStatus('maxDev', maxDev, MOCK_THRESHOLDS);
  const maxDevPctStatus = getSummaryStatus('maxDevPct', maxDevPct, MOCK_THRESHOLDS);

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>{data.title}</h2>
        <div style={modalHeaderControlsStyle}>
          <span>{data.timestamp}</span>
          <div style={modalHeaderIconGroupStyle}>
            <History size={18} cursor="pointer" />
            <Download size={18} cursor="pointer" />
            <X size={20} cursor="pointer" onClick={onClose} />
          </div>
        </div>
      </div>

      {/* FIXED: Two-column layout for Chart and Details Table */}
      <div style={{ ...modalContentStyle, paddingBottom: '0' }}>
        {/* Left Column: Chart */}
        <div style={modalColumnStyle}>
          <HorizontalBarChartWithAverage
            currents={data.currents}
            average={data.avg_i}
            timestamp={data.timestamp}
            thresholds={MOCK_THRESHOLDS.current}
          />
        </div>

        {/* Right Column: Details Table */}
        <div style={modalColumnStyle}>
          <table style={{ ...professionalTableStyle, height: '94%' }}>
            <thead>
              <tr>
                <th style={{ ...professionalTableThStyle, textAlign: 'center' }}>Tag</th>
                <th style={{ ...professionalTableThStyle, textAlign: 'center' }}>Value</th>
                <th style={{ ...professionalTableThStyle, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => {
                const status = getCurrentStatus(row.value, MOCK_THRESHOLDS);
                return (
                  <tr key={row.label}>
                    <td style={{ ...professionalTableTdStyle, textAlign: 'center' }}>
                      <span style={{ ...colorDotStyle, backgroundColor: phaseColorMap[row.label] }}></span>
                      {row.label}
                    </td>
                    <td style={{ ...professionalTableTdStyle, textAlign: 'center' }}>{row.value.toFixed(1)} A</td>
                    <td style={{ ...professionalTableTdStyle, textAlign: 'center' }}>
                      <StatusIndicator status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIXED: Full-width summary section is back at the bottom */}
      <div style={summaryContainerStyle}>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Avg Current</div>
          <div style={{ ...statValueStyle, color: STATUS_COLORS[avgCurrentStatus] }}>{avgI.toFixed(1)} A</div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Max Deviation</div>
          <div style={{ ...statValueStyle, color: STATUS_COLORS[maxDevStatus] }}>{maxDev.toFixed(1)} A</div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Current Imbalance %</div>
          <div style={{ ...statValueStyle, color: STATUS_COLORS[maxDevPctStatus] }}>{maxDevPct.toFixed(2)}%</div>
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
};

// Styles for the new summary section
const summaryContainerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  padding: '16px',
  margin: '0 20px 20px 20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0'
};
const statItemStyle = { textAlign: 'center' };
const statLabelStyle = { color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' };
const statValueStyle = { fontSize: '1.5rem', fontWeight: 'bold' };

export default CurrentBarChartModal;
