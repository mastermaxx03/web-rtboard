// src/views/alertLogPage/utils.js

// ---- formatters ----
export const fmt = (d) => new Date(d).toLocaleString();
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : 'mm/dd/yyyy');
export const fmtCompact = (d) => {
  const dt = new Date(d);
  const date = dt.toLocaleDateString(undefined, { month: 'numeric', day: '2-digit', year: '2-digit' });
  const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
};

// ---- date helpers ----
export const toYMD = (d) => {
  const dt = new Date(d);
  const m = `${dt.getMonth() + 1}`.padStart(2, '0');
  const day = `${dt.getDate()}`.padStart(2, '0');
  return `${dt.getFullYear()}-${m}-${day}`;
};
export const addMonths = (d, n) => {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + n);
  return dt;
};
export const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
export const inRange = (d, s, e) => {
  if (!s || !e) return false;
  const x = new Date(d).setHours(0, 0, 0, 0);
  const a = new Date(s).setHours(0, 0, 0, 0);
  const b = new Date(e).setHours(0, 0, 0, 0);
  return x >= a && x <= b;
};

// ---- CSV export (matching on-screen timestamp formatting) ----
export const exportCSV = (rows, filename = 'alert_log.csv') => {
  const headers = [
    'Panel Name',
    'Location',
    'Timestamp',
    'Tag Name',
    'Alert Value',
    'Unit',
    'Alert Message',
    'Status',
    'Ack User',
    'Ack Timestamp',
    'Ack Note'
  ];

  const lines = rows.map((r) => {
    const ts = r.ts ? new Date(r.ts).toLocaleString() : '';
    const ackTs = r.ack_ts ? new Date(r.ack_ts).toLocaleString() : '';
    return [
      r.panel_name,
      r.panel_location,
      ts,
      r.tag_name,
      r.alert_value,
      r.unit,
      r.message,
      r.status,
      r.ack_user ?? '',
      ackTs,
      r.ack_note ?? ''
    ]
      .map((x) => `"${String(x).replace(/"/g, '""')}"`)
      .join(',');
  });

  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
