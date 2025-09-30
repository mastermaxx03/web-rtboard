// src/styles/modalLayout.jsx

// --- Main Modal Container ---
export const modalCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  color: '#1a202c',
  padding: '20px 24px',

  // --- NEW RESPONSIVE SIZING ---
  width: '1200px', // Take up 95% of the viewport width
  height: '600px', // Take up 90% of the viewport height
  //maxWidth: '1600px', // A safety limit for extremely large screens
  // --------------------------

  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

// --- Modal Header ---
export const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #e2e8f0',
  paddingBottom: '16px',
  // Make sure header doesn't shrink
  flexShrink: 0
};

export const modalHeaderTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#2d3748'
};

export const modalHeaderControlsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  fontSize: '0.875rem',
  color: '#4a5568'
};

export const modalHeaderIconGroupStyle = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center'
};

// --- Main Content Area ---
export const modalContentStyle = {
  display: 'flex',
  gap: '24px',
  flexGrow: 1,
  // Allow content to scroll if it overflows
  overflow: 'auto'
};

export const modalColumnStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

// --- Reusable Table Styling ---
export const modalTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.875rem'
};

export const modalTableThStyle = {
  border: '1px solid #cbd5e0',
  padding: '8px 12px',
  textAlign: 'left',
  backgroundColor: '#f7fafc',
  fontWeight: 600
};

export const modalTableTdStyle = {
  border: '1px solid #cbd5e0',
  padding: '8px 12px',
  textAlign: 'left'
};

// A specific style for the right-aligned table cell
export const modalTableTdRightStyle = {
  ...modalTableTdStyle, // Inherits base td styles
  textAlign: 'right',
  fontWeight: 500
};
export const modalFooterStyle = {
  display: 'flex',
  justifyContent: 'flex-end', // Aligns buttons to the right
  gap: '12px',
  paddingTop: '16px',
  borderTop: '1px solid #e2e8f0',
  flexShrink: 0 // Prevents the footer from shrinking
};

export const modalButtonStyle = {
  padding: '8px 16px',
  fontSize: '0.875rem',
  fontWeight: 600,
  borderRadius: '8px',
  border: '1px solid #cbd5e0',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

export const modalButtonPrimaryStyle = {
  ...modalButtonStyle,
  backgroundColor: '#3366FF', // A sample primary color
  color: '#ffffff',
  border: 'none'
};
export const professionalTableStyle = {
  width: '100%',
  borderCollapse: 'collapse', // Ensures clean lines
  fontSize: '0.9rem',
  color: '#2d3748'
};

export const professionalTableThStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#4a5568',
  backgroundColor: '#f8fafc',
  borderBottom: '2px solid #e2e8f0' // A solid line under the header
};

export const professionalTableTdStyle = {
  padding: '8px 16px',
  borderBottom: '1px solid #e2e8f0', // Thin lines between rows
  fontWeight: 500
};

export const colorDotStyle = {
  height: '10px',
  width: '10px',
  borderRadius: '50%',
  display: 'inline-block',
  marginRight: '12px',
  verticalAlign: 'middle' // Aligns the dot nicely with the text
};
