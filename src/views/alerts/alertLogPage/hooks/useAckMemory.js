import { useEffect, useMemo, useState } from 'react';

/** Create a tight signature for an alert row (must match exactly to reuse the ACK). */
export const signatureFor = (r) => {
  const tsMs = r?.ts ? new Date(r.ts).getTime() : 0;
  return [r?.panel_name ?? '', r?.tag_name ?? '', tsMs, r?.alert_value ?? '', r?.message ?? '', r?.unit ?? ''].join('|');
};

/** Stable key for storage — align with signature so each alert instance is unique. */
export const keyFor = (r) => signatureFor(r);

const OLD_KEY = 'alert_ack_store';
const NEW_KEY = 'alert_ack_store_v2';

/** Reads an existing store from localStorage (safe) */
function readStore(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Writes a store to localStorage (safe) */
function writeStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/** Keeps ACKs in localStorage and holds just-ACKed rows on screen until next refresh */
export function useAckMemory(storageKey = NEW_KEY) {
  // --- init with new store; do a light migration from the old key (only trusted entries) ---
  const [ackStore, setAckStore] = useState(() => {
    const current = readStore(storageKey);

    // If the new store already exists, just use it
    if (Object.keys(current).length) return current;

    // Otherwise, migrate from the old key, but ONLY entries with _by_user === true and a valid signature
    const old = readStore(OLD_KEY);
    const migrated = {};
    for (const [k, snap] of Object.entries(old)) {
      if (snap && snap._by_user === true && snap._signature === signatureFor(snap)) {
        migrated[snap._stableKey || k] = {
          ...snap,
          _stableKey: snap._stableKey || k,
          _signature: signatureFor(snap),
          _by_user: true
        };
      }
    }
    if (Object.keys(migrated).length) {
      writeStore(storageKey, migrated);
      // Note: we don't delete the old key automatically to be safe; feel free to clear it manually if desired
      return migrated;
    }
    return {};
  });

  useEffect(() => {
    writeStore(storageKey, ackStore);
  }, [ackStore, storageKey]);

  // keys of rows to keep in the main list until next refresh
  const [holdAckKeys, setHoldAckKeys] = useState(new Set());

  /** Merge fetched rows with any remembered ACKs — ONLY if the signature matches AND it was set by a user. */
  const mergeRows = (fetchedRows) =>
    fetchedRows.map((r) => {
      const k = keyFor(r);
      const snap = ackStore[k];
      // Apply ONLY when:
      // 1) The stored item came from the user (_by_user true)
      // 2) The stored signature equals the current signature (exact alert instance)
      if (snap && snap._by_user === true && snap._signature === signatureFor(r)) {
        return { ...r, ...snap }; // includes status/ack_user/ack_ts/ack_note
      }
      return r;
    });

  /** Remember an ACK for this exact row (stores signature & by-user flag). */
  const rememberAck = (row, payload) => {
    const k = keyFor(row);
    const snapshot = {
      ...row,
      ...payload,
      _stableKey: k,
      _signature: signatureFor(row),
      _by_user: true // 🔒 explicit proof that a user did this
    };
    setAckStore((prev) => ({ ...prev, [k]: snapshot }));
    setHoldAckKeys((prev) => new Set(prev).add(k));
    return k;
  };

  /** Remove a remembered ACK (on unack). */
  const forgetAck = (rowOrKey) => {
    const k = typeof rowOrKey === 'string' ? rowOrKey : keyFor(rowOrKey);
    setAckStore((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
    setHoldAckKeys((prev) => {
      const next = new Set(prev);
      next.delete(k);
      return next;
    });
  };

  const clearHolds = () => setHoldAckKeys(new Set());

  /** Snapshots not currently visible (for ACK cards/totals). */
  const getRememberedOnly = (visibleRows) => {
    const visibleKeys = new Set(visibleRows.map((r) => keyFor(r)));
    return Object.values(ackStore).filter((snap) => !visibleKeys.has(snap._stableKey));
  };

  /** All snapshots (for totals reconciliation). */
  const getAllSnapshots = () => Object.values(ackStore);

  /** Optional helper to nuke everything (use from dev console if ever needed) */
  const wipeAll = () => {
    setHoldAckKeys(new Set());
    setAckStore({});
    writeStore(storageKey, {});
  };

  return {
    mergeRows,
    rememberAck,
    forgetAck,
    clearHolds,
    getRememberedOnly,
    getAllSnapshots,
    wipeAll,
    holdAckKeys: useMemo(() => holdAckKeys, [holdAckKeys])
  };
}
