// src/routes/AuthGuard.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { hasAccessToken, clearAuth } from '../utils/auth';

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    // 1) Initial check on mount + on route change
    if (!hasAccessToken()) {
      navigate('/pages/login', { replace: true, state: { from: loc.pathname } });
      return;
    }

    // 2) Cross-tab/localStorage changes
    const onStorage = (e) => {
      if (e.storageArea !== localStorage) return;
      if (e.key === 'accessToken' || e.key === null) {
        // key === null means clear() was called
        if (!hasAccessToken()) {
          clearAuth();
          navigate('/pages/login', { replace: true });
        }
      }
    };
    window.addEventListener('storage', onStorage);

    // 3) Safety loop for same-tab manual deletion (DevTools won’t fire 'storage')
    const id = setInterval(() => {
      if (!hasAccessToken()) {
        clearAuth();
        navigate('/pages/login', { replace: true });
      }
    }, 1500);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(id);
    };
  }, [loc.pathname, navigate]);

  return children;
}
