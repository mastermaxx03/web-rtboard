import React, { useState, useEffect } from 'react';
import MaxDemandChart from './MaxDemandChart'; // Import the chart
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
    minHeight: '200px'
    // Allows the chart to fill the vertical space
  }
};

// ID: DB-MDS-EC-01
export default function MaxDemandSegment(props) {
  const { onExpand = () => {} } = props;

  // State for the power data
  const [demand, setDemand] = useState({
    kw: 85.5,
    kvar: 40.2,
    kva: 125.8
  });

  // Simulate real-time data updates
  useEffect(() => {
    const id = setInterval(() => {
      const newKw = 80 + Math.random() * 10;
      const newKvar = 35 + Math.random() * 10;
      const newKva = 120 + Math.random() * 10;

      setDemand({
        kw: +newKw.toFixed(1),
        kvar: +newKvar.toFixed(1),
        kva: +newKva.toFixed(1)
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={segmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>Max Demand</div>
        <Maximize size={16} style={expandIconStyle} onClick={onExpand} />
      </div>
      <div style={styles.chartWrapper}>
        <MaxDemandChart demand={demand} />
      </div>
    </div>
  );
}
