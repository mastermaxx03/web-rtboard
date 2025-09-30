// Axios helper (reads JWT from local/sessionStorage or ?token= — no hardcoded fallback)
import axios from 'axios';

const API_BASE = import.meta.env.VITE_APP_API_REALTIME || '';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

export function readTokenFromBrowser() {
  const read = (k) => {
    try {
      return (
        (typeof window !== 'undefined' && window.localStorage?.getItem(k)) ??
        (typeof window !== 'undefined' && window.sessionStorage?.getItem(k)) ??
        ''
      );
    } catch {
      return '';
    }
  };

  let token = read('accessToken') || read('access_token') || read('token');

  if (!token) {
    const raw = read('loginData');
    if (raw) {
      try {
        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
        token = obj?.accessToken || obj?.token || obj?.data?.accessToken || '';
      } catch {
        console.log('Token Error or Access Denied.');
      }
    }
  }

  try {
    if (!token && typeof window !== 'undefined' && window.location?.search) {
      const qp = new URLSearchParams(window.location.search);
      const qpToken = qp.get('token') || qp.get('accessToken') || qp.get('access_token');
      if (qpToken) {
        window.localStorage?.setItem('accessToken', qpToken);
        token = qpToken;
      }
    }
  } catch {
    console.log('URL issue');
  }

  return token || '';
}

api.interceptors.request.use((config) => {
  const token = readTokenFromBrowser();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('[historical/api] No JWT found in local/sessionStorage (keys tried: accessToken, access_token, token, loginData).');
    delete config.headers.Authorization;
  }
  return config;
});

/* --------------------- param resolution helpers -------------------- */
const DEFAULTS = {
  did: 'E_AA_Z_A_Z_P0001_D1',
  segment: 'energy_loss',
  timeFrame: '15m',
  defaultLookbackDays: 20,
  from: '1741996800',
  to: '1744675200',
  minLimit: 600,
  maxLimit: 20000,
  limitPad: 100
};

const toUnix = (v, fallbackSec) => {
  if (v == null) return fallbackSec;
  if (typeof v === 'number') return v < 1e12 ? v : Math.floor(v / 1000);
  if (typeof v === 'string') {
    const num = Number(v);
    if (!Number.isNaN(num)) return num < 1e12 ? Math.floor(num) : Math.floor(num / 1000);
    const d = new Date(v);
    if (!Number.isNaN(+d)) return Math.floor(+d / 1000);
  }
  return fallbackSec;
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const readQueryString = () => {
  try {
    if (typeof window === 'undefined' || !window.location?.search) return {};
    const qp = new URLSearchParams(window.location.search);
    const getNum = (k) => {
      const raw = qp.get(k);
      if (raw == null) return undefined;
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    };
    return {
      did: qp.get('did') || undefined,
      segment: qp.get('segment') || undefined,
      timeFrame: qp.get('timeFrame') || undefined,
      from: qp.get('from') || undefined,
      to: qp.get('to') || undefined,
      limit: getNum('limit')
    };
  } catch {
    return {};
  }
};

function resolveParams(overrides = {}) {
  const qs = readQueryString();
  const nowSec = Math.floor(Date.now() / 1000);

  const merged = { ...DEFAULTS, ...qs, ...overrides };

  const toSecFinal = toUnix(merged.to, nowSec);
  const defFrom = toSecFinal - DEFAULTS.defaultLookbackDays * 24 * 60 * 60;
  const fromSecFinal = toUnix(merged.from, defFrom);

  const spanSecs = Math.max(0, toSecFinal - fromSecFinal);
  const bucketSecs = 900;
  const expectedPoints = Math.ceil(spanSecs / bucketSecs) || DEFAULTS.minLimit;
  const dynamicLimit = clamp(expectedPoints + DEFAULTS.limitPad, DEFAULTS.minLimit, DEFAULTS.maxLimit);

  const finalLimit = Number.isFinite(merged.limit) ? merged.limit : dynamicLimit;

  return { did: merged.did, segment: merged.segment, timeFrame: merged.timeFrame, from: fromSecFinal, to: toSecFinal, limit: finalLimit };
}

/* ----------------------- Public fetch functions -------------------- */
export async function getTelemetry(overrides = {}, options = {}) {
  const params = resolveParams(overrides);
  const res = await api.get('/api/v1/telemetry', { params, ...options });
  const raw = res.data;

  const data = Array.isArray(raw) ? raw : (raw?.data ?? []);
  const meta = Array.isArray(raw) ? {} : (raw?.meta ?? {});

  return { data, meta, params };
}

export async function fetchHistoricalData(overrides = {}, options = {}) {
  const { data, meta } = await getTelemetry(overrides, options);
  return { data, meta };
}
