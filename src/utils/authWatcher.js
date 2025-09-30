import { hasAccessToken, clearAuth } from './auth';

const LOGIN_PATH = '/pages/login';
const FORGOT_PASSWORD_PATH = '/pages/forgot-password';

// Store the URL user tried to access
function storeRedirectUrl() {
  localStorage.setItem('redirectTo', window.location.pathname + window.location.search + window.location.hash);
}

function goLogin() {
  if (!location.pathname.startsWith(LOGIN_PATH)) {
    storeRedirectUrl(); // Save requested URL
    window.location.replace(LOGIN_PATH);
  }
}

// 1) On load: if no token, go login (skip forgot password)
if (location.pathname !== FORGOT_PASSWORD_PATH && !hasAccessToken()) {
  goLogin();
}

// 2) Cross-tab sync
window.addEventListener('storage', (e) => {
  if (e.storageArea !== localStorage) return;
  if (e.key === 'accessToken' || e.key === null) {
    if (!hasAccessToken()) {
      clearAuth();
      if (location.pathname !== FORGOT_PASSWORD_PATH) goLogin();
    }
  }
});

// 3) Same-tab safety
const interval = setInterval(() => {
  if (!hasAccessToken() && location.pathname !== FORGOT_PASSWORD_PATH) {
    clearAuth();
    goLogin();
  }
}, 1000);

if (import.meta && import.meta.hot) {
  import.meta.hot.dispose(() => clearInterval(interval));
}

// Expose logout
window.__appLogout = () => {
  clearAuth();
  window.location.replace(LOGIN_PATH);
};
