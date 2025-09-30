import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts/core';
import { GaugeChart as EChartsGaugeChart } from 'echarts/charts'; // Rename to avoid conflict
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'; // Added Legend if needed later
import { CanvasRenderer } from 'echarts/renderers';

// Register the components
echarts.use([EChartsGaugeChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

// This is the semi-circle gauge chart component
// --- CHANGE: Added statusMessage prop ---
const GaugeChart = ({ name, value, color = '#5470C6', timestamp, statusMessage = '' }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chartInstance = echarts.getInstanceByDom(chartRef.current);
    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.current);
    }

    const formattedTimestamp = timestamp ? new Date(timestamp).toLocaleString() : 'N/A';

    // Define a gradient color for the progress bar
    const gradientColor = new echarts.graphic.LinearGradient(
      0,
      0,
      1,
      0, // From left to right for a horizontal gradient in a semi-circle
      [
        { offset: 0, color: '#83bff6' }, // Light blue at the start
        { offset: 0.5, color: '#188df0' }, // Mid blue
        { offset: 1, color: '#188df0' } // Darker blue at the end
      ]
    );

    // Use the passed color or the new gradient
    const effectiveColor = color || gradientColor;

    const option = {
      tooltip: {
        formatter: (params) => {
          return `
            <b>${params.seriesName}</b><br/>
            ${params.name}: ${params.value}%<br/>
            <b>Status:</b> ${statusMessage}<br/>
            <b>Time:</b> ${formattedTimestamp}
          `;
        },
        backgroundColor: 'rgba(50,50,50,0.7)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
        extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);'
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

          // --- PROGRESS BAR STYLING ---
          progress: {
            show: true,
            width: 25, // Wider progress bar
            roundCap: true, // Rounded cap for a smoother look
            itemStyle: {
              color: effectiveColor, // Use gradient or passed color
              shadowBlur: 15, // Outer shadow for pop-out effect
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowOffsetX: 0,
              shadowOffsetY: 0
            }
          },
          pointer: { show: false }, // Keep pointer hidden

          // --- AXIS LINE STYLING (Background of the gauge) ---
          axisLine: {
            lineStyle: {
              width: 25, // Match progress bar width
              color: [
                [1, '#F0F2F5'] // Light grey background for the entire arc
              ],
              shadowBlur: 5, // Inner shadow for inset look
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowOffsetX: 0,
              shadowOffsetY: 0
            }
          },

          // --- HIDE UNNECESSARY AXIS ELEMENTS FOR A CLEAN LOOK ---
          axisTick: { show: false }, // Hide ticks
          splitLine: { show: false }, // Hide split lines
          axisLabel: { show: false }, // Hide axis labels (0, 20, 40 etc.)
          anchor: { show: false },
          title: { show: false }, // Hide the default title

          // --- DETAIL (Percentage and Status Message) ---
          detail: {
            valueAnimation: true,
            width: '80%', // Make text area wider
            lineHeight: 20, // Adjust line height
            borderRadius: 8,
            offsetCenter: [0, '-25%'], // Adjust position to make room for status
            // Use rich text for custom styling of value and message
            formatter: function (val) {
              return (
                '{value|' +
                val.toFixed(1) +
                '%}\n' + // Value line
                '{status|' +
                statusMessage +
                '}' // Status message line
              );
            },
            rich: {
              value: {
                fontSize: 38, // Larger value font
                fontWeight: 'bolder',
                color: '#333',
                padding: [0, 0, 5, 0] // Padding below value
              },
              status: {
                fontSize: 16, // Status message font size
                color: '#666',
                fontWeight: 'normal',
                lineHeight: 20 // Ensure status message has consistent line height
              }
            }
          },
          data: [{ value: value, name: 'Load' }] // Name changed to 'Load' for consistency
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
  }, [name, value, color, timestamp, statusMessage]); // Added statusMessage to dependencies

  return <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '250px' }}></div>;
};

export default GaugeChart;
