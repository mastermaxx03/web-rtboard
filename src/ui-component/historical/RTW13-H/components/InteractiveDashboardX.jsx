import React, { useState, useEffect } from 'react';
import MetricComparisonChart from './MetricComparisonChart';
// We need to import the data simulator directly for this test
import { simulateAllChartData } from '../services/dataSimulator';

// A radically simplified dashboard for testing purposes only.
const InteractiveDashboard = () => {
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    setTestData(simulateAllChartData());
  }, []);

  // This is the function we want to test. It just creates an alert.
  const handleTestClick = (chartName) => {
    alert(`Click received from ${chartName} chart!`);
  };

  const styles = {
    dashboardView: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
      gap: '24px'
    }
  };

  if (!testData) {
    return <div>Loading test...</div>;
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Minimal Test Page</h1>
      <p style={{ textAlign: 'center' }}>Click on any chart below to test the event handler.</p>
      <div style={styles.dashboardView}>
        <MetricComparisonChart
          title="Real Power (kW) Comparison"
          metricKey="kw"
          phaseData={testData.phaseData}
          onChartClick={() => handleTestClick('KW')}
        />
        <MetricComparisonChart
          title="Apparent Power (kVA) Comparison"
          metricKey="kva"
          phaseData={testData.phaseData}
          onChartClick={() => handleTestClick('KVA')}
        />
        <MetricComparisonChart
          title="Reactive Power (kVAr) Comparison"
          metricKey="kvar"
          phaseData={testData.phaseData}
          onChartClick={() => handleTestClick('KVAr')}
        />
      </div>
    </div>
  );
};

export default InteractiveDashboard;
