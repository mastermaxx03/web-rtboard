import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { theme } from '../styles/light-theme';
import { inr } from '../utils/formatters';

export default function EnergyFlowDiagram({ energy, wheeling, tod, total }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const W = 420,
      H = 320,
      R = 120,
      TH = 26,
      EXP = 10;
    const todPos = Math.max(0, tod); // for center label only; real split drawn below
    // Outer ring: EC, WC, TOD+
    const outer = [
      { id: 'EC', value: Math.max(0, energy), color: theme.green },
      { id: 'WC', value: Math.max(0, wheeling), color: theme.blue },
      { id: 'TOD+', value: Math.max(0, tod), color: theme.yellow }
    ];
    // Inner ring: TOD credit (abs of negative)
    const todCredit = Math.max(0, -tod);
    const hasCredit = todCredit > 0.00001;

    const svg = d3.select(el).attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${W / 2}, ${H / 2})`);

    // OUTER
    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d.value + 1e-6);
    const arcBase = d3
      .arc()
      .innerRadius(R - TH)
      .outerRadius(R)
      .cornerRadius(10);
    const gOuter = g.append('g');
    const o = gOuter
      .selectAll('path')
      .data(pie(outer))
      .enter()
      .append('path')
      .attr('fill', (d) => d.data.color)
      .attr('d', arcBase)
      .on('mousemove', function (evt, d) {
        const a = d3
          .arc()
          .innerRadius(R - TH - 1)
          .outerRadius(R + EXP)
          .cornerRadius(12);
        d3.select(this).attr('d', a(d));
        const tot = outer.reduce((s, x) => s + x.value, 0);
        const share = tot ? d.data.value / tot : 0;
        setHover({ id: d.data.id, value: d.data.value, share });
        showTooltip(evt, `${d.data.id}: <b>${inr(d.data.value)}</b>${share ? `<br/>Share: ${(share * 100).toFixed(1)}%` : ''}`);
      })
      .on('mouseleave', function (evt, d) {
        d3.select(this).attr('d', arcBase(d));
        setHover(null);
        hideTooltip();
      });

    // INNER – TOD credit ring
    if (hasCredit) {
      const rIn1 = R - TH - 10,
        rIn2 = R - TH - 2;
      const pie2 = d3
        .pie()
        .sort(null)
        .value((d) => d.value);
      const innerArc = d3.arc().innerRadius(rIn1).outerRadius(rIn2).cornerRadius(8);
      g.append('g')
        .selectAll('path')
        .data(pie2([{ id: 'TOD credit', value: todCredit, color: '#7c3aed' }]))
        .enter()
        .append('path')
        .attr('fill', (d) => d.data.color)
        .attr('d', innerArc)
        .style('opacity', 0.95)
        .on('mousemove', (evt, d) => {
          setHover({ id: d.data.id, value: -todCredit, share: null });
          showTooltip(evt, `TOD credit: <b>−${inr(todCredit)}</b>`);
        })
        .on('mouseleave', () => {
          setHover(null);
          hideTooltip();
        });
    }

    // center text
    const label = g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -8)
      .attr('fill', '#64748b')
      .attr('font-size', 12)
      .text('Total Cost');
    const val = g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 16)
      .attr('fill', theme.ink)
      .attr('font-weight', 800)
      .attr('font-size', 20)
      .text(inr(total));

    return () => hideTooltip();
  }, [energy, wheeling, tod, total]);

  // change center readout on hover
  useEffect(() => {
    const svg = d3.select(ref.current);
    const label = svg.select('text[font-size="12"]');
    const value = svg.select('text[font-weight="800"]');
    if (value.empty()) return;
    if (!hover) {
      label.text('Total Cost');
      value.text(inr(total));
    } else {
      label.text(hover.id);
      value.text(hover.value < 0 ? `−${inr(Math.abs(hover.value))}` : inr(hover.value));
    }
  }, [hover, total]);

  return (
    <div
      style={{ background: '#fff', border: '1px solid #e7eaf0', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,.06)', padding: 10 }}
      aria-label="Cost donut"
    >
      <svg ref={ref} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: -6 }}>
        <Legend label="EC" color={theme.green} />
        <Legend label="WC" color={theme.blue} />
        <Legend label="TOD+" color={theme.yellow} />
        <Legend label="TOD credit" color="#7c3aed" />
      </div>
    </div>
  );
}

function Legend({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
      <span style={{ fontSize: 12 }}>{label}</span>
    </div>
  );
}

// ——— tooltip helpers
let tooltipEl;
function ensureTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip-glass';
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}
function showTooltip(evt, html) {
  const t = ensureTooltip();
  t.innerHTML = html;
  const pad = 12;
  t.style.left = `${evt.clientX + pad}px`;
  t.style.top = `${evt.clientY + pad}px`;
  t.style.display = 'block';
}
function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = 'none';
}
