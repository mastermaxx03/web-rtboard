import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Maximize } from 'lucide-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, TitleComponent, CanvasRenderer]);

// ---- Styles ----

const styles = {
  segmentCard: {
    background: '#fff',
    border: '1px solid #374151',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter, Roboto, system-ui, sans-serif',
    height: '100%',
    width: '100%',

    display: 'flex',
    flexDirection: 'column'
  },
  // New style for the header container
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  chartsContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: '16px'
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1, // This allows the wrapper to grow and share space
    minWidth: 0 // Prevents flexbox from overflowing
  },
  chart: {
    width: '100%', // Make the chart responsive to its wrapper
    height: '150px'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#555'
  },
  // Icon no longer needs absolute positioning
  expandIcon: {
    cursor: 'pointer',
    color: '#555'
  }
};

// --- Color Logic Functions ---
const getVoltageColor = (value) => {
  if (value <= 1) return '#5CE65C'; // Green
  if (value <= 2) return '#f1e53b'; // Yellow
  return '#F44336'; // Red
};

const getCurrentColor = (value) => {
  if (value <= 5) return '#5CE65C'; // Green
  if (value <= 10) return '#f1e53b'; // Yellow
  return '#F44336'; // Red
};

// ID: DB-IS-EC-01
export default function ImbalanceSegment(props) {
  const { onExpand = () => {} } = props;

  const [imbalance, setImbalance] = useState({ voltage: 2.3, current: 8.7 });

  useEffect(() => {
    const id = setInterval(() => {
      setImbalance({
        voltage: +(Math.random() * 5).toFixed(1),
        current: +(Math.random() * 15).toFixed(1)
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const voltageMaxValue = 5;
  const currentMaxValue = 15;

  const voltageColor = getVoltageColor(imbalance.voltage);
  const currentColor = getCurrentColor(imbalance.current);

  // --- ECharts option for Voltage Imbalance ---
  const voltageOption = {
    title: {
      text: `${imbalance.voltage}%`,
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 20, fontWeight: 'bold', color: '#333' }
    },
    series: [
      {
        type: 'pie',
        radius: ['80%', '100%'],
        startAngle: 90,
        label: { show: false },
        hoverAnimation: false,
        data: [
          { value: imbalance.voltage, itemStyle: { color: voltageColor } },
          { value: voltageMaxValue - imbalance.voltage, itemStyle: { color: '#E0E0E0' } }
        ]
      }
    ]
  };

  // --- ECharts option for Current Imbalance ---
  const currentOption = {
    title: {
      text: `${imbalance.current}%`,
      left: 'center',
      top: 'center',
      textStyle: { fontSize: 20, fontWeight: 'bold', color: '#333' }
    },
    series: [
      {
        type: 'pie',
        radius: ['80%', '100%'],
        startAngle: 90,
        label: { show: false },
        hoverAnimation: false,
        data: [
          { value: imbalance.current, itemStyle: { color: currentColor } },
          { value: currentMaxValue - imbalance.current, itemStyle: { color: '#E0E0E0' } }
        ]
      }
    ]
  };

  return (
    <div style={styles.segmentCard}>
      {/* A dedicated header for the title and icon */}
      <div style={styles.header}>
        {/* The title is now just a placeholder since each chart has its own */}
        <span></span>
        <Maximize size={16} style={styles.expandIcon} onClick={onExpand} />
      </div>
      <div style={styles.chartsContainer}>
        {/* Voltage Imbalance Chart */}
        <div style={styles.chartWrapper}>
          <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'center' }}>VOLTAGE IMBALANCE</div>
          <div style={styles.chart}>
            <ReactECharts echarts={echarts} option={voltageOption} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Current Imbalance Chart */}
        <div style={styles.chartWrapper}>
          <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'center' }}>CURRENT IMBALANCE</div>
          <div style={styles.chart}>
            <ReactECharts echarts={echarts} option={currentOption} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
