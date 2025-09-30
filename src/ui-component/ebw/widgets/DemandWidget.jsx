// import React, { useMemo } from 'react';
// import ReactECharts from 'echarts-for-react';
// import useDemandData from '../hooks/useDemandData';
// import SharedSpinner from '../components/SharedSpinner';

// /**
//  * DemandWidget (EBW2)
//  * Displays a multi-series line chart comparing Billed, Recorded, and Contract Demand.
//  */
// const DemandWidget = () => {
//   const { data, loading } = useDemandData();

//   const option = useMemo(() => {
//     if (!data) return {};

//     return {
//       grid: {
//         left: '3%',
//         right: '4%',
//         bottom: '3%',
//         containLabel: true
//       },
//       tooltip: {
//         trigger: 'axis',
//         backgroundColor: '#fff',
//         borderColor: '#ccc',
//         borderWidth: 1,
//         textStyle: { color: '#333' },
//         padding: 15,
//         formatter: (params) => {
//           const date = new Date();
//           const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
//           const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//           const monthName = params[0].name; // e.g., "Aug-24"

//           // Start building the tooltip HTML
//           let tooltipHtml = `
//             <div style="font-family: Arial, sans-serif; font-size: 14px;">
//               <div style="font-weight: bold; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #eee;">
//                 Demand Details
//               </div>
//               <div style="font-weight: bold; margin-bottom: 12px; color: #555;">
//                 ${monthName}
//               </div>
//           `;

//           // Loop through the series (Billed, Recorded, Contract) to add their values
//           const desiredOrder = ['Contract Demand', 'Recorded Demand', 'Billed Demand'];

//           // Loop through our desired order instead of the default order.
//           desiredOrder.forEach((seriesName) => {
//             // Find the data for the current series from the params array.
//             const seriesData = params.find((param) => param.seriesName === seriesName);

//             if (seriesData) {
//               const value = seriesData.value;
//               const color = seriesData.color;

//               tooltipHtml += `
//                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
//                   <span style="display: flex; align-items: center;">
//                     <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${color}; margin-right: 8px;"></span>
//                     ${seriesName}:
//                   </span>
//                   <span style="font-weight: bold; margin-left: 25px;">
//                     ${value.toLocaleString()} KVAMU
//                   </span>
//                 </div>
//               `;
//             }
//           });

//           // Add the timestamp footer
//           tooltipHtml += `
//               <div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-bottom: 1px solid #eee;"></div>
//               <div style="font-size: 12px; color: #888; margin-top: 5px;">
//                 Time: ${dateString}, ${timeString}
//               </div>
//             </div>
//           `;
//           return tooltipHtml;
//         }
//       },
//       legend: {
//         data: ['Billed Demand', 'Recorded Demand', 'Contract Demand'],
//         top: 10,
//         textStyle: {
//           fontSize: 13
//         }
//       },
//       xAxis: {
//         type: 'category',
//         boundaryGap: false,
//         data: data.months
//       },
//       yAxis: {
//         type: 'value',
//         name: 'KVAMU'
//       },
//       series: [
//         {
//           name: 'Billed Demand',
//           type: 'line',
//           symbol: 'circle',
//           symbolSize: 8,
//           data: data.billedDemand
//         },
//         {
//           name: 'Recorded Demand',
//           type: 'line',
//           symbol: 'rect', // Using rect for a square-like shape
//           symbolSize: 8,
//           data: data.recordedDemand
//         },
//         {
//           name: 'Contract Demand',
//           type: 'line',
//           symbol: 'triangle',
//           symbolSize: 8,
//           lineStyle: {
//             type: 'dashed'
//           },
//           data: data.contractDemand
//         }
//       ]
//     };
//   }, [data]);

//   if (loading) {
//     return <SharedSpinner />;
//   }

//   return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} lazyUpdate={true} />;
// };

// export default DemandWidget;
import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useDemandData from '../hooks/useDemandData';
import SharedSpinner from '../components/SharedSpinner';
/**
 * A reusable dropdown component for selecting the time period.
 */
const PeriodSelector = ({ selectedPeriod, setSelectedPeriod }) => {
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
    <select style={selectStyle} value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
      <option value="2024-25">2024-25</option>
      <option value="2023-24">2023-24</option>
    </select>
  );
};

/**
 * The main DemandWidget component (EBW2), now with a period selector.
 */
const DemandWidget = () => {
  // 1. Manage the state for the currently selected period.
  const [selectedPeriod, setSelectedPeriod] = useState('2024-25');

  // 2. Pass the selected period to the hook. The hook will re-fetch data
  //    whenever this value changes.
  const { data, loading } = useDemandData(selectedPeriod);

  const option = useMemo(() => {
    if (!data) return {};

    // The entire ECharts configuration remains the same. It just receives
    // new data whenever the hook updates.
    return {
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { color: '#333' },
        padding: 15,
        formatter: (params) => {
          const date = new Date();
          const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const monthName = params[0].name;

          let tooltipHtml = `<div style="font-family: Arial, sans-serif; font-size: 14px;"><div style="font-weight: bold; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #eee;">Demand Details</div><div style="font-weight: bold; margin-bottom: 12px; color: #555;">${monthName}</div>`;

          const desiredOrder = ['Contract Demand', 'Recorded Demand', 'Billed Demand'];
          desiredOrder.forEach((seriesName) => {
            const seriesData = params.find((param) => param.seriesName === seriesName);
            if (seriesData) {
              tooltipHtml += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;"><span style="display: flex; align-items: center;"><span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${seriesData.color}; margin-right: 8px;"></span>${seriesName}:</span><span style="font-weight: bold; margin-left: 25px;">${seriesData.value.toLocaleString()} KVAMU</span></div>`;
            }
          });

          tooltipHtml += `<div style="font-size: 12px; color: #888; margin-top: 12px; padding-top: 5px; border-bottom: 1px solid #eee;"></div><div style="font-size: 12px; color: #888; margin-top: 5px;">Time: ${dateString}, ${timeString}</div></div>`;
          return tooltipHtml;
        }
      },
      legend: { data: ['Billed Demand', 'Recorded Demand', 'Contract Demand'], top: 10, textStyle: { fontSize: 13 } },
      xAxis: { type: 'category', boundaryGap: false, data: data.months },
      yAxis: { type: 'value', name: 'KVAMU' },
      series: [
        { name: 'Billed Demand', type: 'line', symbol: 'circle', symbolSize: 8, data: data.billedDemand },
        { name: 'Recorded Demand', type: 'line', symbol: 'rect', symbolSize: 8, data: data.recordedDemand },
        {
          name: 'Contract Demand',
          type: 'line',
          symbol: 'triangle',
          symbolSize: 8,
          lineStyle: { type: 'dashed' },
          data: data.contractDemand
        }
      ]
    };
  }, [data]);

  return (
    // A relative container is needed for the absolute positioning of the dropdown.
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <PeriodSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />

      {/* Display the spinner while loading, otherwise show the chart */}
      {loading ? (
        <SharedSpinner />
      ) : (
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} lazyUpdate={true} />
      )}
    </div>
  );
};

export default DemandWidget;
