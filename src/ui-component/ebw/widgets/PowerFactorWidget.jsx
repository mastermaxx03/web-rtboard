import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import usePowerFactorData from '../hooks/usePowerFactorData';
import SharedSpinner from '../components/SharedSpinner';

// Dropdown for selecting the yearly period
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

// Panel for displaying insights and messages
const InsightsPanel = ({ data }) => {
  const panelStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    paddingLeft: '20px',
    fontSize: '16px'
  };
  const billedPfStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px'
  };
  // --- START: MODIFIED STYLE ---
  const messageBoxStyle = {
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '6px',
    background: '#fafafa',
    color: '#888',
    fontStyle: 'italic',
    height: '100px', // Reduced height
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  // --- END: MODIFIED STYLE ---

  return (
    <div style={panelStyle}>
      <div style={billedPfStyle}>
        Billed PF: <span style={{ color: '#00529B', fontFamily: 'monospace' }}>{data.billedPf.toFixed(3)}</span>
      </div>
      <div style={messageBoxStyle}>
        <span>Message area is reserved for future insights.</span>
      </div>
    </div>
  );
};

// Main EBW5 Widget Component
const PowerFactorWidget = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-25');
  const { data, loading } = usePowerFactorData(selectedPeriod);

  const chartOption = useMemo(() => {
    if (!data) return {};
    return {
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true }, // Added bottom margin for rotated labels
      // --- START: MODIFIED TOOLTIP ---
      tooltip: {
        trigger: 'axis', // This ensures the tooltip appears on hover over the axis area
        axisPointer: { type: 'shadow' },
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { color: '#333' },
        padding: 10,
        formatter: (params) => {
          const monthName = params[0].name;
          const pfValue = params[0].value;
          const deviation = pfValue - 1.0;
          const date = new Date();
          // Standardized date and time formatting
          const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

          return `
              <div style="font-family: Arial, sans-serif; font-size: 14px;">
                <div style="font-weight: bold; margin-bottom: 5px; padding-bottom: 4px; border-bottom: 1px solid #eee;">
                  Power Factor Details
                </div>
                <div style="font-weight: bold; margin-bottom: 10px; color: #555;">${monthName}</div>
                <div style="margin-bottom: 5px;"><strong>Monthly PF:</strong> ${pfValue.toFixed(3)}</div>
                <div><strong>Deviation from Unity:</strong> ${deviation.toFixed(3)}</div>
                <div style="font-size: 12px; color: #888; margin-top: 10px; padding-top: 4px; border-top: 1px solid #eee;">
                  Time: ${dateString}, ${timeString}
                </div>
              </div>
            `;
        }
      },
      // --- END: MODIFIED TOOLTIP ---
      // --- START: MODIFIED X-AXIS ---
      xAxis: {
        type: 'category',
        data: data.months,
        axisLabel: {
          rotate: 30, // Rotate labels to prevent overlap
          interval: 0 // Ensure every label is shown
        }
      },
      // --- END: MODIFIED X-AXIS ---
      yAxis: { type: 'value', name: 'Power Factor', min: 0.97, max: 1.0 },
      series: [
        {
          name: 'Power Factor',
          type: 'bar',
          data: data.pfValues,
          label: { show: true, position: 'top', formatter: (params) => params.value.toFixed(3) },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                yAxis: 1,
                lineStyle: { color: '#e63946', width: 2, type: 'dashed' },
                label: { show: true, formatter: 'Unity PF', position: 'end', color: '#e63946', fontWeight: 'bold' }
              }
            ]
          }
        }
      ]
    };
  }, [data]);

  const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px 20px 20px 0' };
  const contentStyle = { display: 'flex', height: 'calc(100% - 40px)', marginTop: '40px' };
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
          <InsightsPanel data={data} />
        </div>
      </div>
    </div>
  );
};

export default PowerFactorWidget;
