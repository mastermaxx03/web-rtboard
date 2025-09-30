import React from 'react';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #E2E8F0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  metricName: {
    width: '100px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#334155',
    flexShrink: 0
  },
  rightColumn: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  valueRow: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'left'
  },
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  delta: {
    fontSize: '0.875rem',
    color: '#64748B'
  },
  trendIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.875rem',
    fontWeight: '500'
  }
};

const TrendIndicator = ({ current, previous }) => {
  if (previous === null || current === previous || previous === 0) {
    return null;
  }
  const change = current - previous;
  const percentageChange = (change / previous) * 100;
  const isIncrease = change > 0;
  const color = isIncrease ? '#ef4444' : '#22c55e';
  const arrow = isIncrease ? '▲' : '▼';
  return (
    <div style={{ ...styles.trendIndicator, color }}>
      <span>{arrow}</span>
      <span>{Math.abs(percentageChange).toFixed(2)}%</span>
    </div>
  );
};

export default function MetricRow({ name, value, unit, delta, previousValue }) {
  const formattedValue = value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const formattedDelta = delta.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const deltaSign = delta >= 0 ? '+' : '';

  return (
    <div style={styles.container}>
      <div style={styles.metricName}>{name}</div>
      <div style={styles.rightColumn}>
        <div style={styles.valueRow}>
          {formattedValue} {unit}
        </div>
        <div style={styles.trendRow}>
          <div style={styles.delta}>
            Δ {deltaSign}
            {formattedDelta}
          </div>
          <TrendIndicator current={value} previous={previousValue} />
        </div>
      </div>
    </div>
  );
}
