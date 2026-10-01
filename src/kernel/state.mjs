// NSPFRP: Single source of truth for FractiOS canonical state, deltas, and integrity hashing.
//
// Honesty boundary (src/constants.mjs HONESTY_BOUNDARY): catalog engineering,
// not finished physics. Voice tier for these operations: 'operational'.
// Integrity = sha256 hex of canonical JSON with recursively sorted keys.
// Deltas are lossless E2-style: applyDelta(state, delta(state, s2)) reproduces
// s2 exactly, and invertDelta undoes a delta (removed keys carry their prior
// values in `removedValues` so inversion never loses information).

import { createHash } from 'node:crypto';

/**
 * Canonical JSON: deterministic serialization with recursively sorted object keys.
 * Preserves JSON.stringify value semantics for strings, numbers, booleans, null,
 * arrays, and plain objects. Fails closed (throws) on undefined, functions, and
 * symbols — silent dropping or `null`-coercion would break losslessness.
 *
 * @param {*} value - any JSON-safe value
 * @returns {string} canonical JSON text
 * @throws {TypeError} on undefined/function/symbol values anywhere in the tree
 */
export function canonicalJson(value) {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'string') return JSON.stringify(value);
  if (t === 'number' || t === 'boolean') {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new TypeError('canonicalJson: NaN/Infinity are not lossless (JSON would coerce to null)');
    }
    return JSON.stringify(value);
  }
  if (t === 'undefined' || t === 'function' || t === 'symbol') {
    throw new TypeError(`canonicalJson: non-JSON value of type ${t} is not lossless`);
  }
  if (t !== 'object') {
    throw new TypeError(`canonicalJson: unsupported type ${t}`);
  }
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']';
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== null && proto !== Object.prototype) {
    throw new TypeError('canonicalJson: only plain objects and arrays are lossless');
  }
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
}

/**
 * sha256 hex digest of a UTF-8 string (Node crypto).
 *
 * @param {string} str - input text
 * @returns {string} 64-char lowercase hex digest
 */
export function sha256hex(str) {
  return createHash('sha256').update(str, 'utf8').digest('hex');
}

/** @typedef {{ values: Record<string, *>, version: number, address: string }} FractiState */

/**
 * Build an immutable FractiOS state from an entries object or Map.
 * Address = sha256hex(canonicalJson(values)); version starts at 1.
 *
 * @param {Object|Map} entries - initial key/value entries
 * @returns {FractiState} frozen state { values, version: 1, address }
 * @throws {TypeError} if entries is neither an Object nor a Map
 */
export function makeState(entries) {
  if (!(entries instanceof Map) && (entries === null || typeof entries !== 'object')) {
    throw new TypeError('makeState: entries must be an Object or a Map');
  }
  const values = Object.freeze(
    entries instanceof Map ? Object.fromEntries(entries) : { ...entries }
  );
  const state = {
    values,
    version: 1,
    address: sha256hex(canonicalJson(values)),
  };
  return Object.freeze(state);
}

/**
 * Extract the values object from a state or a bare plain object.
 *
 * @param {FractiState|Record<string, *>} s
 * @returns {Record<string, *>}
 * @internal
 */
function valuesOf(s) {
  if (s !== null && typeof s === 'object' && !Array.isArray(s) && 'values' in s) {
    return s.values;
  }
  return s;
}

/**
 * Lossless E2-style delta between canonical and explored states.
 * base = canonical.address. Removed keys additionally carry their prior values
 * in `removedValues` so invertDelta can restore them exactly.
 *
 * @param {FractiState|Record<string, *>} canonical - origin state (or plain object)
 * @param {FractiState|Record<string, *>} explored - candidate state (or plain object)
 * @returns {{ added: Record<string, *>, removed: string[], removedValues: Record<string, *>, changed: Record<string, { from: *, to: * }>, base: string }}
 * @throws {TypeError} on non-object inputs
 */
export function delta(canonical, explored) {
  const from = valuesOf(canonical);
  const to = valuesOf(explored);
  if (from === null || typeof from !== 'object' || Array.isArray(from)) {
    throw new TypeError('delta: canonical must be a state or plain object');
  }
  if (to === null || typeof to !== 'object' || Array.isArray(to)) {
    throw new TypeError('delta: explored must be a state or plain object');
  }
  const added = {};
  const removed = [];
  const removedValues = {};
  const changed = {};
  for (const k of Object.keys(to)) {
    if (!(k in from)) {
      added[k] = to[k];
    } else if (!sameValue(from[k], to[k])) {
      changed[k] = { from: from[k], to: to[k] };
    }
  }
  for (const k of Object.keys(from)) {
    if (!(k in to)) {
      removed.push(k);
      removedValues[k] = from[k];
    }
  }
  const base = typeof canonical === 'object' && canonical !== null && 'address' in canonical
    ? canonical.address
    : sha256hex(canonicalJson(from));
  return { added, removed, removedValues, changed, base };
}

