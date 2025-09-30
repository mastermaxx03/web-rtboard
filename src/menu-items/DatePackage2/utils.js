/* -------- time helpers -------- */
const pad2 = (n) => String(n).padStart(2, '0');
export function hm(hhmm) {
  const m = /^(\d{2}):(\d{2})$/.exec(String(hhmm || '').trim());
  if (!m) return { h: 0, m: 0 };
  return { h: +m[1], m: +m[2] };
}
export function at(y, m, d, h = 0, mm = 0) {
  return new Date(y, m, d, h, mm, 0, 0);
}
export function formatYMD(date) {
  const dt = new Date(date);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}
function floorLocalDay(d) {
  d.setHours(0, 0, 0, 0);
  return d;
}

/* -------- plant day based on Shift A start -------- */
export const plantStartTime = (shifts) => hm(shifts?.A?.start || '06:00');
export function startOfPlantDay(date, shifts) {
  const d = new Date(date);
  const { h, m } = plantStartTime(shifts);
  const cand = at(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
  return d >= cand ? cand : at(d.getFullYear(), d.getMonth(), d.getDate() - 1, h, m);
}
export function endOfPlantDay(date, shifts) {
  const s = startOfPlantDay(date, shifts);
  const e = new Date(s);
  e.setDate(e.getDate() + 1);
  return e;
}

/* -------- shift windows -------- */
export function shiftWindowForDate(shiftKey, date, shifts) {
  const d = new Date(date);
  const S = hm(shifts?.[shiftKey]?.start || '00:00');
  const E = hm(shifts?.[shiftKey]?.end || '00:00');
  let start = at(d.getFullYear(), d.getMonth(), d.getDate(), S.h, S.m);
  let end = at(d.getFullYear(), d.getMonth(), d.getDate(), E.h, E.m);
  if (end <= start) end.setDate(end.getDate() + 1); // overnight
  return { start, end };
}
export function getShiftTagAt(date, shifts) {
  const d = new Date(date);
  const wins = ['A', 'B', 'C'].map((k) => [k, shiftWindowForDate(k, d, shifts)]);
  for (const [k, w] of wins) if (d >= w.start && d < w.end) return k;
  return null;
}

/* -------- zone windows (multi slots per zone) -------- */
function zoneSlotsForDay(zone, baseDate) {
  const out = [];
  if (!zone?.slots?.length) return out;
  for (const s of zone.slots) {
    const S = hm(s.start || '00:00');
    const E = hm(s.end || '00:00');
    let start = at(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), S.h, S.m);
    let end = at(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), E.h, E.m);
    if (end <= start) end.setDate(end.getDate() + 1); // overnight slot
    out.push({ start, end });
  }
  return out;
}
export function getZoneAt(date, zones) {
  const d = new Date(date);
  for (const z of Object.values(zones)) {
    const slots = zoneSlotsForDay(z, d);
    for (const win of slots) if (d >= win.start && d < win.end) return z.key;
  }
  return null;
}
export function zoneWindowsForRange(startYMD, endYMD, zoneKey, zones) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/;
  const sM = m.exec(String(startYMD || ''));
  const eM = m.exec(String(endYMD || ''));
  if (!sM || !eM) return [];
  const sD = new Date(+sM[1], +sM[2] - 1, +sM[3], 12, 0, 0, 0);
  const eD = new Date(+eM[1], +eM[2] - 1, +eM[3], 12, 0, 0, 0);

  const target = zones?.[zoneKey];
  if (!target) return [];

  const days = [];
  const cur = new Date(sD);
  while (cur <= eD) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const wins = [];
  for (const d of days) {
    const slots = zoneSlotsForDay(target, d);
    for (const w of slots) wins.push({ start: w.start.toISOString(), end: w.end.toISOString() });
  }
  return wins;
}

/* -------- range helpers for UI selections -------- */
function parseYMD(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || ''));
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], 12, 0, 0, 0);
}
export function singleDateShiftRange(dateYMD, shiftKey, shifts) {
  const base = parseYMD(dateYMD);
  if (!base) return { start: null, end: null };
  if (shiftKey === 'ALL') return { start: startOfPlantDay(base, shifts), end: endOfPlantDay(base, shifts) };
  return shiftWindowForDate(shiftKey, base, shifts);
}
export function rangeWithShift(startYMD, endYMD, shiftKey, shifts) {
  const sD = parseYMD(startYMD);
  const eD = parseYMD(endYMD);
  if (!sD || !eD) return { start: null, end: null };

  if (shiftKey === 'ALL') {
    const start = startOfPlantDay(sD, shifts);
    const end = endOfPlantDay(eD, shifts);
    return { start, end };
  }
  const s1 = shiftWindowForDate(shiftKey, sD, shifts).start;
  const e1 = shiftWindowForDate(shiftKey, eD, shifts).end;
  return { start: s1, end: e1 };
}
export function windowsForShiftRange(startYMD, endYMD, shiftKey, shifts) {
  const sD = parseYMD(startYMD);
  const eD = parseYMD(endYMD);
  if (!sD || !eD) return [];

  const days = [];
  const cur = new Date(sD);
  while (cur <= eD) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const wins = [];
  for (const d of days) {
    if (shiftKey === 'ALL') {
      const s = startOfPlantDay(d, shifts);
      const e = endOfPlantDay(d, shifts);
      wins.push({ start: s.toISOString(), end: e.toISOString() });
    } else {
      const { start, end } = shiftWindowForDate(shiftKey, d, shifts);
      wins.push({ start: start.toISOString(), end: end.toISOString() });
    }
  }
  return wins;
}

