// src/ui-component/plantSummary/hooks/useCostSavingData.js

import { useState, useEffect } from 'react';

const initialState = {
  percentage: 7.2,
  amountSaved: 4527,
  benchmark: 11 // The max value for the gauge
};

export const useCostSavingData = () => {
  const [data, setData] = useState(initialState);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setData((prevData) => {
        const percentageFluctuation = (Math.random() - 0.5) * 0.5; // Fluctuate by +/- 0.25%
        let newPercentage = prevData.percentage + percentageFluctuation;

        // Keep the value within the benchmark range
        newPercentage = Math.max(0, Math.min(prevData.benchmark, newPercentage));

        // Let the amount saved fluctuate as well
        const amountFluctuation = (Math.random() - 0.5) * 100;
        let newAmount = prevData.amountSaved + amountFluctuation;

        return {
          ...prevData,
          percentage: parseFloat(newPercentage.toFixed(2)),
          amountSaved: parseFloat(newAmount.toFixed(2))
        };
      });
    }, 4500); // Update every 4.5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return data;
};
