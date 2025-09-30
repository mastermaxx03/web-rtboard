// src/views/plantSummary/Dashboard.jsx

import React from 'react';

// Import the container and the widget you've built
import WidgetContainer from '../../ui-component/plantSummary/components/WidgetContainer';
import EnergySourceWidget from '../../ui-component/plantSummary/widgets/EnergySourceWidget';

const Dashboard = () => {
  return (
    <div className="bg-gray-100 p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Plant Summary Dashboard</h1>

      {/* This is the main grid container for all widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PSW-3: Your Energy Source Widget */}
        <WidgetContainer title="Energy Source">
          <EnergySourceWidget />
        </WidgetContainer>

        {/* --- Placeholder Widgets --- */}
        {/* We add these empty containers to visualize the full dashboard layout */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-700">PSW-4 (Empty)</h3>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-700">PSW-5 (Empty)</h3>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-700">PSW-6 (Empty)</h3>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
