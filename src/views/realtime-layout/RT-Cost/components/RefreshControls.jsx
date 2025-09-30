import React from 'react';

/**
 * Props:
 *  - auto (bool): is auto-refresh enabled
 *  - onToggle(bool) : called when toggle flipped
 *  - onRefresh(): manual refresh
 */
export default function RefreshControls({ auto, onToggle, onRefresh }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Refresh icon button */}
      <button
        onClick={onRefresh}
        aria-label="Refresh now"
        title="Refresh"
        style={{
          border: 'none',
          background: 'transparent',
          padding: 6,
          cursor: 'pointer',
          borderRadius: 6
        }}
      >
        {/* inline SVG so no icon deps */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b7280"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path>
          <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"></path>
        </svg>
      </button>

      {/* iOS style toggle */}
      <button
        role="switch"
        aria-checked={auto}
        onClick={() => onToggle?.(!auto)}
        title={auto ? 'Auto refresh: ON' : 'Auto refresh: OFF'}
        style={{
          width: 46,
          height: 24,
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: auto ? '#60a5fa' : '#e5e7eb',
          position: 'relative',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)'
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: auto ? 24 : 2,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: auto ? '#1d4ed8' : '#9ca3af',
            transition: 'left 160ms ease',
            boxShadow: '0 1px 3px rgba(0,0,0,.2)'
          }}
        />
      </button>
    </div>
  );
}
