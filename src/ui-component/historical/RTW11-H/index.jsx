// import React, { useState, useEffect } from 'react';
// import { simulateThdData } from './services/dataSimulator';
// import DistortionChart from './components/DistortionChart';

// export default function RTW11H() {
//   const [focusedChart, setFocusedChart] = useState('ALL'); // 'ALL', 'THD-V', 'THD-I'
//   const [chartData, setChartData] = useState(null);

//   useEffect(() => {
//     setChartData(simulateThdData());
//   }, []);

//   const exitFocusView = () => setFocusedChart('ALL');

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === 'Escape') exitFocusView();
//     };
//     if (focusedChart !== 'ALL') window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [focusedChart]);

//   const styles = {
//     container: { padding: '24px', fontFamily: 'sans-serif' },
//     header: { marginBottom: '16px' },
//     title: { fontSize: '1.5rem', fontWeight: 'bold' },
//     dashboardView: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' },
//     focusView: { display: 'flex', flexDirection: 'column', gap: '16px' },
//     backButton: {
//       padding: '8px 16px',
//       fontSize: '1rem',
//       cursor: 'pointer',
//       alignSelf: 'flex-start',
//       borderRadius: '6px',
//       border: '1px solid #ccc',
//       backgroundColor: '#f0f0f0'
//     }
//   };

//   if (!chartData) {
//     return <div>Loading chart data...</div>;
//   }

//   if (focusedChart !== 'ALL') {
//     return (
//       <div style={{ ...styles.container, ...styles.focusView }}>
//         <button style={styles.backButton} onClick={exitFocusView}>
//           ← Back to Dashboard (or press Esc)
//         </button>
//         {focusedChart === 'THD-V' && <DistortionChart title="THD-V %" data={chartData.thdV} isFocused={true} />}
//         {focusedChart === 'THD-I' && <DistortionChart title="THD-I %" data={chartData.thdI} isFocused={true} />}
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <div style={styles.title}>TOTAL HARMONIC DISTORTION (THD) - HISTORICAL</div>
//       </div>
//       <div style={styles.dashboardView}>
//         <DistortionChart title="THD-V %" data={chartData.thdV} isFocused={false} onChartClick={() => setFocusedChart('THD-V')} />
//         <DistortionChart title="THD-I %" data={chartData.thdI} isFocused={false} onChartClick={() => setFocusedChart('THD-I')} />
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { simulateThdData } from './services/dataSimulator';
import DistortionChart from './components/DistortionChart';

export default function RTW11H() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    setChartData(simulateThdData());
  }, []);

  const styles = {
    container: { padding: '24px', fontFamily: 'sans-serif' },
    header: { marginBottom: '16px' },
    title: { fontSize: '1.5rem', fontWeight: 'bold' },
    // A new style to create space between the vertically stacked charts
    chartWrapper: {
      marginBottom: '32px' // This adds space below each chart
    }
  };

  if (!chartData) {
    return <div>Loading chart data...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>TOTAL HARMONIC DISTORTION (THD) - HISTORICAL</div>
      </div>

      {/* The charts are now stacked vertically in simple divs */}
      <div style={styles.chartWrapper}>
        <DistortionChart title="THD-V %" data={chartData.thdV} />
      </div>

      <div style={styles.chartWrapper}>
        <DistortionChart title="THD-I %" data={chartData.thdI} />
      </div>
    </div>
  );
}
