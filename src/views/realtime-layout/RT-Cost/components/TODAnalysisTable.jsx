import React from 'react';
import { inr, nf2 } from '../utils/formatters';

export default function TODAnalysisTable({ zones, activeZone }) {
  return (
    <div
      style={{ background: '#fff', border: '1px solid #e7eaf0', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,.06)', padding: 10 }}
      aria-label="TOD table"
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', padding: '6px 6px 10px' }}>TOD Table</div>

      <div role="table" aria-label="TOD analysis table">
        <Header />
        {zones.map((z) => (
          <Row key={z.id} z={z} active={z.id === activeZone} />
        ))}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 260px 110px 1fr 1fr',
        padding: '8px 10px',
        color: '#6b7280',
        fontSize: 12,
        borderTop: '1px solid #eef1f6',
        borderBottom: '1px solid #eef1f6',
        background: '#fbfdff'
      }}
    >
      <div>TOD Zone</div>
      <div>Time Slots</div>
      <div>Rate (₹/u)</div>
      <div>Units (ΔkVAh)</div>
      <div>Charges (₹)</div>
    </div>
  );
}

function Row({ z, active }) {
  const rateColor = z.rate < 0 ? '#16a34a' : z.rate > 0.9 ? '#ef4444' : '#f59e0b';
  return (
    <div
      className="row-hover"
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 260px 110px 1fr 1fr',
        padding: '10px 10px',
        borderBottom: '1px solid #eef1f6',
        background: active ? '#f0f6ff' : 'transparent'
      }}
      aria-label={`Zone ${z.id} • ${z.times24}`}
      title={`${z.label} • ${z.times24}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 10, height: 10, background: z.color, borderRadius: 2, display: 'inline-block' }} />
        <b style={{ color: '#0f172a' }}>{z.id}</b>
      </div>

      {/* exact 24h text, styled to read like time */}
      <div
        style={{
          color: '#0f172a',
          fontVariantNumeric: 'tabular-nums', // keeps digits aligned
          letterSpacing: 0.2
        }}
      >
        {z.times24}
      </div>

      <div style={{ color: rateColor, fontWeight: 600 }}>{z.rate.toFixed(2)}</div>
      <div>{nf2(z.units)}</div>
      <div style={{ fontWeight: 700, color: z.charges < 0 ? '#0f766e' : '#111827' }}>
        {z.charges < 0 ? `−${inr(Math.abs(z.charges))}` : inr(z.charges)}
      </div>
    </div>
  );
}
