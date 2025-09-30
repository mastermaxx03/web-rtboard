import React from 'react';

/**
 * A simple, reusable spinner component for indicating loading states.
 * This component is shared only within the EBW feature.
 */
const SharedSpinner = () => {
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const style = {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    borderLeftColor: '#09f',
    animation: 'spin 1s linear infinite'
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={style}></div>
    </>
  );
};

export default SharedSpinner;