/**
 * Structural equality for delta comparison: canonical JSON text equality.
 * Avoids NaN !== NaN false positives while staying deterministic.
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 * @internal
 */
function sameValue(a, b) {
  if (a === b) return true;
  return canonicalJson(a) === canonicalJson(b);
}

/**
 * Apply a delta to a state, producing a NEW immutable state (version + 1).
 * Added keys are inserted, removed keys deleted, changed keys moved to `to`.
 * Fails closed: missing removed prior values (for inversion fidelity) are only
 * required by invertDelta, not here; a malformed delta throws.
 *
 * @param {FractiState|Record<string, *>} state - base state (or plain object)
 * @param {{ added?: Record<string, *>, removed?: string[], changed?: Record<string, { to: * }> }} d
 * @returns {FractiState} new frozen state with version + 1
 * @throws {TypeError} on malformed delta or non-object base
 */
export function applyDelta(state, d) {
  const base = valuesOf(state);
  if (base === null || typeof base !== 'object' || Array.isArray(base)) {
    throw new TypeError('applyDelta: state must be a state or plain object');
  }
  if (d === null || typeof d !== 'object') {
    throw new TypeError('applyDelta: delta must be an object');
  }
  const next = { ...base };
  if (d.added !== undefined) {
    if (d.added === null || typeof d.added !== 'object') {
      throw new TypeError('applyDelta: delta.added must be an object');
    }
    for (const k of Object.keys(d.added)) next[k] = d.added[k];
  }
  if (d.removed !== undefined) {
    if (!Array.isArray(d.removed)) {
      throw new TypeError('applyDelta: delta.removed must be an array');
    }
    for (const k of d.removed) delete next[k];
  }
  if (d.changed !== undefined) {
    if (d.changed === null || typeof d.changed !== 'object') {
      throw new TypeError('applyDelta: delta.changed must be an object');
    }
    for (const k of Object.keys(d.changed)) {
      const entry = d.changed[k];
      if (entry === null || typeof entry !== 'object' || !('to' in entry)) {
        throw new TypeError(`applyDelta: delta.changed[${JSON.stringify(k)}] must have a 'to'`);
      }
      next[k] = entry.to;
    }
  }
  const prevVersion = typeof state === 'object' && state !== null && typeof state.version === 'number'
    ? state.version
    : 1;
  const values = Object.freeze(next);
  return Object.freeze({
    values,
    version: prevVersion + 1,
    address: sha256hex(canonicalJson(values)),
  });
}

/**
 * Build the delta that undoes `d`, returning to the base address.
 * `added` restores prior values (from changed.from and removedValues),
 * `removed` drops keys the delta introduced, `changed` swaps from/to,
 * base is preserved as d.base.
 *
 * @param {{ added?: Record<string, *>, removed?: string[], removedValues?: Record<string, *>, changed?: Record<string, { from: *, to: * }>, base?: string }} d
 * @returns {{ added: Record<string, *>, removed: string[], removedValues: Record<string, *>, changed: Record<string, { from: *, to: * }>, base: string|undefined }}
 * @throws {TypeError} if d has removed keys but no removedValues to restore them losslessly
 */
export function invertDelta(d) {
  if (d === null || typeof d !== 'object') {
    throw new TypeError('invertDelta: delta must be an object');
  }
  const added = {};
  const removed = [];
  const removedValues = {};
  const changed = {};
  if (d.changed !== undefined) {
    for (const k of Object.keys(d.changed)) {
      const entry = d.changed[k];
      if (entry === null || typeof entry !== 'object') {
        throw new TypeError(`invertDelta: delta.changed[${JSON.stringify(k)}] must be an object`);
      }
      added[k] = entry.from;
    }
  }
  if (d.removed !== undefined && d.removed.length > 0) {
    if (d.removedValues === undefined || d.removedValues === null) {
      throw new TypeError(
        'invertDelta: delta is missing removedValues for its removed keys; ' +
        'inversion would be lossy (fail-closed)'
      );
    }
    for (const k of d.removed) {
      if (!(k in d.removedValues)) {
        throw new TypeError(
          `invertDelta: removedValues missing prior value for key ${JSON.stringify(k)}`
        );
      }
      added[k] = d.removedValues[k];
    }
  }
  if (d.added !== undefined) {
    for (const k of Object.keys(d.added)) {
      removed.push(k);
      removedValues[k] = d.added[k];
    }
  }
  return { added, removed, removedValues, changed, base: d.base };
}
