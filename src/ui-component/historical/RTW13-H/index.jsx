import React, { useState, useEffect } from 'react';
import { simulateAllChartData } from './services/dataSimulator';
// The component is now named InteractiveDashboard
import InteractiveDashboard from './components/InteractiveDashboard';

export default function RTW13H() {
  const [allChartData, setAllChartData] = useState(null);

  useEffect(() => {
    // Generate all data for the page when the component first loads
    setAllChartData(simulateAllChartData());
  }, []);

  const styles = {
    container: { padding: '24px', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    title: { fontSize: '1.5rem', fontWeight: 'bold' },
    controls: { display: 'flex', gap: '8px' }
  };

  if (!allChartData) {
    return <div>Loading page data...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>POWER ANALYSIS - HISTORICAL PLOT</div>
        <div style={styles.controls}>
          <select>
            <option>Last 24 Hours</option>
          </select>
          <input type="date" />
          <input type="time" />
        </div>
      </div>

      {/* The single dashboard component now handles all four charts.
        The separate sections are no longer needed.
      */}
      <InteractiveDashboard phaseData={allChartData.phaseData} imbalanceData={allChartData.imbalanceData} />
    </div>
  );
}
