import React, { useState, useEffect } from 'react';
import SegmentedControl from './SegmentedControl';

const styles = {
  popupOverlay: {
    position: 'absolute',
    top: '55px',
    right: '20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
    border: '1px solid #E2E8F0',
    zIndex: 100,
    width: '380px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  popupContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1E293B'
  },
  timezone: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#475569',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '4px 8px',
    backgroundColor: '#F8FAFC'
  },
  dropdown: {
    width: '100%',
    padding: '12px',
    fontSize: '0.9rem',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    appearance: 'none',
    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="gray" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid #F1F5F9'
  },
  button: {
    padding: '10px 20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    color: '#475569'
  },
  updateButton: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF'
  }
};

export default function RealtimeTimeWindow({ initialSettings, onUpdate, onCancel }) {
  const [activeTab, setActiveTab] = useState('last');
  const [lastValue, setLastValue] = useState('30 seconds');
  const [relativeValue, setRelativeValue] = useState('Current day');
  const [aggregation, setAggregation] = useState('Average');
  const [groupingInterval, setGroupingInterval] = useState('5 seconds');

  useEffect(() => {
    if (initialSettings) {
      setActiveTab(initialSettings.type || 'last');
      setLastValue(initialSettings.value || '30 seconds');
      setAggregation(initialSettings.aggregation || 'Average');
      setGroupingInterval(initialSettings.groupingInterval || '5 seconds');
    }
  }, [initialSettings]);

  const handleUpdate = () => {
    onUpdate({
      type: activeTab,
      value: activeTab === 'last' ? lastValue : relativeValue,
      aggregation,
      groupingInterval
    });
  };

  return (
    <div style={styles.popupOverlay}>
      <div style={styles.popupContent}>
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.title}>Time window</span>
            <span style={styles.timezone}>UTC+05:30</span>
          </div>
          {/* CHANGED: Wrapped the SegmentedControl in a div to constrain its width */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <SegmentedControl
              options={[
                { id: 'last', label: 'Last' },
                { id: 'relative', label: 'Relative' }
              ]}
              activeOptionId={activeTab}
              onSelect={setActiveTab}
            />
          </div>
          {activeTab === 'last' && (
            <select style={styles.dropdown} value={lastValue} onChange={(e) => setLastValue(e.target.value)}>
              <option>30 seconds</option>
              <option>5 minutes</option>
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
            </select>
          )}
          {activeTab === 'relative' && (
            <select style={styles.dropdown} value={relativeValue} onChange={(e) => setRelativeValue(e.target.value)}>
              <option>Current hour</option>
              <option>Current day</option>
              <option>Current day so far</option>
              <option>Current week</option>
            </select>
          )}
        </div>

        <div style={styles.section}>
          <span style={styles.title}>Aggregation</span>
          <select style={styles.dropdown} value={aggregation} onChange={(e) => setAggregation(e.target.value)}>
            <option>Average</option>
            <option>Minimum</option>
            <option>Maximum</option>
            <option>Sum</option>
            <option>Count</option>
            <option>None</option>
          </select>
        </div>

        <div style={styles.section}>
          <span style={styles.title}>Grouping interval</span>
          <select style={styles.dropdown} value={groupingInterval} onChange={(e) => setGroupingInterval(e.target.value)}>
            <option>5 seconds</option>
            <option>15 seconds</option>
            <option>30 seconds</option>
            <option>1 minute</option>
          </select>
        </div>

        <div style={styles.footer}>
          <button style={{ ...styles.button, ...styles.cancelButton }} onClick={onCancel}>
            Cancel
          </button>
          <button style={{ ...styles.button, ...styles.updateButton }} onClick={handleUpdate}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
