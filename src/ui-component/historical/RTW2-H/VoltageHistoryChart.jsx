// import React, { forwardRef } from 'react';
// import ReactECharts from 'echarts-for-react';

// // ---- ECharts modular (tree-shaken) imports ----
// import * as echarts from 'echarts/core';
// import { BarChart, LineChart } from 'echarts/charts';
// import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';

// echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

// const VoltageHistoryChart = forwardRef(({ data }, ref) => {
//   const timeData = data.map((item) => item.time);
//   const vbData = data.map((item) => item.vb);
//   const vyData = data.map((item) => item.vy);
//   const vrData = data.map((item) => item.vr);
//   const vAvgData = data.map((item) => item.v_avg);

//   const option = {
//     tooltip: {
//       trigger: 'axis',
//       axisPointer: { type: 'shadow' }
//     },
//     legend: {
//       data: ['VB', 'VY', 'VR', 'VAVG']
//     },
//     grid: {
//       left: '3%',
//       right: '4%',
//       bottom: '10%',
//       containLabel: true
//     },
//     xAxis: {
//       type: 'category',
//       data: timeData
//     },
//     // --- CHANGE: Converted yAxis to an array for dual-axis support ---
//     yAxis: [
//       {
//         type: 'value',
//         name: 'V_LL (Volts)',
//         position: 'left',
//         axisLabel: {
//           formatter: '{value} V'
//         }
//       },
//       {
//         type: 'value',
//         name: 'VAVG (Volts)',
//         position: 'right',
//         axisLabel: {
//           formatter: '{value} V'
//         }
//       }
//     ],
//     dataZoom: [
//       {
//         type: 'inside',
//         start: 0,
//         end: 100
//       }
//     ],
//     series: [
//       {
//         name: 'VB',
//         type: 'bar',
//         stack: 'voltage',
//         itemStyle: { color: '#5470C6' },
//         barWidth: '60%',
//         data: vbData
//       },
//       {
//         name: 'VY',
//         type: 'bar',
//         stack: 'voltage',
//         itemStyle: { color: '#FAC858' },
//         barWidth: '60%',
//         data: vyData
//       },
//       {
//         name: 'VR',
//         type: 'bar',
//         stack: 'voltage',
//         itemStyle: { color: '#ee6666' },
//         barWidth: '60%',
//         data: vrData
//       },
//       {
//         name: 'VAVG',
//         type: 'line',
//         // --- CHANGE: Assigned this series to the second (index 1) y-axis ---
//         yAxisIndex: 1,
//         smooth: true,
//         data: vAvgData
//       }
//     ]
//   };

//   return <ReactECharts ref={ref} echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// });

// export default VoltageHistoryChart;
// import React, { forwardRef } from 'react';
// import ReactECharts from 'echarts-for-react';

// import * as echarts from 'echarts/core';
// import { BarChart, LineChart } from 'echarts/charts';
// import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';

// echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

// const VoltageHistoryChart = forwardRef(({ data }, ref) => {
//   const timeData = data.map((item) => item.time);
//   const vbData = data.map((item) => item.vb);
//   const vyData = data.map((item) => item.vy);
//   const vrData = data.map((item) => item.vr);
//   const vAvgData = data.map((item) => item.v_avg);

