export const ECR = 8.36; // ₹/u
export const WCR = 0.6; // ₹/u

// Pretty “00–06” style time labels
const hh = (h) => String(h).padStart(2, '0');
const slot = (s, e) => `${hh(s)}–${hh(e)}`;
const timesLabel = (ranges) => ranges.map(([s, e]) => slot(s, e)).join(', ');

// TOD bands (local time, 24h)
export const ZONES = [
  {
    id: 'A',
    label: 'Zone A',
    ranges: [
      [0, 6],
      [22, 24]
    ],
    rate: -1.5,
    color: '#16a34a'
  }, // credit window
  {
    id: 'B',
    label: 'Zone B',
    ranges: [
      [6, 9],
      [12, 18]
    ],
    rate: 0.0,
    color: '#2563eb'
  },
  { id: 'C', label: 'Zone C', ranges: [[9, 12]], rate: 0.8, color: '#f59e0b' },
  { id: 'D', label: 'Zone D', ranges: [[18, 22]], rate: 1.1, color: '#ef4444' }
];

export function zoneForHour(h) {
  return ZONES.find((z) => z.ranges.some(([s, e]) => h >= s && h < e)) ?? ZONES[1];
}
export function zoneForTs(ts) {
  return zoneForHour(new Date(ts).getHours());
}

export function sum(arr, sel = (x) => x) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += sel(arr[i]) || 0;
  return s;
}

// ... keep the rest of the file exactly as you have it

// … keep existing imports, ECR/WCR, ZONES, helpers …

export function accumulate(stream) {
  const zoneBuckets = { A: [], B: [], C: [], D: [] };
  const points = stream.map((p) => {
    const z = zoneForTs(p.ts);
    const ec = p.deltaKVAh * ECR;
    const wc = p.deltaKVAh * WCR;
    const tod = p.deltaKVAh * z.rate;
    const total = ec + wc + tod;
    const out = { ...p, zone: z.id, ec, wc, tod, total };
    zoneBuckets[z.id].push(out);
    return out;
  });

  const energyCharges = sum(points, (p) => p.ec);
  const wheelingCharges = sum(points, (p) => p.wc);
  const todRaw = sum(points, (p) => p.tod);

  const todPos = Math.abs(
    sum(
      points.filter((p) => p.tod > 0),
      (p) => p.tod
    )
  );
  const todNeg = Math.abs(
    sum(
      points.filter((p) => p.tod < 0),
      (p) => p.tod
    )
  );

  const totals = { energyCharges, wheelingCharges, todCharges: todRaw, todPos, todNeg };
  totals.totalCost = energyCharges + wheelingCharges + todRaw;

  // --- 24h time label helpers (HH:MM-HH:MM & ...)
  const hhmm = (h) => `${String(h).padStart(2, '0')}:00`;
  const slot24 = (s, e) => `${hhmm(s)}-${hhmm(e)}`;
  const timesLabel24 = (ranges) => ranges.map(([s, e]) => slot24(s, e)).join(' & ');

  const zoneRows = ZONES.map((z) => {
    const rows = zoneBuckets[z.id];
    const units = sum(rows, (r) => r.deltaKVAh);
    const charges = sum(rows, (r) => r.deltaKVAh * z.rate);
    return {
      id: z.id,
      label: z.label,
      color: z.color,
      rate: z.rate,
      ranges: z.ranges, // keep raw ranges for any future visuals
      times24: timesLabel24(z.ranges), // <-- exact text you wanted
      units,
      charges
    };
  });

  return { totals, zoneRows, points };
}
