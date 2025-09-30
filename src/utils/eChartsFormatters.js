// src/utils/echartsFormatters.js

// (The valueFormatters object remains the same)
export const valueFormatters = {
  currency: (params) => {
    /* ... */
  },
  percent: (params) => `${params.value}%`,
  unit: (unit) => (params) => `${params.value} ${unit}`
};

/**
 * Creates a standardized, timestamped tooltip for ECharts.
 * This version includes a defensive check to prevent crashes.
 */
export const createTimestampedTooltip =
  ({ title, valueFormatter }) =>
  (params) => {
    // --- THE FIX ---
    // Handle cases where params or its value might be missing during a re-render.
    const point = Array.isArray(params) ? params[0] : params;
    if (!point || point.value == null) {
      // '==' checks for both null and undefined
      return ''; // Return an empty string to prevent the error
    }
    // --- END OF FIX ---

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
    const dateString = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    const header = point.name ? `<strong>${point.name}</strong><br/>` : `<strong>${title}</strong><br/>`;
    const formattedValue = valueFormatter(point);

    return `${header}
          ${point.marker || ''} ${title}: <strong>${formattedValue}</strong><br/>
          <hr style="margin: 5px 0; border-color: #555;"/>
          Time: ${timeString}, ${dateString}`;
  };
