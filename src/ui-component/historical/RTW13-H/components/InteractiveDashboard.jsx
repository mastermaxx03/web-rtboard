// // import React, { useState, useEffect } from 'react';
// // import PhaseChart from './PhaseChart';
// // import ImbalanceChart from './ImbalanceChart';
// // import MetricComparisonChart from './MetricComparisonChart'; // Import the new component

// // const InteractiveDashboard = ({ phaseData, imbalanceData }) => {
// //   // Set the default view to 'PARAMETER'
// //   const [viewMode, setViewMode] = useState('PARAMETER'); // 'PHASE' or 'PARAMETER'
// //   const [focusedChart, setFocusedChart] = useState('ALL');
// //   const [resetKey, setResetKey] = useState(0);

// //   const exitFocusView = () => {
// //     setFocusedChart('ALL');
// //     setResetKey(prevKey => prevKey + 1);
// //   };

// //   useEffect(() => {
// //     const handleKeyDown = (event) => {
// //       if (event.key === 'Escape') exitFocusView();
// //     };
// //     if (focusedChart !== 'ALL') window.addEventListener('keydown', handleKeyDown);
// //     return () => window.removeEventListener('keydown', handleKeyDown);
// //   }, [focusedChart]);

// //   const styles = {
// //     // ... styles for dashboardView, focusView, backButton ...
// //     dashboardView: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' },
// //     focusView: { display: 'flex', flexDirection: 'column', gap: '16px' },
// //     backButton: { padding: '8px 16px', fontSize: '1rem', cursor: 'pointer', alignSelf: 'flex-start', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' },
// //     // Styles for the new view switcher
// //     viewSwitcher: { display: 'flex', justifyContent: 'center', marginBottom: '24px', gap: '4px' },
// //     switchButton: { padding: '10px 20px', fontSize: '1rem', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#f9f9f9' },
// //     activeButton: { backgroundColor: '#3b82f6', color: 'white', border: '1px solid #3b82f6' },
// //   };

// //   if (focusedChart !== 'ALL') {
// //     // --- FOCUS VIEW RENDER ---
// //     return (
// //       <div style={styles.focusView}>
// //         <button style={styles.backButton} onClick={exitFocusView}>← Back to Dashboard (or press Esc)</button>
// //         {focusedChart === 'R' && <PhaseChart phaseName="R" data={phaseData.R} isFocused={true} />}
// //         {focusedChart === 'Y' && <PhaseChart phaseName="Y" data={phaseData.Y} isFocused={true} />}
// //         {focusedChart === 'B' && <PhaseChart phaseName="B" data={phaseData.B} isFocused={true} />}
// //         {focusedChart === 'IMBALANCE' && <ImbalanceChart data={imbalanceData} isFocused={true} />}
// //         {focusedChart === 'KW' && <MetricComparisonChart title="Real Power (kW) Comparison" metricKey="kw" phaseData={phaseData} isFocused={true} />}
// //         {focusedChart === 'KVA' && <MetricComparisonChart title="Apparent Power (kVA) Comparison" metricKey="kva" phaseData={phaseData} isFocused={true} />}
// //         {focusedChart === 'KVAR' && <MetricComparisonChart title="Reactive Power (kVAr) Comparison" metricKey="kvar" phaseData={phaseData} isFocused={true} />}
// //       </div>
// //     );
// //   }

// //   // --- DASHBOARD VIEW RENDER ---
// //   return (
// //     <div>
// //       <div style={styles.viewSwitcher}>
// //         <button
// //           style={{ ...styles.switchButton, ...(viewMode === 'PHASE' ? styles.activeButton : {}) }}
// //           onClick={() => setViewMode('PHASE')}
// //         >
// //           Phase View
// //         </button>
// //         <button
// //           style={{ ...styles.switchButton, ...(viewMode === 'PARAMETER' ? styles.activeButton : {}) }}
// //           onClick={() => setViewMode('PARAMETER')}
// //         >
// //           Parameter View
// //         </button>
// //       </div>

