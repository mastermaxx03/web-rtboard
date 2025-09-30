import React from 'react';
import { theme } from '../styles/light-theme';
import { inr, nf2 } from '../utils/formatters';

function Stat({ title, value, subtitle, color }) {
  return (
    <div
      style={{
        background: theme.card,
        border: theme.border,
        borderRadius: 12,
        boxShadow: theme.shadow,
        padding: '12px 14px',
        display: 'grid',
        gap: 4
      }}
      title={subtitle}
      aria-label={title}
    >
      <div style={{ fontSize: 12, color: theme.muted }}>{title}</div>
      <div className="countup" style={{ fontWeight: 800, fontSize: 22, color: theme.ink }}>
        {inr(value)}
      </div>
      {subtitle ? <div style={{ fontSize: 11, color }}>{subtitle}</div> : null}
    </div>
  );
}

export default function CostBreakdownCards({ totals, rates }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12 }}>
      <div
        style={{
          background: theme.card,
          border: theme.border,
          borderRadius: 12,
          boxShadow: theme.shadow,
          padding: '12px 14px',
          display: 'grid',
          alignItems: 'center'
        }}
        aria-label="Total Real Time Energy Cost"
        title="Total = Σ(ΔkVAh × ECR + ΔkVAh × WCR + ΔkVAh × TOD)"
      >
        <div style={{ fontSize: 12, color: theme.muted }}>Total Real-Time Energy Cost</div>
        <div className="countup" style={{ fontWeight: 900, fontSize: 28, color: theme.ink }}>
          {inr(totals.totalCost)}
        </div>
        <div style={{ fontSize: 12, color: theme.muted }}>
          Projected EOD: <b>{inr(totals.projectedEOD)}</b>
        </div>
      </div>

      <Stat title="Energy Charges" value={totals.energyCharges} subtitle="= Σ(ΔkVAh × ECR)" color={theme.green} />
      <Stat title="Wheeling Charges" value={totals.wheelingCharges} subtitle="= Σ(ΔkVAh × WCR)" color={theme.blue} />
      <Stat title="TOD Charges" value={totals.todCharges} subtitle="= Σ(ΔkVAh × TOD rate)" color={theme.yellow} />

      <div
        style={{
          background: theme.card,
          border: theme.border,
          borderRadius: 12,
          boxShadow: theme.shadow,
          padding: '12px 14px',
          minWidth: 140,
          display: 'grid',
          alignItems: 'center'
        }}
        aria-label="Rates"
      >
        <div style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>Rates</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span>ECR (₹/u)</span>
          <b>{nf2(rates.ECR)}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span>WCR (₹/u)</span>
          <b>{nf2(rates.WCR)}</b>
        </div>
      </div>
    </div>
  );
}
