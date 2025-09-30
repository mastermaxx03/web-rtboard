import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, MarkAreaComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, TooltipComponent, MarkAreaComponent, CanvasRenderer]);

// --- Main Component ---

export default function AvgPFBarChart({ data, timestamp }) {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },

      formatter: (params) => {
        const bar = params[0]; // Get the first series in the tooltip
        const value = bar.value;
        const name = bar.name;
        let tooltipContent = `${name}: ${value}`;

        if (timestamp) {
          tooltipContent += `<br/>Time: ${timestamp}`;
        }

        return tooltipContent;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['R-Phase', 'Y-Phase', 'B-Phase'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: 0.7,
        max: 1.0,
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: 'Power Factor',
        type: 'bar',
        barWidth: '30%',
        data: [data.r, data.y, data.b],
        itemStyle: {
          color: (params) => {
            const colors = ['#ff5252', '#ffce56', '#36a2eb'];
            return colors[params.dataIndex];
          }
        },
        // --- This is the key part for the background zones ---
        markArea: {
          silent: true,
          itemStyle: {
            color: 'rgba(0, 0, 0, 0.1)' // Default color for zones
          },
          data: [
            // Penalty Zone (Red)
            [
              {
                name: 'Penalty',
                yAxis: 0.7, // Start of the zone

                itemStyle: { color: 'rgba(255, 82, 82, 0.1)' }
              },
              {
                yAxis: 0.9 // End of the zone
              }
            ],
            // Neutral Zone (Grey)
            [
              {
                name: 'Neutral',
                yAxis: 0.9,
                itemStyle: { color: 'rgba(158, 158, 158, 0.1)' }
              },
              {
                yAxis: 0.95
              }
            ],
            // Incentive Zone (Green)
            [
              {
                name: 'Incentive',
                yAxis: 0.95,
                itemStyle: { color: 'rgba(76, 175, 80, 0.1)' }
              },
              {
                yAxis: 1.0
              }
            ]
          ]
        }
      }
    ]
  };

  return <ReactECharts echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
}
