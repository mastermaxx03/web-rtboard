// src/views/plantSummary/index.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import EnergySourceWidget from '../../ui-component/plantSummary/widgets/EnergySourceWidget';
import EnergyEfficiencyWidget from '../../ui-component/plantSummary/widgets/EnergyEfficiencyWidget';
import TopConsumptionsWidget from '../../ui-component/plantSummary/widgets/TopConsumptionsWidget'; // New import
import WidgetContainer from '../../ui-component/plantSummary/components/WidgetContainer';
import PowerDurationWidget from '../../ui-component/plantSummary/widgets/PowerCutDurationWidget';
import PlantBreakdownWidget from '../../ui-component/plantSummary/widgets/PlantBreakdownWidget';
import LiveEnergyCostWidget from '../../ui-component/plantSummary/widgets/LiveEnergyCostWidget';
import CostSavingBenchmarkWidget from '../../ui-component/plantSummary/widgets/CostSavingBenchmarkWidget';
import TopEnergyCostsWidget from '../../ui-component/plantSummary/widgets/TopEnergyCostsWidget';
import SurchargeWidget from '../../ui-component/plantSummary/widgets/SurchargeWidget';
import EnergyLossCostingWidget from '../../ui-component/plantSummary/widgets/EnergyLossCostingWidget';
import EnergyChargesWidget from '../../ui-component/plantSummary/widgets/EnergyChargesWidget';
export default function PlantSummaryPage() {
  const { componentID } = useParams();
  let containerStyle = {
    width: '500px',
    height: '400px'
  };

  // Special smaller style for the Energy Charges KPI card
  if (componentID === 'psw-a') {
    containerStyle = {
      width: '300px',
      height: '250px'
    };
  }
  const renderComponent = () => {
    switch (componentID) {
      case 'psw3':
        return (
          <WidgetContainer title="Energy Source">
            <EnergySourceWidget />
          </WidgetContainer>
        );
      case 'psw4':
        return (
          <WidgetContainer title="Energy Efficiency">
            <EnergyEfficiencyWidget />
          </WidgetContainer>
        );
      // Add case for PSW-5
      case 'psw5':
        return (
          <WidgetContainer title="Top 5 Consumptions">
            <TopConsumptionsWidget />
          </WidgetContainer>
        );
      case 'psw7.0':
        return (
          <WidgetContainer title="Power Outages">
            <PowerDurationWidget />
          </WidgetContainer>
        );
      case 'psw7.1':
        return (
          <WidgetContainer title="Plant Breakdown">
            <PlantBreakdownWidget />
          </WidgetContainer>
        );
      case 'psw9':
        return (
          <WidgetContainer title="Live Energy Cost">
            <LiveEnergyCostWidget />
          </WidgetContainer>
        );
      case 'psw10':
        return (
          <WidgetContainer title="Cost Saving Benchmark">
            <CostSavingBenchmarkWidget />
          </WidgetContainer>
        );
      case 'psw11':
        return (
          <WidgetContainer title="Top 5 Energy Costs">
            <TopEnergyCostsWidget />
          </WidgetContainer>
        );
      case 'psw12.0':
        return (
          <WidgetContainer title="PF/MD Surcharge">
            <SurchargeWidget />
          </WidgetContainer>
        );
      case 'psw12.1':
        return (
          <WidgetContainer title="Energy Loss Costing">
            <EnergyLossCostingWidget />
          </WidgetContainer>
        );
      case 'pswa':
        return (
          <WidgetContainer title="Energy Charges">
            <EnergyChargesWidget />
          </WidgetContainer>
        );
      default:
        return <div>Component "{componentID}" not found.</div>;
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <div style={containerStyle}>{renderComponent()}</div>
    </div>
  );
}
