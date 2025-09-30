// src/ui-component/plantSummary/hooks/useEnergyChargesData.js

import { useState, useEffect } from 'react';

const initialState = {
  costPerKwh: 6.78,
  previousCost: 6.78, // Start with the same value
  percentageChange: 0,
  direction: 'neutral' // Can be 'up', 'down', or 'neutral'
};

export const useEnergyChargesData = () => {
  const [data, setData] = useState(initialState);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setData((prevData) => {
        const newCost = prevData.costPerKwh + (Math.random() - 0.5) * 0.05;
        const previousCost = prevData.costPerKwh;

        let percentageChange = 0;
        if (previousCost !== 0) {
          percentageChange = ((newCost - previousCost) / previousCost) * 100;
        }

        let direction = 'neutral';
        if (percentageChange > 0.01) direction = 'up';
        if (percentageChange < -0.01) direction = 'down';

        return {
          costPerKwh: parseFloat(newCost.toFixed(2)),
          previousCost: previousCost,
          percentageChange: parseFloat(percentageChange.toFixed(2)),
          direction: direction
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return data;
};