// //       <div style={styles.dashboardView}>
// //         {viewMode === 'PHASE' && (
// //           <>
// //             <PhaseChart key={`r-chart-${resetKey}`} phaseName="R" data={phaseData.R} isFocused={false} onChartClick={() => setFocusedChart('R')} />
// //             <PhaseChart key={`y-chart-${resetKey}`} phaseName="Y" data={phaseData.Y} isFocused={false} onChartClick={() => setFocusedChart('Y')} />
// //             <PhaseChart key={`b-chart-${resetKey}`} phaseName="B" data={phaseData.B} isFocused={false} onChartClick={() => setFocusedChart('B')} />
// //           </>
// //         )}
// //         {viewMode === 'PARAMETER' && (
// //           <>
// //             <MetricComparisonChart key={`kw-chart-${resetKey}`} title="Real Power (kW) Comparison" metricKey="kw" phaseData={phaseData} isFocused={false} onChartClick={() => setFocusedChart('KW')} />
// //             <MetricComparisonChart key={`kva-chart-${resetKey}`} title="Apparent Power (kVA) Comparison" metricKey="kva" phaseData={phaseData} isFocused={false} onChartClick={() => setFocusedChart('KVA')} />
// //             <MetricComparisonChart key={`kvar-chart-${resetKey}`} title="Reactive Power (kVAr) Comparison" metricKey="kvar" phaseData={phaseData} isFocused={false} onChartClick={() => setFocusedChart('KVAR')} />
// //           </>
// //         )}
// //         {/* The Imbalance Chart is always visible */}
// //         <ImbalanceChart key={`imbalance-chart-${resetKey}`} data={imbalanceData} isFocused={false} onChartClick={() => setFocusedChart('IMBALANCE')} />
// //       </div>
// //     </div>
// //   );
// // };

// // export default InteractiveDashboard;
// import React, { useState, useEffect } from 'react';
// import PhaseChart from './PhaseChart';
// import ImbalanceChart from './ImbalanceHistoryChart';
// import MetricComparisonChart from './MetricComparisonChart'; // Import the new component

// const InteractiveDashboard = ({ phaseData, imbalanceData }) => {
//   // Set the default view to 'PARAMETER'
//   const [viewMode, setViewMode] = useState('PARAMETER'); // 'PHASE' or 'PARAMETER'
//   const [focusedChart, setFocusedChart] = useState('ALL');
//   const [resetKey, setResetKey] = useState(0);

//   const exitFocusView = () => {
//     setFocusedChart('ALL');
//     setResetKey((prevKey) => prevKey + 1);
//   };

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === 'Escape') exitFocusView();
//     };
//     if (focusedChart !== 'ALL') window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [focusedChart]);

//   const styles = {
//     // ... styles for dashboardView, focusView, backButton ...
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
//     },
//     // Styles for the new view switcher
//     viewSwitcher: { display: 'flex', justifyContent: 'center', marginBottom: '24px', gap: '4px' },
//     switchButton: { padding: '10px 20px', fontSize: '1rem', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#f9f9f9' },
//     activeButton: { backgroundColor: '#3b82f6', color: 'white', border: '1px solid #3b82f6' }
//   };

//   if (focusedChart !== 'ALL') {
//     // --- FOCUS VIEW RENDER ---
//     return (
//       <div style={styles.focusView}>
//         <button style={styles.backButton} onClick={exitFocusView}>
//           ← Back to Dashboard (or press Esc)
//         </button>
//         {focusedChart === 'R' && <PhaseChart phaseName="R" data={phaseData.R} isFocused={true} />}
//         {focusedChart === 'Y' && <PhaseChart phaseName="Y" data={phaseData.Y} isFocused={true} />}
//         {focusedChart === 'B' && <PhaseChart phaseName="B" data={phaseData.B} isFocused={true} />}
//         {focusedChart === 'IMBALANCE' && <ImbalanceChart data={imbalanceData} isFocused={true} />}
//         {focusedChart === 'KW' && (
//           <MetricComparisonChart title="Real Power (kW) Comparison" metricKey="kw" phaseData={phaseData} isFocused={true} />
//         )}
//         {focusedChart === 'KVA' && (
//           <MetricComparisonChart title="Apparent Power (kVA) Comparison" metricKey="kva" phaseData={phaseData} isFocused={true} />
//         )}
//         {focusedChart === 'KVAR' && (
//           <MetricComparisonChart title="Reactive Power (kVAr) Comparison" metricKey="kvar" phaseData={phaseData} isFocused={true} />
//         )}
//       </div>
//     );
//   }

