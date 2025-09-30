// src/ui-components/plantSummary/hooks/useEnergySourceData.js

/**
 * This hook is responsible for providing the data for the Energy Source widget.
 * Later, this is where we'll add logic to fetch real data from an API.
 */
export const useEnergySourceData = () => {
  // Mock data based on your initial design
  const data = [
    { value: 82, name: 'Grid' },
    { value: 12, name: 'Solar' },
    { value: 6, name: 'DG' }
  ];

  // For now, we just return the data. In the future, we can add
  // isLoading and error states here.
  return { data };
};
