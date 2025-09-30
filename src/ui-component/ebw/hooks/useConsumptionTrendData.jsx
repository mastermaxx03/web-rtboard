// import { useState, useEffect } from 'react';

// // We now provide both abbreviated and full month names
// const mockApiData = {
//   monthsAbbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//   monthsFull: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
//   currentYear: [1210440, 1239120, 1133280, 1264980, 1113660, 1212600, 1134780, 1105740, 1213560, 1229400, 1137180, 1143240],
//   previousYear: [1165600, 1180620, 985320, 1016640, 894660, 980580, 1062060, 1167900, 1289120, 1161420, 1194240, 1169640]
// };

// const useConsumptionTrendData = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = () => {
//       setTimeout(() => {
//         setData(mockApiData); // The widget will now receive both month arrays
//         setLoading(false);
//       }, 1500);
//     };

//     fetchData();
//   }, []);

//   return { data, loading };
// };

// export default useConsumptionTrendData;
import { useState, useEffect } from 'react';

// A mock database holding data for different yearly periods.
const mockDatabase = {
  '2024-25': {
    monthsAbbreviated: [
      'Jul-24',
      'Aug-24',
      'Sep-24',
      'Oct-24',
      'Nov-24',
      'Dec-24',
      'Jan-25',
      'Feb-25',
      'Mar-25',
      'Apr-25',
      'May-25',
      'Jun-25'
    ],
    monthsFull: [
      'July 2024',
      'August 2024',
      'September 2024',
      'October 2024',
      'November 2024',
      'December 2024',
      'January 2025',
      'February 2025',
      'March 2025',
      'April 2025',
      'May 2025',
      'June 2025'
    ],
    currentYearData: [1210440, 1239120, 1133280, 1264980, 1113660, 1212600, 1134780, 1105740, 1213560, 1229400, 1137180, 1143240],
    previousYearData: [1165600, 1180620, 985320, 1016640, 894660, 980580, 1062060, 1167900, 1289120, 1161420, 1194240, 1169640],
    currentYearLabel: '2024-25',
    previousYearLabel: '2023-24'
  },
  '2023-24': {
    monthsAbbreviated: [
      'Jul-23',
      'Aug-23',
      'Sep-23',
      'Oct-23',
      'Nov-23',
      'Dec-23',
      'Jan-24',
      'Feb-24',
      'Mar-24',
      'Apr-24',
      'May-24',
      'Jun-24'
    ],
    monthsFull: [
      'July 2023',
      'August 2023',
      'September 2023',
      'October 2023',
      'November 2023',
      'December 2023',
      'January 2024',
      'February 2024',
      'March 2024',
      'April 2024',
      'May 2024',
      'June 2024'
    ],
    currentYearData: [1150000, 1190000, 1080000, 1210000, 1050000, 1180000, 1090000, 1050000, 1180000, 1190000, 1080000, 1100000],
    previousYearData: [1100000, 1120000, 930000, 960000, 840000, 930000, 1010000, 1110000, 1230000, 1100000, 1140000, 1110000],
    currentYearLabel: '2023-24',
    previousYearLabel: '2022-23'
  }
};

/**
 * Custom hook to fetch Consumption Trend data for a specific period.
 * @param {string} period - The selected year range, e.g., '2024-25'.
 */
const useConsumptionTrendData = (period) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = () => {
      // Simulate fetching data from the backend
      setTimeout(() => {
        setData(mockDatabase[period] || mockDatabase['2024-25']);
        setLoading(false);
      }, 750);
    };

    fetchData();
  }, [period]); // This effect re-runs whenever the 'period' changes

  return { data, loading };
};

export default useConsumptionTrendData;
