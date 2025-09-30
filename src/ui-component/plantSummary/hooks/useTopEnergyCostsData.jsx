// src/ui-component/plantSummary/hooks/useTopEnergyCostsData.js

import { useState, useEffect } from 'react';

// Base cost values from your sketch, with names assigned
const initialCosts = [
  { name: 'Machinery', value: 12500 },
  { name: 'HVAC', value: 12350 },
  { name: 'Lighting', value: 7800 },
  { name: 'Pumps', value: 4650 },
  { name: 'Process Heat', value: 3450 } // Adjusted for a more visible arc
];

export const useTopEnergyCostsData = () => {
  const [data, setData] = useState(initialCosts);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setData((prevData) =>
        prevData.map((item) => {
          // Fluctuate each cost by a small random amount
          const fluctuation = (Math.random() - 0.5) * (item.value * 0.03); // Fluctuate by up to 1.5%
          const newValue = item.value + fluctuation;
          return {
            name: item.name,
            value: parseFloat(newValue.toFixed(2))
          };
        })
      );
    }, 4000); // Update every 4 seconds

    return () => clearInterval(intervalId);
  }, []);

  return { data };
};
