import React from 'react';
import { useParams } from 'react-router-dom';

import ConsumptionTrendWidget from '../../../src/ui-component/ebw/widgets/ConsumptionTrendWidget';
import DemandWidget from '../../../src/ui-component/ebw/widgets/DemandWidget';
import BillingAnalysisWidget from '../../../src/ui-component/ebw/widgets/BillingAnalysisWidget';
import TodCostWidget from '../../../src/ui-component/ebw/widgets/TodCostWidget';
import WidgetContainer from '../../../src/ui-component/ebw/components/WidgetContainer';
import PowerFactorWidget from '../../ui-component/ebw/widgets/PowerFactorWidget';
import LoadFactorWidget from '../../ui-component/ebw/widgets/LoadFactorWidget';
import BillComponentWidget from '../../ui-component/ebw/widgets/BillComponentWidget';
import RebatesWidget from '../../ui-component/ebw/widgets/RebatesWidget';
export default function IsolatedTestPage() {
  const { componentId } = useParams();

  let containerStyle = { width: '900px', height: '500px' };

  // Give EBW4 a wider container for better layout
  if (componentId === 'ebw4') {
    containerStyle.width = '1100px';
    containerStyle.height = '450px';
  }

  const renderComponent = () => {
    switch (componentId) {
      case 'ebw1':
        return (
          <WidgetContainer title="Consumption Trend">
            <ConsumptionTrendWidget />
          </WidgetContainer>
        );
      case 'ebw2':
        return (
          <WidgetContainer title="Demand Details">
            <DemandWidget />
          </WidgetContainer>
        );
      case 'ebw3':
        return (
          <WidgetContainer title="Billing Demand Analysis">
            <BillingAnalysisWidget />
          </WidgetContainer>
        );
      case 'ebw4':
        return (
          <WidgetContainer title="TOD Cost Analysis">
            <TodCostWidget />
          </WidgetContainer>
        );
      case 'ebw5':
        return (
          <WidgetContainer title="Power Factor Analysis">
            <PowerFactorWidget />
          </WidgetContainer>
        );
      case 'ebw6':
        return (
          <WidgetContainer title="Power Factor Analysis">
            <LoadFactorWidget />
          </WidgetContainer>
        );
      case 'ebw7':
        return (
          <WidgetContainer title="Bill Component">
            <BillComponentWidget />
          </WidgetContainer>
        );
      case 'ebw8':
        return (
          <WidgetContainer title="Incentives & Rebates">
            <RebatesWidget />
          </WidgetContainer>
        );
      default:
        return <div>Component ID "{componentId}" not found.</div>;
    }
  };

  return (
    <div
      style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}
    >
      <div style={containerStyle}>{renderComponent()}</div>
    </div>
  );
}
