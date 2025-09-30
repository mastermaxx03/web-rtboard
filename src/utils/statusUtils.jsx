export const getPerformanceStatus = (score) => {
  if (score < 75) return 'critical';
  if (score < 85) return 'warning';
  return 'acceptable';
};