//   const option = {
//     tooltip: {
//       trigger: 'axis',
//       axisPointer: { type: 'shadow' }
//     },
//     legend: {
//       data: ['VR', 'VY', 'VB', 'VAVG']
//     },
//     grid: {
//       left: '3%',
//       right: '4%',
//       bottom: '10%',
//       containLabel: true
//     },
//     xAxis: {
//       type: 'category',
//       data: timeData
//     },
//     // --- CHANGE: Y-Axes are now switched and configured ---
//     yAxis: [
//       {
//         // Axis for VAVG (Left)
//         type: 'value',
//         name: 'VAVG (Volts)',
//         position: 'left',
//         min: 350, // Start the axis at 350
//         axisLabel: {
//           formatter: '{value} V'
//         }
//       },
//       {
//         // Axis for Voltage Bars (Right)
//         type: 'value',
//         name: 'V_LL (Volts)',
//         position: 'right',
//         axisLabel: {
//           show: false // Hide the number labels for this axis
//         }
//       }
//     ],
//     dataZoom: [
//       {
//         type: 'inside',
//         start: 0,
//         end: 100
//       }
//     ],
//     // --- CHANGE: Series are reordered for the tooltip ---
//     series: [
//       {
//         name: 'VR',
//         type: 'bar',
//         stack: 'voltage',
//         yAxisIndex: 1, // Use the right-side Y-axis
//         itemStyle: { color: '#ee6666' },
//         barWidth: '60%',
//         data: vrData
//       },
//       {
//         name: 'VY',
//         type: 'bar',
//         stack: 'voltage',
//         yAxisIndex: 1, // Use the right-side Y-axis
//         itemStyle: { color: '#FAC858' },
//         barWidth: '60%',
//         data: vyData
//       },
//       {
//         name: 'VB',
//         type: 'bar',
//         stack: 'voltage',
//         yAxisIndex: 1, // Use the right-side Y-axis
//         itemStyle: { color: '#5470C6' },
//         barWidth: '60%',
//         data: vbData
//       },
//       {
//         name: 'VAVG',
//         type: 'line',
//         yAxisIndex: 0, // Use the left-side Y-axis
//         smooth: true,
//         data: vAvgData
//       }
//     ]
//   };

//   return <ReactECharts ref={ref} echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// });

// export default VoltageHistoryChart;
// import React, { forwardRef } from 'react';
// import ReactECharts from 'echarts-for-react';

// import * as echarts from 'echarts/core';
// import { BarChart, LineChart } from 'echarts/charts';
// import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';

// echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

// const VoltageHistoryChart = forwardRef(({ data }, ref) => {
//   const timeData = data.map((item) => item.time);
//   const vbData = data.map((item) => item.vb);
//   const vyData = data.map((item) => item.vy);
//   const vrData = data.map((item) => item.vr);
//   const vAvgData = data.map((item) => item.v_avg);

//   const option = {
//     // --- CHANGE 2: Added a custom formatter to control tooltip order ---
//     tooltip: {
//       trigger: 'axis',
//       axisPointer: { type: 'shadow' },
//       formatter: (params) => {
//         // Find each data series by its name
//         const vrSeries = params.find((p) => p.seriesName === 'VR');
//         const vySeries = params.find((p) => p.seriesName === 'VY');
//         const vbSeries = params.find((p) => p.seriesName === 'VB');
//         const vAvgSeries = params.find((p) => p.seriesName === 'VAVG');

//         // Manually build the tooltip HTML string in your desired order
//         let tooltipHtml = `${params[0].axisValueLabel}<br/>`; // Get the time label
//         if (vrSeries) tooltipHtml += `${vrSeries.marker} ${vrSeries.seriesName}: ${vrSeries.value} V<br/>`;
//         if (vySeries) tooltipHtml += `${vySeries.marker} ${vySeries.seriesName}: ${vySeries.value} V<br/>`;
//         if (vbSeries) tooltipHtml += `${vbSeries.marker} ${vbSeries.seriesName}: ${vbSeries.value} V<br/>`;
//         if (vAvgSeries && vAvgSeries.value !== null) {
//           // Check for null before showing
//           tooltipHtml += `${vAvgSeries.marker} ${vAvgSeries.seriesName}: ${vAvgSeries.value} V<br/>`;
//         }

//         return tooltipHtml;
//       }
//     },
//     legend: {
//       data: ['VR', 'VY', 'VB', 'VAVG']
//     },
//     grid: {
//       left: '3%',
//       right: '4%',
//       bottom: '10%',
//       containLabel: true
//     },
//     xAxis: {
//       type: 'category',
//       data: timeData
//     },
//     yAxis: [
//       {
//         type: 'value',
//         name: 'VAVG (Volts)',
//         position: 'left',
//         min: 340,
//         max: 460,
//         // --- CHANGE 1: Added this line to fix the inverted axis ---
//         inverse: false,
//         axisLabel: {
//           formatter: '{value} V'
//         }
//       },
//       {
//         type: 'value',
//         name: 'V_LL (Volts)',
//         position: 'right',
//         axisLabel: {
//           show: false
//         }
//       }
//     ],
//     dataZoom: [
//       {
//         type: 'inside',
//         start: 0,
//         end: 100
//       }
//     ],
//     // --- CHANGE 2: Reordered series for correct VISUAL stacking (VR on top) ---
//     series: [
//       {
//         name: 'VB', // Blue bar at the bottom of the stack
//         type: 'bar',
//         stack: 'voltage',
//         yAxisIndex: 1,
//         itemStyle: { color: '#36a2eb' },
//         barWidth: '60%',
//         data: vbData
//       },
//       {
//         name: 'VY', // Yellow bar in the middle of the stack
//         type: 'bar',
//         stack: 'voltage',
//         yAxisIndex: 1,
//         itemStyle: { color: '#ffce56' },
//         barWidth: '60%',
//         data: vyData
//       },
//       {
//         name: 'VR', // Red bar at the top of the stack
//         type: 'bar',
//         stack: 'voltage',
//         yAxisIndex: 1,
//         itemStyle: { color: '#ff5252' },
//         barWidth: '60%',
//         data: vrData
//       },
//       {
//         name: 'VAVG',
//         type: 'line',
//         yAxisIndex: 0,
//         smooth: true,
//         data: vAvgData
//       }
//     ]
//   };

