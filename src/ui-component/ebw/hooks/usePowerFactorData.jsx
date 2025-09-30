import { useState, useEffect } from 'react';

// Mock database containing different yearly datasets.
// In a real backend, this would be calculated dynamically based on the year.
const mockDatabase = {
  '2024-25': {
    months: ['Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25'],
    pfValues: [0.995, 0.993, 0.991, 0.986, 0.989, 0.987, 0.992, 0.988, 0.988, 0.985, 0.991, 0.994]
  },
  '2023-24': {
    months: ['Jul-23', 'Aug-23', 'Sep-23', 'Oct-23', 'Nov-23', 'Dec-23', 'Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24'],
    pfValues: [0.985, 0.988, 0.99, 0.982, 0.985, 0.989, 0.991, 0.986, 0.989, 0.982, 0.988, 0.99]
  }
};

/**
 * Custom hook to fetch and process Power Factor data.
 * @param {string} period - The selected year range, e.g., '2024-25'.
 */
const usePowerFactorData = (period) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = () => {
      setTimeout(() => {
        const rawData = mockDatabase[period] || mockDatabase['2024-25'];

        // --- Perform Calculations ---
        const billedPf = rawData.pfValues[rawData.pfValues.length - 1]; // Get the last month's PF
        const sum = rawData.pfValues.reduce((a, b) => a + b, 0);
        const averagePf = sum / rawData.pfValues.length;

        // Savings formula: (1 - (currentPF / idealPF)) * 100
        // Since idealPF is 1, the formula simplifies.
        const savingsPercentage = (1 - averagePf) * 100;

        setData({
          months: rawData.months,
          pfValues: rawData.pfValues,
          billedPf: billedPf,
          averagePf: averagePf,
          savingsPercentage: savingsPercentage
        });

        setLoading(false);
      }, 800);
    };

    fetchData();
  }, [period]); // Re-run effect when the period changes

  return { data, loading };
};

export default usePowerFactorData;
