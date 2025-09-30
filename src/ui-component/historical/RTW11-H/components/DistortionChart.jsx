import React from 'react';
import ReactECharts from 'echarts-for-react';

import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

const DistortionChart = ({ title, data }) => {
  // --- Data Pre-processing for all chart features ---
  if (!data || data.length === 0) return <div>No data available.</div>;

  const values = data.map((d) => d.value);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;

  let maxDeviation = 0;
  let maxDeviationIndex = -1;

  values.forEach((val, index) => {
    const deviation = Math.abs(val - average);
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
      maxDeviationIndex = index;
    }
  });

  const processedData = data.map((item, index) => {
    if (index === maxDeviationIndex) {
      return { value: item.value, itemStyle: { color: '#ef4444' } };
    }
    return item.value;
  });
  // --- End of Pre-processing ---

  const getChartOptions = () => {
    return {
      grid: { top: 40, right: 30, bottom: 90, left: 50 },
      xAxis: { type: 'category', data: data.map((d) => d.time) },
      yAxis: { type: 'value', name: 'THD (%)' },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, height: 25 }
      ],
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const param = params[0];
          const timeLabel = param.axisValueLabel;
          const dataPoint = data.find((d) => d.time === timeLabel);

          if (!dataPoint) return '';

          let value = typeof param.value === 'object' ? param.value.value : param.value;

          const keyValueHtml = `
            <div style="padding: 5px 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${param.marker} ${title}</span>
                <strong style="margin-left: 20px;">${value}%</strong>
              </div>
            </div>`;

          const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
          const formattedDate = dataPoint.fullDate.toLocaleDateString('en-GB', dateOptions);
          const timeHtml = `
            <div style="font-size: 0.9em; color: #666; padding: 5px 10px; border-top: 1px solid #eee;">
              Time: ${timeLabel}hrs, ${formattedDate}
            </div>`;

          // NEW: Summary section for avg and max deviation
          const summaryHtml = `
            <div style="font-size: 0.9em; color: #333; padding: 8px 10px; border-top: 1px solid #eee; margin-top: 5px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Avg Value:</span>
                <strong>${average.toFixed(2)}%</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                <span>Max Deviation:</span>
                <strong>${maxDeviation.toFixed(2)}%</strong>
              </div>
            </div>`;

          return keyValueHtml + timeHtml + summaryHtml;
        }
      },
      series: [
        {
          type: 'bar',
          data: processedData,
          barWidth: '60%',
          color: '#3b82f6',
          markLine: {
            symbol: 'none',
            data: [{ type: 'average', name: 'Average' }],
            label: { position: 'insideEndTop', formatter: 'Avg: {c}%' }
          }
        }
      ]
    };
  };

  const style = {
    height: '400px',
    width: '100%'
  };

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>{title}</h3>
      <ReactECharts echarts={echarts} option={getChartOptions()} style={style} />
    </div>
  );
};

export default DistortionChart;