/* -------- relative / preset windows -------- */
function mondayStart(d) {
  const t = new Date(d);
  const dow = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - dow);
  return t;
}
function sundayStart(d) {
  const t = new Date(d);
  t.setDate(t.getDate() - t.getDay());
  return t;
}
function startOfMonth(d) {
  return at(d.getFullYear(), d.getMonth(), 1, 0, 0);
}
function startOfQuarter(d) {
  return at(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1, 0, 0);
}
function startOfHalfYear(d) {
  return at(d.getFullYear(), d.getMonth() < 6 ? 0 : 6, 1, 0, 0);
}
function startOfYear(d) {
  return at(d.getFullYear(), 0, 1, 0, 0);
}

/**
 * Presets: returns { start, end, label }.
 */
export function presetRange(kind, now, shifts, { zones, zoneKey, billingCycleDay } = {}) {
  const N = new Date(now);

  const prevShiftWindow = () => {
    const curTag = getShiftTagAt(N, shifts) || 'A';
    const order = ['A', 'B', 'C'];
    const idx = order.indexOf(curTag);
    const prevTag = order[(idx + 2) % 3];
    const { start: prevStart } = shiftWindowForDate(prevTag, N, shifts);
    return { prevTag, prevStart };
  };

  switch (kind) {
    // --- realtime set ---
    case 'currentShiftSoFar': {
      const tag = getShiftTagAt(N, shifts) || 'A';
      const { start } = shiftWindowForDate(tag, N, shifts);
      return { start, end: N, label: `Current Shift (${tag}) – so far` };
    }
    case 'currentShiftPlusPrevious': {
      const curTag = getShiftTagAt(N, shifts) || 'A';
      const { prevTag, prevStart } = prevShiftWindow();
      return { start: prevStart, end: N, label: `Current Shift (${curTag}) + Previous (${prevTag})` };
    }
    case 'currentCalendarDaySoFar': {
      const s = new Date(N);
      s.setHours(0, 0, 0, 0);
      return { start: s, end: N, label: 'Current Day (00:00 → now)' };
    }
    case 'currentZoneSoFar': {
      const key = zoneKey;
      if (zones && key && zones[key]) {
        const zs = zones[key];
        const slots = (() => {
          const arr = [];
          for (const sl of zs.slots || []) {
            const S = hm(sl.start || '00:00');
            const E = hm(sl.end || '00:00');
            let st = at(N.getFullYear(), N.getMonth(), N.getDate(), S.h, S.m);
            let en = at(N.getFullYear(), N.getMonth(), N.getDate(), E.h, E.m);
            if (en <= st) en.setDate(en.getDate() + 1);
            arr.push({ start: st, end: en });
          }
          return arr;
        })();
        const containing = slots.find((w) => N >= w.start && N < w.end);
        const start = containing ? containing.start : new Date(new Date(N).setHours(0, 0, 0, 0));
        return { start, end: new Date(), label: `Zone ${zs.label} – so far` };
      }
      return { start: new Date(0), end: N, label: 'Current Zone – so far' };
    }
    case 'currentWeekMonSoFar': {
      const s = startOfPlantDay(mondayStart(N), shifts);
      return { start: s, end: N, label: 'Current Week so far (Mon - Sun)' };
    }
    case 'currentMonthSoFar': {
      const s = startOfPlantDay(startOfMonth(N), shifts);
      return { start: s, end: N, label: 'Current Month – so far' };
    }
    case 'currentBillingCycleSoFar': {
      const day = Math.max(1, Math.min(28, billingCycleDay || 1));
      const cur = new Date(N);
      const cycleStart = new Date(cur.getFullYear(), cur.getMonth(), day, 0, 0, 0, 0);
      if (cur < cycleStart) cycleStart.setMonth(cycleStart.getMonth() - 1);
      return { start: cycleStart, end: N, label: 'Current Billing Cycle – so far' };
    }
    case 'currentQuarterSoFar': {
      const s = startOfPlantDay(startOfQuarter(N), shifts);
      return { start: s, end: N, label: 'Current Quarter – so far' };
    }
    case 'currentYearSoFar': {
      const s = startOfPlantDay(startOfYear(N), shifts);
      return { start: s, end: N, label: 'Current Year – so far' };
    }
    case 'allDataSoFar': {
      return { start: new Date(0), end: N, label: 'All data – so far' };
    }

    // --- history-only ---
    case 'yesterday': {
      const y = new Date(N);
      floorLocalDay(y);
      y.setDate(y.getDate() - 1);
      const s = startOfPlantDay(y, shifts),
        e = endOfPlantDay(y, shifts);
      return { start: s, end: e, label: 'Yesterday' };
    }
    case 'dayBeforeYesterday': {
      const y = new Date(N);
      floorLocalDay(y);
      y.setDate(y.getDate() - 2);
      const s = startOfPlantDay(y, shifts),
        e = endOfPlantDay(y, shifts);
      return { start: s, end: e, label: 'Day before yesterday' };
    }
    case 'thisDayLastWeek': {
      const y = new Date(N);
      y.setDate(y.getDate() - 7);
      const s = startOfPlantDay(y, shifts),
        e = endOfPlantDay(y, shifts);
      return { start: s, end: e, label: 'This day last week' };
    }
    case 'previousWeekSun': {
      const endLast = sundayStart(N);
      endLast.setDate(endLast.getDate() - 1);
      const startLast = sundayStart(endLast);
      const s = startOfPlantDay(startLast, shifts),
        e = endOfPlantDay(endLast, shifts);
      return { start: s, end: e, label: 'Previous week (Sun - Sat)' };
    }
    case 'previousWeekMon': {
      const endLast = mondayStart(N);
      endLast.setDate(endLast.getDate() - 1);
      const startLast = mondayStart(endLast);
      const s = startOfPlantDay(startLast, shifts),
        e = endOfPlantDay(endLast, shifts);
      return { start: s, end: e, label: 'Previous week (Mon - Sun)' };
    }
    case 'previousMonth': {
      const startLast = startOfMonth(new Date(N.getFullYear(), N.getMonth() - 1, 1));
      const endLast = new Date(N.getFullYear(), N.getMonth(), 0);
      const s = startOfPlantDay(startLast, shifts),
        e = endOfPlantDay(endLast, shifts);
      return { start: s, end: e, label: 'Previous month' };
    }
    case 'previousQuarter': {
      const qStart = startOfQuarter(new Date(N.getFullYear(), N.getMonth() - 3, 1));
      const last = new Date(qStart.getFullYear(), qStart.getMonth() + 3, 0);
      const s = startOfPlantDay(qStart, shifts),
        e = endOfPlantDay(last, shifts);
      return { start: s, end: e, label: 'Previous quarter' };
    }
    case 'previousHalfYear': {
      const base = new Date(N);
      base.setMonth(base.getMonth() - 6);
      const s0 = startOfHalfYear(base);
      const last = new Date(s0.getFullYear(), s0.getMonth() + 6, 0);
      const s = startOfPlantDay(s0, shifts),
        e = endOfPlantDay(last, shifts);
      return { start: s, end: e, label: 'Previous half year' };
    }
    case 'previousYear': {
      const s0 = startOfYear(new Date(N.getFullYear() - 1, 0, 1));
      const last = new Date(N.getFullYear() - 1, 12, 0);
      const s = startOfPlantDay(s0, shifts),
        e = endOfPlantDay(last, shifts);
      return { start: s, end: e, label: 'Previous year' };
    }

    default:
      return { start: N, end: N, label: '' };
  }
}

