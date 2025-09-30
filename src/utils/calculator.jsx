export const findTierByLevel = (pfLevel, allTiers) => {
  const level = parseFloat(pfLevel);
  if (isNaN(level)) {
    return null;
  }
  return allTiers.find((tier) => tier.level.toFixed(2) === level.toFixed(2)) || null;
};
