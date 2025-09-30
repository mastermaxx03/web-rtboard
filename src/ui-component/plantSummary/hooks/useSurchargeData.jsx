// src/ui-component/plantSummary/hooks/useSurchargeData.js

import { useState, useEffect } from 'react';

// Base values from your sketch
const initialData = [
  { name: 'PF Sur.', value: 4800 },
  { name: 'MD Sur.', value: 2700 }
];

export const useSurchargeData = () => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setData((prevData) =>
        prevData.map((item) => {
          // Fluctuate each cost by a small random amount
          const fluctuation = (Math.random() - 0.5) * (item.value * 0.02); // Fluctuate by up to 1%
          const newValue = item.value + fluctuation;
          return {
            name: item.name,
            value: parseFloat(newValue.toFixed(2))
          };
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return { data };
};
