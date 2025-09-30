// src/ui-component/plantSummary/hooks/useEnergyEfficiencyData.js

import { useState, useEffect } from 'react';

/**
 * Provides a SIMULATED real-time data feed for the Energy Efficiency gauge chart.
 */
export const useEnergyEfficiencyData = () => {
  // 1. Use useState to hold the dynamic value. We start at 76.
  const [value, setValue] = useState(76);

  // 2. Use useEffect to set up a timer that updates the value.
  useEffect(() => {
    // This function will run every 3 seconds
    const intervalId = setInterval(() => {
      // 3. Generate a new value that fluctuates slightly.
      // We'll take the previous value and add a random number between -1.5 and +1.5.
      setValue((prevValue) => {
        const fluctuation = (Math.random() - 0.5) * 3;
        let newValue = prevValue + fluctuation;

        // Keep the value within a realistic range (e.g., 70 to 85)
        if (newValue > 85) newValue = 85;
        if (newValue < 70) newValue = 70;

        // Return the new value, rounded to one decimal place
        return Math.round(newValue * 10) / 10;
      });
    }, 3000); // Update every 3000 milliseconds (3 seconds)

    // 4. IMPORTANT: Clean up the interval when the component is no longer on screen
    // This prevents memory leaks.
    return () => clearInterval(intervalId);
  }, []); // The empty array [] means this effect runs only once when the component mounts.

  // 5. Return the dynamic value.
  return { value };
};