//   return <ReactECharts ref={ref} echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
// });

// export default VoltageHistoryChart;
import React, { forwardRef } from 'react';
import ReactECharts from 'echarts-for-react';

import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

const VoltageHistoryChart = forwardRef(({ data }, ref) => {
  const timeData = data.map((item) => item.time);
  const vbData = data.map((item) => item.vb);
  const vyData = data.map((item) => item.vy);
  const vrData = data.map((item) => item.vr);
  const vAvgData = data.map((item) => item.v_avg);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      // The custom formatter ensures the tooltip order is always correct
      formatter: (params) => {
        const vrSeries = params.find((p) => p.seriesName === 'VR');
        const vySeries = params.find((p) => p.seriesName === 'VY');
        const vbSeries = params.find((p) => p.seriesName === 'VB');
        const vAvgSeries = params.find((p) => p.seriesName === 'VAVG');

        let tooltipHtml = `${params[0].axisValueLabel}<br/>`;
        if (vrSeries) tooltipHtml += `${vrSeries.marker} ${vrSeries.seriesName}: ${vrSeries.value} V<br/>`;
        if (vySeries) tooltipHtml += `${vySeries.marker} ${vySeries.seriesName}: ${vySeries.value} V<br/>`;
        if (vbSeries) tooltipHtml += `${vbSeries.marker} ${vbSeries.seriesName}: ${vbSeries.value} V<br/>`;
        if (vAvgSeries && vAvgSeries.value !== null) {
          tooltipHtml += `${vAvgSeries.marker} ${vAvgSeries.seriesName}: ${vAvgSeries.value} V<br/>`;
        }

        return tooltipHtml;
      }
    },
    legend: {
      data: ['VR', 'VY', 'VB', 'VAVG']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeData
    },
    yAxis: [
      {
        type: 'value',
        name: 'VAVG (Volts)',
        position: 'left',
        min: 150,
        max: 350,
        // --- FIX 1: This forces the axis to draw correctly ---
        inverse: false,
        axisLabel: {
          formatter: '{value} V'
        }
      },
      {
        type: 'value',
        name: 'V_LL (Volts)',
        position: 'right',
        axisLabel: {
          show: false
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    // --- FIX 2: Series reordered for correct VISUAL stacking (VR on top) ---
    series: [
      {
        name: 'VB', // Bottom of the stack
        type: 'bar',
        stack: 'voltage',
        yAxisIndex: 1,
        itemStyle: { color: '#36a2eb' },
        barWidth: '60%',
        data: vbData
      },
      {
        name: 'VY', // Middle of the stack
        type: 'bar',
        stack: 'voltage',
        yAxisIndex: 1,
        itemStyle: { color: '#ffce56' },
        barWidth: '60%',
        data: vyData
      },
      {
        name: 'VR', // Top of the stack
        type: 'bar',
        stack: 'voltage',
        yAxisIndex: 1,
        itemStyle: { color: '#ff5252' },
        barWidth: '60%',
        data: vrData
      },
      {
        name: 'VAVG',
        type: 'line',
        yAxisIndex: 0,
        itemStyle: { color: '#000' },
        smooth: true,
        data: vAvgData
      }
    ]
  };

  return <ReactECharts ref={ref} echarts={echarts} option={option} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;
});

export default VoltageHistoryChart;
