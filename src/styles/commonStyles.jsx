export const segmentCardStyle = {
  backgroundColor: '#FFFFFF',
  border: 'none',
  borderRadius: '12px',

  padding: '24px',
  fontFamily: 'Inter, Roboto, system-ui, sans-serif',
  display: 'flex',
  flexDirection: 'column'
};

export const segmentHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between', // This is the key property that fixes the alignment
  alignItems: 'center',
  marginBottom: '16px'
};

export const segmentTitleStyle = {
  fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
  fontWeight: 600,
  color: '#1E293B'
};

export const statTitleStyle = {
  fontSize: 'clamp(0.7rem, 1.5vw, 0.75rem)',
  fontWeight: '500',
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

export const statValueStyle = {
  fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
  fontWeight: 'bold',
  lineHeight: 1.1
};

export const statUnitStyle = {
  fontSize: 'clamp(0.9rem, 2vw, 1.25rem)',
  fontWeight: '500',
  lineHeight: 1
};

export const trendIndicatorStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '4px',
  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)'
};

export const expandIconStyle = {
  cursor: 'pointer',
  color: '#6B7280'
};

export const chartWrapperStyle = {
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
