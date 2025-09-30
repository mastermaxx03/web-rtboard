// src/utils/idleAndNavigationRefresh.js
import { refreshAccessToken } from './refreshTokenService';

export function setupAutoRefresh(router) {
  // Refresh on route changes
  router.subscribe(() => {
    refreshAccessToken();
  });

  // Refresh every 10 minutes (600k ms)
  setInterval(
    () => {
      refreshAccessToken();
    },
    10 * 60 * 1000
  );
}
