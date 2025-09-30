import React from 'react';
import PowerConsumptionChart from './PowerConsumptionChart'; // Import the chart
import { Maximize } from 'lucide-react';
import { segmentCardStyle, expandIconStyle, segmentTitleStyle } from '../../../styles/commonStyles';

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
    minHeight: '200px' // Allows the chart to fill the vertical space
  }
};

// --- THIS IS THE REFACTORED COMPONENT ---
export default function PowerConsumptionSegment({ data, onExpandClick }) {
  // --- REMOVED: All internal useState and useEffect logic ---

  return (
    <div style={segmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>Power Consp (ph wire)</div>
        {/* --- CHANGE: onClick is now wired up to the onExpandClick prop --- */}
        <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      </div>
      <div style={styles.chartWrapper}>
        {/* --- CHANGE: The chart now receives its data from the `data` prop --- */}
        <PowerConsumptionChart data={data.phases} />
      </div>
    </div>
  );
}
