// // import React from 'react';
// // import ReactECharts from 'echarts-for-react';

// // const MetricComparisonChart = ({ title, metricKey, phaseData, isFocused, onChartClick }) => {
// //   const getChartOptions = () => {
// //     const dataZoomConfig = [{ type: 'inside', start: 0, end: 100 }];
// //     if (isFocused) {
// //       dataZoomConfig.push({ type: 'slider', start: 0, end: 100, height: 25 });
// //     }

// //     return {
// //       grid: { top: 40, right: 30, bottom: 90, left: 50 },
// //       xAxis: { type: 'category', data: phaseData.R.map((d) => d.time) },
// //       yAxis: { type: 'value', name: metricKey.toUpperCase() },
// //       tooltip: { trigger: 'axis' },
// //       legend: { data: ['R-Phase', 'Y-Phase', 'B-Phase'], top: 0 },
// //       dataZoom: dataZoomConfig,
// //       series: [
// //         { name: 'R-Phase', type: 'line', data: phaseData.R.map((d) => d[metricKey]), smooth: true, symbol: 'none', color: '#ef4444' },
// //         { name: 'Y-Phase', type: 'line', data: phaseData.Y.map((d) => d[metricKey]), smooth: true, symbol: 'none', color: '#facc15' },
// //         { name: 'B-Phase', type: 'line', data: phaseData.B.map((d) => d[metricKey]), smooth: true, symbol: 'none', color: '#3b82f6' }
// //       ]
// //     };
// //   };

// //   const style = {
// //     height: isFocused ? 'calc(100vh - 150px)' : '350px',
// //     width: '100%',
// //     cursor: isFocused ? 'default' : 'pointer'
// //   };

// //   const handleChartClick = (params) => {
// //     console.log('Chart component clicked. Component Type:', params.componentType);
// //     if (params.componentType === 'series' && onChartClick) {
// //       onChartClick();
// //     }
// //   };

// //   return (
// //     <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
// //       <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>{title}</h3>
// //       <ReactECharts option={getChartOptions()} style={style} onEvents={{ click: handleChartClick }} />
// //     </div>
// //   );
// // };

// // export default MetricComparisonChart;
// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// // NEW: Add modular ECharts imports
// import * as echarts from 'echarts/core';
// import { LineChart } from 'echarts/charts';
// import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';

// // NEW: Register the required components
// echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

// const MetricComparisonChart = ({ title, metricKey, phaseData, isFocused, onChartClick }) => {
//   // ... (The getChartOptions function and other logic remains exactly the same)
//   const getChartOptions = () => {
//     const dataZoomConfig = [{ type: 'inside', start: 0, end: 100 }];
//     if (isFocused) {
//       dataZoomConfig.push({ type: 'slider', start: 0, end: 100, height: 25 });
//     }
//     return {
//       grid: { top: 40, right: 30, bottom: 90, left: 50 },
//       xAxis: { type: 'category', data: phaseData.R.map((d) => d.time) },
//       yAxis: { type: 'value', name: metricKey.toUpperCase() },
//       tooltip: { trigger: 'axis' },
//       legend: { data: ['R-Phase', 'Y-Phase', 'B-Phase'], top: 0 },
//       dataZoom: dataZoomConfig,
//       series: [
//         { name: 'R-Phase', type: 'line', data: phaseData.R.map((d) => d[metricKey]), smooth: true, symbol: 'none', color: '#ef4444' },
//         { name: 'Y-Phase', type: 'line', data: phaseData.Y.map((d) => d[metricKey]), smooth: true, symbol: 'none', color: '#facc15' },
//         { name: 'B-Phase', type: 'line', data: phaseData.B.map((d) => d[metricKey]), smooth: true, symbol: 'none', color: '#3b82f6' }
//       ]
//     };
//   };

//   const style = {
//     height: isFocused ? 'calc(100vh - 150px)' : '350px',
//     width: '100%',
//     cursor: isFocused ? 'default' : 'pointer'
//   };

//   const handleChartClick = (params) => {
//     if (params.componentType === 'series' && onChartClick) {
//       onChartClick();
//     }
//   };

//   return (
//     <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
//       <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>{title}</h3>
//       {/* NEW: Add the echarts={echarts} prop */}
//       <ReactECharts echarts={echarts} option={getChartOptions()} style={style} onEvents={{ click: handleChartClick }} />
//     </div>
//   );
// };

// export default MetricComparisonChart;
import React from 'react';
import ReactECharts from 'echarts-for-react';

const MetricComparisonChart = ({ title, metricKey, phaseData, isFocused, onChartClick }) => {
  const getChartOptions = () => {
    const dataZoomConfig = [{ type: 'inside', start: 0, end: 100 }];
    if (isFocused) {
      dataZoomConfig.push({ type: 'slider', start: 0, end: 100, height: 25 });
    }

    return {
      grid: { top: 40, right: 30, bottom: 90, left: 50 },
      xAxis: { type: 'category', data: phaseData.R.map((d) => d.time) },
      yAxis: { type: 'value', name: metricKey.toUpperCase() },
      tooltip: { trigger: 'axis' },
      legend: { data: ['R-Phase', 'Y-Phase', 'B-Phase'], top: 0 },
      dataZoom: dataZoomConfig,
      series: [
        {
          name: 'R-Phase',
          type: 'line',
          data: phaseData.R.map((d) => d[metricKey]),
          smooth: true,
          symbol: 'circle', // Use a symbol for the hitbox
          symbolSize: 22, // Make the hitbox large enough to click easily
          lineStyle: {
            color: '#ef4444' // Explicitly set the line color
          },
          itemStyle: {
            color: 'transparent', // Make the symbol's fill invisible
            borderColor: 'transparent' // Make the symbol's border invisible
          }
        },
        {
          name: 'Y-Phase',
          type: 'line',
          data: phaseData.Y.map((d) => d[metricKey]),
          smooth: true,
          symbol: 'circle',
          symbolSize: 22,
          lineStyle: {
            color: '#facc15'
          },
          itemStyle: {
            color: 'transparent',
            borderColor: 'transparent'
          }
        },
        {
          name: 'B-Phase',
          type: 'line',
          data: phaseData.B.map((d) => d[metricKey]),
          smooth: true,
          symbol: 'circle',
          symbolSize: 22,
          lineStyle: {
            color: '#3b82f6'
          },
          itemStyle: {
            color: 'transparent',
            borderColor: 'transparent'
          }
        }
      ]
    };
  };

  const style = {
    height: isFocused ? 'calc(100vh - 150px)' : '350px',
    width: '100%',
    cursor: isFocused ? 'default' : 'pointer'
  };

  // const handleChartClick = (params) => {
  //   if (params.componentType === 'series' && onChartClick) {
  //     onChartClick();
  //   }
  // };

  const handleChartClick = (params) => {
    // Define the components that should NOT trigger the zoom
    const nonZoomableComponents = ['legend', 'dataZoom'];

    // If the clicked component is not in our blocklist, trigger the zoom
    if (!nonZoomableComponents.includes(params.componentType) && onChartClick) {
      onChartClick();
    }
  };
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>{title}</h3>
      <ReactECharts option={getChartOptions()} style={style} onEvents={{ click: handleChartClick }} />
    </div>
  );
};

export default MetricComparisonChart;
