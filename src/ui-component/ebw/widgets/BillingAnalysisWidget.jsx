import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import useBillingAnalysisData from '../hooks/useBillingAnalysisData';
import SharedSpinner from '../components/SharedSpinner';

// A simple component for the month selection dropdown
const MonthSelector = ({ selectedMonth, setSelectedMonth }) => {
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
    <select style={selectStyle} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
      <option value="2025-09">September 2025</option>
      <option value="2025-08">August 2025</option>
      <option value="2025-07">July 2025</option>
    </select>
  );
};

// Component for the data table on the right side
const BillingTable = ({ data }) => {
  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '14px' };
  const thStyle = { background: '#f7f7f7', padding: '10px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 'bold' };
  const tdStyle = { padding: '10px', border: '1px solid #ddd', textAlign: 'left' };
  const tdValueStyle = { ...tdStyle, textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' };
  const finalRowStyle = { background: '#e9f5ff', fontWeight: 'bold' };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle} colSpan="2">
            Billing Demand
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={tdStyle}>Recorded MD (except A Zone)</td>
          <td style={tdValueStyle}>{data.recordedMD.toLocaleString()}</td>
        </tr>
        <tr>
          <td style={tdStyle}>75% of Highest Demand preceding 11 months</td>
          <td style={tdValueStyle}>{data.historical75.toLocaleString()}</td>
        </tr>
        <tr>
          <td style={tdStyle}>75% of CD</td>
          <td style={tdValueStyle}>{data.contract75.toLocaleString()}</td>
        </tr>
        <tr style={finalRowStyle}>
          <td style={tdStyle}>Billed Demand (KVA) (Max of above)</td>
          <td style={tdValueStyle}>{data.billedDemand.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  );
};

// Main EBW3 Widget Component
const BillingAnalysisWidget = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-09');
  const { data, loading } = useBillingAnalysisData(selectedMonth);

  const chartOption = useMemo(() => {
    if (!data) return {};
    return {
      tooltip: {
        trigger: 'item', // 'item' is better for inspecting individual bars
        axisPointer: { type: 'shadow' },
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { color: '#333' },
        padding: 10,
        formatter: (params) => {
          const date = new Date();
          const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

          const zoneName = params.name;
          const value = params.value;
          const color = params.color;

          let tooltipHtml = `
              <div style="font-family: Arial, sans-serif; font-size: 14px;">
                <div style="font-weight: bold; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #eee;">
                  TOD Recorded MD
                </div>
                <div style="margin-bottom: 5px;">
                  <span style="font-weight:bold;">Zone:</span> ${zoneName}
                </div>
                <div>
                  <span style="display:inline-block; height: 10px; width: 10px; border-radius: 50%; background-color: ${color}; margin-right: 5px;"></span>
                  <span style="font-weight:bold;">Demand:</span> ${value.toLocaleString()}
                </div>
                <div style="font-size: 12px; color: #888; margin-top: 10px; padding-top: 4px; border-top: 1px solid #eee;">
                  Time: ${dateString}, ${timeString}
                </div>
              </div>
            `;
          return tooltipHtml;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: data.todData.labels },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Recorded MD',
          type: 'bar',
          barWidth: '60%',
          data: data.todData.values,
          label: { show: true, position: 'top' }
        }
      ]
    };
  }, [data]);

  const mainStyle = { position: 'relative', width: '100%', height: '100%', padding: '20px' };
  const contentStyle = { display: 'flex', gap: '20px', height: 'calc(100% - 40px)', marginTop: '40px' };
  const chartContainerStyle = { flex: 1 };
  const detailsContainerStyle = { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' };
  const messageBoxStyle = {
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '6px',
    background: '#fafafa',
    color: '#888',
    fontStyle: 'italic',
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  if (loading) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <SharedSpinner />
      </div>
    );
  }

  return (
    <div style={mainStyle}>
      <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      <div style={contentStyle}>
        <div style={chartContainerStyle}>
          <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div style={detailsContainerStyle}>
          <BillingTable data={data.billingCalculation} />
          <div style={messageBoxStyle}>
            <span>Message area is reserved for future insights.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingAnalysisWidget;
