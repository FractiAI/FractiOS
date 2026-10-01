// NSPFRP: Single source of truth for pipeline orchestration.

import {
  ALPHA_STEPS,
  B_MAX,
  D_COLLAPSE,
  D_LOW,
  E_MIN,
  HONESTY_BOUNDARY,
  PHI_DEPTH,
  PHI_WIDTH,
  RCR_MIN,
  UCR_FLOOR,
  UCR_MIN_ELIGIBLE,
  VOICE_TIERS,
} from '../constants.mjs';

import { applyDelta, canonicalJson, delta, makeState } from './state.mjs';
import {
  bleed,
  goldilocks,
  loss,
  nrmse,
  rcr,
  threeAxis,
  usefulCommitRate,
  usefulEvolution,
} from './metrics.mjs';

const KIND_ORDER = /** @type {const} */ ({ added: 0, changed: 1, removed: 2 });
const PRIME_CACHE = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

/**
 * @param {unknown} value
 * @returns {value is {values: Record<string, unknown>, version: number, address: string}}
 */
function isStateLike(value) {
  return Boolean(
    value
    && typeof value === 'object'
    && 'values' in value
    && 'version' in value
    && 'address' in value,
  );
}

/**
 * @param {unknown} value
 * @returns {{values: Record<string, unknown>, version: number, address: string}}
 */
function toState(value) {
  if (isStateLike(value)) {
    return value;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return makeState(/** @type {Record<string, unknown>} */ (value));
  }
  return makeState({});
}

/**
 * @param {{added: Record<string, unknown>, changed: Record<string, {from: unknown, to: unknown}>, removed: string[]}} diff
 * @returns {Array<{kind: 'added' | 'changed' | 'removed', key: string, value?: unknown}>}
 */
function changeEntries(diff) {
  return [
    ...Object.keys(diff.added).map((key) => ({ kind: 'added', key, value: diff.added[key] })),
    ...Object.keys(diff.changed).map((key) => ({ kind: 'changed', key, value: diff.changed[key].to })),
    ...diff.removed.map((key) => ({ kind: 'removed', key })),
  ].sort((left, right) => {
    const keyOrder = left.key.localeCompare(right.key);
    return keyOrder !== 0 ? keyOrder : KIND_ORDER[left.kind] - KIND_ORDER[right.kind];
  });
}

/**
 * @param {number} count
 * @returns {number[]}
 */
function primes(count) {
  const result = [];
  for (let candidate = 2; result.length < count; candidate += 1) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      result.push(candidate);
    }
  }
  return result;
}

/**
 * @param {number} alpha
 * @param {Array<{kind: 'added' | 'changed' | 'removed', key: string, value?: unknown}>} entries
 * @param {{values: Record<string, unknown>, version: number, address: string}} canonical
 * @returns {{state: {values: Record<string, unknown>, version: number, address: string}, selectedCount: number}}
 */
function blendState(alpha, entries, canonical) {
  const selectedCount = entries.length === 0 ? 0 : Math.min(entries.length, Math.floor(alpha * entries.length + 1e-12));
  const values = { ...canonical.values };
  for (let index = 0; index < selectedCount; index += 1) {
    const entry = entries[index];
    if (entry.kind === 'removed') {
      delete values[entry.key];
    } else {
      values[entry.key] = entry.value;
    }
  }
  return { state: makeState(values), selectedCount };
}

/**
 * @param {Array<{key: string, kind: 'added' | 'changed' | 'removed'}>} entries
 * @returns {{shelves: Array<Array<Array<string>>>, assignment: Record<string, {shelf: number, slot: number}>, keyOrder: string[]}}
 */
