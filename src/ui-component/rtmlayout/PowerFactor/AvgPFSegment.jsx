import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Maximize } from 'lucide-react';
import { segmentCardStyle, expandIconStyle, segmentTitleStyle } from '../../../styles/commonStyles';

// --- ECharts modular (tree-shaken) imports ---
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([PieChart, TitleComponent, CanvasRenderer]);

// ---- Styles ----
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',

    marginBottom: 8
  },
  chartWrapper: {
    flexGrow: 1,
    height: '150px'
  }
};

// --- Incentive/Penalty Logic ---
const getIncentivePenalty = (avgPF) => {
  // Incentive Ranges
  if (avgPF >= 0.955) return { text: 'Incentive', color: '#22c55e' }; // Green
  if (avgPF >= 0.951) return { text: 'Neutral', color: '#64748B' }; // Gray

  // Penalty Ranges
  if (avgPF < 0.895) return { text: 'Penalty', color: '#ef4444' }; // Red

  // Neutral Zone
  return { text: 'Neutral', color: '#64748B' };
};

export default function AvgPFSegment({ data, onExpandClick }) {
  if (!data) {
    return (
      <div style={segmentCardStyle}>
        <div style={styles.header}>
          <div style={segmentTitleStyle}>Power Factor Level</div>
        </div>
      </div>
    );
  }

  const maxPF = 1.0;
  const status = getIncentivePenalty(data.avg);

  const donutOption = {
    // Use the 'title' to place rich text in the center
    title: {
      text: `{pf|${data.avg.toFixed(3)}}\n{line|}\n{status|${status.text}}`,
      left: 'center',
      top: 'center',
      textStyle: {
        // Define rich text styles for each part of the title
        rich: {
          pf: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1E293B',
            padding: [5, 0]
          },
          line: {
            backgroundColor: '#E2E8F0',
            height: 1,
            width: '100%',
            margin: [10, 0]
          },
          status: {
            fontSize: 14,
            fontWeight: '600',
            color: status.color, // Use the dynamic color
            padding: [5, 0]
          }
        }
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['80%', '100%'],
        startAngle: 90,
        label: { show: false },
        hoverAnimation: false,
        data: [
          { value: data.avg, itemStyle: { color: status.color } }, // Ring color matches status
          { value: maxPF - data.avg, itemStyle: { color: '#E2E8F0', opacity: 0.5 } }
        ]
      }
    ]
  };

  return (
    <div style={segmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>Power Factor Level</div>
        <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      </div>
      <div style={styles.chartWrapper}>
        <ReactECharts echarts={echarts} option={donutOption} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
