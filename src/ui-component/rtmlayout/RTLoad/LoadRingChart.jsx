import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

// This is the semi-circle gauge chart component
const GaugeChart = ({ name, value, color = '#5470C6', timestamp }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chartInstance = echarts.getInstanceByDom(chartRef.current);
    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.current);
    }

    // --- CHANGE: Format the timestamp for display ---
    const formattedTimestamp = timestamp ? new Date(timestamp).toLocaleString() : 'N/A';

    const option = {
      tooltip: {
        // --- CHANGE: Updated formatter to include the timestamp ---
        formatter: (params) => {
          return `
                    <b>${params.seriesName}</b><br/>
                    ${params.name}: ${params.value}%<br/>
                    <b>Time:</b> ${formattedTimestamp}
                `;
        }
      },
      series: [
        {
          name: name || 'Real-Time Load',
          type: 'gauge',
          radius: '100%',
          center: ['50%', '70%'],
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 10,
          progress: {
            show: true,
            width: 18,
            itemStyle: { color }
          },
          pointer: { show: false },
          axisLine: {
            lineStyle: {
              width: 18,
              color: [[1, '#E6EBF8']]
            }
          },
          axisTick: {
            distance: -25,
            splitNumber: 5,
            length: 8,
            lineStyle: { width: 1, color: '#999' }
          },
          splitLine: {
            distance: -30,
            length: 12,
            lineStyle: { width: 2, color: '#999' }
          },
          axisLabel: {
            distance: 35,
            color: '#999',
            fontSize: 12
          },
          anchor: { show: false },
          title: { show: false },
          detail: {
            valueAnimation: true,
            width: '60%',
            lineHeight: 40,
            borderRadius: 8,
            offsetCenter: [0, '-40%'],
            fontSize: 30,
            fontWeight: 'bolder',
            formatter: '{value}%',
            color: 'auto'
          },
          data: [{ value: value, name: 'Value' }]
        }
      ]
    };

    chartInstance.setOption(option);

    const handleResize = () => chartInstance.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.dispose();
    };
    // --- CHANGE: Added timestamp to the dependency array ---
  }, [name, value, color, timestamp]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '250px' }}></div>;
};

export default GaugeChart;
