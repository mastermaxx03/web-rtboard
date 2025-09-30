// import React from 'react';
// import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';
// import GaugeChart from '../Harmonics/GaugeChart';
// // --- CHANGE: Import our new PerformanceScoreChart ---
// import PerformanceScoreChart from './PerformanceScoreChart';
// import {
//   modalCardStyle,
//   modalHeaderStyle,
//   modalHeaderTitleStyle,
//   modalHeaderControlsStyle,
//   modalHeaderIconGroupStyle,
//   modalContentStyle,
//   modalColumnStyle,
//   modalFooterStyle,
//   modalButtonStyle,
//   modalButtonPrimaryStyle
// } from '../../../styles/modalLayout';

// //styles for metric table
// const metricsContainerStyle = {
//   display: 'flex',
//   justifyContent: 'space-around',
//   width: '100%',
//   padding: '20px 0',
//   borderTop: '1px solid #e9ecef',
//   borderBottom: '1px solid #e9ecef',
//   backgroundColor: '#f8f9fa'
// };

// const metricBoxStyle = {
//   textAlign: 'center'
// };

// const metricLabelStyle = {
//   fontSize: '0.75rem',
//   color: '#6c757d',
//   marginBottom: '4px',
//   textTransform: 'uppercase',
//   fontWeight: '600'
// };

// const metricValueStyle = {
//   fontSize: '1.75rem',
//   fontWeight: 'bold',
//   color: '#212529',
//   lineHeight: 1.2
// };

// const chartTitleStyle = {
//   textAlign: 'center',
//   fontWeight: 600,
//   fontSize: '1rem',
//   color: '#343a40',
//   marginBottom: '8px'
// };

// export default function RTLoadModal({ data, onClose, onRefresh }) {
//   const handleCardClick = (e) => {
//     e.stopPropagation();
//   };

//   return (
//     <div style={modalCardStyle} onClick={handleCardClick}>
//       <div style={modalHeaderStyle}>
//         <h2 style={modalHeaderTitleStyle}>
//           {data.title || 'REAL-TIME LOAD'} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {data.ref}</span>
//         </h2>
//         <div style={modalHeaderControlsStyle}>
//           <span>{data.date}</span>
//           <span>{data.time}</span>
//           <div style={modalHeaderIconGroupStyle}>
//             <Tally5 size={18} cursor="pointer" />
//             <History size={18} cursor="pointer" />
//             <Download size={18} cursor="pointer" />
//             <RefreshCw size={18} cursor="pointer" onClick={onRefresh} />
//             <X size={20} cursor="pointer" onClick={onClose} />
//           </div>
//         </div>
//       </div>

//       <div style={modalContentStyle}>
//         <div style={modalColumnStyle}>
//           <h3 style={chartTitleStyle}>RT Load %</h3>
//           <div style={{ flexGrow: 1, maxHeight: '200px' }}>
//             <GaugeChart name="RT Load" value={data.rtLoad.percentage} color="#91CC75" timestamp={data.timestamp} />
//           </div>
//         </div>

//         <div style={modalColumnStyle}>
//           <h3 style={chartTitleStyle}>Performance Score</h3>
//           <div style={{ flexGrow: 1, maxHeight: '275px' }}>
//             {/* --- CHANGE: Use the new chart and pass its data --- */}
//             <PerformanceScoreChart value={data.performance.score} timestamp={data.timestamp} />
//           </div>
//         </div>
//       </div>

//       <div style={modalFooterStyle}>
//         <button style={modalButtonPrimaryStyle} onClick={onClose}>
//           Okay
//         </button>
//         <button style={modalButtonStyle} onClick={onClose}>
//           Close
//         </button>
//       </div>
//     </div>
//   );
// }
import React from 'react';
import { Tally5, History, Download, X, RefreshCw } from 'lucide-react';
import GaugeChart from '../Harmonics/GaugeChart';
import PerformanceScoreChart from './PerformanceScoreChart';
import {
  modalCardStyle,
  modalHeaderStyle,
  modalHeaderTitleStyle,
  modalHeaderControlsStyle,
  modalHeaderIconGroupStyle,
  modalContentStyle,
  modalColumnStyle,
  modalFooterStyle,
  modalButtonStyle,
  modalButtonPrimaryStyle
} from '../../../styles/modalLayout';

const chartTitleStyle = {
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '1rem',
  color: '#343a40',
  marginBottom: '8px'
};

// --- CHANGE: Added styles for the new metrics section ---
const metricsContainerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%',
  padding: '20px 0',
  borderTop: '1px solid #e9ecef',
  borderBottom: '1px solid #e9ecef',
  backgroundColor: '#f8f9fa'
};

const metricBoxStyle = {
  textAlign: 'center'
};

const metricLabelStyle = {
  fontSize: '0.75rem',
  color: '#6c757d',
  marginBottom: '4px',
  textTransform: 'uppercase',
  fontWeight: '600'
};

const metricValueStyle = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  color: '#212529',
  lineHeight: 1.2
};

export default function RTLoadModal({ data, onClose, onRefresh }) {
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={modalCardStyle} onClick={handleCardClick}>
      <div style={modalHeaderStyle}>
        <h2 style={modalHeaderTitleStyle}>
          {data.title || 'REAL-TIME LOAD'} <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Ref {data.ref}</span>
        </h2>
        <div style={modalHeaderControlsStyle}>
          <span>{data.date}</span>
          <span>{data.time}</span>
          <div style={modalHeaderIconGroupStyle}>
            <Tally5 size={18} cursor="pointer" />
            <History size={18} cursor="pointer" />
            <Download size={18} cursor="pointer" />
            <RefreshCw size={18} cursor="pointer" onClick={onRefresh} />
            <X size={20} cursor="pointer" onClick={onClose} />
          </div>
        </div>
      </div>

      {/* --- CHANGE: Added the metrics section --- */}
      <div style={metricsContainerStyle}>
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Rated Load</div>
          <div style={metricValueStyle}>{data.ratedLoad} kW</div>
        </div>
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Realtime Load</div>
          <div style={metricValueStyle}>{data.realtimeLoad} kW</div>
        </div>
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>RT Load %</div>
          <div style={metricValueStyle}>{data.rtLoad.percentage}%</div>
        </div>
      </div>

      <div style={modalContentStyle}>
        <div style={modalColumnStyle}>
          <h3 style={chartTitleStyle}>RT Load %</h3>
          <div style={{ flexGrow: 1, maxHeight: '300px' }}>
            <GaugeChart name="RT Load" value={data.rtLoad.percentage} color="#91CC75" timestamp={data.timestamp} />
          </div>
        </div>

        <div style={modalColumnStyle}>
          <h3 style={chartTitleStyle}>Performance Score</h3>
          <div style={{ flexGrow: 1, minHeight: '355px' }}>
            <PerformanceScoreChart value={data.performance.score} timestamp={data.timestamp} />
          </div>
        </div>
      </div>

      <div style={modalFooterStyle}>
        <button style={modalButtonPrimaryStyle} onClick={onClose}>
          Okay
        </button>
        <button style={modalButtonStyle} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
