/* telemetryLoader.js — JSON-first loader, facets, filter, aggregate, finalize, paginate */

import { aggregate as aggregateGeneric } from '../utils';

/** Load from JSON (array of records). Supports:
 *  - a plain array: [ {...}, {...} ]
 *  - or an object that contains an array under "data" or "rows".
 */
a; // telemetryLoader.js
async function fetchFromAPI({ baseUrl = API_BASE, segment = 'all', start, end, did, sid, aggregateMinutes, limit = 5000 }) {
  // Convert UI times to epoch seconds; make `to` inclusive by subtracting 1 ms.
  const fromSec = secs(start);
  const endMs = Date.parse(end);
  const toSec = Number.isFinite(endMs) ? Math.floor((endMs - 1) / 1000) : undefined;

  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (Number.isFinite(fromSec)) params.set('from', String(fromSec));
  if (Number.isFinite(toSec)) params.set('to', String(toSec));
  params.set('segment', segment);
  params.set('timeFrame', buildTimeFrame(aggregateMinutes));
  if (did) params.set('did', String(did));
  if (sid) params.set('sid', String(sid));

  const url = `${baseUrl}/telemetry?${params.toString()}`;

  const res = await fetch(url, {
    headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : undefined,
    cache: 'no-store'
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${txt || res.statusText}`);
  }

  const json = await res.json();
  const arr = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

  // Stamp identity so downstream filters/facets don’t drop everything
  return arr.map((row) => ({
    ...row,
    DID: row.DID ?? row.device_id ?? did ?? undefined,
    SLAVE_ID: row.SLAVE_ID ?? row.SID ?? sid ?? undefined
  }));
}

/** Tiny mock in case the JSON isn’t reachable. */
async function fetchMock({ start, end }, normalize) {
  await new Promise((r) => setTimeout(r, 80));
  const endMs = Number.isFinite(Date.parse(end)) ? Date.parse(end) : Date.now();
  const startMs = Number.isFinite(Date.parse(start)) ? Date.parse(start) : endMs - 10 * 60 * 1000;

  const out = [];
  for (let t = startMs; t <= endMs; t += 1000) {
    out.push(
      normalize({
        TS: new Date(t).toISOString(),
        DID: 'E_AA_Z_B_X_P0024_D1',
        SLAVE_ID: 72,
        VRY: 330 + Math.sin(t / 6e4) * 2,
        VYB: 330 + Math.cos(t / 7e4) * 2,
        VBR: 330 + Math.sin(t / 8e4) * 2,
        IR: 45 + Math.sin(t / 5e4) * 0.7,
        IY: 44 + Math.cos(t / 5.5e4) * 0.7,
        IB: 46 + Math.sin(t / 6e4) * 0.7,
        AVG_I: 45.3
      })
    );
  }
  return out;
}

function buildFacets(rows) {
  const dids = new Set(),
    sids = new Set(),
    panels = new Set(),
    locs = new Set();
  rows.forEach((r) => {
    if (r.DID) dids.add(String(r.DID));
    if (r.SID) sids.add(String(r.SID));
    if (r.panel_name) panels.add(String(r.panel_name));
    if (r.panel_location) locs.add(String(r.panel_location));
  });
  return {
    dids: [...dids].sort(),
    sids: [...sids].sort(),
    panels: [...panels].sort(),
    locations: [...locs].sort()
  };
}

/** Main loader */
export async function loadTelemetry({
  csvUrl, // legacy; if present we will try to infer JSON URL by swapping extension
  dataUrl, // preferred explicit JSON path
  normalize,
  finalize,
  aggregateMinutes,
  aggregationStrategy = 'avg',
  page,
  pageSize,
  start,
  end,
  filter = {}
}) {
  // Resolve the JSON URL:
  let url =
    dataUrl ||
    (csvUrl ? csvUrl.replace(/\.csv$/i, '.json') : undefined) ||
    // sensible default (same folder as the CSV used before)
    '/src/views/telemetry-kit/data/telemetry.json';

  let raw = [];
  try {
    raw = await fetchFromJSON(url, normalize);
  } catch (e) {
    console.warn('JSON load failed, using mock data:', e?.message);
    raw = await fetchMock({ start, end }, normalize);
  }

  // Bound by date
  const sMs = Number.isFinite(Date.parse(start)) ? Date.parse(start) : -Infinity;
  const eMs = Number.isFinite(Date.parse(end)) ? Date.parse(end) : +Infinity;
  let bounded = raw.filter((r) => r.ts >= sMs && r.ts < eMs);

  // Identity filters
  if (filter.DID) bounded = bounded.filter((r) => String(r.DID) === String(filter.DID));
  if (filter.SID) bounded = bounded.filter((r) => String(r.SID) === String(filter.SID));
  if (filter.panel_name) bounded = bounded.filter((r) => String(r.panel_name) === String(filter.panel_name));
  if (filter.panel_location) bounded = bounded.filter((r) => String(r.panel_location) === String(filter.panel_location));

  // Aggregate (avg/sum per key) then finalize (derive fields/performance)
  const aggregated = aggregateGeneric(bounded, aggregateMinutes, aggregationStrategy).map((r) =>
    typeof finalize === 'function' ? finalize(r) : r
  );

  // Facets should reflect post-aggregation identity values
  const facets = buildFacets(aggregated);

  // Paginate
  const total = aggregated.length;
  const startIdx = Math.max(0, (Number(page) - 1) * Number(pageSize));
  const rows = aggregated.slice(startIdx, startIdx + Number(pageSize));

  return { rows, total, facets };
}

/** >>> Minimal helper to get ALL rows for download (reuses the same loader) */
export async function loadAllTelemetry(args) {
  return loadTelemetry({ ...args, page: 1, pageSize: Number.MAX_SAFE_INTEGER });
}

export default { loadTelemetry, loadAllTelemetry };
