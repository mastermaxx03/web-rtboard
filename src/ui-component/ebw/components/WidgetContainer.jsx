import React from 'react';

// A generic, reusable container for all widgets.
// It receives a title and any style-related props from the dashboard layout.
// This ensures that individual widgets don't need to know about their titles or positions.
const WidgetContainer = ({ title, children, style }) => {
  // Base styles for the container
  const containerStyle = {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...style // Merge with grid-related styles passed from the dashboard
  };

  // Styles for the widget title
  const titleStyle = {
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    fontFamily: 'sans-serif'
  };

  const contentStyle = {
    flex: 1, // Ensures the content area fills the available space
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <div style={contentStyle}>{children}</div>
    </div>
  );
};

export default WidgetContainer;
