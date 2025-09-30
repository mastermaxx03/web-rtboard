// import React, { useState, useEffect } from 'react';
// import TotalPowerHistoryChartX from './TotalPowerHistoryChartX';

// // This function now prepares all data needed for the enhanced chart
// const simulateHistoricalPowerData = () => {
//   const data = [];
//   const contractDemand = 160; // The 100% Contract Demand threshold
//   const seventyFivePercentDemand = contractDemand * 0.75; // The 75% threshold

//   let maxKvaValue = 0;
//   let maxKvaTime = '';

//   // First pass: generate raw data and find the max KVA
//   for (let i = 0; i < 24; i++) {
//     const time = `${String(i).padStart(2, '0')}:00`;
//     const kw = +(100 + Math.random() * 50).toFixed(2);
//     const kvar = +(20 + Math.random() * 30).toFixed(2);
//     const kva = +(kw + Math.random() * 45).toFixed(2); // Increased variance to make peaks more likely

//     data.push({ time, kva, kw, kvar });

//     if (kva > maxKvaValue) {
//       maxKvaValue = kva;
//       maxKvaTime = time;
//     }
//   }

//   // Second pass: format the data for the chart, adding the highlight style
//   const chartData = data.map((item) => {
//     // For the KVA bar that is the maximum, add a special color
//     if (item.time === maxKvaTime) {
//       return {
//         ...item,
//         kva: {
//           value: item.kva,
//           itemStyle: {
//             color: '#FF7F50' // A prominent gold/yellow for the highlight
//           }
//         }
//       };
//     }
//     return item;
//   });

//   return { chartData, contractDemand, seventyFivePercentDemand };
// };

// const styles = {
//   container: { padding: '24px', fontFamily: 'sans-serif' },
//   header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
//   title: { fontSize: '1.5rem', fontWeight: 'bold' },
//   controls: { display: 'flex', gap: '8px' },
//   chartContainer: { width: '100%', height: '400px', marginBottom: '40px' }
// };

// export default function RTW5H() {
//   const [chartData, setChartData] = useState([]);
//   const [contractDemand, setContractDemand] = useState(0);
//   const [seventyFivePercentDemand, setSeventyFivePercentDemand] = useState(0);

//   useEffect(() => {
//     const { chartData: newData, contractDemand, seventyFivePercentDemand } = simulateHistoricalPowerData();
//     setChartData(newData);
//     setContractDemand(contractDemand);
//     setSeventyFivePercentDemand(seventyFivePercentDemand);
//   }, []);

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <div style={styles.title}>TOTAL POWER CONSUMPTION - HISTORICAL PLOT</div>
//         <div style={styles.controls}>
//           <select>
//             <option>Last 24 Hours</option>
//           </select>
//           <input type="date" />
//           <input type="time" />
//         </div>
//       </div>

//       <div style={styles.chartContainer}>
//         {chartData.length > 0 ? (
//           <TotalPowerHistoryChartX data={chartData} contractDemand={contractDemand} seventyFivePercentDemand={seventyFivePercentDemand} />
//         ) : (
//           <p>Loading chart...</p>
//         )}
//       </div>

//       {/* --- This page now only contains the single chart --- */}
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import TotalPowerHistoryChartX from './TotalPowerHistoryChartX';

// This function now prepares all data needed for the enhanced chart
const simulateHistoricalPowerData = () => {
  const data = [];
  const contractDemand = 160;
  const seventyFivePercentDemand = contractDemand * 0.75;

  let maxKvaValue = 0;
  let maxKvaTime = '';

  // --- CHANGE: Added a base date for the simulation ---
  const baseDate = new Date(); // Use today's date as the base

  // First pass: generate raw data and find the max KVA
  for (let i = 0; i < 24; i++) {
    const time = `${String(i).padStart(2, '0')}:00`;

    // --- CHANGE: Create a full date object for each hour ---
    const currentDate = new Date(baseDate);
    currentDate.setHours(i, 0, 0, 0); // Set the hour for the current data point

    const kw = +(100 + Math.random() * 50).toFixed(2);
    const kvar = +(20 + Math.random() * 30).toFixed(2);
    const kva = +(kw + Math.random() * 45).toFixed(2);

    // --- CHANGE: Push the `fullDate` object into the data array ---
    data.push({ time, kva, kw, kvar, fullDate: currentDate });

    if (kva > maxKvaValue) {
      maxKvaValue = kva;
      maxKvaTime = time;
    }
  }

  // Second pass: format the data for the chart, adding the highlight style
  const chartData = data.map((item) => {
    if (item.time === maxKvaTime) {
      return {
        ...item,
        kva: {
          value: item.kva,
          itemStyle: {
            color: '#ffc107'
          }
        }
      };
    }
    return item;
  });

  return { chartData, contractDemand, seventyFivePercentDemand };
};

const styles = {
  container: { padding: '24px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '1.5rem', fontWeight: 'bold' },
  controls: { display: 'flex', gap: '8px' },
  chartContainer: { width: '100%', height: '400px', marginBottom: '40px' }
};

export default function RTW5H() {
  const [chartData, setChartData] = useState([]);
  const [contractDemand, setContractDemand] = useState(0);
  const [seventyFivePercentDemand, setSeventyFivePercentDemand] = useState(0);

  useEffect(() => {
    const { chartData: newData, contractDemand, seventyFivePercentDemand } = simulateHistoricalPowerData();
    setChartData(newData);
    setContractDemand(contractDemand);
    setSeventyFivePercentDemand(seventyFivePercentDemand);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>TOTAL POWER CONSUMPTION - HISTORICAL PLOT</div>
        <div style={styles.controls}>
          <select>
            <option>Last 24 Hours</option>
          </select>
          <input type="date" />
          <input type="time" />
        </div>
      </div>

      <div style={styles.chartContainer}>
        {chartData.length > 0 ? (
          <TotalPowerHistoryChartX data={chartData} contractDemand={contractDemand} seventyFivePercentDemand={seventyFivePercentDemand} />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>
    </div>
  );
}
