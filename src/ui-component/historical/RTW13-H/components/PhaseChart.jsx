// // import React from 'react';
// // import ReactECharts from 'echarts-for-react';

// // // ... (imports remain the same)

// // const PhaseChart = ({ phaseName, data, isFocused, onChartClick }) => {
// //   const getChartOptions = () => {
// //     // ... (logic for dataZoomConfig remains the same)
// //     const dataZoomConfig = [{ type: 'inside', start: 0, end: 100 }];
// //     if (isFocused) {
// //       dataZoomConfig.push({ type: 'slider', start: 0, end: 100, height: 25 });
// //     }

// //     return {
// //       // FIX: Increased bottom margin to make space for the slider
// //       grid: { top: 40, right: 30, bottom: 90, left: 50 },
// //       // ... (xAxis, yAxis, tooltip, legend logic remains the same)
// //       xAxis: { type: 'category', data: data.map((d) => d.time) },
// //       yAxis: { type: 'value', name: 'Power' },
// //       tooltip: {
// //         trigger: 'axis',
// //         formatter: (params) => {
// //           const timeLabel = params[0].axisValueLabel;
// //           const dataPoint = data.find((d) => d.time === timeLabel);
// //           if (!dataPoint) return '';
// //           const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
// //           const formattedDate = dataPoint.fullDate.toLocaleDateString('en-GB', dateOptions);
// //           const timeHtml = `<div style="font-size: 0.9em; color: #666; padding: 5px 10px; border-top: 1px solid #eee;">Time: ${timeLabel}hrs, ${formattedDate}</div>`;
// //           let keyValueHtml = '<div style="padding: 5px 10px;">';
// //           params.forEach((param) => {
// //             keyValueHtml += `
// //               <div style="display: flex; justify-content: space-between; align-items: center;">
// //                 <span>${param.marker} ${param.seriesName}</span>
// //                 <strong style="margin-left: 20px;">${param.value}</strong>
// //               </div>
// //             `;
// //           });
// //           keyValueHtml += '</div>';
// //           return keyValueHtml + timeHtml;
// //         }
// //       },
// //       legend: { data: ['kVA', 'kW', 'KVAr'], top: 0 },
// //       dataZoom: dataZoomConfig,
// //       series: [
// //         { name: 'kW', type: 'bar', stack: 'power', data: data.map((d) => d.kw), color: '#3b82f6' },
// //         { name: 'KVAr', type: 'bar', stack: 'power', data: data.map((d) => d.kvar), color: '#84cc16' },
// //         { name: 'kVA', type: 'line', data: data.map((d) => d.kva), symbol: 'none', smooth: true, color: '#ef4444' }
// //       ]
// //     };
// //   };

// //   // ... (style and handleChartClick logic remain the same)
// //   const style = {
// //     height: isFocused ? 'calc(100vh - 150px)' : '350px',
// //     width: '100%',
// //     cursor: isFocused ? 'default' : 'pointer'
// //   };

// //   const handleChartClick = (params) => {
// //     if (params.componentType === 'series' && onChartClick) {
// //       onChartClick();
// //     }
// //   };

// //   return (
// //     <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
// //       <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>{phaseName} Phase Power</h3>
// //       <ReactECharts option={getChartOptions()} style={style} onEvents={{ click: handleChartClick }} />
// //     </div>
// //   );
// // };

// // export default PhaseChart;
// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// // NEW: Add modular ECharts imports (for Bar and Line charts)
// import * as echarts from 'echarts/core';
// import { BarChart, LineChart } from 'echarts/charts';
// import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';

// // NEW: Register the required components
// echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer]);

