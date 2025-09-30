// src/ui-component/historical/RTW15-H/services/mockDataService.js

// This file provides mock data for the RTW15H component.
// The data is pre-calculated to match the total run time and load band distribution from the image.

const LOAD_BAND_DETAILS = [
  { name: 'Power Off', oldName: 'OFF', logic: 'L <= 1%', hours: 7.4, percentage: 4.16 },
  { name: 'Poor Idle', oldName: 'Band A', logic: '1% < L <= 25%', hours: 32.13, percentage: 18.05 },
  { name: 'Idle', oldName: 'Band B', logic: '25% < L <= 45%', hours: 14.48, percentage: 8.14 },
  { name: 'Optimal', oldName: 'Band C', logic: '45% < L <= 65%', hours: 39.17, percentage: 22.0 }, // Renamed from Band C to Optimal
  { name: 'Near Full Load', oldName: 'Band D', logic: '65% < L <= 85%', hours: 66.88, percentage: 37.57 }, // Renamed from Band D to Near Full Load
  { name: 'Full Load', oldName: 'Band E', logic: '85% < L <= 98%', hours: 14.53, percentage: 8.16 }, // Renamed from Band E to Overload
  { name: 'Overload', oldName: 'Band F', logic: 'L > 98%', hours: 3.4, percentage: 1.91 } // Renamed from Band F to Critical Overload - Adjusting to fit provided image's labels
];

const ZONES = ['A', 'B', 'C', 'D'];
const SHIFTS = ['Shift A', 'Shift B', 'Shift C'];

// Helper function to create a date string
const getDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Generates an array of daily mock data
const generateMockData = () => {
  const data = [];
  const totalHours = LOAD_BAND_DETAILS.reduce((sum, band) => sum + band.hours, 0);
  const bandHourShares = LOAD_BAND_DETAILS.map((band) => band.hours);

  // Distribute the total 178 hours across 30 days, shifts, and zones
  let remainingHours = totalHours;
  for (let i = 0; i < 30; i++) {
    const dailyHours = remainingHours > 0 ? Math.min(remainingHours, (totalHours / 30) * (Math.random() * 0.5 + 0.75)) : 0;
    remainingHours -= dailyHours;

    const shift = SHIFTS[Math.floor(Math.random() * SHIFTS.length)];
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];

    const dailyLoadBands = {};
    let hoursDistributed = 0;

    // Distribute daily hours based on the overall band percentages
    bandHourShares.forEach((share, index) => {
      const bandName = LOAD_BAND_DETAILS[index].name; // Use new descriptive name
      const hoursInBand = (share / totalHours) * dailyHours;
      dailyLoadBands[bandName] = hoursInBand;
      hoursDistributed += hoursInBand;
    });

    data.push({
      date: getDateString(29 - i),
      shift,
      zone,
      loadBands: dailyLoadBands
    });
  }

  return data;
};

// The main function to get the data
export const getMockMachineData = () => {
  return generateMockData();
};

// Provides the static details of the load bands for the metrics table
export const getLoadBandDetails = () => {
  return LOAD_BAND_DETAILS;
};
