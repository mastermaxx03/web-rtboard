// src/utils/refreshTokenService.js
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './tokenService';
import { isJwtSane } from './jwtUtils';

const API_BASE = import.meta.env.VITE_APP_API_AUTH;

export async function refreshAccessToken() {
  // ✋ HARD GATE: if the stored access token is tampered, DO NOT refresh.
  const current = getAccessToken();
  if (current && !isJwtSane(current)) {
    clearTokens();
    return null;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken })
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();

    if (data?.accessToken) setAccessToken(data.accessToken); // also syncs loginData.accessToken
    if (data?.refreshToken) setRefreshToken(data.refreshToken);

    return data?.accessToken ?? null;
  } catch (err) {
    console.error('Refresh token failed:', err);
    clearTokens();
    return null;
  }
}
