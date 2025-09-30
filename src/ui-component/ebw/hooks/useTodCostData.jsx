import { useState, useEffect } from 'react';

// This mock database contains different datasets for each time range.
// A real backend would calculate this dynamically.
const mockDatabase = {
  last24Hrs: {
    pieData: [
      { value: 105, name: 'A' },
      { value: 120, name: 'B' },
      { value: 45, name: 'C' },
      { value: 55, name: 'D' }
    ],
    tableData: [
      { zone: 'A', timing: '00:00-06:00 & 22:00-24:00', units: 105340, rate: -1.5, charges: -158010.0 },
      { zone: 'B', timing: '06:00-09:00 & 12:00-18:00', units: 120080, rate: 0.0, charges: 0.0 },
      { zone: 'C', timing: '09:00-12:00', units: 45260, rate: 0.8, charges: 36208.0 },
      { zone: 'D', timing: '18:00-22:00', units: 55560, rate: 1.1, charges: 61116.0 }
    ]
  },
  thisWeek: {
    pieData: [
      { value: 800, name: 'A' },
      { value: 950, name: 'B' },
      { value: 320, name: 'C' },
      { value: 410, name: 'D' }
    ],
    tableData: [
      { zone: 'A', timing: '00:00-06:00 & 22:00-24:00', units: 800150, rate: -1.5, charges: -1200225.0 },
      { zone: 'B', timing: '06:00-09:00 & 12:00-18:00', units: 950400, rate: 0.0, charges: 0.0 },
      { zone: 'C', timing: '09:00-12:00', units: 320800, rate: 0.8, charges: 256640.0 },
      { zone: 'D', timing: '18:00-22:00', units: 410200, rate: 1.1, charges: 451220.0 }
    ]
  },
  thisMonth: {
    pieData: [
      { value: 380, name: 'A' },
      { value: 424, name: 'B' },
      { value: 157, name: 'C' },
      { value: 181, name: 'D' }
    ],
    tableData: [
      { zone: 'A', timing: '00:00-06:00 & 22:00-24:00', units: 380340, rate: -1.5, charges: -570510.0 },
      { zone: 'B', timing: '06:00-09:00 & 12:00-18:00', units: 424080, rate: 0.0, charges: 0.0 },
      { zone: 'C', timing: '09:00-12:00', units: 157260, rate: 0.8, charges: 125808.0 },
      { zone: 'D', timing: '18:00-22:00', units: 181560, rate: 1.1, charges: 199716.0 }
    ]
  }
};

/**
 * Custom hook to fetch TOD cost analysis data.
 * @param {string} timeRange - The selected time range: 'last24Hrs', 'thisWeek', 'thisMonth'.
 */
const useTodCostData = (timeRange) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = () => {
      setTimeout(() => {
        setData(mockDatabase[timeRange] || mockDatabase['last24Hrs']);
        setLoading(false);
      }, 600);
    };

    fetchData();
  }, [timeRange]); // Re-run effect when the timeRange changes

  return { data, loading };
};

export default useTodCostData;
