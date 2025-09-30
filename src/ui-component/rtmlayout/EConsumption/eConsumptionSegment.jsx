import React from 'react';
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
  mainContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px'
  },
  primaryValue: {
    fontSize: '2rem', // 32px
    fontWeight: 'bold',
    color: '#1a73e8'
  },
  secondaryValue: {
    fontSize: '1rem', // 16px
    color: '#5f6368'
  }
};

// ID: DB-ECS-01
// CHANGE: Destructure the 'data' prop and rename onExpand for consistency
export default function EnergyConsumptionSegment({ data, onExpandClick }) {
  // DELETED: Removed the local useState and useEffect for data simulation.
  // The component is now "dumb" and just displays the data it receives.

  // CHANGE: Use the destructured values from the 'data' prop.
  // Provide default values to prevent errors if data is not yet available.
  const { totalKWH = 0, totalKVAh = 0, totalKVARh = 0 } = data || {};

  return (
    <div style={segmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>Energy Consumption</div>
        {/* CHANGE: Use the renamed onExpandClick prop */}
        <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      </div>
      <div style={styles.mainContent}>
        <div style={styles.primaryValue}>{totalKWH.toFixed(1)} kWh</div>
        <div style={styles.secondaryValue}>
          {totalKVAh.toFixed(1)} KVAh / {totalKVARh.toFixed(1)} KVArh
        </div>
      </div>
    </div>
  );
}
