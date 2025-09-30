import React from 'react';

// --- Icon Imports ---
import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';

// --- Project Imports ---
import AvgPFBarChart from './AvgPFBarChart';
import PFS_SliderChart from './PFS_SliderChart';
// --- CHANGE: Assuming a reusable MetricBar component exists ---
import MetricBar from './MetricBarChart'; // Adjust this import path as needed
import {
  modalCardStyle,
  modalHeaderStyle,
  modalHeaderTitleStyle,
  modalHeaderControlsStyle,
  modalHeaderIconGroupStyle,
  modalContentStyle,
  modalColumnStyle,
  modalFooterStyle,
  modalButtonStyle,
  modalButtonPrimaryStyle
} from '../../../styles/modalLayout';

// --- Logic from the Incentive/Penalty Table ---
const getIncentivePenaltyPercent = (avgPF) => {
  // Incentive Ranges
  if (avgPF >= 0.995) return 3.5;
  if (avgPF >= 0.985) return 2.5;
  if (avgPF >= 0.975) return 1.5;
  if (avgPF >= 0.965) return 1.0;
  if (avgPF >= 0.955) return 0.5;
  if (avgPF >= 0.951) return 0;

  // Penalty Ranges (use negative for slider positioning)
  if (avgPF < 0.815) return -5.0;
  if (avgPF < 0.825) return -4.5;
  if (avgPF < 0.835) return -4.0;
  if (avgPF < 0.845) return -3.5;
  if (avgPF < 0.855) return -3.0;
  if (avgPF < 0.865) return -2.5;
  if (avgPF < 0.875) return -2.0;
  if (avgPF < 0.885) return -1.5;
  if (avgPF < 0.895) return -1.0;

  // Neutral Zone
  return 0;
};

// --- Main Component ---
export default function AvgPFModal({ data, onClose, onRefresh }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  // --- Calculate derived values for the new metric bars ---
  const phaseValues = Object.values(data.phases);
  const maxDev = Math.max(...phaseValues) - Math.min(...phaseValues);
  const pfImbalance = data.avg > 0 ? (maxDev / data.avg) * 100 : 0;

  const sliderValue = getIncentivePenaltyPercent(data.avg);

  // Data for the metric bars in the right column
  const metricsData = [
    { label: 'Max Devn', value: maxDev.toFixed(3), percentage: (maxDev / 0.2) * 100 }, // Assuming max possible dev is 0.2
    { label: 'PF Imbalance', value: `${pfImbalance.toFixed(2)}%`, percentage: pfImbalance },
    { label: 'Avg P.F.', value: data.avg.toFixed(3), percentage: data.avg * 100 }
  ];

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      {/* Header */}
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>
          {data.title || 'AVERAGE PF FACTOR'} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {data.ref}</span>
        </h2>
        <div style={modalHeaderControlsStyle}>
          <span>{data.date}</span>
          <span>{data.time}</span>
          <div style={modalHeaderIconGroupStyle}>
            <Tally5 size={18} cursor="pointer" />
            <History size={18} cursor="pointer" />
            <Download size={18} cursor="pointer" />
            <RefreshCw size={18} cursor="pointer" onClick={onRefresh} />
            <X size={20} cursor="pointer" onClick={onClose} />
          </div>
        </div>
      </div>

      {/* Content */}
      {/* --- CHANGE: Main content is a column, containing the 2-col layout and the slider --- */}
      <div style={{ ...modalContentStyle, flexDirection: 'column', flexGrow: 1 }}>
        {/* Top Two-Column Section */}
        <div style={{ display: 'flex', gap: '12px', flexGrow: 1 }}>
          {/* Left Column: Phase Bar Chart */}
          <div style={modalColumnStyle}>
            <AvgPFBarChart data={data.phases} timestamp={data.timestamp} />
          </div>

          {/* Right Column: New Metric Bars */}
          <div style={{ ...modalColumnStyle, justifyContent: 'center' }}>
            {metricsData.map((metric) => (
              <MetricBar
                key={metric.label}
                label={metric.label}
                value={metric.value}
                percentage={metric.percentage}
                // Placeholder color - can be made dynamic later
                color={metric.label === 'Avg P.F.' ? '#4CAF50' : '#4CAF50'}
              />
            ))}
          </div>
        </div>

        {/* Bottom Section: Slider Chart */}
        <div style={{ height: '200px', flexShrink: 0 }}>
          <PFS_SliderChart value={sliderValue} avgPF={data.avg} timestamp={data.timestamp} />
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
