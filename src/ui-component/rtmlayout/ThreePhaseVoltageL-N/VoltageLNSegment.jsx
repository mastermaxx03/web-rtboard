import React from 'react';
// --- CHANGE: Assuming a new, separate chart for the L-N segment ---
import PhasorChartSegLN from './PhasorChartSegLN'; 
import { Maximize } from 'lucide-react';

import { segmentCardStyle, expandIconStyle, segmentTitleStyle } from '../../../styles/commonStyles';


const styles = {
  segmentChartWrap: {
    flexGrow: 1
  }
};

// --- CHANGE: Component now accepts `data` and `onExpandClick` as props ---
export default function VoltageLNSegment({ data, onExpandClick }) {
  // --- REMOVED: All useState and useEffect logic has been removed ---

  return (
    <div style={segmentCardStyle}>
      <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      {/* --- CHANGE: Updated title --- */}
      <div style={segmentTitleStyle}>3-Phase Voltage L-N</div>

      <div style={styles.segmentChartWrap}>
        {/* --- CHANGE: Using data prop and new chart component --- */}
        <PhasorChartSegLN volts={data.phasorVolts} />
      </div>
    </div>
  );
}
