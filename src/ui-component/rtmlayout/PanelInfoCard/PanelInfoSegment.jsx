import React from 'react';
import { Maximize, AlertTriangle, Siren } from 'lucide-react';

import Card from '../../common/commonCard';
const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4B5563',
    width: '80px', // Fixed width for alignment
    flexShrink: 0
  },
  value: {
    fontSize: '0.875rem',
    color: '#1F2937'
  },
  alarmContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  alarmTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  criticalAlarm: {
    backgroundColor: '#FEF2F2', // Light Red
    color: '#EF4444' // Red
  },
  warningAlarm: {
    backgroundColor: '#FFFBEB', // Light Yellow
    color: '#F59E0B' // Yellow
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  onlineDot: {
    backgroundColor: '#22C55E' // Green
  },
  offlineDot: {
    backgroundColor: '#6B7280' // Gray
  }
};

// Reusable sub-components for clarity
const InfoRow = ({ label, value }) => (
  <div style={styles.infoRow}>
    <span style={styles.label}>{label.toUpperCase()}:</span>
    <span style={styles.value}>{value}</span>
  </div>
);

const StatusIndicator = ({ isOnline }) => (
  <div style={styles.statusIndicator}>
    <div style={{ ...styles.statusDot, ...(isOnline ? styles.onlineDot : styles.offlineDot) }}></div>
    <span style={styles.value}>{isOnline ? 'Online' : 'Offline'}</span>
  </div>
);

export default function PanelInfoSegment({ data, onExpandClick }) {
  // Use data from props where available, otherwise use default values
  const panelName = data?.name || 'Main LT Panel';
  const location = data?.location || 'Shop Floor, Assembly';
  const criticalAlarms = data?.criticalAlarms || 7; // Default value
  const warningAlarms = data?.warningAlarms || 10; // Default value
  const isOnline = data?.panelStatus === 'ON';
  const headerControls = <Maximize size={16} style={{ cursor: 'pointer', color: '#6B7280' }} onClick={onExpandClick} />;

  return (
    <Card title="Panel Information" headerControls={headerControls}>
      <div style={styles.content}>
        <InfoRow label="Name" value={panelName} />
        <InfoRow label="Location" value={location} />

        <div style={styles.infoRow}>
          <span style={styles.label}>ALARM:</span>
          <div style={styles.alarmContainer}>
            <div style={{ ...styles.alarmTag, ...styles.criticalAlarm }}>
              <Siren size={12} style={{ marginRight: '4px' }} />
              {criticalAlarms} CRIT
            </div>
            <div style={{ ...styles.alarmTag, ...styles.warningAlarm }}>
              <AlertTriangle size={12} style={{ marginRight: '4px' }} />
              {warningAlarms} WARN
            </div>
          </div>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.label}>STATUS:</span>
          <StatusIndicator isOnline={isOnline} />
        </div>
      </div>
    </Card>
  );
}
