// // import React, { useState, useMemo } from 'react';
// // import ReactECharts from 'echarts-for-react';
// // import useRebatesData from '../hooks/useRebatesData';
// // import SharedSpinner from '../components/SharedSpinner';

// // const MonthSelector = ({ selectedMonth, setSelectedMonth }) => {
// //   const selectStyle = {
// //     position: 'absolute',
// //     top: '15px',
// //     right: '20px',
// //     zIndex: 10,
// //     padding: '6px 10px',
// //     fontSize: '14px',
// //     border: '1px solid #ccc',
// //     borderRadius: '6px',
// //     backgroundColor: '#fff',
// //     cursor: 'pointer'
// //   };
// //   return (
// //     <select style={selectStyle} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
// //       <option value="2025-09">September 2025</option>
// //       <option value="2025-08">August 2025</option>
// //     </select>
// //   );
// // };

// // const RebatesWidget = () => {
// //   const [selectedMonth, setSelectedMonth] = useState('2025-09');
// //   const { data, loading } = useRebatesData(selectedMonth);

// //   const chartOption = useMemo(() => {
// //     if (!data) return {};
// //     return {
// //       tooltip: {
// //         trigger: 'item',
// //         backgroundColor: '#fff',
// //         padding: 15,
// //         formatter: (params) => {
// //           const { name, percent, color } = params;
// //           // Find the original data point to display the correct negative value
// //           const originalDataPoint = data.rebates.find((item) => item.name === name);
// //           const value = originalDataPoint ? originalDataPoint.value : 0;

// //           const date = new Date();
// //           const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
// //           const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// //           return `
// //             <div style="font-family: Arial, sans-serif; font-size: 14px; min-width:220px;">
// //               <div style="font-weight: bold; margin-bottom: 12px; color: #333;">
// //                 <span style="display:inline-block; height:10px; width:10px; border-radius:50%; background-color:${color}; margin-right:8px;"></span>
// //                 ${name}
// //               </div>
// //               <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
// //                 <span>Value (Rs.):</span> <span style="font-weight:bold; color:green;">${Number(value).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
// //               </div>
// //               <div style="display: flex; justify-content: space-between;">
// //                 <span>Percentage:</span> <span style="font-weight:bold;">${percent}%</span>
// //               </div>
// //                <div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-top: 1px solid #eee;">
// //                 Time: ${dateString}, ${timeString}
// //               </div>
// //             </div>`;
// //         }
// //       },
// //       legend: { show: false },
// //       series: [
// //         {
// //           name: 'Incentives & Rebates',
// //           type: 'pie',
// //           radius: ['40%', '70%'],
// //           center: ['50%', '55%'],
// //           data: data.chartData, // Use the positive values for the chart rendering
// //           label: { show: true, position: 'outside', formatter: '{b}\n({d}%)', fontSize: 14 },
// //           labelLine: { show: true }
// //         }
// //       ]
// //     };
// //   }, [data]);

// //   const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
// //   const totalStyle = { textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: 'green', marginBottom: '10px' };

// //   if (loading)
// //     return (
// //       <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //         <SharedSpinner />
// //       </div>
// //     );

// //   return (
// //     <div style={mainStyle}>
// //       <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
// //       <div style={totalStyle}>{Number(data.totalRebates).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
// //       <ReactECharts option={chartOption} style={{ height: 'calc(100% - 40px)' }} />
// //     </div>
// //   );
// // };

// // export default RebatesWidget;
// import React, { useState, useMemo } from 'react';
// import ReactECharts from 'echarts-for-react';
// import useRebatesData from '../hooks/useRebatesData';
// import SharedSpinner from '../components/SharedSpinner';

// const MonthSelector = ({ selectedMonth, setSelectedMonth }) => {
//   const selectStyle = {
//     position: 'absolute',
//     top: '15px',
//     right: '20px',
//     zIndex: 10,
//     padding: '6px 10px',
//     fontSize: '14px',
//     border: '1px solid #ccc',
//     borderRadius: '6px',
//     backgroundColor: '#fff',
//     cursor: 'pointer'
//   };
//   return (
//     <select style={selectStyle} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
//       <option value="2025-09">September 2025</option>
//       <option value="2025-08">August 2025</option>
//     </select>
//   );
// };

// // --- START: NEW CUSTOM LEGEND FOR REBATES ---
// const CustomLegend = ({ rebates, colors }) => {
//   const legendContainerStyle = {
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     height: '100%',
//     paddingLeft: '20px'
//   };
//   const legendItemStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     marginBottom: '15px',
//     fontSize: '14px'
//   };
//   const colorDotStyle = {
//     width: '12px',
//     height: '12px',
//     borderRadius: '50%',
//     marginRight: '10px'
//   };
//   const nameStyle = {
//     flex: '1',
//     color: '#333'
//   };
//   const valueStyle = {
//     fontWeight: 'bold',
//     minWidth: '120px', // Ensure alignment
//     textAlign: 'right',
//     fontFamily: 'monospace',
//     color: 'green' // Green color for positive financial impact (rebates)
//   };

//   return (
//     <div style={legendContainerStyle}>
//       {rebates.map((item, index) => (
//         <div key={item.name} style={legendItemStyle}>
//           <span style={{ ...colorDotStyle, backgroundColor: colors[index % colors.length] }}></span>
//           <span style={nameStyle}>{item.name}</span>
//           {/* Display the original negative value formatted as currency */}
//           <span style={valueStyle}>
//             {Number(item.value).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 })}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// };
// // --- END: NEW CUSTOM LEGEND FOR REBATES ---

