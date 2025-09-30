import React from 'react';

const styles = {
  container: {
    display: 'inline-flex', // Use inline-flex to fit content
    alignItems: 'center',
    padding: '2px',
    background: '#E2E8F0',
    borderRadius: '6px'
  },
  button: {
    fontSize: '0.75rem', // 12px
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#475569',
    cursor: 'pointer',
    padding: '4px 12px', // Adjusted padding
    borderRadius: '4px',
    border: 'none',
    background: 'transparent',
    whiteSpace: 'nowrap', // Prevent text from wrapping
    transition: 'all 0.2s ease-in-out'
  },
  buttonActive: {
    background: '#FFFFFF',
    color: '#1E293B',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  }
};

export default function SegmentedControl({ options, activeOptionId, onSelect }) {
  return (
    <div style={styles.container}>
      {options.map((option) => {
        const isActive = option.id === activeOptionId;
        const buttonStyle = isActive ? { ...styles.button, ...styles.buttonActive } : styles.button;

        return (
          <button key={option.id} style={buttonStyle} onClick={() => onSelect(option.id)}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
