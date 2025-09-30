// import React, { useState, useEffect } from 'react';
// import VoltageHistoryChart from './VoltageHistoryChart';
// import DeviationImbalanceChart from './DeviationImbalanceChart';

// const simulateApiData = () => {
//   const data = [];
//   const now = new Date();
//   const FULL_DAY_MINUTES = 24 * 60;

//   for (let i = 0; i < FULL_DAY_MINUTES; i++) {
//     const timestamp = new Date(now.getTime() - i * 60000);

//     const dailyCycleAngle = (i / FULL_DAY_MINUTES) * 2 * Math.PI;
//     const cycleModifier = Math.sin(dailyCycleAngle) * 20; // Increased modifier for more variance
//     const randomJitter = (Math.random() - 0.5) * 5;
//     let vr, vy, vb, independent_v_avg;
//     const hour = timestamp.getHours();

//     // --- CHANGE: Logic to set all voltages to 0 for specific hours ---
//     if (hour === 3 || hour === 10) {
//       // Set all values to 0 to create a break in both charts
//       vr = 0;
//       vy = 0;
//       vb = 0;
//       independent_v_avg = 0;
//     } else {
//       // Generate normal random values for all other times
//       vr = 350 + cycleModifier + randomJitter;
//       vy = 400 + cycleModifier + randomJitter * 1.2;
//       vb = 450 + cycleModifier + randomJitter * 0.8;
//       independent_v_avg = 400 + cycleModifier + (Math.random() - 0.5) * 15;
//     }

//     const maxDeviation = +(1 + Math.random() * 5).toFixed(2);
//     const voltageImbalance = +(1 + Math.random() * 4).toFixed(2);

//     data.push({
//       TS: timestamp.toISOString(),
//       VR: +vr.toFixed(2),
//       VY: +vy.toFixed(2),
//       VB: +vb.toFixed(2),
//       // --- CHANGE: Add the new independent v_avg to the data payload ---
//       V_AVG: +independent_v_avg.toFixed(2),
//       maxDeviation: maxDeviation,
//       voltageImbalance: voltageImbalance
//     });
//   }
//   return { data: data.reverse() };
// };

// const processDataForTopChart = (apiData) => {
//   if (!apiData || apiData.length === 0) return [];
//   const hourlyData = {};
//   apiData.forEach((item) => {
//     const hour = new Date(item.TS).getHours();
//     // --- CHANGE: Prepare to collect the v_avg values for each hour ---
//     if (!hourlyData[hour]) hourlyData[hour] = { vrs: [], vys: [], vbs: [], v_avgs: [] };
//     hourlyData[hour].vrs.push(item.VR);
//     hourlyData[hour].vys.push(item.VY);
//     hourlyData[hour].vbs.push(item.VB);
//     // --- CHANGE: Collect the raw v_avg values ---
//     hourlyData[hour].v_avgs.push(item.V_AVG);
//   });

//   const chartData = Array.from({ length: 24 }, (_, i) => {
//     const hour = i;
//     const hourEntries = hourlyData[hour];
//     if (!hourEntries || hourEntries.vrs.length === 0) {
//       return { time: `${String(hour).padStart(2, '0')}:00`, vr: 0, vy: 0, vb: 0, v_avg: 0 };
//     }
//     const vr = hourEntries.vrs.reduce((a, b) => a + b, 0) / hourEntries.vrs.length;
//     const vy = hourEntries.vys.reduce((a, b) => a + b, 0) / hourEntries.vys.length;
//     const vb = hourEntries.vbs.reduce((a, b) => a + b, 0) / hourEntries.vbs.length;
//     // --- CHANGE: Calculate the true average of the independent v_avg values ---
//     const v_avg = hourEntries.v_avgs.reduce((a, b) => a + b, 0) / hourEntries.v_avgs.length;

//     return {
//       time: `${String(hour).padStart(2, '0')}:00`,
//       vr: +vr.toFixed(2),
//       vy: +vy.toFixed(2),
//       vb: +vb.toFixed(2),
//       v_avg: v_avg > 0 ? +v_avg.toFixed(2) : null
//     };
//   });
//   return chartData;
// };

// const styles = {
//   container: { padding: '24px', fontFamily: 'sans-serif' },
//   header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
//   title: { fontSize: '1.5rem', fontWeight: 'bold' },
//   controls: { display: 'flex', gap: '8px' },
//   chartContainer: { width: '100%', height: '350px', marginBottom: '40px' }
// };

// export default function RTW3H() {
//   const [rawData, setRawData] = useState([]);
//   const [topChartData, setTopChartData] = useState([]);

//   useEffect(() => {
//     const apiResponse = simulateApiData();
//     setRawData(apiResponse.data);
//     setTopChartData(processDataForTopChart(apiResponse.data));
//   }, []);

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <div style={styles.title}>3PH L-L VOLTAGE HISTORICAL PLOT</div>
//         <div style={styles.controls}>
//           <select>
//             <option>Last 24 Hours</option>
//           </select>
//           <input type="date" />
//           <input type="time" />
//         </div>
//       </div>

//       <div style={styles.chartContainer}>
//         {topChartData.length > 0 ? <VoltageHistoryChart data={topChartData} /> : <p>Loading chart...</p>}
//       </div>

//       <div style={styles.chartContainer}>
//         {rawData.length > 0 ? <DeviationImbalanceChart rawData={rawData} /> : <p>Loading chart...</p>}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import VoltageHistoryChart from './VoltageHistoryChart';
import DeviationImbalanceChart from './DeviationImbalanceChart';

