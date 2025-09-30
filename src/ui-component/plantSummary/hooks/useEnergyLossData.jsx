// src/ui-component/plantSummary/hooks/useEnergyLossData.js

import { useState, useEffect } from 'react';

const initialState = {
  cost: 15000,
  benchmark: 25000
};

export const useEnergyLossData = () => {
  const [data, setData] = useState(initialState);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setData((prevData) => {
        const fluctuation = (Math.random() - 0.5) * 500; // Fluctuate by +/- 250
        let newCost = prevData.cost + fluctuation;

        // Keep the value within the benchmark range
        newCost = Math.max(0, Math.min(prevData.benchmark, newCost));

        return {
          ...prevData,
          cost: parseFloat(newCost.toFixed(2))
        };
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return data;
};
