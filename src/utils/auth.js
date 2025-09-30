export const AUTH_KEYS = ['accessToken', 'refreshToken', 'loginData', 'userData'];

export function clearAuth() {
  AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
}

export function hasAccessToken() {
  return !!localStorage.getItem('accessToken');
}