// const PhaseChart = ({ phaseName, data, isFocused, onChartClick }) => {
//   // ... (The getChartOptions function and other logic remains exactly the same)
//   const getChartOptions = () => {
//     const dataZoomConfig = [{ type: 'inside', start: 0, end: 100 }];
//     if (isFocused) {
//       dataZoomConfig.push({ type: 'slider', start: 0, end: 100, height: 25 });
//     }
//     return {
//       grid: { top: 40, right: 30, bottom: 90, left: 50 },
//       xAxis: { type: 'category', data: data.map((d) => d.time) },
//       yAxis: { type: 'value', name: 'Power' },
//       tooltip: {
//         trigger: 'axis',
//         formatter: (params) => {
//           const timeLabel = params[0].axisValueLabel;
//           const dataPoint = data.find((d) => d.time === timeLabel);
//           if (!dataPoint) return '';
//           const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
//           const formattedDate = dataPoint.fullDate.toLocaleDateString('en-GB', dateOptions);
//           const timeHtml = `<div style="font-size: 0.9em; color: #666; padding: 5px 10px; border-top: 1px solid #eee;">Time: ${timeLabel}hrs, ${formattedDate}</div>`;
//           let keyValueHtml = '<div style="padding: 5px 10px;">';
//           params.forEach((param) => {
//             keyValueHtml += `<div style="display: flex; justify-content: space-between; align-items: center;"><span>${param.marker} ${param.seriesName}</span><strong style="margin-left: 20px;">${param.value}</strong></div>`;
//           });
//           keyValueHtml += '</div>';
//           return keyValueHtml + timeHtml;
//         }
//       },
//       legend: { data: ['kVA', 'kW', 'KVAr'], top: 0 },
//       dataZoom: dataZoomConfig,
//       series: [
//         { name: 'kW', type: 'bar', stack: 'power', data: data.map((d) => d.kw), color: '#3b82f6' },
//         { name: 'KVAr', type: 'bar', stack: 'power', data: data.map((d) => d.kvar), color: '#84cc16' },
//         { name: 'kVA', type: 'line', data: data.map((d) => d.kva), symbol: 'none', smooth: true, color: '#ef4444' }
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
//       <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>{phaseName} Phase Power</h3>
//       {/* NEW: Add the echarts={echarts} prop */}
//       <ReactECharts echarts={echarts} option={getChartOptions()} style={style} onEvents={{ click: handleChartClick }} />
//     </div>
//   );
// };

// export default PhaseChart;
import React from 'react';
import ReactECharts from 'echarts-for-react';

const PhaseChart = ({ phaseName, data, isFocused, onChartClick }) => {
  const getChartOptions = () => {
    const dataZoomConfig = [{ type: 'inside', start: 0, end: 100 }];
    if (isFocused) {
      dataZoomConfig.push({ type: 'slider', start: 0, end: 100, height: 25 });
    }

    return {
      grid: { top: 40, right: 30, bottom: 90, left: 50 },
      xAxis: { type: 'category', data: data.map((d) => d.time) },
      yAxis: { type: 'value', name: 'Power' },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const timeLabel = params[0].axisValueLabel;
          const dataPoint = data.find((d) => d.time === timeLabel);
          if (!dataPoint) return '';
          const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
          const formattedDate = dataPoint.fullDate.toLocaleDateString('en-GB', dateOptions);
          const timeHtml = `<div style="font-size: 0.9em; color: #666; padding: 5px 10px; border-top: 1px solid #eee;">Time: ${timeLabel}hrs, ${formattedDate}</div>`;
          let keyValueHtml = '<div style="padding: 5px 10px;">';
          params.forEach((param) => {
            keyValueHtml += `<div style="display: flex; justify-content: space-between; align-items: center;"><span>${param.marker} ${param.seriesName}</span><strong style="margin-left: 20px;">${param.value}</strong></div>`;
          });
          keyValueHtml += '</div>';
          return keyValueHtml + timeHtml;
        }
      },
      legend: { data: ['kVA', 'kW', 'KVAr'], top: 0 },
      dataZoom: dataZoomConfig,
      series: [
        { name: 'kW', type: 'bar', stack: 'power', data: data.map((d) => d.kw), color: '#3b82f6' },
        { name: 'KVAr', type: 'bar', stack: 'power', data: data.map((d) => d.kvar), color: '#84cc16' },
        { name: 'kVA', type: 'line', data: data.map((d) => d.kva), symbol: 'none', smooth: true, color: '#ef4444' }
      ]
    };
  };

  const style = {
    height: isFocused ? 'calc(100vh - 150px)' : '350px',
    width: '100%',
    cursor: isFocused ? 'default' : 'pointer'
  };

  //   const handleChartClick = (params) => {
  //     if (params.componentType === 'series' && onChartClick) {
  //       onChartClick();
  //     }
  //   };
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
      <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>{phaseName} Phase Power</h3>
      <ReactECharts option={getChartOptions()} style={style} onEvents={{ click: handleChartClick }} />
    </div>
  );
};

export default PhaseChart;
