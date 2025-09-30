import React from 'react';
import { theme } from '../styles/light-theme';
import { ZONES } from '../utils/calculations';

export default function RealTimeMeters({ now, currentZone }) {
  const t = now || new Date();
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  const ss = String(t.getSeconds()).padStart(2, '0');
  const zone = ZONES.find((z) => z.id === currentZone);

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        background: theme.card,
        border: theme.border,
        boxShadow: theme.shadow,
        borderRadius: 999,
        padding: '8px 12px'
      }}
      aria-live="polite"
      title="Live clock & active TOD zone"
    >
      <b style={{ color: theme.ink }}>
        {hh}:{mm}:{ss}
      </b>
      <span style={{ color: theme.muted, fontSize: 12, marginLeft: 6 }}>Local</span>
      <span
        style={{
          marginLeft: 10,
          padding: '6px 10px',
          background: zone?.color || '#e2e8f0',
          color: '#ffffff',
          borderRadius: 999,
          fontWeight: 700,
          fontSize: 12
        }}
      >
        Active: {zone?.id} ({zone?.rate} ₹/u)
      </span>
    </div>
  );
}
