// Helpers to normalize API rows -> { t, r, y, b }

const toMs = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
  const d = new Date(v);
  return Number.isFinite(+d) ? +d : null;
};

const num = (o, keys) => {
  for (const k of keys) if (o?.[k] != null && isFinite(Number(o[k]))) return Number(o[k]);
  return null;
};

export function normalizeRows(arr) {
  if (!Array.isArray(arr)) return [];
  const IR = ['IR', 'Ir', 'ir', 'iR'];
  const IY = ['IY', 'Iy', 'iy', 'iY'];
  const IB = ['IB', 'Ib', 'ib', 'iB'];

  const out = arr
    .map((r) => ({
      t: toMs(r?.TS ?? r?.timestamp ?? r?.time ?? r?.Time ?? r?.TIME ?? r?.ts),
      r: num(r, IR),
      y: num(r, IY),
      b: num(r, IB)
    }))
    .filter((x) => x.t != null);

  out.sort((a, b) => a.t - b.t);
  return out;
}
