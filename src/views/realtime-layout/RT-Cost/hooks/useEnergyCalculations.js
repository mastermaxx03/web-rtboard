import { useMemo } from 'react';
import { accumulate, zoneForTs, ECR, WCR } from '../utils/calculations';

export function useEnergyCalculations(stream, now = new Date()) {
  const acc = useMemo(() => accumulate(stream), [stream]);
  const currentZone = useMemo(() => zoneForTs(now).id, [now]);

  const totals = useMemo(
    () => ({
      ...acc.totals,
      projectedEOD: (() => {
        if (!stream.length) return acc.totals.totalCost;
        const first = stream[0].ts,
          last = stream[stream.length - 1].ts;
        const h = (last - first) / 3.6e6;
        if (h <= 0) return acc.totals.totalCost;
        return (acc.totals.totalCost / h) * 24;
      })()
    }),
    [acc.totals, stream]
  );

  return {
    totals,
    zoneRows: acc.zoneRows,
    currentZone,
    rates: { ECR, WCR }
  };
}
