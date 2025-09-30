import React, { useState } from 'react';
import { Maximize, AlertTriangle, Siren, CheckCircle2 } from 'lucide-react';
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
    width: '98%',
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
    fontWeight: 'bold' // CHANGED: Removed margin
  },
  // ADDED: New style for the flex container
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
    height: '16px' // Reserve space to prevent layout shift
  }
};

// --- Configuration & Helpers (No changes here) ---
const THRESHOLDS = {
  voltageImbalance: { acceptable: { max: 1.0 }, warning: { max: 3.0 }, critical: { min: 3.0 } },
  averageVoltage: {
    acceptable: { min: 410, max: 420 },
    warning_low: { min: 400, max: 410 },
    warning_high: { min: 420, max: 430 },
    critical_low: { max: 400 },
    critical_high: { min: 430 }
  }
};
const STATUS_COLORS = { acceptable: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };
const getImbalanceStatus = (value) => {
  if (value <= THRESHOLDS.voltageImbalance.acceptable.max) return 'acceptable';
  if (value <= THRESHOLDS.voltageImbalance.warning.max) return 'warning';
  return 'critical';
};
const getAvgVoltageStatus = (value) => {
  if (value >= THRESHOLDS.averageVoltage.acceptable.min && value <= THRESHOLDS.averageVoltage.acceptable.max) return 'acceptable';
  if (
    (value >= THRESHOLDS.averageVoltage.warning_low.min && value < THRESHOLDS.averageVoltage.warning_low.max) ||
    (value > THRESHOLDS.averageVoltage.warning_high.min && value <= THRESHOLDS.averageVoltage.warning_high.max)
  )
    return 'warning';
  return 'critical';
};

// --- Sub-components (StatBlock is changed) ---

const TrendIndicator = ({ current, previous }) => {
  if (previous === null || previous === undefined || current === previous || previous === 0) {
    return <div style={styles.trendIndicator}></div>;
  }
  const change = current - previous;
  const percentageChange = (change / previous) * 100;
  const isIncrease = change > 0;
  const color = isIncrease ? '#ef4444' : '#22c55e';
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

  // This version uses the cleaner lucide-react icons
  const STATUS_CONFIG = {
    acceptable: {
      bgColor: '#22c55e',
      icon: <CheckCircle2 size={12} strokeWidth={3} />
    },
    warning: {
      bgColor: '#f59e0b',
      icon: <AlertTriangle size={12} strokeWidth={2.5} />
    },
    critical: {
      bgColor: '#ef4444',
      icon: <Siren size={12} strokeWidth={2.5} /> // Using Siren for critical as in your other component
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

// --- The Main Integrated Component (No changes here) ---
export default function VoltageSegment({ data, onExpandClick }) {
  if (!data || data.v_avg === undefined) {
    return (
      <Card title="3-Phase Voltage L-L">
        <div style={styles.loadingText}>Loading...</div>
      </Card>
    );
  }
  const imbalanceStatus = getImbalanceStatus(data.imbalance);
  const avgVoltageStatus = getAvgVoltageStatus(data.v_avg);
  const statusLevels = { acceptable: 0, warning: 1, critical: 2 };
  const overallStatus = statusLevels[imbalanceStatus] > statusLevels[avgVoltageStatus] ? imbalanceStatus : avgVoltageStatus;
  const tooltipText = `Vry: ${data.vry}V | Vyb: ${data.vyb}V | Vbr: ${data.vbr}V`;
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const statusTooltipText = `Average Voltage: ${capitalize(avgVoltageStatus)}\nVoltage Imbalance: ${capitalize(imbalanceStatus)}`;
  const headerControls = (
    <>
      <StatusIndicator status={overallStatus} tooltipText={statusTooltipText} />
      <Maximize size={16} style={{ cursor: 'pointer', color: '#64748B' }} onClick={onExpandClick} />
    </>
  );
  return (
    <Card title="3-Phase Voltage L-L" headerControls={headerControls}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
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