function organizePhi(entries) {
  const shelves = Array.from({ length: PHI_DEPTH }, () => Array.from({ length: PHI_WIDTH }, () => []));
  const assignment = {};
  const keyOrder = entries.map((entry) => entry.key);
  for (let index = 0; index < entries.length; index += 1) {
    const key = entries[index].key;
    const shelf = Math.floor(index / PHI_WIDTH) % PHI_DEPTH;
    const slot = index % PHI_WIDTH;
    shelves[shelf][slot].push(key);
    assignment[key] = { shelf, slot };
  }
  return { shelves, assignment, keyOrder };
}

/**
 * @param {Array<{key: string, kind: 'added' | 'changed' | 'removed'}>} entries
 * @returns {{containers: Array<{index: number, prime: number, boundary: number, keys: string[]}>, assignment: Record<string, number>, transitions: number, contained: number, leaked: number, b: number}}
 */
function containPrime(entries) {
  const keyOrder = entries.map((entry) => entry.key);
  const usedPrimes = primes(Math.max(1, entries.length ? entries.length : 1));
  const containers = [];
  const assignment = {};
  let cursor = 0;
  let boundary = 0;
  for (let index = 0; cursor < entries.length; index += 1) {
    const prime = usedPrimes[index];
    boundary += prime;
    const keys = [];
    while (cursor < entries.length && keys.length < prime) {
      const key = entries[cursor].key;
      assignment[key] = index;
      keys.push(key);
      cursor += 1;
    }
    containers.push({ index, prime, boundary, keys });
  }

  let transitions = 0;
  for (let index = 1; index < keyOrder.length; index += 1) {
    if (assignment[keyOrder[index]] !== assignment[keyOrder[index - 1]]) {
      transitions += 1;
    }
  }

  const contained = entries.length;
  const leaked = Math.max(0, entries.length - containers.reduce((sum, container) => sum + container.prime, 0));
  const b = bleed(transitions, contained, leaked);
  return { containers, assignment, transitions, contained, leaked, b };
}

/**
 * @param {Array<{kind: 'added' | 'changed' | 'removed', key: string, value?: unknown}>} entries
 * @param {number} alpha
 * @returns {{alpha: number, blended: {values: Record<string, unknown>, version: number, address: string}, delta: ReturnType<typeof delta>, metrics: {rcr: number, b: number, e: number, l: number}, novelty: number, selectedCount: number, divergence: number, goldilocks: boolean}}
 *
 * The alpha sweep is deterministic: changes are sorted by key, then by change kind
 * (added < changed < removed). For a candidate alpha in [0,1], the first
 * floor(alpha * n) sorted changes are applied to the canonical state. This creates
 * a monotone lattice over the search space while preserving a fully reproducible
 * selection order.
 */
function reconcileAlpha(entries, alpha) {
  const novelty = entries.length === 0 ? 0 : Math.min(1, Math.max(0, Math.floor(alpha * entries.length + 1e-12) / entries.length));
  const blended = blendState(alpha, entries, /** @type {{values: Record<string, unknown>, version: number, address: string}} */ (this.canonical));
  const selectionMask = entries.map((_, index) => (index < blended.selectedCount ? 1 : 0));
  const allMask = entries.map(() => 1);
  const divergence = entries.length === 0 ? 0 : nrmse(selectionMask, allMask);
  const recoverableShape = 1 - divergence;
  const rcrValue = rcr(blended.selectedCount, entries.length);
  const bValue = this.containment.b;
  const eValue = usefulEvolution(novelty, recoverableShape);
  const lValue = loss(rcrValue);
  const metrics = { rcr: rcrValue, b: bValue, e: eValue, l: lValue };
  const bestDelta = delta(this.canonical, blended.state);
  return {
    alpha,
    blended: blended.state,
    delta: bestDelta,
    metrics,
    novelty,
    selectedCount: blended.selectedCount,
    divergence,
    goldilocks: goldilocks(divergence, bValue, eValue, { dLow: D_LOW, dCollapse: D_COLLAPSE }),
  };
}

