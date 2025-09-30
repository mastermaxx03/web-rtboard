// Lightweight helpers to read/write DID in the browser URL (no router dependency)

export function getDidFromURL() {
  try {
    if (typeof window === 'undefined') return '';
    const s = new URLSearchParams(window.location.search);
    return s.get('did') || '';
  } catch {
    return '';
  }
}

export function setDidInURL(nextDid, { replace = false } = {}) {
  try {
    if (typeof window === 'undefined' || !nextDid) return;
    const url = new URL(window.location.href);
    url.searchParams.set('did', String(nextDid));
    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  } catch {
    // ignore
  }
}

/** Optional: call when your page mounts to ensure a default DID is visible in URL */
export function ensureDidInURL(defaultDid) {
  const cur = getDidFromURL();
  if (!cur && defaultDid) setDidInURL(defaultDid, { replace: true });
}
