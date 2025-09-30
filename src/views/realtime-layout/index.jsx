import React from 'react';
// import PanelInfoCard from '../../ui-component/rtmlayout/PanelInfoCard'; // We will create this component next
// import ThreePhaseVoltage from '../../ui-component/rtmlayout/ThreePhaseVoltage';

// /home/rushikesh/esm/web-dashboard/src/ui-component/rtmlayout/PanelInfoCard

// Define styles for the page container
const pageStyles = {
  backgroundColor: '#FFFF', // A dark gray background, similar to bg-gray-900
  minHeight: 'calc(100vh - 88px)', // Adjust height to account for your app's header/appbar
  display: 'flex',
  alignItems: 'flex-start', // Align items to the top
  justifyContent: 'flex-start', // Align items to the left
  padding: '24px', // Corresponds to theme.spacing(3) in Material-UI
  boxSizing: 'border-box'
};

const RealtimeLayoutPage = () => {
  return (
    <div style={pageStyles}>
      {/* <PanelInfoCard /> */}
      <ThreePhaseVoltage />
    </div>
  );
};

export default RealtimeLayoutPage;
