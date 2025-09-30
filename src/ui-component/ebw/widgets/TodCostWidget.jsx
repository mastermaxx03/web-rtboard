// // import React, { useState, useMemo } from 'react';
// // import ReactECharts from 'echarts-for-react';
// // import useTodCostData from '../hooks/useTodCostData';
// // import SharedSpinner from '../components/SharedSpinner';

// // // Dropdown for selecting the time range
// // const TimeRangeSelector = ({ selectedRange, setSelectedRange }) => {
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
// //     <select style={selectStyle} value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)}>
// //       <option value="last24Hrs">Last 24 Hrs</option>
// //       <option value="thisWeek">This Week</option>
// //       <option value="thisMonth">This Month</option>
// //     </select>
// //   );
// // };

// // // Component for the detailed charges table
// // const TodChargesTable = ({ data }) => {
// //   const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
// //   const thStyle = { background: '#f7f7f7', padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' };
// //   const tdStyle = { padding: '8px', border: '1px solid #ddd', textAlign: 'center' };
// //   const tdValue = { ...tdStyle, fontFamily: 'monospace', fontWeight: 'bold' };

// //   return (
// //     <table style={tableStyle}>
// //       <thead>
// //         <tr>
// //           <th style={thStyle}>Zone</th>
// //           <th style={thStyle}>Timing</th>
// //           <th style={thStyle}>Units</th>
// //           <th style={thStyle}>Rate</th>
// //           <th style={thStyle}>Charges Rs.</th>
// //         </tr>
// //       </thead>
// //       <tbody>
// //         {data.map((row) => (
// //           <tr key={row.zone}>
// //             <td style={{ ...tdStyle, fontWeight: 'bold' }}>{row.zone}</td>
// //             <td style={tdStyle}>{row.timing}</td>
// //             <td style={tdValue}>{row.units.toLocaleString()}</td>
// //             <td style={tdValue}>{row.rate.toFixed(2)}</td>
// //             <td style={tdValue}>{row.charges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
// //           </tr>
// //         ))}
// //       </tbody>
// //     </table>
// //   );
// // };

// // // Main EBW4 Widget Component
// // const TodCostWidget = () => {
// //   const [selectedRange, setSelectedRange] = useState('last24Hrs');
// //   const { data, loading } = useTodCostData(selectedRange);

// //   const chartOption = useMemo(() => {
// //     if (!data) return {};
// //     return {
// //       // --- START: NEW AND IMPROVED TOOLTIP ---
// //       tooltip: {
// //         trigger: 'item',
// //         backgroundColor: '#fff',
// //         borderColor: '#ccc',
// //         borderWidth: 1,
// //         textStyle: { color: '#333' },
// //         padding: 15,
// //         formatter: (params) => {
// //           const zoneName = params.name;
// //           const color = params.color;

// //           // Find the complete data for this zone from the table data
// //           const zoneData = data.tableData.find((d) => d.zone === zoneName);
// //           if (!zoneData) return 'Data not found';

// //           const date = new Date();
// //           const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
// //           const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// //           let tooltipHtml = `
// //             <div style="font-family: Arial, sans-serif; font-size: 14px; min-width: 220px;">
// //               <div style="font-weight: bold; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #eee;">
// //                 TOD Details
// //               </div>
// //               <div style="font-weight: bold; margin-bottom: 12px; color: #555;">
// //                 <span style="display:inline-block; height: 10px; width: 10px; border-radius: 50%; background-color: ${color}; margin-right: 8px;"></span>
// //                 Zone ${zoneData.zone}
// //               </div>
// //               <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
// //                 <span>Units Consumed:</span>
// //                 <span style="font-weight: bold;">${zoneData.units.toLocaleString()}</span>
// //               </div>
// //               <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
// //                 <span>Rate:</span>
// //                 <span style="font-weight: bold;">${zoneData.rate.toFixed(2)}</span>
// //               </div>
// //               <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
// //                 <span>Charges (Rs.):</span>
// //                 <span style="font-weight: bold;">${zoneData.charges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
// //               </div>
// //               <div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-top: 1px solid #eee;">
// //                 Time: ${dateString}, ${timeString}
// //               </div>
// //             </div>
// //           `;
// //           return tooltipHtml;
// //         }
// //       },
// //       // --- END: NEW AND IMPROVED TOOLTIP ---
// //       legend: {
// //         show: false
// //       },
// //       series: [
// //         {
// //           name: 'Consumption',
// //           type: 'pie',
// //           radius: '70%',
// //           center: ['65%', '50%'],
// //           data: data.tableData.map((d) => ({ name: d.zone, value: d.units })),
// //           label: { show: false },
// //           emphasis: {
// //             itemStyle: {
// //               shadowBlur: 10,
// //               shadowOffsetX: 0,
// //               shadowColor: 'rgba(0, 0, 0, 0.5)'
// //             }
// //           }
// //         }
// //       ]
// //     };
// //   }, [data]);

