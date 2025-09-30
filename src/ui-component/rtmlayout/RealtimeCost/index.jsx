import React from 'react';
import { Maximize } from 'lucide-react';
import { segmentCardStyle, expandIconStyle, segmentTitleStyle } from '../../../styles/commonStyles';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '6px',
    gap: '8px',

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  primaryValue: {
    fontSize: '1.70rem', // Larger font size
    fontWeight: 'bold',
    color: '#1a73e8' // Blue color for value
  },
  trendIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '1rem',
    fontWeight: '500'
  },
  // Simple CSS spinner
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};

const TrendIndicator = ({ current, previous }) => {
  if (previous === null || current === previous || previous === 0) {
    return null; // Don't show if data is incomplete
  }

  const change = current - previous;
  const percentageChange = (change / previous) * 100;
  const isIncrease = change > 0;
  const color = isIncrease ? '#ef4444' : '#22c55e'; // Red for up (cost increase), Green for down
  const arrow = isIncrease ? '▲' : '▼';

  return (
    <div style={{ ...styles.trendIndicator, color }}>
      <span>{arrow}</span>
      <span>{Math.abs(percentageChange).toFixed(1)}%</span>
    </div>
  );
};

export default function RealtimeCost({ data, isLoading, onExpandClick }) {
  // Add a simple keyframe for the spinner animation
  const styleSheet = document.styleSheets[0];
  if (styleSheet) {
    const keyframes = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    try {
      if (!Array.from(styleSheet.cssRules).some((rule) => rule.name === 'spin')) {
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
      }
    } catch (e) {
      console.error('Could not insert CSS keyframes', e);
    }
  }

  return (
    <div style={segmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>RT Cost</div>
        <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      </div>
      <div style={styles.content}>
        {isLoading ? (
          <div style={styles.spinner}></div>
        ) : (
          <>
            <div style={styles.primaryValue}>₹ {data.current.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            <TrendIndicator current={data.current} previous={data.previous} />
          </>
        )}
      </div>
    </div>
  );
}
