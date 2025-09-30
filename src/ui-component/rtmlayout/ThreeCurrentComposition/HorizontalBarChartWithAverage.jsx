// HorizontalBarChartWithAverage.js
import React from 'react';
import ReactECharts from 'echarts-for-react';

const HorizontalBarChartWithAverage = ({ currents, average, timestamp, thresholds }) => {
  const numericCurrents = {
    ir: parseFloat(currents.ir),
    iy: parseFloat(currents.iy),
    ib: parseFloat(currents.ib)
  };
  const numericAverage = parseFloat(average);

  // Calculate the boundaries for the status bands
  const { nominal, warning_pct, critical_pct } = thresholds;
  const warningLower = nominal * (1 - warning_pct / 100);
  const warningUpper = nominal * (1 + warning_pct / 100);
  const criticalLower = nominal * (1 - critical_pct / 100);
  const criticalUpper = nominal * (1 + critical_pct / 100);

  // FIXED: Ensure the chart's max value is high enough to show the upper critical band
  const chartMax = Math.max(criticalUpper * 1.2, ...Object.values(numericCurrents));

  const phaseColorMap = { ir: '#ff5252', iy: '#ffce56', ib: '#3366FF' };

  const option = {
    grid: { top: '20px', left: '3%', right: '4%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: '{value} A' },
      max: chartMax
    },
    yAxis: {
      type: 'category',
      data: ['IB', 'IY', 'IR'],
      axisTick: { show: false }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const param = params[0];
        const phaseName = param.name;
        const phaseValue = parseFloat(param.value).toFixed(1);
        return `<strong>${phaseName}:</strong> ${phaseValue}A<br /><strong>Time:</strong> ${timestamp}`;
      },
      backgroundColor: '#FFFFFF',
      borderColor: '#ef4444',
      borderWidth: 1,
      textStyle: { color: '#1e293b' },
      padding: 10
    },
    series: [
      {
        name: 'Line Current',
        type: 'bar',
        barWidth: '40%',
        data: [
          { value: numericCurrents.ib, itemStyle: { color: phaseColorMap.ib } },
          { value: numericCurrents.iy, itemStyle: { color: phaseColorMap.iy } },
          { value: numericCurrents.ir, itemStyle: { color: phaseColorMap.ir } }
        ],
        markLine: {
          silent: true,
          symbol: 'none',
          data: [
            {
              xAxis: numericAverage,
              lineStyle: { type: 'dashed', color: '#334155' },
              label: {
                show: true,
                formatter: '{c} A',
                position: 'start', // This moves it to the top end of the line
                color: '#334155',
                fontSize: 10,
                padding: [0, 0, 5, 0] // Adds a little space below the text
              }
            }
          ]
        },
        markArea: {
          silent: true,
          itemStyle: { opacity: 0.1 },
          data: [
            [{ name: 'Acceptable', xAxis: warningLower, itemStyle: { color: '#169c33' } }, { xAxis: warningUpper }],
            [{ name: 'Warning', xAxis: criticalLower, itemStyle: { color: '#ffce56' } }, { xAxis: warningLower }],
            [{ name: 'Warning', xAxis: warningUpper, itemStyle: { color: '#ffce56' } }, { xAxis: criticalUpper }],
            [{ name: 'Critical', xAxis: 0, itemStyle: { color: '#ff5252' } }, { xAxis: criticalLower }],
            [{ name: 'Critical', xAxis: criticalUpper, itemStyle: { color: '#ff5252' } }, { xAxis: chartMax }]
          ]
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', minHeight: '300px', width: '100%' }} />;
};

export default HorizontalBarChartWithAverage;
