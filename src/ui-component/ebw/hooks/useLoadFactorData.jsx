import { useState, useEffect } from 'react';

// Mock database containing different yearly datasets for Load Factor.
const mockDatabase = {
  '2024-25': {
    months: ['Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25'],
    loadFactorValues: [44, 45, 43, 46, 42, 44, 41, 44, 44, 46, 41, 43]
  },
  '2023-24': {
    months: ['Jul-23', 'Aug-23', 'Sep-23', 'Oct-23', 'Nov-23', 'Dec-23', 'Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24'],
    loadFactorValues: [42, 43, 41, 44, 40, 42, 39, 42, 43, 45, 40, 41]
  }
};

/**
 * Custom hook to fetch Load Factor data for a specific period.
 * @param {string} period - The selected year range, e.g., '2024-25'.
 */
const useLoadFactorData = (period) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = () => {
      setTimeout(() => {
        setData(mockDatabase[period] || mockDatabase['2024-25']);
        setLoading(false);
      }, 750);
    };

    fetchData();
  }, [period]);

  return { data, loading };
};

export default useLoadFactorData;
