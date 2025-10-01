// src/routes/AuthGuard.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { hasAccessToken, clearAuth } from '../utils/auth';

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    // Initial check on mount + on route change
    if (!hasAccessToken()) {
      navigate('/login', { replace: true, state: { from: loc.pathname } });
      return;
    }

    // Cross-tab/localStorage changes
    const onStorage = (e) => {
      if (e.storageArea !== localStorage) return;
      if (e.key === 'accessToken' || e.key === null) {
        if (!hasAccessToken()) {
          clearAuth();
          navigate('/login', { replace: true });
        }
      }
    };
    window.addEventListener('storage', onStorage);

    // Safety loop for same-tab manual deletion
    const id = setInterval(() => {
      if (!hasAccessToken()) {
        clearAuth();
        navigate('/login', { replace: true });
      }
    }, 1500);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(id);
    };
  }, [loc.pathname, navigate]);

  return children;
}