/**
 * @param {{alpha: number, blended: {values: Record<string, unknown>, version: number, address: string}, delta: ReturnType<typeof delta>, metrics: {rcr: number, b: number, e: number, l: number}, novelty: number, selectedCount: number, divergence: number, goldilocks: boolean}} left
 * @param {{alpha: number, blended: {values: Record<string, unknown>, version: number, address: string}, delta: ReturnType<typeof delta>, metrics: {rcr: number, b: number, e: number, l: number}, novelty: number, selectedCount: number, divergence: number, goldilocks: boolean}} right
 * @returns {number}
 */
function compareCandidates(left, right) {
  if (left.novelty !== right.novelty) {
    return left.novelty - right.novelty;
  }
  if (left.metrics.e !== right.metrics.e) {
    return left.metrics.e - right.metrics.e;
  }
  if (right.metrics.b !== left.metrics.b) {
    return right.metrics.b - left.metrics.b;
  }
  if (left.metrics.rcr !== right.metrics.rcr) {
    return left.metrics.rcr - right.metrics.rcr;
  }
  return left.alpha - right.alpha;
}

/**
 * Run the canonical pipeline over a canonical state and a candidate state.
 *
 * UCR is a population-level gate: when this call evaluates fewer than
 * UCR_MIN_ELIGIBLE candidate explorations, UCR is reported for observability
 * but does not gate commitment. That avoids the over-safe-refuse failure mode
 * where per-candidate work is incorrectly blocked by a population metric.
 *
 * @param {{canonical: unknown, candidate?: unknown, candidates?: unknown[], control?: {rcr?: number, b?: number, e?: number}, thresholds?: {dLow?: number, dCollapse?: number}}} input
 * @returns {{
 *   stages: {
 *     explore: unknown,
 *     organize: unknown,
 *     contain: unknown,
 *     reconcile: unknown,
 *     verify: unknown,
 *     commit: unknown,
 *   },
 *   reconcile: { alpha: number, blended: {values: Record<string, unknown>, version: number, address: string}, delta: ReturnType<typeof delta>, metrics: {rcr: number, b: number, e: number, l: number} },
 *   verify: { threeAxis: boolean, gates: {rcr: boolean, b: boolean, e: boolean, ucr: boolean, ucrValue: number, ucrReportOnly: boolean}, pass: boolean },
 *   commit: { committed: boolean, reason: string, canonical: {values: Record<string, unknown>, version: number, address: string}, journal: Record<string, unknown> },
 * }}
 */
