import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'shift_settings_v1';

/** Default 3-shift pattern (supports overnight C: 22:00 → 06:00) */
const DEFAULT = {
  A: { key: 'A', start: '06:00', end: '14:00', label: 'A' },
  B: { key: 'B', start: '14:00', end: '22:00', label: 'B' },
  C: { key: 'C', start: '22:00', end: '06:00', label: 'C' }
};

const Ctx = createContext({
  shifts: DEFAULT,
  setShifts: () => {},
  /** Returns {start,end,shift} for *now* (UTC ISO strings) */
  currentShiftRange: () => ({ start: '', end: '', shift: null })
});

function parseHM(hhmm) {
  const [h, m] = String(hhmm || '')
    .split(':')
    .map(Number);
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
}
function localToISO(y, mIdx, d, hh, mm) {
  return new Date(y, mIdx, d, hh, mm, 0, 0).toISOString();
}
/** Build [start,end) for a given local date and shift; handles overnight */
function computeShiftRangeLocal(dayLocal, shift) {
  const y = dayLocal.getFullYear();
  const mIdx = dayLocal.getMonth();
  const d = dayLocal.getDate();
  const { h: sh, m: sm } = parseHM(shift.start);
  const { h: eh, m: em } = parseHM(shift.end);

  const startLocal = new Date(y, mIdx, d, sh, sm, 0, 0);
  let endLocal = new Date(y, mIdx, d, eh, em, 0, 0);
  if (endLocal <= startLocal) endLocal.setDate(endLocal.getDate() + 1); // overnight

  return { start: startLocal.toISOString(), end: endLocal.toISOString() };
}

function currentShiftRangeLocal(nowLocal, shifts) {
  const list = [shifts.A, shifts.B, shifts.C].filter(Boolean);

  for (const s of list) {
    // today’s window
    const r = computeShiftRangeLocal(nowLocal, s);
    const t = nowLocal.getTime();
    if (t >= new Date(r.start).getTime() && t < new Date(r.end).getTime()) {
      return { ...r, shift: s };
    }

    // yesterday’s overnight (if any)
    const { h: sh, m: sm } = parseHM(s.start);
    const { h: eh, m: em } = parseHM(s.end);
    if (eh < sh || (eh === sh && em <= sm)) {
      const y = new Date(nowLocal);
      y.setDate(y.getDate() - 1);
      const ry = computeShiftRangeLocal(y, s);
      if (t >= new Date(ry.start).getTime() && t < new Date(ry.end).getTime()) {
        return { ...ry, shift: s };
      }
    }
  }

  // Fallback to A today
  const fa = computeShiftRangeLocal(nowLocal, shifts.A || DEFAULT.A);
  return { ...fa, shift: shifts.A || DEFAULT.A };
}

export function ShiftSettingsProvider({ children }) {
  const [shifts, setShifts] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
    } catch {}
  }, [shifts]);

  const value = useMemo(
    () => ({
      shifts,
      setShifts,
      currentShiftRange: () => currentShiftRangeLocal(new Date(), shifts)
    }),
    [shifts]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShiftSettings() {
  return useContext(Ctx);
}
