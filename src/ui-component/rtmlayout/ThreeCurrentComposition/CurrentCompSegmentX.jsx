import React, { useState } from 'react';
import { Maximize, AlertTriangle, Siren, CheckCircle2 } from 'lucide-react';
import { segmentCardStyle, segmentHeaderStyle, segmentTitleStyle, expandIconStyle } from '../../../styles/commonStyles';
import Card from '../../common/commonCard';
// --- STYLES for a compact and clean 2-column layout ---
const styles = {
  body: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: '8px',
    width: '100%'
  },
  statColumn: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 8px'
  },
  divider: {
    width: '1px',
    alignSelf: 'stretch',
    backgroundColor: '#E2E8F0'
  },
  statTitle: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    lineHeight: '1.1'
  },
  statUnit: {
    fontSize: '1rem',
    lineHeight: '1',
    fontWeight: '500'
  },
  trendIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.875rem'
  },
  // Styles for the StatusIndicator sub-component
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
const THRESHOLDS = {
  imbalance: { acceptable: { max: 2.0 }, warning: { max: 5.0 }, critical: { min: 5.0 } },
  // NOTE: Adjust these average current thresholds as needed for your system
  averageCurrent: {
    acceptable: { min: 2000, max: 2450 },
    warning: { min: 2450, max: 2500 },
    critical: { min: 2500 }
  }
};
const STATUS_COLORS = { acceptable: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };

const getImbalanceStatus = (value) => {
  if (value >= THRESHOLDS.imbalance.critical.min) return 'critical';
  if (value >= THRESHOLDS.imbalance.warning.max) return 'warning';
  return 'acceptable';
};
const getAvgCurrentStatus = (value) => {
  if (value >= THRESHOLDS.averageCurrent.critical.min) return 'critical';
  if (value >= THRESHOLDS.averageCurrent.warning.min) return 'warning';
  return 'acceptable';
};

// --- Helper TrendIndicator sub-component ---
const TrendIndicator = ({ current, previous, style, color }) => {
  if (previous === null || current === previous || previous === 0) {
    return <div style={{ ...style, height: '20px' }}></div>;
  }
  const change = current - previous;
  const percentageChange = (change / previous) * 100;
  const isIncrease = change > 0;
  const arrow = isIncrease ? '▲' : '▼';
  // Use the passed color for the trend
  return (
    <div style={{ ...style, color: color }}>
      <span>{arrow}</span>
      <span>{Math.abs(percentageChange).toFixed(1)}%</span>
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

// --- Main Component ---
export default function CurrentCompSegment({ data, onExpandClick }) {
  if (!data || data.avg_i === undefined || data.I_CURR_IMB === undefined) {
    return (
      <Card title="3PH Line Current">
        <div style={{ color: '#64748B' }}>Loading...</div>
      </Card>
    );
  }

  // --- All of your calculation logic is preserved ---

  // --- Status and Color Logic ---
  const imbalanceStatus = getImbalanceStatus(data.I_CURR_IMB);
  const avgCurrentStatus = getAvgCurrentStatus(data.avg_i);

  const statusLevels = { acceptable: 0, warning: 1, critical: 2 };
  const overallStatus = statusLevels[imbalanceStatus] > statusLevels[avgCurrentStatus] ? imbalanceStatus : avgCurrentStatus;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const statusTooltipText = `Average Current: ${capitalize(avgCurrentStatus)}\nCurrent Imbalance: ${capitalize(imbalanceStatus)}`;

  // --- CHANGED: Header controls now use the new logic ---
  const headerControls = (
    <>
      <StatusIndicator status={overallStatus} tooltipText={statusTooltipText} />
      <Maximize size={16} style={{ cursor: 'pointer', color: '#64748B' }} onClick={onExpandClick} />
    </>
  );
  return (
    <Card title="3PH Line Current" headerControls={headerControls}>
      <div style={styles.body}>
        <div style={styles.statColumn}>
          <div style={styles.statTitle}>Average Current</div>
          <div style={{ ...styles.statValue, color: STATUS_COLORS[avgCurrentStatus] }}>
            {data.avg_i.toFixed(1)}
            <span style={styles.statUnit}> A</span>
          </div>
          <TrendIndicator
            current={data.avg_i}
            previous={data.avg_i_previous}
            style={styles.trendIndicator}
            color={STATUS_COLORS[imbalanceStatus]}
          />
        </div>

        <div style={styles.divider} />

        <div style={styles.statColumn}>
          <div style={styles.statTitle}>Current Imbalance</div>
          <div style={{ ...styles.statValue, color: STATUS_COLORS[imbalanceStatus] }}>
            {data.I_CURR_IMB.toFixed(1)}
            <span style={styles.statUnit}>%</span>
          </div>
          <TrendIndicator current={data.I_CURR_IMB} previous={data.I_CURR_IMB_previous} style={styles.trendIndicator} />
        </div>
      </div>
    </Card>
  );
}
