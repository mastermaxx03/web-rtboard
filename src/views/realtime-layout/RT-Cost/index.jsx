import React from 'react';
import './styles/animations.css';

import { useDidUrlSync, useRealTimeData } from './hooks/useRealTimeData';
import { useEnergyCalculations } from './hooks/useEnergyCalculations';

import CostBreakdownCards from './components/CostBreakdownCards';
import EnergyFlowDiagram from './components/EnergyFlowDiagram';
import TODAnalysisTable from './components/TODAnalysisTable';
import RealTimeMeters from './components/RealTimeMeters';
import RefreshOverlay from './components/RefreshOverlay';
import RefreshControls from './components/RefreshControls';

export default function RTCostPage() {
  const [did] = useDidUrlSync('E_AA_Z_A_Z_P0001_D1');

  const [auto, setAuto] = React.useState(true);
  const { stream, isLive, now, error, refreshing, reload } = useRealTimeData({
    did,
    timeFrame: '15m',
    segment: 'all',
    pollSec: 60,
    autoRefresh: auto
  });

  const calc = useEnergyCalculations(stream, now);

  return (
    <div style={{ minHeight: '100%', background: '#fff', color: '#0b1020', fontFamily: '"Inter", ui-sans-serif, system-ui', padding: 16 }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        {/* Top strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Real-Time Energy Cost</h2>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              DID: <b>{did}</b>
              {error ? <span style={{ color: '#ef4444', marginLeft: 6 }}>Error: {String(error?.message || error)}</span> : null}
            </span>
          </div>

          {/* Right controls: clock + refresh controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RefreshControls auto={auto} onToggle={setAuto} onRefresh={reload} />
            <RealTimeMeters now={now} currentZone={calc.currentZone} />
          </div>
        </div>

        {/* KPI row */}
        <CostBreakdownCards totals={calc.totals} rates={calc.rates} />

        {/* Donut + Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 16, marginTop: 12 }}>
          <EnergyFlowDiagram
            energy={calc.totals.energyCharges}
            wheeling={calc.totals.wheelingCharges}
            tod={calc.totals.todCharges} // may be negative
            total={calc.totals.totalCost}
          />
          <TODAnalysisTable zones={calc.zoneRows} activeZone={calc.currentZone} />
        </div>
      </div>

      {/* overlay for manual refresh */}
      <RefreshOverlay show={refreshing} />
    </div>
  );
}