//   // --- DASHBOARD VIEW RENDER ---
//   return (
//     <div>
//       <div style={styles.viewSwitcher}>
//         <button
//           style={{ ...styles.switchButton, ...(viewMode === 'PHASE' ? styles.activeButton : {}) }}
//           onClick={() => setViewMode('PHASE')}
//         >
//           Phase View
//         </button>
//         <button
//           style={{ ...styles.switchButton, ...(viewMode === 'PARAMETER' ? styles.activeButton : {}) }}
//           onClick={() => setViewMode('PARAMETER')}
//         >
//           Parameter View
//         </button>
//       </div>

//       <div style={styles.dashboardView}>
//         {viewMode === 'PHASE' && (
//           <>
//             <PhaseChart
//               key={`r-chart-${resetKey}`}
//               phaseName="R"
//               data={phaseData.R}
//               isFocused={false}
//               onChartClick={() => setFocusedChart('R')}
//             />
//             <PhaseChart
//               key={`y-chart-${resetKey}`}
//               phaseName="Y"
//               data={phaseData.Y}
//               isFocused={false}
//               onChartClick={() => setFocusedChart('Y')}
//             />
//             <PhaseChart
//               key={`b-chart-${resetKey}`}
//               phaseName="B"
//               data={phaseData.B}
//               isFocused={false}
//               onChartClick={() => setFocusedChart('B')}
//             />
//           </>
//         )}
//         {viewMode === 'PARAMETER' && (
//           <>
//             <MetricComparisonChart
//               key={`kw-chart-${resetKey}`}
//               title="Real Power (kW) Comparison"
//               metricKey="kw"
//               phaseData={phaseData}
//               isFocused={false}
//               onChartClick={() => setFocusedChart('KW')}
//             />
//             <MetricComparisonChart
//               key={`kva-chart-${resetKey}`}
//               title="Apparent Power (kVA) Comparison"
//               metricKey="kva"
//               phaseData={phaseData}
//               isFocused={false}
//               onChartClick={() => setFocusedChart('KVA')}
//             />
//             <MetricComparisonChart
//               key={`kvar-chart-${resetKey}`}
//               title="Reactive Power (kVAr) Comparison"
//               metricKey="kvar"
//               phaseData={phaseData}
//               isFocused={false}
//               onChartClick={() => setFocusedChart('KVAR')}
//             />
//           </>
//         )}
//         {/* The Imbalance Chart is always visible */}
//         <ImbalanceChart
//           key={`imbalance-chart-${resetKey}`}
//           data={imbalanceData}
//           isFocused={false}
//           onChartClick={() => setFocusedChart('IMBALANCE')}
//         />
//       </div>
//     </div>
//   );
// };

// export default InteractiveDashboard;
import React, { useState, useEffect } from 'react';
import PhaseChart from './PhaseChart';
import ImbalanceChart from './ImbalanceHistoryChart';
import MetricComparisonChart from './MetricComparisonChart';

