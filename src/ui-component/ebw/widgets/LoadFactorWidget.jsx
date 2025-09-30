import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useLoadFactorData from '../hooks/useLoadFactorData';
import SharedSpinner from '../components/SharedSpinner';

const YearSelector = ({ selectedPeriod, setSelectedPeriod }) => {
  const selectStyle = {
    position: 'absolute',
    top: '15px',
    right: '20px',
    zIndex: 10,
    padding: '6px 10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  };
  return (
    <select style={selectStyle} value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
      <option value="2024-25">2024-25</option>
      <option value="2023-24">2023-24</option>
    </select>
  );
};

const IncentivePanel = () => {
  const panelStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: '20px',
    textAlign: 'center',
    background: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #eee'
  };
  const messageStyle = {
    fontSize: '16px',
    lineHeight: 1.6,
    color: '#333'
  };

  return (
    <div style={panelStyle}>
      <p style={messageStyle}>
        Maintain <strong>Load Factor</strong> above <strong>75%</strong> and earn LF incentive subject to ceiling up to <strong>15%</strong>
        .
      </p>
    </div>
  );
};

const LoadFactorWidget = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-25');
  const { data, loading } = useLoadFactorData(selectedPeriod);

  const chartOption = useMemo(() => {
    if (!data) return {};
    const target = 75;
    return {
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      tooltip: {
        trigger: 'axis', // This is the key property. 'axis' ensures it triggers on hover.
        axisPointer: {
          type: 'shadow' // Adds a shadow to highlight the hovered column
        },
        backgroundColor: '#fff',
        borderColor: '#ccc',
        padding: 10,
        formatter: (params) => {
          const monthName = params[0].name;
          const lfValue = params[0].value;
          const performanceGap = lfValue - target;
          const date = new Date();
          const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

          return `
              <div style="font-family: Arial, sans-serif; font-size: 14px;">
                <div style="font-weight: bold; margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px solid #eee;">
                  Load Factor Details
                </div>
                <div style="font-weight: bold; margin-bottom: 10px; color: #555;">${monthName}</div>
                <div style="margin-bottom: 5px;"><strong>Monthly LF:</strong> ${lfValue}%</div>
                <div style="margin-bottom: 5px;"><strong>Target:</strong> ${target}%</div>
                <div><strong>Performance Gap:</strong> <span style="color:${performanceGap >= 0 ? 'green' : 'red'}; font-weight:bold;">${performanceGap.toFixed(0)}%</span></div>
                <div style="font-size: 12px; color: #888; margin-top: 10px; padding-top: 4px; border-top: 1px solid #eee;">
                  Time: ${dateString}, ${timeString}
                </div>
              </div>
            `;
        }
      },
      xAxis: {
        type: 'category',
        data: data.months,
        axisLabel: { rotate: 30, interval: 0 }
      },
      yAxis: {
        type: 'value',
        name: '    Load Factor (%)',
        min: 35,
        max: 80
      },
      series: [
        {
          name: 'Load Factor',
          type: 'line',
          symbol: 'circle',
          symbolSize: 8,
          data: data.loadFactorValues,
          label: { show: true, position: 'top' },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                yAxis: target,
                lineStyle: { color: '#28a745', width: 2, type: 'dashed' },
                label: { show: true, formatter: 'Target: {c}%', position: 'middle', color: '#28a745', fontWeight: 'bold' }
              }
            ]
          }
        }
      ]
    };
  }, [data]);

  const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
  const contentStyle = { display: 'flex', gap: '30px', height: 'calc(100% - 40px)', marginTop: '40px' };
  const chartContainerStyle = { flex: '0 0 65%' };
  const detailsContainerStyle = { flex: '1' };

  if (loading)
    return (
      <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SharedSpinner />
      </div>
    );

  return (
    <div style={mainStyle}>
      <YearSelector selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
      <div style={contentStyle}>
        <div style={chartContainerStyle}>
          <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div style={detailsContainerStyle}>
          <IncentivePanel />
        </div>
      </div>
    </div>
  );
};

export default LoadFactorWidget;
