import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import MachineDetails from './machineDetails';
import EnergyDashboard from './machineDetails2';
import MainCard from 'ui-component/cards/MainCard';
import { FiMaximize, FiMinimize } from 'react-icons/fi'; // Add this for icons

const MachinePage = () => {
  const { machineId } = useParams();
  const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen state

  return (
    <MainCard
      title="Dashboard"
      style={{
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : '100%',
        position: isFullscreen ? 'fixed' : 'relative', // <-- key change
        // background: '#f8f8f8',
        zIndex: isFullscreen ? 2000 : 'auto',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        transition: 'all 0.3s',
        overflow: 'auto'
      }}
    >
      <button
        onClick={() => setIsFullscreen((prev) => !prev)}
        style={{
          position: 'absolute',
          top: 3,
          right: 16,
          zIndex: 1100,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer'
        }}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
      </button>

      <div style={{ padding: '10px' }}>
        {/* <MachineDetails machineId={machineId} /> */}
        <EnergyDashboard machineId={machineId} />
      </div>
    </MainCard>
  );
};

export default MachinePage;
