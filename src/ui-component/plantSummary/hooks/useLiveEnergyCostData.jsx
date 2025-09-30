// src/ui-component/plantSummary/hooks/useLiveEnergyCostData.js

import { useState, useEffect } from 'react';

// Base cost values from your sketch
const initialCosts = [
  { name: 'Grid', value: 57072 },
  { name: 'DG', value: 14000 },
  { name: 'Solar', value: 8500 } // Assigning a base value for Solar
];

export const useLiveEnergyCostData = () => {
  const [data, setData] = useState(initialCosts);

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
    }, 3500); // Update every 3.5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return { data };
};
