import { getRefreshToken, setTokens, clearTokens } from './tokenService';

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch('http://192.168.0.158:9001/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken })
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();

    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });

    return data.accessToken;
  } catch (err) {
    console.error('Refresh failed', err);
    clearTokens();
    window.location.href = '/login';
    return null;
  }
};