// const RebatesWidget = () => {
//   const [selectedMonth, setSelectedMonth] = useState('2025-09');
//   const { data, loading } = useRebatesData(selectedMonth);

//   // Define a color palette for consistency between the chart and legend
//   const colorPalette = ['#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'];

//   const chartOption = useMemo(() => {
//     if (!data) return {};
//     return {
//       color: colorPalette,
//       tooltip: {
//         trigger: 'item',
//         backgroundColor: '#fff',
//         padding: 15,
//         formatter: (params) => {
//           const { name, percent, color } = params;
//           const originalData = data.rebates.find((item) => item.name === name);
//           const value = originalData ? originalData.value : 0;

//           const date = new Date();
//           const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//           const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//           return `
//             <div style="font-family: Arial, sans-serif; font-size: 14px; min-width:220px;">
//               <div style="font-weight: bold; margin-bottom: 12px; color: #333;">
//                 <span style="display:inline-block; height:10px; width:10px; border-radius:50%; background-color:${color}; margin-right:8px;"></span>
//                 ${name}
//               </div>
//               <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
//                 <span>Value (Rs.):</span> <span style="font-weight:bold; color:green;">${Number(value).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
//               </div>
//               <div style="display: flex; justify-content: space-between;">
//                 <span>Percentage:</span> <span style="font-weight:bold;">${percent}%</span>
//               </div>
//                <div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-top: 1px solid #eee;">
//                 Time: ${dateString}, ${timeString}
//               </div>
//             </div>`;
//         }
//       },
//       legend: { show: false }, // Hide default legend
//       series: [
//         {
//           name: 'Incentives & Rebates',
//           type: 'pie',
//           radius: '80%',
//           center: ['50%', '50%'],
//           data: data.chartData, // Use positive values for chart
//           label: { show: false }, // Hide default labels
//           labelLine: { show: false }
//         }
//       ]
//     };
//   }, [data]);

//   const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
//   const totalStyle = { textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: 'green', marginBottom: '10px' };

//   const contentStyle = { display: 'flex', alignItems: 'center', height: 'calc(100% - 80px)', marginTop: '20px' };
//   const chartContainerStyle = { flex: '0 0 55%' }; // Chart takes 55%
//   const legendContainerStyle = { flex: '1' }; // Custom legend takes the rest

//   if (loading)
//     return (
//       <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <SharedSpinner />
//       </div>
//     );

//   return (
//     <div style={mainStyle}>
//       <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
//       <div style={totalStyle}>{Number(data.totalRebates).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>

//       <div style={contentStyle}>
//         <div style={chartContainerStyle}>
//           <ReactECharts option={chartOption} style={{ height: '100%' }} />
//         </div>
//         <div style={legendContainerStyle}>
//           {/* Use the new custom legend, passing the original rebate data */}
//           <CustomLegend rebates={data.rebates} colors={colorPalette} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RebatesWidget;
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useRebatesData from '../hooks/useRebatesData';
import SharedSpinner from '../components/SharedSpinner';

const RebatesWidget = () => {
  const { data, loading } = useRebatesData();

  const chartOption = useMemo(() => {
    if (!data) return {};

    // A helper function to find the raw data for a given series name
    const getRawValue = (name) => {
      const item = data.legendData.find((d) => d.name === name);
      return item ? item.value : 0;
    };

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        padding: 15,
        formatter: (params) => {
          const { name, percent, color } = params;
          const rawValue = getRawValue(name);
          const date = new Date();
          const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          return `
            <div style="font-family: Arial, sans-serif; font-size: 14px; min-width:220px;">
              <div style="font-weight: bold; margin-bottom: 12px; color: #333;">
                <span style="display:inline-block; height:10px; width:10px; border-radius:50%; background-color:${color}; margin-right:8px;"></span>
                ${name}
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Value (Rs.):</span> <span style="font-weight:bold; color:${rawValue >= 0 ? 'black' : 'green'};">${Number(rawValue).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Percentage of Total:</span> <span style="font-weight:bold;">${percent}%</span>
              </div>
               <div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-top: 1px solid #eee;">
                Time: ${dateString}, ${timeString}
              </div>
            </div>`;
        }
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        itemGap: 25,
        textStyle: { fontSize: 14 },
        // This custom formatter creates the "Name- Value" display from your image
        formatter: (name) => {
          const rawValue = getRawValue(name);
          // Add extra spaces for alignment
          return `${name}-   ${rawValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      },
      series: [
        {
          name: 'Incentives & Rebates',
          type: 'pie',
          radius: '80%',
          center: ['40%', '50%'], // Position the pie chart on the left side
          data: data.chartData, // Use the all-positive data for rendering the chart
          label: { show: false }, // Hide labels and lines on the chart itself
          labelLine: { show: false }
        }
      ]
    };
  }, [data]);

  const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
  const titleStyle = { textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '5px' };
  const totalStyle = { textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#555', marginBottom: '10px' };

  if (loading)
    return (
      <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SharedSpinner />
      </div>
    );

  return (
    <div style={mainStyle}>
      <h2 style={titleStyle}>Incentives & Rebates</h2>
      <div style={totalStyle}>{data.totalRebates.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
      <ReactECharts option={chartOption} style={{ height: 'calc(100% - 60px)' }} />
    </div>
  );
};

export default RebatesWidget;
