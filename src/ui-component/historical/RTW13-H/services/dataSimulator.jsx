// src/RTW13-H/services/dataSimulator.js

/**
 * Generates historical data for both phase power and imbalance.
 */
export const simulateAllChartData = () => {
  const phaseData = { R: [], Y: [], B: [] };
  const imbalanceData = [];
  const now = new Date();

  // Helper to calculate imbalance
  const calculateImbalance = (a, b, c) => {
    const avg = (a + b + c) / 3;
    if (avg === 0) return 0;
    const maxDev = Math.max(Math.abs(a - avg), Math.abs(b - avg), Math.abs(c - avg));
    return (maxDev / avg) * 100;
  };

  for (let i = 0; i < 24; i++) {
    const hourDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), i);
    const time = `${String(i).padStart(2, '0')}:00`;

    // --- Generate Phase Data ---
    const r_kw = 100 + 40 * Math.sin(i / 3);
    const y_kw = 110 + 30 * Math.cos(i / 4);
    const b_kw = 105 + 35 * Math.sin(i / 5 + 2);

    const r_kvar = r_kw * (0.3 + Math.random() * 0.2);
    const y_kvar = y_kw * (0.3 + Math.random() * 0.2);
    const b_kvar = b_kw * (0.3 + Math.random() * 0.2);

    const r_kva = Math.sqrt(r_kw * r_kw + r_kvar * r_kvar);
    const y_kva = Math.sqrt(y_kw * y_kw + y_kvar * y_kvar);
    const b_kva = Math.sqrt(b_kw * b_kw + b_kvar * b_kvar);

    phaseData.R.push({ time, fullDate: hourDate, kw: +r_kw.toFixed(2), kvar: +r_kvar.toFixed(2), kva: +r_kva.toFixed(2) });
    phaseData.Y.push({ time, fullDate: hourDate, kw: +y_kw.toFixed(2), kvar: +y_kvar.toFixed(2), kva: +y_kva.toFixed(2) });
    phaseData.B.push({ time, fullDate: hourDate, kw: +b_kw.toFixed(2), kvar: +b_kvar.toFixed(2), kva: +b_kva.toFixed(2) });

    // --- Generate Imbalance Data ---
    imbalanceData.push({
      time,
      kva_imbalance: +calculateImbalance(r_kva, y_kva, b_kva).toFixed(2),
      kw_imbalance: +calculateImbalance(r_kw, y_kw, b_kw).toFixed(2),
      kvar_imbalance: +(5 + Math.random() * 15).toFixed(2) // Simplified for example
    });
  }
  return { phaseData, imbalanceData };
};
