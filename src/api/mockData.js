// This is your example data
const mockMachineSummaries = [
  {
    deviceId: 'E_AA_Z_B_Y_P0034_D1',
    performanceScore: 84
  },
  {
    deviceId: 'E_AA_Z_B_Y_P0009_D3',
    performanceScore: 92
  },
  {
    deviceId: 'E_AA_Z_B_X_P0023_D2',
    performanceScore: 68
  }
];

// This function simulates a network request
export const fetchMockMachineStatuses = () => {
  console.log('Fetching MOCK machine statuses...');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMachineSummaries);
    }, 500); // Simulate a 500ms network delay
  });
};