// //   const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
// //   const contentStyle = { display: 'flex', gap: '20px', height: 'calc(100% - 40px)', marginTop: '40px' };
// //   const chartContainerStyle = { flex: '0 0 40%' };
// //   const detailsContainerStyle = { flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' };
// //   const messageBoxStyle = {
// //     border: '1px solid #ddd',
// //     padding: '15px',
// //     borderRadius: '6px',
// //     background: '#fafafa',
// //     color: '#888',
// //     fontStyle: 'italic',
// //     flexGrow: 1,
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'center'
// //   };

// //   if (loading)
// //     return (
// //       <div style={mainStyle}>
// //         <SharedSpinner />
// //       </div>
// //     );

// //   return (
// //     <div style={mainStyle}>
// //       <TimeRangeSelector selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
// //       <div style={contentStyle}>
// //         <div style={chartContainerStyle}>
// //           <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
// //         </div>
// //         <div style={detailsContainerStyle}>
// //           <TodChargesTable data={data.tableData} />
// //           <div style={messageBoxStyle}>
// //             <span>Message area is reserved for future insights.</span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default TodCostWidget;
// import React, { useState, useMemo } from 'react';
// import ReactECharts from 'echarts-for-react';
// import useTodCostData from '../hooks/useTodCostData';
// import SharedSpinner from '../components/SharedSpinner';
// const TimeRangeSelector = ({ selectedRange, setSelectedRange }) => {
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
//     <select style={selectStyle} value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)}>
//       <option value="last24Hrs">Last 24 Hrs</option>
//       <option value="thisWeek">This Week</option>
//       <option value="thisMonth">This Month</option>
//     </select>
//   );
// };

// const TodChargesTable = ({ data }) => {
//   const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
//   const thStyle = { background: '#f7f7f7', padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' };
//   const tdStyle = { padding: '8px', border: '1px solid #ddd', textAlign: 'center' };
//   const tdValue = { ...tdStyle, fontFamily: 'monospace', fontWeight: 'bold' };

//   return (
//     <table style={tableStyle}>
//       <thead>
//         <tr>
//           <th style={thStyle}>Zone</th>
//           <th style={thStyle}>Timing</th>
//           <th style={thStyle}>Units</th>
//           <th style={thStyle}>Rate</th>
//           <th style={thStyle}>Charges Rs.</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((row) => (
//           <tr key={row.zone}>
//             <td style={{ ...tdStyle, fontWeight: 'bold' }}>{row.zone}</td>
//             <td style={tdStyle}>{row.timing}</td>
//             <td style={tdValue}>{row.units.toLocaleString()}</td>
//             <td style={tdValue}>{row.rate.toFixed(2)}</td>
//             <td style={tdValue}>{row.charges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };

// const TodCostWidget = () => {
//   const [selectedRange, setSelectedRange] = useState('last24Hrs');
//   const { data, loading } = useTodCostData(selectedRange);

