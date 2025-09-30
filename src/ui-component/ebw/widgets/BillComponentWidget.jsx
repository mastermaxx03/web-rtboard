// import React, { useState, useMemo } from 'react';
// import ReactECharts from 'echarts-for-react';
// import useBillComponentData from '../hooks/useBillComponentData';
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

// const BillComponentWidget = () => {
//   const [selectedMonth, setSelectedMonth] = useState('2025-09');
//   const { data, loading } = useBillComponentData(selectedMonth);

//   const chartOption = useMemo(() => {
//     if (!data) return {};
//     return {
//       tooltip: {
//         trigger: 'item',
//         backgroundColor: '#fff',
//         padding: 15,
//         formatter: (params) => {
//           const { name, value, percent, color } = params;
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
//                 <span>Value (Rs.):</span> <span style="font-weight:bold;">${Number(value).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
//               </div>
//               <div style="display: flex; justify-content: space-between;">
//                 <span>Percentage:</span> <span style="font-weight:bold;">${percent}%</span>
//               </div>
//               <div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-top: 1px solid #eee;">
//                 Time: ${dateString}, ${timeString}
//               </div>
//             </div>`;
//         }
//       },
//       legend: { show: false },
//       series: [
//         {
//           name: 'Bill Component',
//           type: 'pie',
//           radius: ['40%', '70%'],
//           center: ['50%', '55%'],
//           data: data.components,
//           label: { show: true, position: 'outside', formatter: '{b}\n({d}%)', fontSize: 14 },
//           labelLine: { show: true }
//         }
//       ]
//     };
//   }, [data]);

//   const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
//   const totalStyle = { textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' };

//   if (loading)
//     return (
//       <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <SharedSpinner />
//       </div>
//     );

//   return (
//     <div style={mainStyle}>
//       <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
//       <div style={totalStyle}>{Number(data.totalBill).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
//       <ReactECharts option={chartOption} style={{ height: 'calc(100% - 40px)' }} />
//     </div>
//   );
// };

// export default BillComponentWidget;
import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useBillComponentData from '../hooks/useBillComponentData';
import SharedSpinner from '../components/SharedSpinner';

const MonthSelector = ({ selectedMonth, setSelectedMonth }) => {
  const selectStyle = {
    position: 'absolute',
    top: '15px',
    right: '20px',
    zIndex: 10,
    padding: '6px 10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  };
  return (
    <select style={selectStyle} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
      <option value="2025-09">September 2025</option>
      <option value="2025-08">August 2025</option>
    </select>
  );
};

const BillComponentWidget = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-09');
  const { data, loading } = useBillComponentData(selectedMonth);

  const chartOption = useMemo(() => {
    if (!data) return {};
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        padding: 15,
        formatter: (params) => {
          const { name, value, percent, color } = params;
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
                <span>Value (Rs.):</span> <span style="font-weight:bold;">${Number(value).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Percentage:</span> <span style="font-weight:bold;">${percent}%</span>
              </div>
              <div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-top: 1px solid #eee;">
                Time: ${dateString}, ${timeString}
              </div>
            </div>`;
        }
      },
      // --- START: HYBRID LEGEND & LABEL CONFIGURATION ---
      legend: {
        show: true,
        orient: 'vertical',
        right: '5%', // Position the legend on the right
        top: 'center',
        formatter: '{name}', // Only show the name in the legend
        itemGap: 20,
        textStyle: {
          fontSize: 14
        }
      },
      series: [
        {
          name: 'Bill Component',
          type: 'pie',
          // Set a large radius and define the drawing area
          radius: ['40%', '75%'],
          center: ['45%', '55%'], // Center the pie in its allocated space
          right: '25%', // Reserve the right 25% of the container for the legend
          data: data.components,
          label: {
            show: true,
            position: 'outside',
            formatter: '{d}%', // Only show the percentage in the label
            fontSize: 14,
            fontWeight: 'bold'
          },
          labelLine: {
            show: true
          }
        }
      ]
      // --- END: HYBRID LEGEND & LABEL CONFIGURATION ---
    };
  }, [data]);

  const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
  const totalStyle = { textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '10px' };

  if (loading)
    return (
      <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SharedSpinner />
      </div>
    );

  return (
    <div style={mainStyle}>
      <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      <div style={totalStyle}>{Number(data.totalBill).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
      {/* The chart now takes up the full container height */}
      <ReactECharts option={chartOption} style={{ height: 'calc(100% - 60px)', width: '100%' }} />
    </div>
  );
};

export default BillComponentWidget;
