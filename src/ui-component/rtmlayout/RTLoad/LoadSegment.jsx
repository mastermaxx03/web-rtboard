// }import React from 'react';
// --- CHANGE: Import the reusable GaugeChart ---
import GaugeChart from '../Harmonics/GaugeChart';
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

// --- CHANGE: Updated to accept `data` and `onExpandClick` and remove internal state ---
export default function LoadSegment({ data, onExpandClick = () => {} }) {
  return (
    <div style={segmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>RT LOAD %</div>
        {/* --- CHANGE: Use the correct onExpandClick prop --- */}
        <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      </div>
      <div style={styles.chartWrapper}>
        <div style={styles.chart}>
          {/* --- CHANGE: Use GaugeChart and pass data from props --- */}
          <GaugeChart
            name="RT Load"
            value={data ? data.percentage : 0}
            color="#91CC75" // Green color to match the original design
          />
        </div>
      </div>
    </div>
  );
}
