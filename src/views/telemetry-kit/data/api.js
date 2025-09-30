// data/api.js
// Centralized API config + auth helpers used by telemetry loader (and others)

import axios from 'axios';

/** Base URL (no trailing slash) */
export const API_BASE = import.meta.env.VITE_APP_API_TELEMETRY;

/** Robust token reader (localStorage → sessionStorage → JSON bundle → ?token=... in URL → env) */
export function readTokenFromBrowser() {
  const read = (k) => {
    try {
      return (
        (typeof window !== 'undefined' && window?.localStorage?.getItem(k)) ??
        (typeof window !== 'undefined' && window?.sessionStorage?.getItem(k)) ??
        ''
      );
    } catch {
      return '';
    }
  };

  // common keys first
  let token = read('accessToken') || read('access_token') || read('token');

  // embedded JSON blob (e.g. loginData)
  if (!token) {
    const raw = read('loginData');
    if (raw) {
      try {
        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
        token = obj?.accessToken || obj?.token || obj?.data?.accessToken || '';
      } catch {
        // swallow
      }
    }
  }

  // query string fallback (persist to localStorage)
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
    // ignore
  }

  // env fallback
  if (!token) token = import.meta?.env?.VITE_API_TOKEN || '';

  return token || '';
}

/** Returns `Authorization` header map when a token exists */
export const authHeaders = () => {
  const raw = readTokenFromBrowser();
  if (!raw) return undefined;
  const bearer = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
  return { Authorization: bearer };
};

/** Axios instance mirroring your reference (used elsewhere if needed) */
export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const tok = readTokenFromBrowser();
  if (tok) {
    const bearer = tok.startsWith('Bearer ') ? tok : `Bearer ${tok}`;
    config.headers.Authorization = bearer;
  } else {
    // eslint-disable-next-line no-console
    console.warn('[data/api] No JWT found (tried accessToken, access_token, token, loginData; also looks for ?token=...)');
  }
  return config;
});
