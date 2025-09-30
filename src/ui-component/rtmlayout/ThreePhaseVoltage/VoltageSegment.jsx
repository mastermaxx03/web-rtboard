// import React, { useState, useEffect } from 'react';
// import PhasorChartSeg from './PhasorChartSeg';
// import { Maximize } from 'lucide-react';

// import { segmentCardStyle, expandIconStyle, segmentTitleStyle } from '../../../styles/commonStyles';

// const styles = {
//   segmentChartWrap: {
//     flexGrow: 1
//   }
// };

// export default function VoltageSegment({ onExpandClick }) {
//   const [volts, setVolts] = useState([400, 450, 500]);

//   //  simulates real-time data updates
//   useEffect(() => {
//     const id = setInterval(() => {
//       // random voltage values for the demo
//       setVolts([0, 1, 2].map(() => +(300 + Math.random() * 300).toFixed(2)));
//     }, 7000);
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <div style={segmentCardStyle}>
//       <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
//       <div style={segmentTitleStyle}>3-Phase Voltage</div>

//       <div style={styles.segmentChartWrap}>
//         {/* Here we use our reusable PhasorChart component.
//           We pass the current voltage data down to it via the 'volts' prop.
//         */}
//         <PhasorChartSeg volts={volts} />
//       </div>
//     </div>
//   );
// }
import React from 'react';
import PhasorChartSeg from './PhasorChartSeg';
import { Maximize } from 'lucide-react';

import { segmentCardStyle, expandIconStyle, segmentTitleStyle } from '../../../styles/commonStyles';

const styles = {
  segmentChartWrap: {
    flexGrow: 1
  }
};

// --- CHANGE: Component now accepts `data` and `onExpandClick` as props ---
export default function VoltageSegment({ data, onExpandClick }) {
  // --- REMOVED: All useState and useEffect logic has been removed ---

  return (
    <div style={segmentCardStyle}>
      <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      <div style={segmentTitleStyle}>3-Phase Voltage</div>

      <div style={styles.segmentChartWrap}>
        {/* --- CHANGE: PhasorChart now receives its data from the `data` prop --- */}
        <PhasorChartSeg volts={data.phasorVolts} />
      </div>
    </div>
  );
}
