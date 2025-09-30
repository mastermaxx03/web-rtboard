/**
 * Generates historical data for THD-V and THD-I.
 */
export const simulateThdData = () => {
  const thdV = [];
  const thdI = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const time = `${String(i).padStart(2, '0')}:00`;
    // THD-V usually has lower values and less variance
    const hourDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), i);
    const vValue = 2.5 + Math.random() * 2 + Math.sin(i / 4) * 1.5;
    // THD-I can have higher values and more spikes
    const iValue = 5 + Math.random() * 5 + Math.cos(i / 3) * 3;

    thdV.push({ time, value: +vValue.toFixed(2), fullDate: hourDate });
    thdI.push({ time, value: +iValue.toFixed(2), fullDate: hourDate });
  }

  return { thdV, thdI };
};
