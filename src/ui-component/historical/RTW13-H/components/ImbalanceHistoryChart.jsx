import React from 'react';
import ReactECharts from 'echarts-for-react';

// ---- ECharts modular (tree-shaken) imports ----
import * as echarts from 'echarts/core';
import { HeatmapChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

export default function ImbalanceChart({ data, isFocused, onChartClick }) {
  const getChartOptions = () => {
    // ... (data prep and dataZoomConfig logic remains the same)
    const yAxisLabels = ['KVAR Imbalance', 'KW Imbalance', 'KVA Imbalance'];
    const xAxisLabels = data.map((item) => item.time);
    const heatmapData = [];
    data.forEach((item, timeIndex) => {
      heatmapData.push([timeIndex, 0, item.kvar_imbalance]);
      heatmapData.push([timeIndex, 1, item.kw_imbalance]);
      heatmapData.push([timeIndex, 2, item.kva_imbalance]);
    });
    const dataZoomConfig = [{ type: 'inside', start: 0, end: 100 }];
    if (isFocused) {
      dataZoomConfig.push({ type: 'slider', start: 0, end: 100, height: 25 });
    }

    return {
      tooltip: {
        position: 'top',
        formatter: (params) => `
          <strong>Time: ${xAxisLabels[params.data[0]]}</strong><br/>
          ${yAxisLabels[params.data[1]]}: ${params.data[2]}%
        `
      },
      // FIX: Increased bottom margin to make space for the slider
      grid: { left: '12%', right: '10%', bottom: '90px', top: '5%' },
      // ... (rest of the options remain the same)
      xAxis: { type: 'category', data: xAxisLabels, splitArea: { show: true } },
      yAxis: { type: 'category', data: yAxisLabels, splitArea: { show: true } },
      visualMap: {
        min: 0,
        max: 20,
        calculable: true,
        orient: 'vertical',
        left: 'right',
        bottom: '15%',
        inRange: { color: ['#91CC75', '#ffce56', '#ff5252'] }
      },
      dataZoom: dataZoomConfig,
      series: [
        {
          name: 'Imbalance',
          type: 'heatmap',
          data: heatmapData,
          label: { show: false },
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }
      ]
    };
  };

  // ... (style and handleChartClick logic remain the same)
  const style = {
    height: isFocused ? 'calc(100vh - 150px)' : '350px',
    width: '100%',
    cursor: isFocused ? 'default' : 'pointer'
  };

  //   const handleChartClick = (params) => {
  //     if (params.componentType === 'series' && onChartClick) {
  //       onChartClick();
  //     }
  //   };
  const handleChartClick = (params) => {
    // Define the components that should NOT trigger the zoom
    const nonZoomableComponents = ['legend', 'dataZoom'];

    // If the clicked component is not in our blocklist, trigger the zoom
    if (!nonZoomableComponents.includes(params.componentType) && onChartClick) {
      onChartClick();
    }
  };
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 16px 0' }}>Power Imbalance</h3>
      <ReactECharts echarts={echarts} option={getChartOptions()} style={style} onEvents={{ click: handleChartClick }} notMerge lazyUpdate />
    </div>
  );
}