const InteractiveDashboard = ({ phaseData, imbalanceData }) => {
  const [viewMode, setViewMode] = useState('PARAMETER');
  const [focusedChart, setFocusedChart] = useState('ALL');
  const [resetKey, setResetKey] = useState(0);

  const exitFocusView = () => {
    setFocusedChart('ALL');
    setResetKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') exitFocusView();
    };
    if (focusedChart !== 'ALL') window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedChart]);

  const styles = {
    dashboardView: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' },
    focusView: { display: 'flex', flexDirection: 'column', gap: '16px' },
    backButton: {
      padding: '8px 16px',
      fontSize: '1rem',
      cursor: 'pointer',
      alignSelf: 'flex-start',
      borderRadius: '6px',
      border: '1px solid #ccc',
      backgroundColor: '#f0f0f0'
    },
    viewSwitcher: { display: 'flex', justifyContent: 'center', marginBottom: '24px', gap: '4px' },
    switchButton: { padding: '10px 20px', fontSize: '1rem', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#f9f9f9' },
    activeButton: { backgroundColor: '#3b82f6', color: 'white', border: '1px solid #3b82f6' }
  };

  if (focusedChart !== 'ALL') {
    return (
      <div style={styles.focusView}>
        <button style={styles.backButton} onClick={exitFocusView}>
          ← Back to Dashboard (or press Esc)
        </button>
        {focusedChart === 'R' && <PhaseChart phaseName="R" data={phaseData.R} isFocused={true} />}
        {focusedChart === 'Y' && <PhaseChart phaseName="Y" data={phaseData.Y} isFocused={true} />}
        {focusedChart === 'B' && <PhaseChart phaseName="B" data={phaseData.B} isFocused={true} />}
        {focusedChart === 'IMBALANCE' && <ImbalanceChart data={imbalanceData} isFocused={true} />}
        {focusedChart === 'KW' && (
          <MetricComparisonChart title="Real Power (kW) Comparison" metricKey="kw" phaseData={phaseData} isFocused={true} />
        )}
        {focusedChart === 'KVA' && (
          <MetricComparisonChart title="Apparent Power (kVA) Comparison" metricKey="kva" phaseData={phaseData} isFocused={true} />
        )}
        {focusedChart === 'KVAR' && (
          <MetricComparisonChart title="Reactive Power (kVAr) Comparison" metricKey="kvar" phaseData={phaseData} isFocused={true} />
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={styles.viewSwitcher}>
        <button
          style={{ ...styles.switchButton, ...(viewMode === 'PHASE' ? styles.activeButton : {}) }}
          onClick={() => setViewMode('PHASE')}
        >
          Phase View
        </button>
        <button
          style={{ ...styles.switchButton, ...(viewMode === 'PARAMETER' ? styles.activeButton : {}) }}
          onClick={() => setViewMode('PARAMETER')}
        >
          Parameter View
        </button>
      </div>
      <div style={styles.dashboardView}>
        {viewMode === 'PHASE' && (
          <>
            <PhaseChart
              key={`r-chart-${resetKey}`}
              phaseName="R"
              data={phaseData.R}
              isFocused={false}
              onChartClick={() => setFocusedChart('R')}
            />
            <PhaseChart
              key={`y-chart-${resetKey}`}
              phaseName="Y"
              data={phaseData.Y}
              isFocused={false}
              onChartClick={() => setFocusedChart('Y')}
            />
            <PhaseChart
              key={`b-chart-${resetKey}`}
              phaseName="B"
              data={phaseData.B}
              isFocused={false}
              onChartClick={() => setFocusedChart('B')}
            />
          </>
        )}
        {viewMode === 'PARAMETER' && (
          <>
            <MetricComparisonChart
              key={`kw-chart-${resetKey}`}
              title="Real Power (kW) Comparison"
              metricKey="kw"
              phaseData={phaseData}
              isFocused={false}
              onChartClick={() => setFocusedChart('KW')}
            />
            <MetricComparisonChart
              key={`kva-chart-${resetKey}`}
              title="Apparent Power (kVA) Comparison"
              metricKey="kva"
              phaseData={phaseData}
              isFocused={false}
              onChartClick={() => setFocusedChart('KVA')}
            />
            <MetricComparisonChart
              key={`kvar-chart-${resetKey}`}
              title="Reactive Power (kVAr) Comparison"
              metricKey="kvar"
              phaseData={phaseData}
              isFocused={false}
              onChartClick={() => setFocusedChart('KVAR')}
            />
          </>
        )}
        <ImbalanceChart
          key={`imbalance-chart-${resetKey}`}
          data={imbalanceData}
          isFocused={false}
          onChartClick={() => setFocusedChart('IMBALANCE')}
        />
      </div>
    </div>
  );
};

export default InteractiveDashboard;
