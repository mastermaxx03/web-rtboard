// src/ui-component/plantSummary/hooks/useTopConsumptionsData.js

import { useState, useEffect } from 'react';

// Define the initial components and their approximate base consumptions
const initialConsumptions = [
  { name: 'Chiller 1', baseValue: 22 },
  { name: 'CompressorDiscrete Mathematics with Ducks', baseValue: 18 },
  { name: 'HVAC Unit', baseValue: 15 },
  { name: 'Pumps', baseValue: 12 },
  { name: 'Water', baseValue: 10 },
  { name: 'Light', baseValue: 8 }, // Will be part of miscellaneous
  { name: 'IT Servers', baseValue: 5 } // Will be part of miscellaneous
];

/**
 * Provides a SIMULATED real-time data feed for the Top 5 Consumptions chart,
 * including a 'Miscellaneous' category.
 */
export const useTopConsumptionsData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const updateData = () => {
      let totalValue = 0;
      const currentData = initialConsumptions.map((item) => {
        // Apply a random fluctuation to each component's value
        const fluctuation = (Math.random() - 0.5) * 4; // Fluctuate by +/- 2%
        let newValue = item.baseValue + fluctuation;

        // Ensure values stay positive and within a reasonable range
        newValue = Math.max(0, Math.min(30, newValue));
        totalValue += newValue;
        return { ...item, value: newValue };
      });

      // Sort to get top 5
      currentData.sort((a, b) => b.value - a.value);
      const top5 = currentData.slice(0, 5);

      // Calculate miscellaneous
      const top5Total = top5.reduce((sum, item) => sum + item.value, 0);
      let miscellaneousValue = 100 - top5Total; // Calculate based on 100% total

      // Ensure miscellaneous is not negative and make it a valid segment
      if (miscellaneousValue < 0) miscellaneousValue = 0;

      const finalData = [
        ...top5.map((item) => ({
          name: item.name,
          value: parseFloat(item.value.toFixed(2)) // Round to 2 decimal places
        })),
        { name: 'Miscellaneous', value: parseFloat(miscellaneousValue.toFixed(2)) }
      ];

      // Re-normalize to ensure percentages sum to exactly 100%
      const currentTotal = finalData.reduce((sum, item) => sum + item.value, 0);
      const normalizedData = finalData.map((item) => ({
        name: item.name,
        value: parseFloat(((item.value / currentTotal) * 100).toFixed(2))
      }));

      setData(normalizedData);
    };

    // Initial data load
    updateData();

    // Set up interval for real-time updates
    const intervalId = setInterval(updateData, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return { data };
};
