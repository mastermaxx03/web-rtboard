import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
import { LegendComponent, PolarComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, BarChart, PolarComponent, TooltipComponent, CanvasRenderer, LegendComponent]);

// ---- Config ----
const MAX_VOLT = 600; // Increased to accommodate the 400V range
const NAMES = ['VRY', 'VYB', 'VBR'];
const SOLID_COLORS = [
  '#ff5252', // VRY
  '#ffce56', // VYB
  '#36a2eb' // VBR
];

// --- Define Thresholds ---
const NOMINAL_VOLT = 400;
const ACCEPTABLE_PCT = 0.1; // +/- 10%
const WARNING_PCT = 0.2; // +/- 20%

// --- Logic to determine voltage status ---
export const getVoltageStatus = (voltage) => {
  const deviation = Math.abs(voltage - NOMINAL_VOLT) / NOMINAL_VOLT;
  if (deviation > WARNING_PCT) {
    return 'critical';
  }
  if (deviation > ACCEPTABLE_PCT) {
    return 'warning';
  }
  return 'acceptable';
};

// Helper function to create the dashed guide rings
const dashedRingSeries = (radiusPct, color) => ({
  type: 'pie',
  silent: true,
  radius: [`${radiusPct - 0.5}%`, `${radiusPct}%`],
  center: ['50%', '50%'],
  label: { show: false },
  labelLine: { show: false },
  hoverAnimation: false,
  data: [{ value: 100, itemStyle: { color: 'transparent', borderColor: color, borderWidth: 1, borderType: 'dashed' } }],
  z: 1
});

// --- Main Component ---
export default function PhasorChart(props) {
  const { volts = [], timestamp = '' } = props;
  const chartRef = useRef(null);
  const animationIntervalRef = useRef(null);

  // --- Animation Engine ---
  useEffect(() => {
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

    const echartsInstance = chartRef.current?.getEchartsInstance();
    if (!echartsInstance) return;

    const timerId = setTimeout(() => {
      animationIntervalRef.current = setInterval(() => {
        const barSeriesIndex = 4; // The bar chart is the 5th series in the array

        volts.forEach((v, i) => {
          const status = getVoltageStatus(v);

          switch (status) {
            case 'critical':
              // Fast red blink
              echartsInstance.dispatchAction({ type: 'toggleSelect', seriesIndex: barSeriesIndex, dataIndex: i });
              break;
            case 'warning':
            case 'acceptable':
            default:
              // No animation for warning or acceptable, ensure it's in a clean state
              echartsInstance.dispatchAction({ type: 'unselect', seriesIndex: barSeriesIndex, dataIndex: i });
              break;
          }
        });
      }, 500); // Master interval runs every 0.5 seconds
    }, 100);

    return () => {
      clearTimeout(timerId);
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
  }, [volts]);

  const chartRadius = 86;

  // --- Calculate dynamic band positions ---
  const upperWarningLimit = NOMINAL_VOLT * (1 + WARNING_PCT); // 480V
  const upperAcceptableLimit = NOMINAL_VOLT * (1 + ACCEPTABLE_PCT); // 440V
  const lowerAcceptableLimit = NOMINAL_VOLT * (1 - ACCEPTABLE_PCT); // 360V
  const lowerWarningLimit = NOMINAL_VOLT * (1 - WARNING_PCT); // 320V

  const upperWarningRadiusPct = (upperWarningLimit / MAX_VOLT) * chartRadius;
  const upperAcceptableRadiusPct = (upperAcceptableLimit / MAX_VOLT) * chartRadius;
  const lowerAcceptableRadiusPct = (lowerAcceptableLimit / MAX_VOLT) * chartRadius;
  const lowerWarningRadiusPct = (lowerWarningLimit / MAX_VOLT) * chartRadius;

  const phasorOption = {
    animationDuration: 250,
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const { name, value } = params;
        return `
          ${name}: ${value}V<br/>
          Time: ${timestamp}
        `;
      }
    },

    polar: { radius: [0, `${chartRadius}%`] },
    angleAxis: {
      type: 'category',
      data: NAMES,
      startAngle: 90,
      axisLine: { show: false },
      axisTick: {
        show: false
      },

      axisLabel: {
        show: true,
        // margin: 8,
        // fontSize: 12,
        // fontWeight: 'bold',
        color: '#4A5568'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#000', // Black color for the lines
          width: 2
        },
        z: 10000000
      }
    },

    radiusAxis: {
      type: 'value',
      min: 0,
      max: MAX_VOLT,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    series: [
      dashedRingSeries(upperWarningRadiusPct, '#d61a22'),
      dashedRingSeries(upperAcceptableRadiusPct, '#169c33'),
      dashedRingSeries(lowerAcceptableRadiusPct, '#169c33'),
      dashedRingSeries(lowerWarningRadiusPct, '#d61a22'),
      {
        type: 'bar',
        coordinateSystem: 'polar',
        data: volts.map((v, i) => ({
          value: v,
          name: NAMES[i],
          itemStyle: {
            color: SOLID_COLORS[i],
            borderColor: '#000',
            borderWidth: 2
          },

          // Removed emphasis style as it's no longer needed for warning
          emphasis: {
            focus: 'none'
          },
          // Style for the 'critical' fast blink
          select: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0)' // Red glow
            }
          }
        })),
        barCategoryGap: '0%',
        barGap: '0%',
        z: 2,
        selectedMode: 'multiple'
      }
    ]
  };

  return (
    <ReactECharts ref={chartRef} echarts={echarts} option={phasorOption} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />
  );
}