export function runPipeline(input) {
  const canonical = toState(input?.canonical);
  const candidateInput = Array.isArray(input?.candidates) ? input?.candidates[0] ?? input?.candidate : input?.candidate;
  const candidate = toState(candidateInput);
  const control = {
    rcr: input?.control?.rcr ?? RCR_MIN,
    b: input?.control?.b ?? B_MAX,
    e: input?.control?.e ?? E_MIN,
  };
  const thresholds = {
    dLow: input?.thresholds?.dLow ?? D_LOW,
    dCollapse: input?.thresholds?.dCollapse ?? D_COLLAPSE,
  };

  const explored = delta(canonical, candidate);
  const entries = changeEntries(explored);
  const organize = organizePhi(entries);
  const containment = containPrime(entries);

  const evaluations = [];
  const sweepCount = Math.max(1, ALPHA_STEPS);
  for (let step = 0; step < sweepCount; step += 1) {
    const alpha = sweepCount === 1 ? 1 : step / (sweepCount - 1);
    const selectedCount = entries.length === 0 ? 0 : Math.min(entries.length, Math.floor(alpha * entries.length + 1e-12));
    const values = { ...canonical.values };
    for (let index = 0; index < selectedCount; index += 1) {
      const entry = entries[index];
      if (entry.kind === 'removed') {
        delete values[entry.key];
      } else {
        values[entry.key] = entry.value;
      }
    }
    const blended = makeState(values);
    const novelty = entries.length === 0 ? 0 : selectedCount / entries.length;
    const selectionMask = entries.map((_, index) => (index < selectedCount ? 1 : 0));
    const allMask = entries.map(() => 1);
    const divergence = entries.length === 0 ? 0 : nrmse(selectionMask, allMask);
    const recoverableShape = 1 - divergence;
    const rcrValue = rcr(selectedCount, entries.length);
    const bValue = containment.b;
    const eValue = usefulEvolution(novelty, recoverableShape);
    const lValue = loss(rcrValue);
    const metrics = { rcr: rcrValue, b: bValue, e: eValue, l: lValue };
    const pass = rcrValue >= RCR_MIN && bValue <= B_MAX && eValue > E_MIN && threeAxis(rcrValue, bValue, eValue, control);
    const candidateResult = {
      alpha,
      blended,
      delta: delta(canonical, blended),
      metrics,
      novelty,
      selectedCount,
      divergence,
      goldilocks: goldilocks(divergence, bValue, eValue, thresholds),
      pass,
    };
    evaluations.push(candidateResult);
  }

  let best = evaluations[0] ?? {
    alpha: 1,
    blended: canonical,
    delta: explored,
    metrics: { rcr: 0, b: 0, e: 0, l: 1 },
    novelty: 0,
    selectedCount: 0,
    divergence: 0,
    goldilocks: false,
    pass: false,
  };
  for (let index = 1; index < evaluations.length; index += 1) {
    const candidateResult = evaluations[index];
    if (candidateResult.pass && !best.pass) {
      best = candidateResult;
      continue;
    }
    if (candidateResult.pass === best.pass && compareCandidates(best, candidateResult) < 0) {
      best = candidateResult;
    }
  }

  const rcrGate = best.metrics.rcr >= RCR_MIN;
  const bGate = best.metrics.b <= B_MAX;
  const eGate = best.metrics.e > E_MIN;
  const axisGate = threeAxis(best.metrics.rcr, best.metrics.b, best.metrics.e, control);
  const candidatePass = rcrGate && bGate && eGate && axisGate;
  const eligible = Array.isArray(input?.candidates) ? input.candidates.length : 1;
  const commitCount = candidatePass ? 1 : 0;
  const ucr = usefulCommitRate(commitCount, eligible);
  const ucrReportOnly = eligible < UCR_MIN_ELIGIBLE;
  const ucrGate = ucrReportOnly ? true : ucr >= UCR_FLOOR;
  const verify = {
    threeAxis: axisGate,
    gates: {
      rcr: rcrGate,
      b: bGate,
      e: eGate,
      ucr: ucrGate,
      ucrValue: ucr,
      ucrReportOnly,
    },
    pass: rcrGate && bGate && eGate && axisGate && ucrGate,
  };

  const committed = verify.pass;
  const committedCanonical = committed ? applyDelta(canonical, best.delta) : canonical;
  const reason = committed ? 'verify.pass' : 'verify.failed';
  const journal = {
    voiceTier: VOICE_TIERS[1],
    honestyBoundary: HONESTY_BOUNDARY,
    stages: {
      explore: explored,
      organize,
      contain: containment,
      reconcile: {
        alpha: best.alpha,
        metrics: best.metrics,
        novelty: best.novelty,
        divergence: best.divergence,
      },
      verify,
      commit: {
        committed,
        reason,
      },
    },
    alpha: best.alpha,
    metrics: best.metrics,
    summary: canonicalJson({
      committed,
      alpha: best.alpha,
      metrics: best.metrics,
      reason,
    }),
  };

  const reconcile = {
    alpha: best.alpha,
    blended: best.blended,
    delta: best.delta,
    metrics: best.metrics,
  };

  const commit = {
    committed,
    reason,
    canonical: committedCanonical,
    journal,
  };

  return {
    stages: {
      explore: explored,
      organize,
      contain: containment,
      reconcile,
      verify,
      commit,
    },
    reconcile,
    verify,
    commit,
  };
}
