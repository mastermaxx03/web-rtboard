import React from 'react';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  switchTrack: {
    cursor: 'pointer',
    width: '40px',
    height: '22px',
    borderRadius: '11px',
    background: '#CBD5E1', // Default off color
    position: 'relative',
    transition: 'background-color 0.2s ease-in-out'
  },
  switchTrackOn: {
    background: '#3B82F6' // Blue for 'V', for example
  },
  switchKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '18px',
    height: '18px',
    background: 'white',
    borderRadius: '50%',
    transition: 'transform 0.2s ease-in-out'
  },
  switchKnobOn: {
    transform: 'translateX(18px)'
  }
};

export default function ToggleSwitch({ isOn, handleToggle, optionLabels }) {
  const trackStyle = isOn ? { ...styles.switchTrack, ...styles.switchTrackOn } : styles.switchTrack;
  const knobStyle = isOn ? { ...styles.switchKnob, ...styles.switchKnobOn } : styles.switchKnob;

  return (
    <div style={styles.container}>
      <span style={styles.label}>{optionLabels.on}</span>
      <div style={trackStyle} onClick={handleToggle}>
        <div style={knobStyle}></div>
      </div>
      <span style={styles.label}>{optionLabels.off}</span>
    </div>
  );
}
