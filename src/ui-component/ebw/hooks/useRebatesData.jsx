// import { useState, useEffect } from 'react';

// // Mock database containing different months' incentives and rebates data.
// const mockDatabase = {
//   '2025-09': {
//     totalRebates: -445220.3,
//     rebates: [
//       { name: 'Payables', value: -124987.34 },
//       { name: 'BCR', value: -158442.3 },
//       { name: 'ICR', value: -154892.0 },
//       { name: 'PPD', value: -111886.0 }
//     ]
//   },
//   '2025-08': {
//     totalRebates: -398500.0,
//     rebates: [
//       { name: 'Payables', value: -110000.0 },
//       { name: 'BCR', value: -142000.0 },
//       { name: 'ICR', value: -136500.0 },
//       { name: 'PPD', value: -10000.0 }
//     ]
//   }
// };

// const useRebatesData = (month) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setLoading(true);
//     const fetchData = () => {
//       setTimeout(() => {
//         const rawData = mockDatabase[month] || mockDatabase['2025-09'];

//         // The chart needs positive values to calculate slice proportions,
//         // so we map the raw data to their absolute values.
//         const chartData = rawData.rebates.map((item) => ({ ...item, value: Math.abs(item.value) }));

//         setData({
//           totalRebates: rawData.totalRebates,
//           rebates: rawData.rebates, // Keep original negative values for the tooltip
//           chartData: chartData // Use positive values for the chart series
//         });
//         setLoading(false);
//       }, 600);
//     };

//     fetchData();
//   }, [month]);

//   return { data, loading };
// };

// export default useRebatesData;
import { useState, useEffect } from 'react';

// This hook now simulates a more complex financial calculation.
const useRebatesData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        // --- START: Mock Data & Calculation ---
        const dummyTotalBill = 12835597.94; // A dummy value in Crores
        const rebatesArray = [
          { name: 'BCR', value: -168442.3 },
          { name: 'ICR', value: -164892 },
          { name: 'PPD', value: -111886 }
        ];

        // 1. Calculate the sum of all negative rebates.
        const totalRebates = rebatesArray.reduce((acc, item) => acc + item.value, 0);

        // 2. Calculate the final positive "Payables" amount.
        const payablesValue = dummyTotalBill + totalRebates; // Adding a negative number

        // 3. Create the data for the legend (raw values).
        const legendData = [{ name: 'Payables', value: payablesValue }, ...rebatesArray];

        // 4. Create the data for the pie chart (must be all positive values).
        const chartData = legendData.map((item) => ({
          name: item.name,
          value: Math.abs(item.value)
        }));
        // --- END: Mock Data & Calculation ---

        setData({
          totalRebates,
          legendData,
          chartData
        });
        setLoading(false);
      }, 800);
    };

    fetchData();
  }, []);

  return { data, loading };
};

export default useRebatesData;
