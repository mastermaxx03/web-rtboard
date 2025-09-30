import React from 'react';
import spinnerUrl from '../assets/esm-rotate-loading.png'; // ✅ Vite will bundle this

export default function RefreshOverlay({ show, logoSrc, size = 100 }) {
  if (!show) return null;
  const src = logoSrc || spinnerUrl;

  return (
    <div
      aria-label="Refreshing data"
      role="status"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(245,247,251,0.55)',
        backdropFilter: 'blur(0.1px)',
        WebkitBackdropFilter: 'blur(0.1px)',
        transition: 'opacity 160ms ease',
        pointerEvents: 'auto'
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          animation: 'rtcost_spin 1.25s linear infinite'
        }}
      >
        <img
          src={src}
          alt="Refreshing"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.15))'
          }}
        />
      </div>

      <style>{`
        @keyframes rtcost_spin { from { transform: rotate(0deg) } to { transform: rotate(540deg) } }
      `}</style>
    </div>
  );
}
