import React from 'react';
import { Maximize } from 'lucide-react';
import { segmentCardStyle, expandIconStyle, segmentTitleStyle } from '../../../styles/commonStyles';
import EChartsPowerChart from './EChartsPowerChart';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  contentWrap: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  labelsContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: '150px',
    textAlign: 'right',
    paddingRight: '12px',
    flexShrink: 0
  },
  label: {
    fontSize: '0.8rem',
    color: '#334155',
    fontWeight: '500'
  },
  chartContainer: {
    flexGrow: 1,
    height: '150px'
  }
};

export default function TotalPowerSegment({ data, onExpandClick = () => {} }) {
  return (
    <div style={segmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>Total Power Consumption</div>
        <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      </div>
      <div style={styles.contentWrap}>
        <div style={styles.labelsContainer}>
          {/* This order is now correct and matches the chart */}
          <div style={styles.label}>Total kVA</div>
          <div style={styles.label}>kVA Imbalance</div>
          <div style={styles.label}>Total kW</div>
          <div style={styles.label}>kW Imbalance</div>
        </div>
        <div style={styles.chartContainer}>
          <EChartsPowerChart data={data} />
        </div>
      </div>
    </div>
  );
}
