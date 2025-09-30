// src/views/alertLogPage/data.js

// ---------- helpers (local-time safe) --------------------------------------
const hm = (hhmm) => {
  if (!hhmm) return { h: 0, m: 0 };
  const [h, m] = hhmm.split(':').map(Number);
  return { h: h || 0, m: m || 0 };
};
const atLocal = (y, m, d, h, mm) => new Date(y, m, d, h, mm, 0, 0);
const ymd = (d) => {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

// Expose a small set of mock users for the primary filter UI
export const MOCK_USERS = ['ALL', 'Johne Doe', 'Rohit', 'operator_01', 'Jane Smith'];

// Build a [start,end) window for a single “base” date with possible overnight
function shiftWindowForBaseDate(baseDate, shiftStart, shiftEnd) {
  const { h: sh, m: sm } = hm(shiftStart);
  const { h: eh, m: em } = hm(shiftEnd);
  const start = atLocal(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), sh, sm);
  let end = atLocal(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), eh, em);
  if (end <= start) end.setDate(end.getDate() + 1); // overnight shift
  return { start, end };
}

// Build ALL daily windows for a range of YMDs (inclusive), honoring overnight
// Example: 2025-09-09..2025-09-12 with 14:00–22:00 -> 4 windows, one per day
function buildDailyWindows(meta) {
  const res = [];
  if (!meta || meta.shift === 'ALL') return res;

  const { startYMD, endYMD, shiftStart, shiftEnd } = meta;
  if (!startYMD || !endYMD || !shiftStart || !shiftEnd) return res;

  // iterate day by day from startYMD..endYMD (inclusive)
  const [ys, ms, ds] = startYMD.split('-').map(Number);
  const [ye, me, de] = endYMD.split('-').map(Number);
  const cur = new Date(ys, ms - 1, ds, 12, 0, 0, 0);
  const end = new Date(ye, me - 1, de, 12, 0, 0, 0);

  while (cur <= end) {
    const w = shiftWindowForBaseDate(cur, shiftStart, shiftEnd);
    res.push(w);
    cur.setDate(cur.getDate() + 1);
  }
  return res;
}

const inAnyWindow = (tMs, windows) => windows.some((w) => tMs >= w.start.getTime() && tMs < w.end.getTime());

// ---------------------------------------------------------------------------
// Mock fetcher (same signature, but now truly respects shift/day unions)
// NEW: accepts `user` (owner) and filters by it FIRST (primary filter)
export const mockFetchAlerts = async ({ panelId, page = 1, pageSize = 10, start, end, meta, user }) => {
  await new Promise((r) => setTimeout(r, 200));

  const metrics = [
    { tag: 'pf_avg', unit: 'pf' },
    { tag: 'v_ll_imb_pct', unit: '%' },
    { tag: 'current_r', unit: 'A' },
    { tag: 'frequency', unit: 'Hz' }
  ];

  const DATASET_SIZE = 200;

  // Anchor “now” at `end` or current time; generate backwards every 15 min
  const endAnchorMs = end && !Number.isNaN(Date.parse(end)) ? Date.parse(end) : Date.now();

  const allRows = Array.from({ length: DATASET_SIZE }).map((_, i) => {
    const t = endAnchorMs - i * 15 * 60 * 1000;
    const met = metrics[Math.floor(Math.random() * metrics.length)];
    const value =
      met.tag === 'pf_avg'
        ? +(0.85 + Math.random() * 0.2).toFixed(3)
        : met.tag.includes('imb')
          ? +(8 + Math.random() * 12).toFixed(1)
          : met.tag.includes('current')
            ? +(300 + Math.random() * 200).toFixed(0)
            : +(49 + Math.random() * 2).toFixed(2);

    const message =
      met.tag === 'pf_avg'
        ? value < 0.9
          ? 'Critical'
          : value < 0.951
            ? 'Warning!!'
            : 'Returned to Normal'
        : Math.random() > 0.5
          ? 'Warning!!'
          : 'Critical';

    // owner/user cycles through mock list (skipping 'ALL' entry)
    const owners = MOCK_USERS.filter((u) => u !== 'ALL');
    const owner = owners[i % owners.length];

    return {
      alert_id: `alrt_${i}`,
      panel_name: panelId || 'MCC10',
      panel_location: 'Compressor House',
      ts: new Date(t).toISOString(),
      tag_name: met.tag,
      alert_value: value,
      unit: met.unit,
      message,
      severity: message === 'Critical' ? 'critical' : message === 'Warning!!' ? 'warning' : 'info',
      owner, // ← NEW: who owns/raised this alert
      status: 'open',
      ack_user: null,
      ack_ts: null,
      ack_note: null
    };
  });

  // ---------- PRIMARY FILTER: by user/owner --------------------------------
  const filteredByUser = user && user !== 'ALL' ? allRows.filter((r) => r.owner === user) : allRows;

  // ---------- apply date bounds + shift/day union filter --------------------
  const hasStart = !!start && !Number.isNaN(Date.parse(start));
  const hasEnd = !!end && !Number.isNaN(Date.parse(end));
  const startMs = hasStart ? Date.parse(start) : null;
  const endMs = hasEnd ? Date.parse(end) : null;

  // Build union-of-days windows once if a specific shift is selected
  const dailyWindows = meta && meta.shift && meta.shift !== 'ALL' ? buildDailyWindows(meta) : [];

  let filtered = filteredByUser.filter((r) => {
    const t = Date.parse(r.ts);

    // coarse continuous bounds first (for performance)
    if (hasStart && t < startMs) return false;
    if (hasEnd && t >= endMs) return false;

    // if Shift ALL -> no per-day window check; otherwise enforce union
    if (dailyWindows.length) {
      return inAnyWindow(t, dailyWindows);
    }
    return true;
  });

  // ---------- totals (on filtered), paging stays the same -------------------
  const totals = {
    pending_critical: filtered.filter((r) => r.severity === 'critical' && r.status === 'open').length,
    pending_warning: filtered.filter((r) => r.severity === 'warning' && r.status === 'open').length,
    ack_critical: 0,
    ack_warning: 0
  };

  const total = filtered.length;
  const startIdx = Math.max(0, (page - 1) * pageSize);
  const rows = filtered.slice(startIdx, startIdx + pageSize);

  return { rows, total, totals };
};
