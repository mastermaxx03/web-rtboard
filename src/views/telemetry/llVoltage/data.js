// src/views/telemetry/llVoltage/data.js

// Client-side CSV loader + mock + aggregation orchestrator.
import Papa from 'papaparse';
import { aggregate } from './utils';

/** ---------------------------------------------------------------
 *  CSV READER
 *  - We parse into epoch ms so everything stays UTC.
 *  - SID = SLAVE_ID (as per your sheet).
 *  - DID = DID (device id column).
 *  - Panel fields fallback to your defaults if not present.
 *  ------------------------------------------------------------- */
async function fetchFromCSV(csvUrl) {
  const res = await fetch(csvUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`CSV fetch failed (${res.status})`);

  const text = await res.text();
  const { data } = Papa.parse(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  });

  return data
    .map((r) => {
      // Prefer these exact headers (from your screenshot):
      const rawTS = r.TS ?? r.ts ?? r.timestamp;
      const tsEpoch = rawTS ? new Date(String(rawTS)).getTime() : NaN; // stays UTC
      return {
        ts: tsEpoch, // store as epoch to avoid timezone pitfalls
        DID: r.DID ?? r.device_id ?? 'UNKNOWN',
        SID: r.SLAVE_ID ?? r.SID ?? r.panel_id ?? 'UNKNOWN', // ✅ SLAVE_ID
        panel_name: r.panel_name ?? 'MCC10',
        panel_location: r.panel_location ?? 'Compressor House',
        VRY: r.VRY ?? r.V_RY ?? r.LL_RY ?? r.v_ry,
        VYB: r.VYB ?? r.V_YB ?? r.LL_YB ?? r.v_yb,
        VBR: r.VBR ?? r.V_BR ?? r.LL_BR ?? r.v_br
      };
    })
    .filter((r) => Number.isFinite(r.ts));
}

/** ---------------------------------------------------------------
 *  MOCK (1s) — used when CSV missing/unreadable
 *  ------------------------------------------------------------- */
async function fetchMock({ panelId, start, end }) {
  await new Promise((r) => setTimeout(r, 100)); // tiny delay for UX

  const endMs = Number.isFinite(Date.parse(end)) ? Date.parse(end) : Date.now();
  const startMs = Number.isFinite(Date.parse(start)) ? Date.parse(start) : endMs - 30 * 60 * 1000; // last 30 mins

  const out = [];
  for (let t = startMs; t <= endMs; t += 1000) {
    const base = 330 + 3 * Math.sin(t / (60 * 1000));
    const jitter = () => (Math.random() - 0.5) * 2.5;
    out.push({
      ts: t, // epoch (UTC)
      DID: 'E_AA_Z_B_X_P0024_D1',
      SID: '72', // mock slave id
      panel_name: panelId || 'MCC10',
      panel_location: 'Compressor House',
      VRY: +(base + jitter()).toFixed(2),
      VYB: +(base + jitter()).toFixed(2),
      VBR: +(base + jitter()).toFixed(2)
    });
  }
  return out;
}

/** ---------------------------------------------------------------
 *  PUBLIC: fetch + window + aggregate + paginate
 *  - `aggregateMinutes` 0 => RT 1s
 *  - time bounds happen on epoch (UTC)
 *  ------------------------------------------------------------- */
export async function fetchLLAggregated({ panelId, start, end, aggregateMinutes, page, pageSize, csvUrl }) {
  let raw = [];
  try {
    raw = csvUrl ? await fetchFromCSV(csvUrl) : await fetchMock({ panelId, start, end });
  } catch (e) {
    console.warn('CSV load failed, falling back to mock:', e?.message);
    raw = await fetchMock({ panelId, start, end });
  }

  // Narrow by time range if provided
  const hasStart = Number.isFinite(Date.parse(start));
  const hasEnd = Number.isFinite(Date.parse(end));
  const sMs = hasStart ? Date.parse(start) : -Infinity;
  const eMs = hasEnd ? Date.parse(end) : +Infinity;

  const timeBound = raw.filter((r) => r.ts >= sMs && r.ts < eMs);

  // Aggregate (or pass through)
  const aggregated = aggregate(timeBound, aggregateMinutes);

  // paginate
  const total = aggregated.length;
  const startIdx = Math.max(0, (Number(page) - 1) * Number(pageSize));
  const rows = aggregated.slice(startIdx, startIdx + Number(pageSize));

  return { rows, total };
}
