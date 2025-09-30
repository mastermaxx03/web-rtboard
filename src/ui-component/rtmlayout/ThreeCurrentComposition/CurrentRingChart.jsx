import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, TitleComponent, TooltipComponent, CanvasRenderer, LegendComponent]);

// --- Main Component ---
// --- CHANGE: Added showLabels prop with a default value of false ---
export default function CurrentRingChart({ currents, timestamp, showLabels = false, showTooltip = false, showTimestamp = false }) {
  const maxValue = 3000; // Max scale for the rings

  const option = {
    tooltip: {
      show: showTooltip,
      trigger: 'item',
      formatter: (params) => {
        const { name, value } = params;
        let tooltipContent = `${name}: ${value}A`; // Start with the base content

        // --- THIS IS THE KEY LOGIC ---
        // Only add the timestamp if the prop is true
        if (showTimestamp) {
          tooltipContent += `<br/>Time: ${timestamp}`;
        }

        return tooltipContent;
      }
    },
    legend: {
      show: true,
      orient: 'vertical',
      left: 'left',
      bottom: 'bottom',
      data: ['IR', 'IY', 'IB'],
      itemGap: 10
    },
    color: ['#ff5252', '#ffce56', '#36a2eb'],
    series: [
      // Outer Ring (IR)
      {
        name: 'IR',
        type: 'pie',
        radius: ['75%', '90%'],
        startAngle: 90,
        clockwise: true,
        data: [
          {
            value: currents.ir,
            name: 'IR',
            itemStyle: { color: '#ff5252' },
            // --- CHANGE: Labels are now conditional ---
            label: {
              show: showLabels,
              position: 'outside',
              formatter: '{b}'
            },
            labelLine: {
              show: showLabels,
              length: 15,
              length2: 10
            }
          },
          {
            value: maxValue - currents.ir,
            itemStyle: { color: '#e0e0e0' },
            label: { show: false },
            labelLine: { show: false }
          }
        ],
        animationDuration: 300
      },
      // Middle Ring (IY)
      {
        name: 'IY',
        type: 'pie',
        radius: ['55%', '70%'],
        startAngle: 90,
        clockwise: true,
        data: [
          {
            value: currents.iy,
            name: 'IY',
            itemStyle: { color: '#ffce56' },
            label: {
              show: showLabels,
              position: 'outside',
              formatter: '{b}'
            },
            labelLine: {
              show: showLabels,
              length: 75,
              length2: 25
            }
          },
          {
            value: maxValue - currents.iy,
            itemStyle: { color: '#e0e0e0' },
            label: { show: false },
            labelLine: { show: false }
          }
        ],
        animationDuration: 300
      },
      // Inner Ring (IB)
      {
        name: 'IB',
        type: 'pie',
        radius: ['35%', '50%'],
        startAngle: 90,
        clockwise: true,
        data: [
          {
            value: currents.ib,
            name: 'IB',
            itemStyle: { color: '#36a2eb' },
            label: {
              show: showLabels,
              position: 'outside',
              formatter: '{b}'
            },
            labelLine: {
              show: showLabels,
              length: 60,
              length2: 40
            }
          },
          {
            value: maxValue - currents.ib,
            itemStyle: { color: '#e0e0e0' },
            label: { show: false },
            labelLine: { show: false }
          }
        ],
        animationDuration: 300
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
