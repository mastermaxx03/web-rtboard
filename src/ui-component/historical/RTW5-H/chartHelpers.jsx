export const createStandardTooltipFormatter = (params, fullData, options = {}) => {
  const { contractDemand, seventyFivePercentDemand } = options;
  const timeLabel = params[0].axisValueLabel;
  const dataPoint = fullData.find((d) => d.time === timeLabel);

  if (!dataPoint) return '';

  // --- Key: Value Section ---
  let keyValueHtml = '<div style="padding: 2px 8px; font-size: 0.9em;">';
  params.forEach((param) => {
    const value = typeof param.value === 'object' ? param.value.value : param.value;

    // --- CHANGE: Determine the correct unit based on the series name ---
    let unit = 'kVA'; // Default
    if (param.seriesName === 'Real Power') {
      unit = 'kW';
    } else if (param.seriesName === 'Reactive Power') {
      unit = 'kVAr';
    }

    keyValueHtml += `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>${param.marker} ${param.seriesName}</span>
        <strong style="margin-left: 15px;">${value} ${unit}</strong>
      </div>
    `;
  });

  if (contractDemand !== undefined && seventyFivePercentDemand !== undefined) {
    const markerStyle = `display:inline-block;margin-right:5px;width:12px;height:3px;background-color:`;
    const contractDemandMarker = `<span style="${markerStyle}#ff5252;vertical-align:middle;"></span>`;
    const seventyFiveDemandMarker = `<span style="${markerStyle}#ffce56;vertical-align:middle;"></span>`;

    keyValueHtml += `
      <div style="margin-top: 3px; padding-top: 3px; border-top: 1px solid #eee;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${contractDemandMarker}Contract Demand</span>
          <strong style="margin-left: 15px;">${contractDemand} kVA</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${seventyFiveDemandMarker}75% Demand</span>
          <strong style="margin-left: 15px;">${seventyFivePercentDemand} kVA</strong>
        </div>
      </div>
    `;
  }
  keyValueHtml += '</div>';

  // --- Time Section ---
  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = dataPoint.fullDate.toLocaleDateString('en-GB', dateOptions); // Using en-GB for day-month-year
  const timeHtml = `
    <div style="font-size: 0.75em; color: #666; text-align: center; padding: 3px 8px; border-top: 1px solid #eee;">
      Time: ${timeLabel}hrs, ${formattedDate}
    </div>
  `;

  return keyValueHtml + timeHtml;
};
