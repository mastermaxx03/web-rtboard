// import React, { useMemo } from 'react';
// import ReactECharts from 'echarts-for-react';
// import useConsumptionTrendData from '../hooks/useConsumptionTrendData';
// import SharedSpinner from '../components/SharedSpinner';

// /**
//  * ConsumptionTrendWidget
//  * Displays a grouped bar chart comparing monthly energy consumption
//  * between the current and previous year.
//  */
// const ConsumptionTrendWidget = () => {
//   const { data, loading } = useConsumptionTrendData();

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
//         axisPointer: {
//           type: 'shadow'
//         },
//         backgroundColor: '#fff',
//         borderColor: '#ccc',
//         borderWidth: 1,
//         textStyle: {
//           color: '#333'
//         },
//         padding: 10,
//         formatter: (params) => {
//           const date = new Date();
//           const timeString = date.toLocaleTimeString('en-US', {
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//           });
//           const dateString = date.toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric'
//           });
//           const dataIndex = params[0].dataIndex;

//           // 3. Look up the full month name from our new array using the index
//           const monthName = data.monthsFull[dataIndex];

//           let tooltipHtml = `
//             <div style="font-family: Arial, sans-serif; font-size: 14px;">
//               <div style="font-weight: bold; margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px solid #eee;">
//                 Consumption Trend
//               </div>
//               <div style="font-weight: bold; margin-bottom: 10px; color: #555;">
//                 ${monthName}
//               </div>
//           `;

//           // Loop through data points (Current Year, Previous Year)
//           params.forEach((param) => {
//             tooltipHtml += `
//               <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
//                 <span style="display: flex; align-items: center;">
//                   <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 8px;"></span>
//                   ${param.seriesName}:
//                 </span>
//                 <span style="font-weight: bold; margin-left: 20px;">
//                   ${param.value.toLocaleString()} KVAH
//                 </span>
//               </div>
//             `;
//           });

//           // Timestamp footer
//           tooltipHtml += `
//               <div style="font-size: 12px; color: #888; margin-top: 10px; padding-top: 4px; border-top: 1px solid #eee;">
//                 Time: ${dateString}, ${timeString}
//               </div>
//             </div>
//           `;

//           return tooltipHtml;
//         }
//       },
//       legend: {
//         data: ['Current Year', 'Previous Year'],
//         top: 10
//       },
//       xAxis: [
//         {
//           type: 'category',
//           data: data.monthsAbbreviated,
//           axisTick: {
//             alignWithLabel: true
//           }
//         }
//       ],
//       yAxis: [
//         {
//           type: 'value',
//           name: 'KVAH',
//           axisLabel: {
//             formatter: (value) => {
//               if (value >= 1000000) return `${value / 1000000}M`;
//               if (value >= 1000) return `${value / 1000}K`;
//               return value;
//             }
//           }
//         }
//       ],
//       series: [
//         {
//           name: 'Current Year',
//           type: 'bar',
//           barGap: 0,
//           emphasis: {
//             focus: 'series'
//           },
//           data: data.currentYear
//         },
//         {
//           name: 'Previous Year',
//           type: 'bar',
//           emphasis: {
//             focus: 'series'
//           },
//           data: data.previousYear
//         }
//       ]
//     };
//   }, [data]);

//   if (loading) {
//     return <SharedSpinner />;
//   }

//   return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} lazyUpdate={true} />;
// };

// export default ConsumptionTrendWidget;
import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useConsumptionTrendData from '../hooks/useConsumptionTrendData';
import SharedSpinner from '../components/SharedSpinner';

const YearSelector = ({ selectedPeriod, setSelectedPeriod }) => {
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

const ConsumptionTrendWidget = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-25');
  const { data, loading } = useConsumptionTrendData(selectedPeriod);

  const option = useMemo(() => {
    if (!data) return {};

    return {
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          if (!params || params.length === 0) return '';

          const date = new Date();
          const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const dataIndex = params[0].dataIndex;
          const monthName = data.monthsFull[dataIndex];

          let tooltipHtml = `<div style="font-family: Arial, sans-serif; font-size: 14px;"><div style="font-weight: bold; margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px solid #eee;">Consumption Trend</div><div style="font-weight: bold; margin-bottom: 10px; color: #555;">${monthName}</div>`;

          params.forEach((param) => {
            tooltipHtml += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;"><span style="display: flex; align-items: center;"><span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 8px;"></span>${param.seriesName}:</span><span style="font-weight: bold; margin-left: 20px;">${param.value.toLocaleString()} KVAH</span></div>`;
          });

          tooltipHtml += `<div style="font-size: 12px; color: #888; margin-top: 10px; padding-top: 4px; border-top: 1px solid #eee;">Time: ${dateString}, ${timeString}</div></div>`;
          return tooltipHtml;
        }
      },
      legend: {
        data: [data.currentYearLabel, data.previousYearLabel], // Dynamic legend
        top: 10
      },
      xAxis: [
        {
          type: 'category',
          data: data.monthsAbbreviated,
          axisTick: { alignWithLabel: true }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'KVAH',
          axisLabel: {
            formatter: (value) => {
              if (value >= 1000000) return `${value / 1000000}M`;
              if (value >= 1000) return `${value / 1000}K`;
              return value;
            }
          }
        }
      ],
      series: [
        {
          name: data.currentYearLabel, // Dynamic series name
          type: 'bar',
          barGap: 0,
          emphasis: { focus: 'series' },
          data: data.currentYearData
        },
        {
          name: data.previousYearLabel, // Dynamic series name
          type: 'bar',
          emphasis: { focus: 'series' },
          data: data.previousYearData
        }
      ]
    };
  }, [data]);

  if (loading) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <SharedSpinner />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <YearSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} lazyUpdate={true} />
    </div>
  );
};

export default ConsumptionTrendWidget;
