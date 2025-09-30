// src/ui-component/plantSummary/widgets/PowerCutDurationWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { usePowerDurationData } from '../hooks/usePowerDurationData';
import { createTimestampedTooltip } from '../../../utils/eChartsFormatters';

const PowerDurationWidget = () => {
  const { data } = usePowerDurationData();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const options = {
    tooltip: { trigger: 'axis', formatter: createTimestampedTooltip('Avg Duration', ' Hr') },
    xAxis: { type: 'category', boundaryGap: false, data: months }, // Use 12 months
    yAxis: { type: 'value', name: 'Duration', axisLabel: { formatter: '{value} Hr' } },
    series: [{ name: 'Avg Duration', type: 'line', smooth: true, data: data, itemStyle: { color: '#5470C6' } }],
    grid: { top: '15%', bottom: '15%', left: '10%', right: '5%' }
  };

  return <ReactECharts option={options} style={{ height: '100%' }} />;
};

export default PowerDurationWidget;
