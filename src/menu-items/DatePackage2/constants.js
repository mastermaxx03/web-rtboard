// “Last” quick windows (Realtime only – trimmed)
export const LAST_WINDOWS = [
  { label: 'Last 15 minutes', value: { count: 15, unit: 'minute' } },
  { label: 'Last 30 minutes', value: { count: 30, unit: 'minute' } },
  { label: 'Last 1 hour', value: { count: 1, unit: 'hour' } },
  { label: 'Last 2 hours', value: { count: 2, unit: 'hour' } },
  { label: 'Last 4 hours', value: { count: 4, unit: 'hour' } },
  { label: 'Last 8 hours', value: { count: 8, unit: 'hour' } }
];

// Grouping intervals (with “None”) + 1 day
export const GROUPING_INTERVALS_MIN = [0, 15, 30, 60, 240, 480, 1440];

// Aggregations
export const AGGREGATIONS = [
  { key: 'avg', label: 'Average' },
  { key: 'min', label: 'Min' },
  { key: 'max', label: 'Max' },
  { key: 'sum', label: 'Sum' },
  { key: 'count', label: 'Count' },
  { key: 'none', label: 'None' }
];

// Relative preset catalog (keys must match utils.presetRange)
// NOTE: We will **filter** these in Realtime to your reduced set.
export const RELATIVE_PRESETS = [
  // Realtime set (filtered in UI):
  { key: 'currentShiftSoFar', label: 'Current shift so far' },
  { key: 'currentShiftPlusPrevious', label: 'Current shift so far + previous shift' },
  { key: 'currentCalendarDaySoFar', label: 'Current day (00:00 → now)' },
  { key: 'currentZoneSoFar', label: 'Current zone so far' },
  { key: 'currentWeekMonSoFar', label: 'Current week so far (Mon - Sun)' },
  { key: 'currentMonthSoFar', label: 'Current month so far (1st → now)' },
  { key: 'currentBillingCycleSoFar', label: 'Current billing cycle so far (bill start → now)' },
  { key: 'currentQuarterSoFar', label: 'Current quarter so far' },
  { key: 'currentYearSoFar', label: 'Current year so far' },
  { key: 'allDataSoFar', label: 'Current data so far (all)' }, // like Clear but explicit

  // History-only presets (not shown in Realtime):
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'dayBeforeYesterday', label: 'Day before yesterday' },
  { key: 'thisDayLastWeek', label: 'This day last week' },
  { key: 'previousWeekSun', label: 'Previous week (Sun - Sat)' },
  { key: 'previousWeekMon', label: 'Previous week (Mon - Sun)' },
  { key: 'previousMonth', label: 'Previous month' },
  { key: 'previousQuarter', label: 'Previous quarter' },
  { key: 'previousHalfYear', label: 'Previous half year' },
  { key: 'previousYear', label: 'Previous year' }
];
