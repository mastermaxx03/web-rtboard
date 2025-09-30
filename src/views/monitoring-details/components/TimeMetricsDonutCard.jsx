import React from 'react';
import './TimeMetricsDonutCard.css';

const TimeMetricsDonutCard = ({ totalHours, runPercent, idlePercent }) => {
  const radius = 60;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;

  const getOffset = (percent) => circumference - (percent / 100) * circumference;

  return (
    <div className="card">
      <div className="header">Time Metrics</div>
      <div className="donut-container">
        <svg width="160" height="160">
          <circle className="donut-ring" cx="80" cy="80" r={radius} strokeWidth={stroke} />
          <circle
            className="donut-segment-idle"
            cx="80"
            cy="80"
            r={radius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={getOffset(idlePercent)}
          />
          <circle
            className="donut-segment-run"
            cx="80"
            cy="80"
            r={radius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={getOffset(idlePercent + runPercent)}
          />
          <text x="80" y="75" textAnchor="middle" className="center-label">
            Total
          </text>
          <text x="80" y="95" textAnchor="middle" className="center-hours">
            {totalHours} Hr
          </text>
        </svg>
        <div className="legend">
          <div>
            <span className="dot run"></span> Run (&gt;50% Load)
          </div>
          <div>
            <span className="dot idle"></span> Idle (&lt;50%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeMetricsDonutCard;
