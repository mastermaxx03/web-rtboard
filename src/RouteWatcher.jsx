// src/RouteWatcher.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { refreshAccessToken } from './utils/refreshTokenService';

export default function RouteWatcher({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Refresh token whenever the route changes
    refreshAccessToken();
  }, [location]);

  return children;
}
