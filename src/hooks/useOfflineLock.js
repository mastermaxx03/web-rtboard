import { useEffect, useRef } from 'react';

const CSS_ID = 'offline-soft-lock-css';
const HTML_LOCK_CLASS = 'offline-lock';

/**
 * Soft offline lock:
 *  - Adds a *light* blur & disables interaction on #root while offline
 *  - Dispatches 'offline-lock-change' events with { offline: boolean }
 */
export default function useOfflineLock() {
  const installedCssRef = useRef(false);
  const isLockedRef = useRef(false);

  const ensureCss = () => {
    if (installedCssRef.current || document.getElementById(CSS_ID)) return;
    const style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = `
      /* Light blur on the React tree ONLY */
      html.${HTML_LOCK_CLASS} #root {
        filter: blur(1px);              /* <- was stronger; now subtle */
        transition: filter 160ms ease;
        pointer-events: none !important;
        user-select: none !important;
      }

      /* Toastify must remain crisp and clickable */
      .Toastify, .Toastify * {
        filter: none !important;
        pointer-events: auto !important;
        user-select: auto !important;
      }
      .Toastify__toast-container {
        z-index: 2147483647 !important;
      }
    `;
    document.head.appendChild(style);
    installedCssRef.current = true;
  };

  const dispatchState = (offline) => {
    window.dispatchEvent(new CustomEvent('offline-lock-change', { detail: { offline } }));
  };

  const lock = () => {
    if (isLockedRef.current) return;
    ensureCss();
    document.documentElement.classList.add(HTML_LOCK_CLASS);
    isLockedRef.current = true;
    dispatchState(true);
  };

  const unlock = () => {
    if (!isLockedRef.current) return;
    document.documentElement.classList.remove(HTML_LOCK_CLASS);
    isLockedRef.current = false;
    dispatchState(false);
  };

  const apply = () => (navigator.onLine ? unlock() : lock());

  useEffect(() => {
    // initial application
    apply();

    const onOnline = () => apply();
    const onOffline = () => apply();

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // safety poll in case devtools toggle is flaky
    const id = setInterval(apply, 1000);

    return () => {
      clearInterval(id);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.documentElement.classList.remove(HTML_LOCK_CLASS);
      dispatchState(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