//   const chartOption = useMemo(() => {
//     if (!data) return {};
//     return {
//       tooltip: {
//         trigger: 'item',
//         backgroundColor: '#fff',
//         borderColor: '#ccc',
//         borderWidth: 1,
//         textStyle: { color: '#333' },
//         padding: 15,
//         formatter: (params) => {
//           const zoneName = params.name;
//           const color = params.color;
//           const zoneData = data.tableData.find((d) => d.zone === zoneName);
//           if (!zoneData) return 'Data not found';
//           const date = new Date();
//           const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//           const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//           let tooltipHtml = `<div style="font-family: Arial, sans-serif; font-size: 14px; min-width: 220px;"><div style="font-weight: bold; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #eee;">TOD Details</div><div style="font-weight: bold; margin-bottom: 12px; color: #555;"><span style="display:inline-block; height: 10px; width: 10px; border-radius: 50%; background-color: ${color}; margin-right: 8px;"></span>Zone ${zoneData.zone}</div><div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Units Consumed:</span><span style="font-weight: bold;">${zoneData.units.toLocaleString()}</span></div><div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Rate:</span><span style="font-weight: bold;">${zoneData.rate.toFixed(2)}</span></div><div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Charges (Rs.):</span><span style="font-weight: bold;">${zoneData.charges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div><div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-top: 1px solid #eee;">Time: ${dateString}, ${timeString}</div></div>`;
//           return tooltipHtml;
//         }
//       },
//       legend: { show: false },
//       series: [
//         {
//           name: 'Consumption',
//           type: 'pie',
//           // Make the radius smaller to give labels plenty of room
//           radius: '65%',
//           // Center the pie chart perfectly in its container
//           center: ['50%', '50%'],
//           data: data.tableData.map((d) => ({ name: d.zone, value: d.units })),
//           label: {
//             show: true,
//             position: 'outside',
//             formatter: '{b}\n({d}%)', // Stack the label text
//             fontSize: 14,
//             fontWeight: 'bold'
//           },
//           labelLine: {
//             show: true
//           },
//           emphasis: {
//             itemStyle: {
//               shadowBlur: 10,
//               shadowOffsetX: 0,
//               shadowColor: 'rgba(0, 0, 0, 0.5)'
//             }
//           }
//         }
//       ]
//     };
//   }, [data]);

//   const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
//   const contentStyle = { display: 'flex', gap: '20px', alignItems: 'center', height: 'calc(100% - 40px)', marginTop: '40px' };
//   // A 50/50 split for a balanced layout
//   const chartContainerStyle = { flex: '1', height: '100%' };
//   const detailsContainerStyle = { flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' };
//   const messageBoxStyle = {
//     border: '1px solid #ddd',
//     padding: '15px',
//     borderRadius: '6px',
//     background: '#fafafa',
//     color: '#888',
//     fontStyle: 'italic',
//     flexGrow: 1,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center'
//   };

//   if (loading)
//     return (
//       <div style={mainStyle}>
//         <SharedSpinner />
//       </div>
//     );

//   return (
//     <div style={mainStyle}>
//       <TimeRangeSelector selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
//       <div style={contentStyle}>
//         <div style={chartContainerStyle}>
//           <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
//         </div>
//         <div style={detailsContainerStyle}>
//           <TodChargesTable data={data.tableData} />
//           <div style={messageBoxStyle}>
//             <span>Message area is reserved for future insights.</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TodCostWidget;
import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useTodCostData from '../hooks/useTodCostData';
import SharedSpinner from '../components/SharedSpinner';

// This component remains the same, but its placement will change.
const TimeRangeSelector = ({ selectedRange, setSelectedRange }) => {
  const selectStyle = {
    position: 'absolute',
    top: '0px', // Position relative to the new parent's top
    right: '0px', // Position relative to the new parent's right
    zIndex: 10,
    padding: '6px 10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  };
  return (
    <select style={selectStyle} value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)}>
      <option value="last24Hrs">Last 24 Hrs</option>
      <option value="thisWeek">This Week</option>
      <option value="thisMonth">This Month</option>
    </select>
  );
};

