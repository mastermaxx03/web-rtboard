const hm = (hhmm) => {
  const [h, m] = (hhmm || '00:00').split(':').map(Number);
  return { h, m };
};
export const at = (y, m, d, h, mm) => new Date(y, m, d, h, mm, 0, 0);
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : 'mm/dd/yyyy');

export const clampTo3Months = (dt) => {
  const now = new Date();
  const min = new Date(now);
  min.setMonth(now.getMonth() - 3);
  return dt < min ? min : dt;
};

export function startOfPlantDay(date, shifts) {
  const { h, m } = hm(shifts.A?.start || '06:00');
  const d = new Date(date);
  const cand = at(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
  return d >= cand ? cand : at(d.getFullYear(), d.getMonth(), d.getDate() - 1, h, m);
}
export function endOfPlantDay(date, shifts) {
  const s = startOfPlantDay(date, shifts);
  const e = new Date(s);
  e.setDate(e.getDate() + 1);
  return e;
}

export function shiftWindowForDate(shiftKey, date, shifts) {
  const d = new Date(date);
  const { h: sh, m: sm } = hm(shifts[shiftKey].start);
  const { h: eh, m: em } = hm(shifts[shiftKey].end);
  let start = at(d.getFullYear(), d.getMonth(), d.getDate(), sh, sm);
  let end = at(d.getFullYear(), d.getMonth(), d.getDate(), eh, em);
  if (end <= start) end.setDate(end.getDate() + 1);
  return { start, end };
}

export function singleDateShiftRange(dateYMD, shiftKey, shifts) {
  const [y, m, d] = dateYMD.split('-').map(Number);
  const base = new Date(y, m - 1, d, 12, 0, 0, 0);
  if (shiftKey === 'ALL') return { start: startOfPlantDay(base, shifts), end: endOfPlantDay(base, shifts) };
  return shiftWindowForDate(shiftKey, base, shifts);
}

export function rangeWithShift(startYMD, endYMD, shiftKey, shifts) {
  if (shiftKey === 'ALL') {
    return {
      start: singleDateShiftRange(startYMD, 'ALL', shifts).start,
      end: singleDateShiftRange(endYMD, 'ALL', shifts).end
    };
  }
  const s1 = singleDateShiftRange(startYMD, shiftKey, shifts).start;
  const e1 = singleDateShiftRange(endYMD, shiftKey, shifts).end;
  return { start: s1, end: e1 };
}

export function presetRange(kind, now, shifts) {
  const N = new Date(now);
  switch (kind) {
    case 'currentShiftSoFar': {
      const A = shiftWindowForDate('A', N, shifts);
      const B = shiftWindowForDate('B', N, shifts);
      const C = shiftWindowForDate('C', N, shifts);
      const inWin = (t, w) => t >= w.start && t <= w.end;
      const tag = inWin(N, A) ? 'A' : inWin(N, B) ? 'B' : 'C';
      const win = tag === 'A' ? A : tag === 'B' ? B : C;
      return { start: win.start, end: N, label: `Current Shift (${tag}) – so far` };
    }
    case 'currentDaySoFar':
      return { start: startOfPlantDay(N, shifts), end: N, label: 'Current Day – so far' };
    case 'currentWeekSoFar': {
      const s0 = startOfPlantDay(N, shifts);
      const day = (s0.getDay() + 6) % 7;
      const s = new Date(s0);
      s.setDate(s0.getDate() - day);
      return { start: s, end: N, label: 'Current Week – so far' };
    }
    case 'currentMonthSoFar':
      return { start: startOfPlantDay(new Date(N.getFullYear(), N.getMonth(), 1), shifts), end: N, label: 'Current Month – so far' };
    case 'currentQuarterSoFar': {
      const qStartMonth = Math.floor(N.getMonth() / 3) * 3;
      return { start: startOfPlantDay(new Date(N.getFullYear(), qStartMonth, 1), shifts), end: N, label: 'Current Quarter – so far' };
    }
    default:
      return { start: N, end: N, label: '' };
  }
}

export const formatYMD = (date) => {
  const dt = new Date(date);
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
};
