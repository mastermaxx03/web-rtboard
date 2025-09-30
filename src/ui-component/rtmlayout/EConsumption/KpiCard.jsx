// import React from 'react';

// const styles = {
//   card: {
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
//     backgroundColor: '#FFFFFF',
//     borderRadius: '12px',
//     padding: '24px',
//     border: '1px solid #E2E8F0',
//     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
//     width: '300px', // Fixed width for each card
//     textAlign: 'center'
//   },
//   title: {
//     fontSize: '1rem',
//     fontWeight: '600',
//     color: '#475569',
//     marginBottom: '16px'
//   },
//   primaryValue: {
//     fontSize: '1.5rem',
//     fontWeight: 'bold',
//     color: '#1E293B',
//     marginBottom: '8px'
//   },
//   trendContainer: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: '12px'
//   },
//   trendItem: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '4px',
//     fontSize: '1rem',
//     fontWeight: '500'
//   },
//   separator: {
//     width: '1px',
//     height: '16px',
//     backgroundColor: '#CBD5E1'
//   }
// };

// const TrendIndicator = ({ current, previous, delta }) => {
//   if (previous === null || current === previous || previous === 0) {
//     return <div style={{ height: '24px' }}></div>; // Reserve space
//   }

//   const isIncrease = delta >= 0;
//   const percentageChange = (delta / previous) * 100;

//   const color = isIncrease ? '#22c55e' : '#ef4444'; // Green for up, Red for down
//   const arrow = isIncrease ? '↑' : '↓';
//   const deltaSign = isIncrease ? '+' : '';

//   return (
//     <div style={styles.trendContainer}>
//       <div style={{ ...styles.trendItem, color: color }}>
//         <span>{arrow}</span>
//         <span>
//           {deltaSign}
//           {delta.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
//         </span>
//       </div>
//       <div style={styles.separator}></div>
//       <div style={{ ...styles.trendItem, color: color }}>
//         <span>{arrow}</span>
//         <span>{Math.abs(percentageChange).toFixed(2)}%</span>
//       </div>
//     </div>
//   );
// };

// export default function KpiCard({ title, currentValue, previousValue, deltaValue, unit }) {
//   return (
//     <div style={styles.card}>
//       <div style={styles.title}>{title}</div>
//       <div style={styles.primaryValue}>
//         {currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {unit}
//       </div>
//       <TrendIndicator current={currentValue} previous={previousValue} delta={deltaValue} />
//     </div>
//   );
// }
import React from 'react';

const styles = {
  card: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '34px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    transition: 'transform 0.2s ease-in-out' // Added a subtle hover effect
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '16px'
  },
  primaryValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: '8px'
  },
  trendContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    height: '24px' // Reserve space to prevent layout shifts
  },
  trendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '1rem',
    fontWeight: '500'
  },
  separator: {
    width: '1px',
    height: '16px',
    backgroundColor: '#CBD5E1'
  }
};

const TrendIndicator = ({ current, previous, delta }) => {
  if (previous === null || current === previous || previous === 0) {
    return null;
  }

  const isIncrease = delta >= 0;
  const percentageChange = (delta / previous) * 100;

  const color = isIncrease ? '#22c55e' : '#ef4444';
  const arrow = isIncrease ? '↑' : '↓';
  const deltaSign = isIncrease ? '+' : '';

  return (
    <div style={styles.trendContainer}>
      <div style={{ ...styles.trendItem, color: '#5d519c' }}>
        <span>Δ</span>
        <span>
          {deltaSign}
          {delta.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      </div>
      <div style={styles.separator}></div>
      <div style={{ ...styles.trendItem, color: color }}>
        <span>{arrow}</span>
        <span>{Math.abs(percentageChange).toFixed(2)}%</span>
      </div>
    </div>
  );
};

export default function KpiCard({ title, currentValue, previousValue, deltaValue, unit, width = '320px' }) {
  return (
    <div style={{ ...styles.card, width: width }}>
      <div style={styles.title}>{title}</div>
      <div style={styles.primaryValue}>
        {currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })} {unit}
      </div>
      <TrendIndicator current={currentValue} previous={previousValue} delta={deltaValue} />
    </div>
  );
}
