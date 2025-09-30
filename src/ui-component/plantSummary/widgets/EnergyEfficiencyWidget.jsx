// src/ui-component/plantSummary/widgets/EnergyEfficiencyWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergyEfficiencyData } from '../hooks/useEnergyEfficiencyData';

const EnergyEfficiencyWidget = () => {
  const { value } = useEnergyEfficiencyData();

  const option = {
    // TOOLTIP OBJECT HAS BEEN REMOVED FROM THIS TOP LEVEL

    series: [
      {
        type: 'gauge',
        // ... (all other series properties remain the same)
        startAngle: 90,
        endAngle: -270,
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            borderWidth: 1,
            borderColor: '#4682B4',
            color: '#2E8B57'
          }
        },
        axisLine: { lineStyle: { width: 20 } },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        data: [{ value: value }],
        detail: {
          fontSize: 30,
          fontWeight: 'bold',
          color: '#222',
          formatter: '{value}%',
          offsetCenter: [0, 0],
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        },
        title: { show: false },

        // --- TOOLTIP CONFIGURATION MOVED HERE ---
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            const dateString = now.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });

            return `<strong>Energy Efficiency</strong><br/>
                    Value: <strong>${params.value}%</strong><br/>
                    <hr style="margin: 5px 0; border-color: #555;"/>
                    Time: ${timeString}, ${dateString}`;
          }
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

export default EnergyEfficiencyWidget;
