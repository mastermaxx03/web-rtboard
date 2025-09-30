import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'shift_settings_v1';

const DEFAULT = {
  A: { key: 'A', start: '06:00', end: '14:00', label: 'A' },
  B: { key: 'B', start: '14:00', end: '22:00', label: 'B' },
  C: { key: 'C', start: '22:00', end: '06:00', label: 'C' }
};

const ShiftSettingsCtx = createContext({ shifts: DEFAULT, setShifts: () => {} });

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

  const value = useMemo(() => ({ shifts, setShifts }), [shifts]);
  return <ShiftSettingsCtx.Provider value={value}>{children}</ShiftSettingsCtx.Provider>;
}

export function useShifts() {
  return useContext(ShiftSettingsCtx);
}