/* -------- “Last …” offset -------- */
export function addOffset(date, { count, unit }) {
  const d = new Date(date);
  const out = new Date(d);
  switch (unit) {
    case 'minute':
      out.setMinutes(d.getMinutes() + count);
      break;
    case 'hour':
      out.setHours(d.getHours() + count);
      break;
    case 'day':
      out.setDate(d.getDate() + count);
      break;
    default:
      break;
  }
  return out;
}

/* -------- time zone helpers -------- */
export function listTimeZones() {
  if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
    try {
      return ['Browser Time', ...Intl.supportedValuesOf('timeZone')];
    } catch {}
  }
  return ['Browser Time', 'UTC', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Dubai', 'America/New_York', 'America/Los_Angeles'];
}
export function offsetForZone(zone) {
  if (zone === 'Browser Time') {
    const offMin = -new Date().getTimezoneOffset();
    const sign = offMin >= 0 ? '+' : '-';
    const abs = Math.abs(offMin);
    return `UTC${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
  }
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset', hour: '2-digit' }).formatToParts(
      new Date()
    );
    const off = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    const m = off.match(/GMT([+-]\d{1,2}:\d{2})/i);
    if (m) {
      const [hh, mm] = m[1].split(':');
      const sign = hh.startsWith('-') ? '' : '+';
      return `UTC${sign}${pad2(hh)}:${mm}`;
    }
  } catch {}
  return 'UTC';
}
