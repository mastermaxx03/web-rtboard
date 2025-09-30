import { useState, useEffect } from 'react';

// A mock database containing data for multiple fiscal years.
// A real API would handle this logic on the backend.
const mockDatabase = {
  '2024-25': {
    months: ['Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25'],
    billedDemand: [2400, 2610, 2250, 2480, 2390, 2350, 2240, 2450, 2260, 2550, 2400, 2200],
    recordedDemand: [2780, 2780, 2760, 2750, 2750, 2740, 2720, 2720, 2710, 2700, 2690, 2680],
    contractDemand: [3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750]
  },
  '2023-24': {
    months: ['Jul-23', 'Aug-23', 'Sep-23', 'Oct-23', 'Nov-23', 'Dec-23', 'Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24'],
    billedDemand: [2350, 2550, 2180, 2410, 2320, 2280, 2190, 2380, 2200, 2490, 2330, 2150],
    recordedDemand: [2750, 2760, 2740, 2730, 2720, 2710, 2700, 2700, 2690, 2680, 2670, 2660],
    contractDemand: [3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750, 3750]
  }
};

/**
 * A hook that now accepts a 'period' argument to fetch the correct dataset.
 * @param {string} period - The selected period, e.g., '2024-25'.
 */
const useDemandData = (period) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start loading whenever the period changes.
    setLoading(true);

    // This function simulates fetching data for the selected period.
    const fetchData = () => {
      // In a real app, the API call would be:
      // fetch(`https://api.yourenergy.com/demand?period=${period}`)

      // Simulate network delay.
      setTimeout(() => {
        setData(mockDatabase[period]); // Select the data for the given period.
        setLoading(false);
      }, 800); // Shorter delay for a snappier feel on change.
    };

    fetchData();

    // This effect now re-runs whenever the 'period' argument changes.
  }, [period]);

  return { data, loading };
};

export default useDemandData;
