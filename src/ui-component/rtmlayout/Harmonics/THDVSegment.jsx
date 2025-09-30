import React from 'react';
import THDVRingChart from './THDVRingChart';

const styles = {
  chartWrapper: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100px' // Ensure a minimum height
  },
  chart: {
    width: '100px',
    height: '100px'
  }
};

export default function THDVSegment({ data }) {
  const thdValue = data ? data.percentage : 0;

  return (
    <div style={styles.chartWrapper}>
      <div style={styles.chart}>
        <THDVRingChart value={thdValue.toFixed(2)} />
      </div>
    </div>
  );
}
