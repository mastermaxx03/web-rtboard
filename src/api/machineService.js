import { fetchMockMachineStatuses } from './mockData';

const USE_MOCK_DATA = true;
// -------------------------

const REAL_API_ENDPOINT = 'YOUR_NEW_API_SUMMARY_ENDPOINT'; // Replace later

// This function will call your real backend API
const fetchRealMachineStatuses = async () => {
  console.log('Fetching REAL machine statuses...');
  const response = await fetch(REAL_API_ENDPOINT);
  if (!response.ok) {
    throw new Error('Failed to fetch data from the real API');
  }
  return response.json();
};

// This is the only function your components will ever need to call
export const fetchAllMachineStatuses = () => {
  if (USE_MOCK_DATA) {
    return fetchMockMachineStatuses();
  } else {
    return fetchRealMachineStatuses();
  }
};