const TodChargesTable = ({ data }) => {
  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
  const thStyle = { background: '#f7f7f7', padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' };
  const tdStyle = { padding: '8px', border: '1px solid #ddd', textAlign: 'center' };
  const tdValue = { ...tdStyle, fontFamily: 'monospace' };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Zone</th>
          <th style={thStyle}>Timing</th>
          <th style={thStyle}>Units</th>
          <th style={thStyle}>Rate</th>
          <th style={thStyle}>Charges Rs.</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.zone}>
            <td style={{ ...tdStyle }}>{row.zone}</td>
            <td style={tdStyle}>{row.timing}</td>
            <td style={tdValue}>{row.units.toLocaleString()}</td>
            <td style={tdValue}>{row.rate.toFixed(2)}</td>
            <td style={tdValue}>{row.charges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const TodCostWidget = () => {
  const [selectedRange, setSelectedRange] = useState('last24Hrs');
  const { data, loading } = useTodCostData(selectedRange);

  const chartOption = useMemo(() => {
    if (!data) return {};
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { color: '#333' },
        padding: 15,
        formatter: (params) => {
          const zoneName = params.name;
          const color = params.color;
          const zoneData = data.tableData.find((d) => d.zone === zoneName);
          if (!zoneData) return 'Data not found';
          const date = new Date();
          const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          let tooltipHtml = `<div style="font-family: Arial, sans-serif; font-size: 14px; min-width: 220px;"><div style="font-weight: bold; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #eee;">TOD Details</div><div style="font-weight: bold; margin-bottom: 12px; color: #555;"><span style="display:inline-block; height: 10px; width: 10px; border-radius: 50%; background-color: ${color}; margin-right: 8px;"></span>Zone ${zoneData.zone}</div><div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Units Consumed:</span><span style="font-weight: bold;">${zoneData.units.toLocaleString()}</span></div><div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Rate:</span><span style="font-weight: bold;">${zoneData.rate.toFixed(2)}</span></div><div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Charges (Rs.):</span><span style="font-weight: bold;">${zoneData.charges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div><div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-top: 1px solid #eee;">Time: ${dateString}, ${timeString}</div></div>`;
          return tooltipHtml;
        }
      },
      legend: { show: false },
      series: [
        {
          name: 'Consumption',
          type: 'pie',
          radius: '65%',
          center: ['50%', '50%'],
          data: data.tableData.map((d) => ({ name: d.zone, value: d.units })),
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n({d}%)',
            fontSize: 14,
            fontWeight: 'bold'
          },
          labelLine: { show: true },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }, [data]);

  const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
  const contentStyle = { display: 'flex', gap: '20px', alignItems: 'center', height: '100%' };
  const chartContainerStyle = { flex: '1', height: '100%', display: 'flex', flexDirection: 'column' };
  const detailsContainerStyle = { flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' };
  const messageBoxStyle = {
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '6px',
    background: '#fafafa',
    color: '#888',
    fontStyle: 'italic',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // --- START: NEW STYLES ---
  const headingStyle = {
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '16px',
    color: '#444',
    fontWeight: '600'
  };
  const tableHeaderStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px'
  };
  // --- END: NEW STYLES ---

  if (loading)
    return (
      <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SharedSpinner />
      </div>
    );

  return (
    <div style={mainStyle}>
      {/* The main widget's content area */}
      <div style={contentStyle}>
        {/* --- Left Column: Chart --- */}
        <div style={chartContainerStyle}>
          <h3 style={headingStyle}>TOD Consumption Breakup (Units)</h3>
          <div style={{ flex: 1 }}>
            <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* --- Right Column: Details --- */}
        <div style={detailsContainerStyle}>
          {/* Header area for the table, now containing the dropdown */}
          <div style={tableHeaderStyle}>
            <h3 style={{ ...headingStyle, marginBottom: 0 }}>TOD Charges</h3>
            <TimeRangeSelector selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
          </div>
          <TodChargesTable data={data.tableData} />
          <div style={messageBoxStyle}>
            <span>Message area is reserved for future insights.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodCostWidget;
