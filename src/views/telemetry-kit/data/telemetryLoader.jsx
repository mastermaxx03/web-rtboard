/* telemetryLoader.jsx — API-first loader with CSV/JSON fallback, facets, filter, aggregate, paginate */
import { aggregate as aggregateGeneric } from '../utils';
import { API_BASE, authHeaders, readTokenFromBrowser } from './api';
import { getDidFromURL as _getDidFromURL } from './didParam';

/* ---------- ENV ---------- */
const API_BASE_V1 = `${API_BASE}/api/v1`; // keep original /api/v1 path here
const DEFAULT_DID = import.meta?.env?.VITE_DEFAULT_DID || 'E_AA_Z_A_Z_P0001_D1';

/* ---------- helpers ---------- */
function toEpochSec(x) {
  if (x == null || x === '') return NaN;
  if (typeof x === 'number' && Number.isFinite(x)) return x > 2_000_000_000 ? Math.floor(x / 1000) : Math.floor(x);
  if (x instanceof Date) return Math.floor(x.getTime() / 1000);
  const t = Date.parse(String(x));
  return Number.isFinite(t) ? Math.floor(t / 1000) : NaN;
}
function buildTimeFrame(aggregateMinutes = 0) {
  const m = Number(aggregateMinutes || 0);
  if (m <= 0) return '15s';
  if (m === 15) return '15m';
  if (m === 30) return '30m';
  if (m === 60) return '1h';
  if (m === 240) return '4h';
  if (m === 480) return '8h';
  if (m === 1440) return '1d';
  return `${m}m`;
}
function computeRangeSeconds(start, end) {
  const nowSec = Math.floor(Date.now() / 1000);
  let fromSec = toEpochSec(start);
  let toSec = toEpochSec(end);
  if (!Number.isFinite(fromSec)) fromSec = nowSec - 24 * 60 * 60;
  if (!Number.isFinite(toSec)) toSec = nowSec;
  if (toSec < fromSec) [fromSec, toSec] = [toSec, fromSec];
  return { fromSec, toSec };
}

/* ---------- payload adapters ---------- */
function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.rows)) return payload.rows;
  return [];
}

/* Map/standardize identity + timestamps, but **preserve all API keys**. */
function adaptRow(r = {}) {
  const tsRaw = r.TS ?? r.ts ?? r.timestamp;
  const tsMs = typeof tsRaw === 'number' ? (tsRaw < 1e12 ? tsRaw * 1000 : tsRaw) : Date.parse(String(tsRaw));
  const TS = r.TS ?? (Number.isFinite(tsMs) ? new Date(tsMs).toISOString() : null);

  return {
    ...r,
    TS,
    ts: Number.isFinite(tsMs) ? tsMs : NaN,
    DID: r.DID ?? r.did ?? undefined,
    SID: r.SID ?? r.SLAVE_ID ?? r.sid ?? null,
    panel_name: r.panel_name ?? r.panel ?? null,
    panel_location: r.panel_location ?? r.location ?? null
  };
}

/* Safe normalize wrapper — never drops a row if page-level normalize throws */
function safeNormalize(normalize, row) {
  try {
    return typeof normalize === 'function' ? normalize(row) : row;
  } catch {
    return row;
  }
}

