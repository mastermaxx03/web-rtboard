import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
// --- CHANGE: Import VisualMapComponent ---
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  VisualMapComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  VisualMapComponent,
  CanvasRenderer
]);

// Helper function to process the raw backend data
const processApiData = (apiData) => {
  if (!apiData || !apiData.length) return { labels: [], deviationData: [], imbalanceData: [] };

  const deviationThresholds = {
    critical: 5,
    warning: 3
  };
  const colors = {
    critical: '#FF6A00',
    warning: '#FDD90D',
    acceptable: '#9ACD32'
  };

  const hourlyData = {};
  apiData.forEach((item) => {
    const hour = new Date(item.TS).getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = { deviations: [], imbalances: [] };
    }
    hourlyData[hour].deviations.push(item.maxDeviation);
    hourlyData[hour].imbalances.push(item.voltageImbalance);
  });

  const processedData = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const entries = hourlyData[hour];
    if (!entries || entries.deviations.length === 0) {
      return { time: `${String(hour).padStart(2, '0')}:00`, deviation: 0, imbalance: 0 };
    }

    const avgDeviation = entries.deviations.reduce((acc, val) => acc + val, 0) / entries.deviations.length;
    const avgImbalance = entries.imbalances.reduce((acc, val) => acc + val, 0) / entries.imbalances.length;

    let barColor = colors.acceptable;
    if (avgDeviation >= deviationThresholds.critical) {
      barColor = colors.critical;
    } else if (avgDeviation >= deviationThresholds.warning) {
      barColor = colors.warning;
    }

    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      deviation: {
        value: +avgDeviation.toFixed(2),
        itemStyle: {
          color: barColor
        }
      },
      imbalance: +avgImbalance.toFixed(2)
    };
  });

  return {
    labels: processedData.map((d) => d.time),
    deviationData: processedData.map((d) => d.deviation),
    imbalanceData: processedData.map((d) => d.imbalance)
  };
};

export default function DeviationImbalanceChart({ rawData }) {
  const { labels, deviationData, imbalanceData } = processApiData(rawData);

  const option = {
    // --- CHANGE: Added visualMap to color the line chart based on its value ---
    visualMap: {
      show: false, // We don't need to show a separate legend for this
      dimension: 1, // Tell visualMap to use the y-axis value for coloring
      seriesIndex: 1, // IMPORTANT: Only apply this to the 'Voltage Imbalance' line series
      pieces: [
        { lt: 2.5, color: '#32CD32' }, // Acceptable (Green)
        { gte: 2.5, lt: 4, color: '#FFBF00' }, // Warning (Yellow)
        { gte: 4, color: '#FF6A00' } // Critical (Red)
      ]
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Max Deviation', 'Voltage Imbalance']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels
    },
    yAxis: [
      {
        type: 'value',
        name: 'Max Deviation %',
        position: 'left',
        splitNumber: 5
      },
      {
        type: 'value',
        name: 'Voltage Imbalance %',
        position: 'right',
        splitNumber: 5,
        // --- CHANGE: This forces the grid lines to align with the first Y-axis ---
        alignTicks: true
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: 'Max Deviation',
        type: 'bar',
        yAxisIndex: 0,
        data: deviationData // This is an array of objects with value and color
      },
      {
        name: 'Voltage Imbalance',
        type: 'line',
        smooth: true,
        // The color is now controlled by visualMap, no itemStyle needed here
        yAxisIndex: 1,
        data: imbalanceData
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