const simulateApiData = () => {
  const data = [];
  const now = new Date();
  const DAY_IN_MINUTES = 24 * 60;

  const deviationThresholds = {
    critical: 5,
    warning: 3
  };
  // --- CHANGE: Added thresholds for Voltage Imbalance ---
  const imbalanceThresholds = {
    critical: 4,
    warning: 2.5
  };

  for (let i = 0; i < DAY_IN_MINUTES; i++) {
    const timestamp = new Date(now.getTime() - i * 60000);
    const dailyCycleAngle = (i / DAY_IN_MINUTES) * 2 * Math.PI;
    const cycleModifier = Math.sin(dailyCycleAngle) * 20;
    const randomJitter = (Math.random() - 0.5) * 5;

    let vr, vy, vb, independent_v_avg;
    const hour = timestamp.getHours();

    if (hour === 3 || hour === 10) {
      vr = 0;
      vy = 0;
      vb = 0;
      independent_v_avg = 0;
    } else {
      vr = 400 + cycleModifier + randomJitter;
      vy = 400 + cycleModifier + randomJitter * 1.2;
      vb = 400 + cycleModifier + randomJitter * 0.8;
      independent_v_avg = 400 + cycleModifier + (Math.random() - 0.5) * 15;
    }

    let maxDeviation;
    if (hour === 15) {
      maxDeviation = deviationThresholds.critical + Math.random() * 2;
    } else if (hour === 8 || hour === 18) {
      maxDeviation = deviationThresholds.warning + Math.random() * 2;
    } else {
      maxDeviation = Math.random() * deviationThresholds.warning;
    }

    // --- CHANGE: Updated logic to generate status-based imbalance values ---
    let voltageImbalance;
    if (hour === 20) {
      // Force a critical value for one hour
      voltageImbalance = imbalanceThresholds.critical + Math.random();
    } else if (hour === 9 || hour === 21) {
      // Force warning values for two hours
      voltageImbalance = imbalanceThresholds.warning + Math.random();
    } else {
      // Generate acceptable values for all other hours
      voltageImbalance = Math.random() * imbalanceThresholds.warning;
    }

    data.push({
      TS: timestamp.toISOString(),
      VR: +vr.toFixed(2),
      VY: +vy.toFixed(2),
      VB: +vb.toFixed(2),
      V_AVG: +independent_v_avg.toFixed(2),
      maxDeviation: +maxDeviation.toFixed(2),
      voltageImbalance: +voltageImbalance.toFixed(2)
    });
  }
  return { data: data.reverse() };
};

const processDataForHourlyVoltageChart = (apiData) => {
  if (!apiData || apiData.length === 0) return [];
  const hourlyData = {};
  apiData.forEach((item) => {
    const hour = new Date(item.TS).getHours();
    if (!hourlyData[hour]) hourlyData[hour] = { vrs: [], vys: [], vbs: [], v_avgs: [] };
    hourlyData[hour].vrs.push(item.VR);
    hourlyData[hour].vys.push(item.VY);
    hourlyData[hour].vbs.push(item.VB);
    hourlyData[hour].v_avgs.push(item.V_AVG);
  });

  const chartData = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const hourEntries = hourlyData[hour];
    if (!hourEntries || hourEntries.vrs.length === 0) {
      return { time: `${String(hour).padStart(2, '0')}:00`, vr: 0, vy: 0, vb: 0, v_avg: 0 };
    }
    const vr = hourEntries.vrs.reduce((a, b) => a + b, 0) / hourEntries.vrs.length;
    const vy = hourEntries.vys.reduce((a, b) => a + b, 0) / hourEntries.vys.length;
    const vb = hourEntries.vbs.reduce((a, b) => a + b, 0) / hourEntries.vbs.length;
    const v_avg = hourEntries.v_avgs.reduce((a, b) => a + b, 0) / hourEntries.v_avgs.length;

    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      vr: +vr.toFixed(2),
      vy: +vy.toFixed(2),
      vb: +vb.toFixed(2),
      v_avg: v_avg > 0 ? +v_avg.toFixed(2) : null
    };
  });
  return chartData;
};

const styles = {
  container: { padding: '24px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '1.5rem', fontWeight: 'bold' },
  controls: { display: 'flex', gap: '8px' },
  chartContainer: { width: '100%', height: '350px', marginBottom: '40px' }
};

export default function RTW3H() {
  const [rawData, setRawData] = useState([]);
  const [voltageChartData, setVoltageChartData] = useState([]);

  useEffect(() => {
    const apiResponse = simulateApiData();
    setRawData(apiResponse.data);
    setVoltageChartData(processDataForHourlyVoltageChart(apiResponse.data));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>3PH L-L VOLTAGE HISTORICAL PLOT</div>
        <div style={styles.controls}>
          <select>
            <option>Last 24 Hours</option>
          </select>
          <input type="date" disabled />
          <input type="time" disabled />
        </div>
      </div>

      <div style={styles.chartContainer}>
        {voltageChartData.length > 0 ? <VoltageHistoryChart data={voltageChartData} /> : <p>Loading chart...</p>}
      </div>

      <div style={styles.chartContainer}>
        {rawData.length > 0 ? <DeviationImbalanceChart rawData={rawData} /> : <p>Loading chart...</p>}
      </div>
    </div>
  );
}
