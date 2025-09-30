// src/ui-component/plantSummary/widgets/PlantBreakdownWidget.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { usePlantBreakdownData } from '../hooks/usePlantBreakDownData';
import { createTimestampedTooltip } from '../../../utils/eChartsFormatters';

const PlantBreakdownWidget = () => {
  const { data } = usePlantBreakdownData();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const options = {
    tooltip: { trigger: 'axis', formatter: createTimestampedTooltip('Breakdown Duration', ' Hr') },
    xAxis: { type: 'category', data: months }, // Use 12 months
    yAxis: { type: 'value', name: 'Duration', axisLabel: { formatter: '{value} Hr' } },
    series: [{ name: 'Breakdown Duration', type: 'bar', data: data, itemStyle: { color: '#91CC75' } }],
    grid: { top: '15%', bottom: '15%', left: '10%', right: '5%' }
  };

  return <ReactECharts option={options} style={{ height: '100%' }} />;
};

export default PlantBreakdownWidget;