/* ---------- API call ---------- */
export async function fetchFromAPI({
  baseUrl = API_BASE_V1,
  segment = 'all',
  start,
  end,
  did,
  sid,
  aggregateMinutes,
  limit = 500,
  overrideFromSec,
  overrideToSec
}) {
  const { fromSec, toSec } = computeRangeSeconds(start, end);
  const effFrom = Number.isFinite(overrideFromSec) ? overrideFromSec : fromSec;
  const effTo = Number.isFinite(overrideToSec) ? overrideToSec : toSec;

  const timeFrame = buildTimeFrame(aggregateMinutes);

  // NEW: prefer URL ?did=... if caller didn't provide one
  const didFromURL = _getDidFromURL();
  const effectiveDid = did || didFromURL || DEFAULT_DID;

  const qs = new URLSearchParams({
    limit: String(limit),
    from: String(effFrom),
    to: String(effTo),
    segment,
    timeFrame
  });
  if (effectiveDid) qs.set('did', String(effectiveDid));
  if (sid) qs.set('sid', String(sid));

  const url = `${baseUrl}/telemetry?${qs.toString()}`;
  const headers = authHeaders();

  const res = await fetch(url, { method: 'GET', headers, cache: 'no-store', mode: 'cors' });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${txt || res.statusText}`);
  }
  const json = await res.json();
  const rows = extractRows(json);

  // ensure a DID exists on every row (if API omitted it)
  return rows.map((r) => (r && r.DID == null && r.did == null ? { ...r, DID: effectiveDid } : r));
}

/* ---------- JSON fallback ---------- */
async function fetchFromJSON(dataUrl, normalize) {
  const res = await fetch(dataUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`JSON fetch failed (${res.status})`);
  const arr = extractRows(await res.json());
  return arr
    .map(adaptRow)
    .map((r) => safeNormalize(normalize, r))
    .filter((r) => Number.isFinite(r.ts));
}

/* ---------- Mock ---------- */
async function fetchMock({ start, end }, normalize) {
  await new Promise((r) => setTimeout(r, 60));
  const endMs = Number.isFinite(Date.parse(end)) ? Date.parse(end) : Date.now();
  const startMs = Number.isFinite(Date.parse(start)) ? Date.parse(start) : endMs - 60 * 1000;
  const didFromURL = _getDidFromURL() || DEFAULT_DID;
  const out = [];
  for (let t = startMs; t <= endMs; t += 1000) {
    out.push(
      safeNormalize(
        normalize,
        adaptRow({
          TS: new Date(t).toISOString(),
          DID: didFromURL,
          SLAVE_ID: 72,
          VR: 233,
          VY: 234,
          VB: 232,
          AVG_VLN: 233,
          VRY: 330,
          VYB: 331,
          VBR: 329,
          AVG_VLL: 330
        })
      )
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
  return { dids: [...dids].sort(), sids: [...sids].sort(), panels: [...panels].sort(), locations: [...locs].sort() };
}

/* ---------- Main loader (unchanged behavior; DID reads URL) ---------- */
export async function loadTelemetry({
  csvUrl,
  dataUrl,
  normalize,
  finalize,
  aggregateMinutes,
  aggregationStrategy = 'avg',
  page,
  pageSize,
  start,
  end,
  filter = {},
  segment = 'all',
  segments,
  overrideFromSec,
  overrideToSec
}) {
  const segList = Array.isArray(segments) && segments.length ? segments : [segment || 'all'];

  // NEW: fold URL ?did=... into the filter (unless caller already provided one)
  const didFromURL = _getDidFromURL();
  const filterWithDID = { ...filter };
  if (!filterWithDID.DID && didFromURL) filterWithDID.DID = didFromURL;

  let raw = [];
  try {
    const fetchOne = async (seg) =>
      (
        await fetchFromAPI({
          segment: seg,
          start,
          end,
          did: filterWithDID.DID,
          sid: filterWithDID.SID,
          aggregateMinutes,
          overrideFromSec,
          overrideToSec
        })
      ).map(adaptRow);

    raw =
      segList.length === 1
        ? await fetchOne(segList[0])
        : (await Promise.all(segList.map((seg) => fetchOne(seg).then((rows) => rows.map((r) => ({ __seg: seg, ...r })))))).flat();

    // Normalize and ensure DID
    raw = raw
      .map((r) => {
        const n = safeNormalize(normalize, r);
        if (!n.DID || String(n.DID).trim() === '') {
          n.DID = filterWithDID.DID || didFromURL || DEFAULT_DID;
        }
        return n;
      })
      .filter(Boolean);
  } catch (e) {
    console.warn('API failed, falling back to JSON:', e?.message);
    const jsonUrl = dataUrl || (csvUrl ? csvUrl.replace(/.csv$/i, '.json') : undefined) || '/src/views/telemetry-kit/data/telemetry.json';
    try {
      raw = await fetchFromJSON(jsonUrl, normalize);
      // Ensure DID even in fallback
      raw = raw.map((n) => {
        if (!n.DID || String(n.DID).trim() === '') n.DID = filterWithDID.DID || didFromURL || DEFAULT_DID;
        return n;
      });
    } catch (e2) {
      console.warn('JSON also failed, using mock:', e2?.message);
      raw = await fetchMock({ start, end }, normalize);
    }
  }

  let bounded = raw;
  if (!Number.isFinite(overrideFromSec) || !Number.isFinite(overrideToSec)) {
    const sMs = Number.isFinite(Date.parse(start)) ? Date.parse(start) : -Infinity;
    const eMs = Number.isFinite(Date.parse(end)) ? Date.parse(end) + 1 : +Infinity; // inclusive end
    bounded = raw.filter((r) => r.ts >= sMs && r.ts < eMs);
  }

  if (filterWithDID.DID) {
    const hasDidValues = bounded.some((r) => r.DID != null && String(r.DID).trim() !== '');
    if (hasDidValues) bounded = bounded.filter((r) => String(r.DID) === String(filterWithDID.DID));
  }
  if (filterWithDID.SID) bounded = bounded.filter((r) => String(r.SID) === String(filterWithDID.SID));
  if (filterWithDID.panel_name) bounded = bounded.filter((r) => String(r.panel_name) === String(filterWithDID.panel_name));
  if (filterWithDID.panel_location) bounded = bounded.filter((r) => String(r.panel_location) === String(filterWithDID.panel_location));

  const aggregated = aggregateGeneric(bounded, aggregateMinutes, aggregationStrategy).map((r) =>
    typeof finalize === 'function' ? finalize(r) : r
  );

  const facets = buildFacets(aggregated);

  const total = aggregated.length;
  const startIdx = Math.max(0, (Number(page) - 1) * Number(pageSize));
  const rows = aggregated.slice(startIdx, startIdx + Number(pageSize));

  return { rows, total, facets };
}

export async function loadAllTelemetry(args) {
  return loadTelemetry({ ...args, page: 1, pageSize: Number.MAX_SAFE_INTEGER });
}

/* -------- Segment helper (kept) -------- */
export async function fetchTelemetrySegment({
  baseUrl = `${API_BASE}/api/v1/telemetry`,
  token = (() => {
    const t = readTokenFromBrowser();
    return t ? (t.startsWith('Bearer ') ? t : `Bearer ${t}`) : '';
  })(),
  segment,
  did,
  from,
  to,
  limit = 5,
  timeFrame = '15s'
}) {
  const u = new URL(baseUrl);
  u.searchParams.set('limit', String(limit));
  if (from != null) u.searchParams.set('from', String(from));
  if (to != null) u.searchParams.set('to', String(to));
  u.searchParams.set('segment', segment);
  u.searchParams.set('timeFrame', timeFrame);

  const didFromURL = _getDidFromURL();
  const effectiveDid = did || didFromURL || DEFAULT_DID;
  if (effectiveDid) u.searchParams.set('did', effectiveDid);

  const headers = token ? { Authorization: token } : undefined;
  const res = await fetch(u.toString(), { headers, cache: 'no-store' });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API ${segment} failed: ${res.status} ${txt || res.statusText}`);
  }
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}
