import React from 'react';
import FrequencyRingChartSeg from './FrequencyRingChartSeg';
import { Maximize } from 'lucide-react';
// CHANGED: Import the shared header style
import { segmentCardStyle, segmentTitleStyle, expandIconStyle, segmentHeaderStyle, chartWrapperStyle } from '../../../styles/commonStyles';

const styles = {
  chartContainer: {
    // Let's give it a reasonable size that doesn't break the layout
    width: '150px',
    height: '150px'
  }
};

export default function FrequencySegment({ data, onExpandClick }) {
  return (
    // The root div now just uses the common card style
    <div style={segmentCardStyle}>
      {/* CHANGED: Use the imported segmentHeaderStyle for perfect alignment */}
      <div style={segmentHeaderStyle}>
        <div style={segmentTitleStyle}>System Frequency</div>
        <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      </div>

      <div style={chartWrapperStyle}>
        <FrequencyRingChartSeg value={data.avg} />
      </div>
    </div>
  );
}
