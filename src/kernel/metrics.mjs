// NSPFRP: Single source of truth for FractiOS metrics (D, B, E, RCR, L, IFE, gates).
import { B_MAX } from '../constants.mjs';

//
// Honesty boundary (src/constants.mjs HONESTY_BOUNDARY): catalog engineering,
// not finished physics. Voice tier for these formulas: 'operational' — they
// implement the FractiAI whitepaper definitions literally; empirical status is
// unverified. Correlation != causation for anything these numbers suggest.
// All functions are pure: no Math.random, no Date.now, no I/O, no mutation of
// arguments. Definitions (whitepaper-literal):
//   D = NRMSE(X_n, X_0)
//   B = unintended cross-container energy / (contained + leaked)
//   E = stepwise novelty x recoverable shape vs origin
//   RCR = recoverable after recursion / recoverable at encode
//   L = 1 - RCR
//   IFE = recoverable / representation cost

/**
 * Root-mean-square error normalized by the RMS of the reference `b`.
 * Accepts two arrays of numbers (matched by index) or two plain objects of
 * numbers (matched over their shared keys). Fails closed on mismatched shapes,
 * non-number entries, or non-finite inputs.
 *
 * @param {number[]|Record<string, number>} a - approximation (e.g. X_n)
 * @param {number[]|Record<string, number>} b - reference (e.g. X_0)
 * @returns {number} NRMSE(a, b); 0 when both are identical (including all-zero)
 * @throws {TypeError|RangeError} on shape mismatch or invalid entries
 */
export function nrmse(a, b) {
  if (Array.isArray(a) !== Array.isArray(b)) {
    throw new RangeError('nrmse: mixed array/object inputs are not comparable');
  }
  if (!Array.isArray(a)) {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.length !== kb.length || ka.some((k, i) => k !== kb[i])) {
      throw new RangeError('nrmse: object key sets differ; no lossless pairing exists');
    }
  }
  const xs = seriesOf(a, 'a');
  const ys = seriesOf(b, 'b');
  if (xs.length !== ys.length) {
    throw new RangeError(
      `nrmse: shape mismatch (${xs.length} entries in a vs ${ys.length} in b)`
    );
  }
  let sq = 0;
  let refSq = 0;
  for (let i = 0; i < ys.length; i++) {
    const d = xs[i] - ys[i];
    sq += d * d;
    refSq += ys[i] * ys[i];
  }
  const rmse = Math.sqrt(sq / ys.length);
  const rmsRef = Math.sqrt(refSq / ys.length);
  if (rmsRef === 0) {
    return rmse === 0 ? 0 : Number.POSITIVE_INFINITY;
  }
  return rmse / rmsRef;
}

/**
 * Flatten arrays or plain objects of numbers into a finite number list.
 * For objects, entries pair over identical sorted key sets (enforced in nrmse).
 *
 * @param {*} v - candidate input
 * @param {string} name - input name for error messages
 * @returns {number[]}
 * @internal
 */
function seriesOf(v, name) {
  if (Array.isArray(v)) {
    return v.map((x, i) => finiteNumber(x, `${name}[${i}]`));
  }
  if (v !== null && typeof v === 'object') {
    return Object.keys(v).map((k) => finiteNumber(v[k], `${name}[${JSON.stringify(k)}]`));
  }
  throw new TypeError(`nrmse: ${name} must be an array or plain object of numbers`);
}

/**
 * Validate a finite number, returning it.
 *
 * @param {*} x
 * @param {string} label
 * @returns {number}
 * @internal
 */
function finiteNumber(x, label) {
  if (typeof x !== 'number' || !Number.isFinite(x)) {
    throw new TypeError(`metrics: ${label} must be a finite number, got ${String(x)}`);
  }
  return x;
}

/**
 * Bleed ratio B: unintended cross-container energy divided by (contained + leaked).
 * IEEE semantics on zero denominator: Infinity when any energy is present, 0
 * when the system holds no energy at all.
 *
 * @param {number} unintended - energy that crossed container boundaries unintentionally
 * @param {number} contained - energy held inside its container
 * @param {number} leaked - energy that left its container as accounted leakage
 * @returns {number} B
 * @throws {TypeError} on non-finite inputs
 */
export function bleed(unintended, contained, leaked) {
  const u = finiteNumber(unintended, 'unintended');
  const c = finiteNumber(contained, 'contained');
  const l = finiteNumber(leaked, 'leaked');
  const denom = c + l;
  if (denom === 0) return u === 0 ? 0 : Number.POSITIVE_INFINITY;
  return u / denom;
}

/**
 * Stepwise evolution E: novelty times recoverable shape vs origin.
 *
 * @param {number} novelty - stepwise novelty factor
 * @param {number} recoverableShape - recoverable-shape factor vs origin
 * @returns {number} E = novelty * recoverableShape
 * @throws {TypeError} on non-finite inputs
 */
