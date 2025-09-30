import React, { useState, useEffect } from 'react';

// --- Icon Imports ---
import { Tally5, History, Download, X, AlertTriangle, Siren, CheckCircle2, RefreshCw } from 'lucide-react';

// --- Project Imports ---
import FrequencyRingChart from './FrequencyRingChart';
import {
  modalCardStyle,
  modalHeaderStyle,
  modalHeaderTitleStyle,
  modalHeaderControlsStyle,
  modalHeaderIconGroupStyle,
  modalContentStyle,
  modalColumnStyle,
  modalTableStyle,
  modalTableTdStyle,
  modalTableThStyle,
  modalFooterStyle,
  modalButtonStyle,
  modalButtonPrimaryStyle
} from '../../../styles/modalLayout';

// --- Reusable Status Indicator Component ---
const StatusIndicator = ({ status }) => {
  const indicatorConfig = {
    acceptable: { Icon: CheckCircle2, color: '#169c33', bgColor: '#F0FDF4' },
    warning: { Icon: AlertTriangle, color: '#ffce56', bgColor: '#FFFBEB' },
    critical: { Icon: Siren, color: '#ff5252', bgColor: '#FFF1F2' }
  };
  const config = indicatorConfig[status];
  if (!config) return null;
  return (
    <div
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600
      }}
    >
      <config.Icon size={14} style={{ marginRight: '4px' }} />
      {status.toUpperCase()}
    </div>
  );
};

// --- New Reusable DeviationBar Component ---
const DeviationBar = ({ label, value, percentage, color }) => {
  const barColor = color || '#6c757d'; // Use passed color, fallback to grey
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ height: '20px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: barColor, borderRadius: '4px' }} />
      </div>
    </div>
  );
};

// --- Status Logic based on your defined ranges ---
const getMinStatus = (value) => {
  if (value < 40) return 'critical';
  if (value < 45) return 'warning';
  return 'acceptable';
};
const getMaxStatus = (value) => {
  if (value > 60) return 'critical';
  if (value > 55) return 'warning';
  return 'acceptable';
};
const getAvgStatus = (value) => {
  if (value < 45 || value > 55) return 'critical';
  if ((value >= 45 && value < 48) || (value > 53 && value <= 55)) return 'warning';
  return 'acceptable';
};
const getDeviationStatus = (percentage) => {
  if (percentage > 5) return 'critical';
  if (percentage > 2.5) return 'warning';
  return 'acceptable';
};
const statusColors = {
  acceptable: '#169c33', // green
  warning: '#ffce56', // yellow
  critical: '#ff5252' // red
};

// --- Main Component ---
export default function FrequencyModal({ data, onClose, onRefresh }) {
  // --- State for the different update intervals ---
  const [realtimeValue, setRealtimeValue] = useState(data.avg); // Start with avg
  const [minMaxAvg, setMinMaxAvg] = useState({
    min: data.min,
    max: data.max,
    avg: data.avg
  });

  // --- Effect to manage the two simulation timers ---
  useEffect(() => {
    // Fast timer (3s) for realtime value
    const realtimeInterval = setInterval(() => {
      setRealtimeValue(+(48 + Math.random() * 5).toFixed(2));
    }, 3000);

    // Slow timer (9s) for min/max/avg
    const aggregateInterval = setInterval(() => {
      setMinMaxAvg({
        min: +(45 + Math.random() * 3).toFixed(2),
        max: +(52 + Math.random() * 5).toFixed(2),
        avg: +(49 + Math.random() * 3).toFixed(2)
      });
    }, 9000);

    // Cleanup timers on component unmount
    return () => {
      clearInterval(realtimeInterval);
      clearInterval(aggregateInterval);
    };
  }, []); // Empty dependency array means this runs only once on mount

  // --- Calculate derived values on every render ---
  const freqDeviation = Math.abs(realtimeValue - minMaxAvg.avg).toFixed(2);
  const freqDeviationPct = minMaxAvg.avg > 0 ? ((freqDeviation / minMaxAvg.avg) * 100).toFixed(2) : 0;

  const maxDeviation = Math.abs(minMaxAvg.max - minMaxAvg.avg).toFixed(2);
  const maxDeviationPct = minMaxAvg.avg > 0 ? ((maxDeviation / minMaxAvg.avg) * 100).toFixed(2) : 0;

  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  const tableMetrics = [
    { key: 'Min Freq', value: `${minMaxAvg.min} Hz`, status: getMinStatus(minMaxAvg.min) },
    { key: 'Max Freq', value: `${minMaxAvg.max} Hz`, status: getMaxStatus(minMaxAvg.max) },
    { key: 'Avg Freq', value: `${minMaxAvg.avg} Hz`, status: getAvgStatus(minMaxAvg.avg) },
    { key: 'Absolute Deviation', value: `${freqDeviation} Hz`, status: getDeviationStatus(freqDeviationPct) },
    { key: 'Max Deviation', value: `${maxDeviation} Hz`, status: getDeviationStatus(maxDeviationPct) }
  ];
  const realTimeDevStatus = getDeviationStatus(freqDeviationPct);
  const realTimeDevColor = statusColors[realTimeDevStatus];
  const maxDevStatus = getDeviationStatus(maxDeviationPct);
  const maxDevColor = statusColors[maxDevStatus];
  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>
          {data.title} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {data.ref}</span>
        </h2>
        <div style={modalHeaderControlsStyle}>
          <span>{data.date}</span>
          <span>{data.time}</span>
          <div style={modalHeaderIconGroupStyle}>
            {/* --- FIX: Restored missing icons --- */}
            <Tally5 size={18} cursor="pointer" />
            <History size={18} cursor="pointer" />
            <Download size={18} cursor="pointer" />
            <RefreshCw size={18} cursor="pointer" onClick={onRefresh} />
            <X size={20} cursor="pointer" onClick={onClose} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={modalContentStyle}>
        {/* Left Column */}
        <div style={modalColumnStyle}>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '250px', height: '250px' }}>
              <FrequencyRingChart value={realtimeValue} timestamp={data.timestamp} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        {/* --- FIX: Corrected style syntax --- */}
        <div style={{ ...modalColumnStyle, gap: '24px' }}>
          <DeviationBar label="Absolute Deviation %" value={freqDeviationPct} percentage={freqDeviationPct} color={realTimeDevColor} />
          <DeviationBar label="Max Deviation %" value={maxDeviationPct} percentage={maxDeviationPct} color={maxDevColor} />

          <table style={{ ...modalTableStyle, marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={modalTableThStyle}>Key</th>
                <th style={modalTableThStyle}>Value</th>
                <th style={modalTableThStyle}>Indicator</th>
              </tr>
            </thead>
            <tbody>
              {tableMetrics.map((metric) => (
                <tr key={metric.key}>
                  <td style={modalTableTdStyle}>{metric.key}</td>
                  <td style={modalTableTdStyle}>{metric.value}</td>
                  {/* --- FIX: Centered the status indicator cell --- */}
                  <td style={{ ...modalTableTdStyle, textAlign: 'center' }}>
                    <StatusIndicator status={metric.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ flexGrow: 1 }}></div>
        </div>
      </div>
      <div style={modalFooterStyle}>
        <button style={modalButtonPrimaryStyle} onClick={onClose}>
          Okay
        </button>
        <button style={modalButtonStyle} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
