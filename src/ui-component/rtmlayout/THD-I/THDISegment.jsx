import React, { useState, useEffect } from 'react';
// We reuse the same ring chart component from the RTLoad folder
import THDIRingChart from './THDIRingChart';
import { Maximize } from 'lucide-react';
import { segmentTitleStyle, segmentCardStyle, expandIconStyle } from '../../../styles/commonStyles';

// ---- Styles ----
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },

  chartWrapper: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chart: {
    width: '100px',
    height: '100px'
  }
};

// ID: DB-THDS-EC-01
export default function THDISegment(props) {
  const { onExpand = () => {} } = props;

  const [thd, setThd] = useState(8); // Initial THD value

  useEffect(() => {
    const id = setInterval(() => {
      // Simulate a new THD value between 5% and 10%
      setThd(Math.round(5 + Math.random() * 5));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={segmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>THD-I%</div>
        <Maximize size={16} style={expandIconStyle} onClick={onExpand} />
      </div>
      <div style={styles.chartWrapper}>
        <div style={styles.chart}>
          {/* We use the same chart component, just pass it the THD value */}
          <THDIRingChart value={thd} />
        </div>
      </div>
    </div>
  );
}
