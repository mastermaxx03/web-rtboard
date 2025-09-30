import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Toast container rendered to document.body so it never blurs.
 * Listens to 'offline-lock-change' events to show/hide a persistent toast.
 */
export default function ToastOutsideRoot() {
  const toastIdRef = useRef(null);

  useEffect(() => {
    const show = () => {
      if (toastIdRef.current && toast.isActive(toastIdRef.current)) return;
      toastIdRef.current = toast.warning("You're offline. The app is temporarily locked.", {
        toastId: 'offline-lock-toast',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        icon: '⚠️',
        theme: 'colored'
      });
    };

    const hide = () => {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.dismiss('offline-lock-toast');
      toastIdRef.current = null;
    };

    const handler = (e) => {
      if (e.detail?.offline) show();
      else hide();
    };

    // apply current state immediately
    handler({ detail: { offline: !navigator.onLine } });

    window.addEventListener('offline-lock-change', handler);
    return () => window.removeEventListener('offline-lock-change', handler);
  }, []);

  return createPortal(
    <ToastContainer
      position="top-right"
      autoClose={2500}
      closeOnClick={false}
      draggable={false}
      newestOnTop
      pauseOnFocusLoss={false}
      limit={1}
    />,
    document.body
  );
}
