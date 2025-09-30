import React from 'react';
import { Maximize } from 'lucide-react';
import { segmentCardStyle, expandIconStyle, segmentTitleStyle } from '../../../styles/commonStyles';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  contentWrap: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    marginTop: '16px'
  },
  group: {
    marginBottom: '16px'
  },
  groupTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748B',
    marginBottom: '8px',
    textTransform: 'uppercase'
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  barRow: {
    height: '28px',
    borderRadius: '4px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#F1F5F9' // Add a faint track background
  },
  barInner: {
    height: '90%',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  },
  barLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 10px',
    fontSize: '0.8rem',
    fontWeight: '600'
  }
};

// A small, reusable component for each bar
const BarRow = ({ label, value, unit, barPercentage, barColor, textColor = '#000' }) => {
  return (
    <div style={styles.barRow}>
      <div style={{ ...styles.barInner, width: `${barPercentage}%`, background: barColor }}>
        <div style={{ ...styles.barLabel, color: textColor }}>
          <span>{label}</span>
          <span>
            {value.toFixed(1)} {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

// New component for the status-based imbalance bars
const ImbalanceBar = ({ label, value, unit, baseColor }) => {
  // Determine color based on value: < 5% is good, 5-10% is warning, > 10% is critical
  const statusColor = value < 5 ? '#22C55E' : value < 10 ? '#F59E0B' : '#EF4444';
  const textColor = value < 5 ? '#000' : '#1E293B'; // Darker text for lighter yellow bg

  return (
    <div style={styles.barRow}>
      {/* The inner bar now has a fixed width and status-based color */}
      <div style={{ ...styles.barInner, width: '60%', background: statusColor }}>
        <div style={{ ...styles.barLabel, color: textColor }}>
          <span>{label}</span>
          <span>
            {value.toFixed(1)} {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function TotalPowerSegment({ data, onExpandClick = () => {} }) {
  const { totalKva = 0, kvaImbalance = 0, totalKw = 0, kwImbalance = 0 } = data || {};

  // Power bars are still scaled relative to the max power (kVA)
  const kwBarPercentage = totalKva > 0 ? (totalKw / totalKva) * 100 : 0;

  // Define base colors as requested
  const kvaColor = '#CCCCFF'; // Gray
  const kwColor = '#D0F0C0'; // Blue

  return (
    <div style={segmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>Total Power Consumption</div>
        <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      </div>

      <div style={styles.contentWrap}>
        <div style={styles.group}>
          <div style={styles.groupTitle}>Power</div>
          <div style={styles.barContainer}>
            <BarRow label="Total kVA" value={totalKva} unit="kVA" barPercentage={100} barColor={kvaColor} />
            <BarRow label="Total kW" value={totalKw} unit="kW" barPercentage={kwBarPercentage} barColor={kwColor} />
          </div>
        </div>

        <div style={styles.group}>
          <div style={styles.groupTitle}>Imbalance</div>
          <div style={styles.barContainer}>
            {/* CHANGED: Using the new ImbalanceBar component */}
            <ImbalanceBar label="kVA Imbalance" value={kvaImbalance} unit="%" baseColor={kvaColor} />
            <ImbalanceBar label="kW Imbalance" value={kwImbalance} unit="%" baseColor={kwColor} />
          </div>
        </div>
      </div>
    </div>
  );
}
