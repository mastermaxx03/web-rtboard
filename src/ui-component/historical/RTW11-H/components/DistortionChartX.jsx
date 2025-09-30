import React from 'react';
import ReactECharts from 'echarts-for-react';

import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

const DistortionChart = ({ title, data, isFocused, onChartClick }) => {
  const getChartOptions = () => {
    // --- Data Pre-processing for Max Deviation ---
    if (!data || data.length === 0) return {};

    const values = data.map((d) => d.value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    let maxDeviation = -1;
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
        return {
          value: item.value,
          itemStyle: { color: '#ef4444' } // Highlight color for max deviation
        };
      }
      return item.value;
    });
    // --- End of Pre-processing ---

    const dataZoomConfig = [{ type: 'inside', start: 0, end: 100 }];
    if (isFocused) {
      dataZoomConfig.push({ type: 'slider', start: 0, end: 100, height: 25 });
    }

    return {
      grid: { top: 40, right: 30, bottom: 90, left: 50 },
      xAxis: { type: 'category', data: data.map((d) => d.time) },
      yAxis: { type: 'value', name: 'THD (%)' },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const param = params[0];
          const timeLabel = param.axisValueLabel;
          const dataPoint = data.find((d) => d.time === timeLabel);

          if (!dataPoint) return '';

          // Format Key-Value section
          let value = typeof param.value === 'object' ? param.value.value : param.value;
          const keyValueHtml = `
            <div style="padding: 5px 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${param.marker} ${title}</span>
                <strong style="margin-left: 20px;">${value}%</strong>
              </div>
            </div>`;

          // Format Timestamp section
          const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
          const formattedDate = dataPoint.fullDate.toLocaleDateString('en-GB', dateOptions);
          const timeHtml = `
            <div style="font-size: 0.9em; color: #666; padding: 5px 10px; border-top: 1px solid #eee;">
              Time: ${timeLabel}hrs, ${formattedDate}
            </div>`;

          return keyValueHtml + timeHtml;
        }
      },
      dataZoom: dataZoomConfig,
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
    height: isFocused ? 'calc(100vh - 150px)' : '400px',
    width: '100%'
  };

  const handleEvents = {
    click: (params) => {
      if (params.componentType === 'legend' || params.componentType === 'dataZoom') {
        params.event.event.stopPropagation();
      }
    }
  };

  return (
    <div
      onClick={onChartClick}
      style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', cursor: isFocused ? 'default' : 'pointer' }}
    >
      <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>{title}</h3>
      <ReactECharts echarts={echarts} option={getChartOptions()} style={style} onEvents={handleEvents} />
    </div>
  );
};

export default DistortionChart;
