import React from 'react';
import THDVRingChart from './THDVRingChart'; // Reusing the same chart component

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

export default function THDISegment({ data }) {
  const thdValue = data ? data.percentage : 0;

  return (
    <div style={styles.chartWrapper}>
      <div style={styles.chart}>
        <THDVRingChart value={thdValue.toFixed(2)} />
      </div>
    </div>
  );
}
