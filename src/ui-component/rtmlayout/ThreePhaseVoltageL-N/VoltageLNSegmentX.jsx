import React, { useState } from 'react';
import { Maximize } from 'lucide-react';

// --- Style Definitions (No Tailwind CSS) ---
const styles = {
  segmentCard: {
    backgroundColor: '#FFFFFF',
    padding: '1rem',
    borderRadius: '0.75rem',
    border: '1px solid #000',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    position: 'relative',
    justifyContent: 'space-between'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1E293B'
  },
  headerIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  expandIcon: {
    cursor: 'pointer',
    color: '#64748B'
  },
  body: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingTop: '0.5rem'
  },
  divider: {
    height: '1px',
    backgroundColor: '#E2E8F0',
    margin: '0.5rem 0'
  },
  loadingText: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748B'
  },
  statBlock: {
    textAlign: 'center'
  },
  statTitle: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0.25rem 0'
  },
  statusIndicatorContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  tooltip: {
    visibility: 'hidden',
    width: '160px',
    backgroundColor: '#334155',
    color: '#fff',
    textAlign: 'center',
    borderRadius: '6px',
    padding: '8px',
    position: 'absolute',
    zIndex: 1,
    top: '140%',
    left: '50%',
    marginLeft: '-80px',
    opacity: 0,
    transition: 'opacity 0.2s',
    whiteSpace: 'pre-line'
  },
  tooltipVisible: {
    visibility: 'visible',
    opacity: 1
  }
};

// --- Configuration & Helpers for L-N Voltage ---
const THRESHOLDS_LN = {
  voltageImbalance: { acceptable: { max: 1.0 }, warning: { max: 3.0 }, critical: { min: 3.0 } },
  averageVoltage: {
    acceptable: { min: 220, max: 240 },
    warning_low: { min: 210, max: 220 },
    warning_high: { min: 240, max: 250 },
    critical_low: { max: 210 },
    critical_high: { min: 250 }
  }
};

const STATUS_COLORS = {
  acceptable: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444'
};
const STATUS_BG_COLORS = {
  acceptable: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444'
};

const getImbalanceStatus = (value) => {
  if (value <= THRESHOLDS_LN.voltageImbalance.acceptable.max) return 'acceptable';
  if (value <= THRESHOLDS_LN.voltageImbalance.warning.max) return 'warning';
  return 'critical';
};

const getAvgVoltageStatus = (value) => {
  if (value >= THRESHOLDS_LN.averageVoltage.acceptable.min && value <= THRESHOLDS_LN.averageVoltage.acceptable.max) return 'acceptable';
  if (
    (value >= THRESHOLDS_LN.averageVoltage.warning_low.min && value < THRESHOLDS_LN.averageVoltage.warning_low.max) ||
    (value > THRESHOLDS_LN.averageVoltage.warning_high.min && value <= THRESHOLDS_LN.averageVoltage.warning_high.max)
  )
    return 'warning';
  return 'critical';
};

// --- Sub-components (Using Inline Styles) ---
const StatBlock = ({ title, currentValue, unit, status }) => {
  const valueStyle = {
    ...styles.statValue,
    color: STATUS_COLORS[status] || '#1E293B'
  };

  return (
    <div style={styles.statBlock}>
      <h3 style={styles.statTitle}>{title}</h3>
      <p style={valueStyle}>
        {currentValue.toFixed(1)}
        {unit}
      </p>
    </div>
  );
};

const StatusIndicator = ({ status, tooltipText }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const icon = { acceptable: '✓', warning: '!', critical: '✕' }[status];
  const indicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: STATUS_BG_COLORS[status] || '#64748B',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const combinedTooltipStyle = isTooltipVisible ? { ...styles.tooltip, ...styles.tooltipVisible } : styles.tooltip;

  return (
    <div
      style={styles.statusIndicatorContainer}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      <div style={indicatorStyle}>{icon}</div>
      <span style={combinedTooltipStyle}>{tooltipText}</span>
    </div>
  );
};

// --- The Main Integrated Component ---
export default function VoltageLNSegment({ data, onExpandClick }) {
  if (!data || data.v_avg === undefined) {
    return (
      <div style={styles.segmentCard}>
        <div style={styles.title}>3-Phase Voltage L-N</div>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  const imbalanceStatus = getImbalanceStatus(data.imbalance);
  const avgVoltageStatus = getAvgVoltageStatus(data.v_avg);

  const statusLevels = { acceptable: 0, warning: 1, critical: 2 };
  const overallStatus = statusLevels[imbalanceStatus] > statusLevels[avgVoltageStatus] ? imbalanceStatus : avgVoltageStatus;

  const tooltipText = `VRN: ${data.vrn}V | VYN: ${data.vyn}V | VBN: ${data.vbn}V`;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const statusTooltipText = `Average Voltage: ${capitalize(avgVoltageStatus)}\nVoltage Imbalance: ${capitalize(imbalanceStatus)}`;

  return (
    <div style={styles.segmentCard} title={tooltipText}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>3-Phase Voltage L-N</h2>
        <div style={styles.headerIcons}>
          <StatusIndicator status={overallStatus} tooltipText={statusTooltipText} />
          <Maximize size={16} style={styles.expandIcon} onClick={onExpandClick} />
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <StatBlock title="Average Voltage" currentValue={data.v_avg} unit=" V" status={avgVoltageStatus} />
        <div style={styles.divider} />
        <StatBlock title="Voltage Imbalance" currentValue={data.imbalance} unit="%" status={imbalanceStatus} />
      </div>
    </div>
  );
}
