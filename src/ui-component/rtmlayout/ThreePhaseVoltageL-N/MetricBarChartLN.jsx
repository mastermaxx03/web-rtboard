import React from 'react';

export default function MetricBarLN({ label, value, percentage, color }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifycontent:'space-between', marginTop: '8px', marginBottom: '8px', fontSize: '0.875rem' }}>
       <span>{label}</span>
      
       <span style={{ marginLeft: 'auto' }}>{value}</span>
      </div>
      <div style={{ height: '20px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: color, borderRadius: '4px' }} />
      </div>
    </div>
  );
}
