import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui-component/Card';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

import MachineInfoCard from './components/MachineInfoCard';
import ThreePhaseVoltageCard from './components/ThreePhaseVoltageCard';
import ThreePhaseCurrentCard from './components/ThreePhaseCurrentCard';
import EnergyConsumptionCard from './components/EnergyConsumptionCard';

import TimeMetricsDonutChart from './components/TimeMetricsDonutChart';

// import TimeMetricsDonutCard from './components/TimeMetricsDonutCard';

import VoltagePhasorDiagram from './VoltageComponent';
const data33 = {
  title: '3PH L-L VOLTAGE',
  phases: [
    { name: 'VRY', angle: 0, magnitude: 435, voltage: 435.32 },
    { name: 'VYB', angle: 240, magnitude: 440, voltage: 440.12 },
    { name: 'VBR', angle: 120, magnitude: 438, voltage: 438.17 }
  ],
  measurements: {
    VRY: '435.32 V',
    VYB: '440.12 V',
    VBR: '438.17 V',
    VAVG: '437.72 V'
  },
  maxDev: '7.92 V'
};
const voltageData = [
  { angle: 0, voltage: 230 },
  { angle: 30, voltage: 220 },
  { angle: 60, voltage: 215 },
  { angle: 90, voltage: 210 },
  { angle: 120, voltage: 205 },
  { angle: 150, voltage: 200 },
  { angle: 180, voltage: 195 },
  { angle: 210, voltage: 190 },
  { angle: 240, voltage: 185 },
  { angle: 270, voltage: 180 },
  { angle: 300, voltage: 175 },
  { angle: 330, voltage: 170 }
];

import BarChart from './BarChart';
const sampleData = [
  { label: 'A', value: 30 },
  { label: 'B', value: 80 },
  { label: 'C', value: 45 },
  { label: 'D', value: 60 },
  { label: 'E', value: 20 },
  { label: 'F', value: 90 },
  { label: 'G', value: 80 },
  { label: 'H', value: 90 },
  { label: 'I', value: 90 },
  { label: 'J', value: 90 },
  { label: 'K', value: 90 },
  { label: 'L', value: 50 }
];

import AnimatedBarChart from './AnimatedBarChart';
const initialData = [
  { label: 'A', value: 35 },
  { label: 'B', value: 70 },
  { label: 'C', value: 45 },
  { label: 'D', value: 60 },
  { label: 'E', value: 25 }
];

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const EnergyDashboard = () => {
  const [data, setData] = useState(initialData);

  const randomize = () => {
    setData(data.map((d) => ({ ...d, value: Math.floor(Math.random() * 100) })));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'flex-start'
      }}
    >
      <MachineInfoCard
        imageUrl="https://3.imimg.com/data3/HN/TK/GLADMIN-30693/industrial-machinery-250x250.jpg"
        panelName="Panel A1"
        rating="20 kW"
        isCloudConnected={true}
        isPoweredOn={false}
      />

      <ThreePhaseVoltageCard VRY={435.0} VYB={428.13} VBR={421.17} />

      <ThreePhaseCurrentCard IR={150} IY={150} IB={155} />

      <EnergyConsumptionCard totalEnergy={2378.4} phaseR={964.7} phaseY={1413.7} />

      <TimeMetricsDonutChart totalHrs={8.3} runPct={0.68} idlePct={0.32} />

      {/* <TimeMetricsDonutCard totalHours={8.0} runPercent={60} idlePercent={40} /> */}

      {/* <BarChart data={sampleData} />
      <div>
        <h1>D3 + React Animated Bar Chart</h1>
        <AnimatedBarChart data={data} />
        <button onClick={randomize}>Randomize Data</button>
      </div> */}

      <VoltagePhasorDiagram data={voltageData} />
      {/* data33 */}
    </div>
  );
};

export default EnergyDashboard;
