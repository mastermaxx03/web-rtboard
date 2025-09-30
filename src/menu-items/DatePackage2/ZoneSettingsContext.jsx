import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'zone_settings_v1';
const BILLING_KEY = 'billing_cycle_day_v1';

// Default: 4 zones, 1 slot each (slots are [start,end) HH:MM, overnight allowed)
const DEFAULT_ZONES = {
  Z1: { key: 'Z1', label: 'Zone 1', slots: [{ start: '06:00', end: '14:00' }] },
  Z2: { key: 'Z2', label: 'Zone 2', slots: [{ start: '14:00', end: '22:00' }] },
  Z3: { key: 'Z3', label: 'Zone 3', slots: [{ start: '22:00', end: '06:00' }] },
  Z4: { key: 'Z4', label: 'Zone 4', slots: [{ start: '00:00', end: '06:00' }] }
};

const DEFAULT_BILLING_DAY = 1; // 1..28

const ZoneSettingsCtx = createContext({
  zones: DEFAULT_ZONES,
  setZones: () => {},
  billingCycleDay: DEFAULT_BILLING_DAY,
  setBillingCycleDay: () => {}
});

export function ZoneSettingsProvider({ children }) {
  const [zones, setZones] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_ZONES;
    } catch {
      return DEFAULT_ZONES;
    }
  });

  const [billingCycleDay, setBillingCycleDay] = useState(() => {
    try {
      const raw = localStorage.getItem(BILLING_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_BILLING_DAY;
    } catch {
      return DEFAULT_BILLING_DAY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
    } catch {}
  }, [zones]);

  useEffect(() => {
    try {
      localStorage.setItem(BILLING_KEY, JSON.stringify(billingCycleDay));
    } catch {}
  }, [billingCycleDay]);

  const value = useMemo(() => ({ zones, setZones, billingCycleDay, setBillingCycleDay }), [zones, billingCycleDay]);
  return <ZoneSettingsCtx.Provider value={value}>{children}</ZoneSettingsCtx.Provider>;
}

export function useZones() {
  return useContext(ZoneSettingsCtx);
}
