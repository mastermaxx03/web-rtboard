// src/utils/jwtUtils.js
function base64UrlDecode(str) {
  const pad = (s) => s + '==='.slice((s.length + 3) % 4);
  const b64 = pad(str.replace(/-/g, '+').replace(/_/g, '/'));
  try {
    return atob(b64);
  } catch {
    return null;
  }
}

export function isJwtSane(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [h, p] = parts;
  const hJson = base64UrlDecode(h);
  const pJson = base64UrlDecode(p);
  if (!hJson || !pJson) return false;
  try {
    const header = JSON.parse(hJson);
    const payload = JSON.parse(pJson);
    if (!header || typeof header !== 'object') return false;
    if (!payload || typeof payload !== 'object') return false;
    if (!header.alg || typeof header.alg !== 'string') return false;
    if (Number.isFinite(payload.exp) && Number.isFinite(payload.iat) && payload.exp <= payload.iat) return false;
    return true;
  } catch {
    return false;
  }
}