export function usefulEvolution(novelty, recoverableShape) {
  return finiteNumber(novelty, 'novelty') * finiteNumber(recoverableShape, 'recoverableShape');
}

/**
 * Recursion Conservation Ratio: recoverable after recursion divided by
 * recoverable at encode. Contract-literal: 0 when recoverAtEncode <= 0.
 *
 * @param {number} recoverAfter - recoverable content after recursion
 * @param {number} recoverAtEncode - recoverable content at encode time
 * @returns {number} RCR in [0, 1] for valid ratios; 0 when recoverAtEncode <= 0
 * @throws {TypeError} on non-finite inputs
 */
export function rcr(recoverAfter, recoverAtEncode) {
  const after = finiteNumber(recoverAfter, 'recoverAfter');
  const atEncode = finiteNumber(recoverAtEncode, 'recoverAtEncode');
  if (atEncode <= 0) return 0;
  return after / atEncode;
}

/**
 * Loss L = 1 - RCR.
 *
 * @param {number} rcrValue - Recursion Conservation Ratio
 * @returns {number} L
 * @throws {TypeError} on non-finite input
 */
export function loss(rcrValue) {
  return 1 - finiteNumber(rcrValue, 'rcr');
}

/**
 * Information Fractal Efficiency: recoverable content per unit representation cost.
 * Zero/negative cost with positive recoverable content yields Infinity (loud, IEEE).
 *
 * @param {number} recoverable - recoverable content
 * @param {number} cost - representation cost
 * @returns {number} IFE
 * @throws {TypeError} on non-finite inputs
 */
export function ife(recoverable, cost) {
  const r = finiteNumber(recoverable, 'recoverable');
  const c = finiteNumber(cost, 'cost');
  if (c <= 0) return r === 0 ? 0 : Number.POSITIVE_INFINITY;
  return r / c;
}

/**
 * Three-axis Goldilocks gate versus a control (Control A):
 * pass iff RCR > control.rcr AND B < control.b AND E > control.e.
 *
 * @param {number} rcrValue - candidate Recursion Conservation Ratio
 * @param {number} b - candidate bleed B
 * @param {number} e - candidate evolution E
 * @param {{ rcr: number, b: number, e: number }} control - Control A reference axes
 * @returns {boolean} true iff all three axes beat the control
 * @throws {TypeError} on non-finite inputs
 */
export function threeAxis(rcrValue, b, e, control) {
  if (control === null || typeof control !== 'object') {
    throw new TypeError('threeAxis: control must be an object { rcr, b, e }');
  }
  const r = finiteNumber(rcrValue, 'rcr');
  const bb = finiteNumber(b, 'b');
  const ee = finiteNumber(e, 'e');
  const cr = finiteNumber(control.rcr, 'control.rcr');
  const cb = finiteNumber(control.b, 'control.b');
  const ce = finiteNumber(control.e, 'control.e');
  return r > cr && bb < cb && ee > ce;
}

/**
 * Useful Commit Rate: commits passing all three Goldilocks axes divided by
 * eligible explorations. Contract-literal: 0 when eligible <= 0.
 *
 * @param {number} commits - commits satisfying all three axes
 * @param {number} eligible - eligible explorations
 * @returns {number} UCR
 * @throws {TypeError} on non-finite inputs
 */
export function usefulCommitRate(commits, eligible) {
  const c = finiteNumber(commits, 'commits');
  const n = finiteNumber(eligible, 'eligible');
  if (n <= 0) return 0;
  return c / n;
}

/**
 * Goldilocks viability gate: D must sit strictly inside the Goldilocks band
 * (dLow < D < dCollapse), bleed must respect the B ceiling (<= 0.35), and
 * evolution must be strictly positive.
 *
 * @param {number} D - NRMSE distance from origin
 * @param {number} B - bleed ratio
 * @param {number} E - stepwise evolution
 * @param {{ dLow: number, dCollapse: number }} opts - Goldilocks band bounds
 * @returns {boolean} true iff the triple is viable
 * @throws {TypeError} on non-finite inputs or missing bounds
 */
export function goldilocks(D, B, E, opts) {
  if (opts === null || typeof opts !== 'object') {
    throw new TypeError('goldilocks: opts must be an object { dLow, dCollapse }');
  }
  const d = finiteNumber(D, 'D');
  const b = finiteNumber(B, 'B');
  const e = finiteNumber(E, 'E');
  const dLow = finiteNumber(opts.dLow, 'opts.dLow');
  const dCollapse = finiteNumber(opts.dCollapse, 'opts.dCollapse');
  return dLow < d && d < dCollapse && b <= B_MAX && e > 0;
}
