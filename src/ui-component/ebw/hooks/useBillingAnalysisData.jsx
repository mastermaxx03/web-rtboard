import { useState, useEffect } from 'react';

// This mock database simulates a backend that can provide detailed billing analysis for any given month.
const mockDatabase = {
  '2025-09': {
    // Data for September 2025
    todData: {
      labels: ['A', 'B', 'C', 'D'],
      values: [2318, 2340, 2363, 2211]
    },
    billingCalculation: {
      recordedMD: 2363,
      historical75: 1980,
      contract75: 2775,
      billedDemand: 2775 // Max of the above three
    }
  },
  '2025-08': {
    // Data for August 2025
    todData: {
      labels: ['A', 'B', 'C', 'D'],
      values: [2250, 2310, 2330, 2190]
    },
    billingCalculation: {
      recordedMD: 2330,
      historical75: 1995,
      contract75: 2775,
      billedDemand: 2775
    }
  },
  '2025-07': {
    // Data for July 2025
    todData: {
      labels: ['A', 'B', 'C', 'D'],
      values: [2400, 2420, 2450, 2300]
    },
    billingCalculation: {
      recordedMD: 2450,
      historical75: 2010,
      contract75: 2775,
      billedDemand: 2775
    }
  }
};

/**
 * Custom hook to fetch billing analysis data for a specific month.
 * @param {string} month - The selected month in 'YYYY-MM' format, e.g., '2025-09'.
 */
const useBillingAnalysisData = (month) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate an API call to fetch data for the selected month.
    const fetchData = () => {
      setTimeout(() => {
        setData(mockDatabase[month] || mockDatabase['2025-09']); // Fallback to default
        setLoading(false);
      }, 700);
    };

    fetchData();
  }, [month]); // Re-run this effect whenever the month changes

  return { data, loading };
};

export default useBillingAnalysisData;
