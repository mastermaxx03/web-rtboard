import { useState, useEffect } from 'react';

// Mock database for different months' bill component data.
const mockDatabase = {
  '2025-09': {
    totalBill: 12835597.94,
    components: [
      { name: 'Energy Charges', value: 9554321.0 },
      { name: 'Demand Charges', value: 1523456.78 },
      { name: 'Wheeling Charges', value: 865432.1 },
      { name: 'Electricity Duty', value: 685432.5 },
      { name: 'Tax on Sale', value: 206955.56 }
    ]
  },
  '2025-08': {
    totalBill: 11950000.0,
    components: [
      { name: 'Energy Charges', value: 8880000.0 },
      { name: 'Demand Charges', value: 1450000.0 },
      { name: 'Wheeling Charges', value: 820000.0 },
      { name: 'Electricity Duty', value: 610000.0 },
      { name: 'Tax on Sale', value: 190000.0 }
    ]
  }
};

const useBillComponentData = (month) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = () => {
      setTimeout(() => {
        setData(mockDatabase[month] || mockDatabase['2025-09']);
        setLoading(false);
      }, 600);
    };

    fetchData();
  }, [month]);

  return { data, loading };
};

export default useBillComponentData;
