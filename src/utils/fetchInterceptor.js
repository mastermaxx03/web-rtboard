// src/utils/fetchInterceptor.js
import { getAccessToken, clearTokens, LOGIN_ROUTE } from './tokenService';
import { refreshAccessToken } from './refreshTokenService';
import { isJwtSane } from './jwtUtils';

function isAuthUrl(url = '') {
  return url.includes('/auth/login') || url.includes('/auth/refresh-token');
}

export async function customFetch(url, options = {}) {
  if (isAuthUrl(url)) return fetch(url, options);

  const current = getAccessToken();
  if (current && !isJwtSane(current)) {
    clearTokens();
    window.location.href = LOGIN_ROUTE;
    return null;
  }

  const fresh = await refreshAccessToken(); // this is also hard-gated now
  if (!fresh) {
    clearTokens();
    window.location.href = LOGIN_ROUTE;
    return null;
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${fresh}`
  };
  return fetch(url, { ...options, headers });
}
