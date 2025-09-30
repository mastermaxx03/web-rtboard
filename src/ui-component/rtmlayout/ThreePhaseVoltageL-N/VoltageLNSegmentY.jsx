import React, { useState } from 'react';
import { Maximize } from 'lucide-react';
import Card from '../../common/commonCard';
// --- Style Definitions (No Tailwind CSS) ---
const styles = {
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: '0.5rem' // Use gap for spacing
  },
  divider: {
    height: '1px',
    backgroundColor: '#E2E8F0',
    width: '98%', // Make divider slightly smaller than the card
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
    fontWeight: 'bold'
  },
  valueWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0.1rem 0'
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
  },
  trendIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    height: '16px'
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

// ADDED: The TrendIndicator component
const TrendIndicator = ({ current, previous }) => {
  if (previous === null || previous === undefined || current === previous || previous === 0) {
    return <div style={styles.trendIndicator}></div>;
  }
  const change = current - previous;
  const percentageChange = (change / previous) * 100;
  const isIncrease = change > 0;
  const color = isIncrease ? '#ef4444' : '#22c55e'; // Red for up, Green for down
  const arrow = isIncrease ? '▲' : '▼';

  return (
    <div style={{ ...styles.trendIndicator, color: color }}>
      <span>{arrow}</span>
      <span>{Math.abs(percentageChange).toFixed(1)}%</span>
    </div>
  );
};

// CHANGED: This component is updated to use the new layout
const StatBlock = ({ title, currentValue, unit, status, previousValue }) => {
  const valueStyle = {
    ...styles.statValue,
    color: STATUS_COLORS[status] || '#1E293B'
  };

  return (
    <div style={styles.statBlock}>
      <h3 style={styles.statTitle}>{title}</h3>
      <div style={styles.valueWrapper}>
        <span style={valueStyle}>
          {currentValue.toFixed(1)}
          {unit}
        </span>
        <TrendIndicator current={currentValue} previous={previousValue} />
      </div>
    </div>
  );
};

const StatusIndicator = ({ status, tooltipText }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const STATUS_CONFIG = {
    acceptable: {
      bgColor: '#22c55e',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {' '}
          <path d="M20 6 9 17l-5-5" />{' '}
        </svg>
      )
    },
    warning: {
      bgColor: '#f59e0b',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {' '}
          <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /> <path d="M12 9v4" />{' '}
          <path d="M12 17h.01" />{' '}
        </svg>
      )
    },
    critical: {
      bgColor: '#ef4444',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {' '}
          <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /> <path d="M12 9v4" />{' '}
          <path d="M12 17h.01" />{' '}
        </svg>
      )
    }
  };
  const currentStatus = STATUS_CONFIG[status] || STATUS_CONFIG.warning;
  const indicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: currentStatus.bgColor,
    color: 'white',
    cursor: 'pointer'
  };
  const combinedTooltipStyle = isTooltipVisible ? { ...styles.tooltip, ...styles.tooltipVisible } : styles.tooltip;
  return (
    <div
      style={styles.statusIndicatorContainer}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      <div style={indicatorStyle}>{currentStatus.icon}</div>
      <span style={combinedTooltipStyle}>{tooltipText}</span>
    </div>
  );
};

// --- The Main Integrated Component ---
export default function VoltageLNSegment({ data, onExpandClick }) {
  if (!data || data.v_avg === undefined) {
    return (
      <Card title="3-Phase Voltage L-N">
        <div style={styles.loadingText}>Loading...</div>
      </Card>
    );
  }

  const imbalanceStatus = getImbalanceStatus(data.imbalance);
  const avgVoltageStatus = getAvgVoltageStatus(data.v_avg);

  const statusLevels = { acceptable: 0, warning: 1, critical: 2 };
  const overallStatus = statusLevels[imbalanceStatus] > statusLevels[avgVoltageStatus] ? imbalanceStatus : avgVoltageStatus;

  const tooltipText = `VRN: ${data.vrn}V | VYN: ${data.vyn}V | VBN: ${data.vbn}V`;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const statusTooltipText = `Average Voltage: ${capitalize(avgVoltageStatus)}\nVoltage Imbalance: ${capitalize(imbalanceStatus)}`;
  const headerControls = (
    <>
      <StatusIndicator status={overallStatus} tooltipText={statusTooltipText} />
      <Maximize size={16} style={{ cursor: 'pointer', color: '#64748B' }} onClick={onExpandClick} />
    </>
  );
  return (
    <Card title="3-Phase Voltage L-N" headerControls={headerControls}>
      <div style={styles.body}>
        <StatBlock
          title="Average Voltage"
          currentValue={data.v_avg}
          unit=" V"
          status={avgVoltageStatus}
          previousValue={data.v_avg_previous}
        />
        <div style={styles.divider} />
        <StatBlock
          title="Voltage Imbalance"
          currentValue={data.imbalance}
          unit="%"
          status={imbalanceStatus}
          previousValue={data.imbalance_previous}
        />
      </div>
    </Card>
  );
}
