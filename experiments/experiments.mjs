// NSPFRP: Single source of truth for the FractiOS empirical experiment suite (E1..E9).
//
// FractiOS — Holographic Homeostasis Firmware Layer (synthobs empirical-suite shape).
// Honesty boundary (voice tier per record): this is catalog engineering, not
// finished physics. Phi_EGS is a design grammar constant, not a physics
// constant. Nothing here claims RSI is solved. Correlation is not causation.
//
// Record shape: { id: 'E<n>_<snake>', title, pass, honesty, tier } — plain
// objects, deterministic, no Math.random, no Date.now in computation paths.
import {
  PHI_EGS, RCR_MIN, B_MAX, E_MIN, UCR_FLOOR, UCR_MIN_ELIGIBLE, D_LOW, D_COLLAPSE, VOICE_TIERS,
  ALPHA_STEPS, DOC_ID, REGISTRY_ID, HONESTY_BOUNDARY,
} from '../src/constants.mjs';

import { makeState, delta, applyDelta, invertDelta, canonicalJson } from '../src/kernel/state.mjs';
import {
  nrmse, bleed, usefulEvolution, rcr, loss, ife, threeAxis, usefulCommitRate, goldilocks,
} from '../src/kernel/metrics.mjs';
import { runPipeline } from '../src/kernel/pipeline.mjs';
import { loadManifest, validateAgainstDisk, MANIFEST_PATH } from '../src/repos/registry.mjs';

const VAULT_ROOT = process.env.FRACTIOS_VAULT ?? '/Volumes/GitVault/Username/FractiAI';
const CONTROL_A = { rcr: RCR_MIN, b: B_MAX, e: E_MIN };
const THRESHOLDS = { rcrMin: RCR_MIN, bMax: B_MAX, eMin: E_MIN, ucrFloor: UCR_FLOOR };

/** @param {number} x @param {number} y @param {number} [eps=1e-12] */
function near(x, y, eps = 1e-12) {
  return Math.abs(x - y) <= eps;
}

/** Canonical origin arm shared by pipeline experiments. */
function originArm() {
  return makeState({
    seed: { octave: 0, value: 0, type: 'origin' },
    alpha_a: 0.5,
    alpha_b: 0.5,
    alpha_c: 0.5,
  });
}

/**
 * Reference (feasible) exploration arm: a small, low-bleed, novel-but-shape-
 * preserving step off the origin with enough changed keys (>= 5) that the
 * alpha lattice yields a Useful Commit Rate above the floor. Used by E5
 * (rho blend) and E6 (three-axis gate).
 */
function feasibleCandidate() {
  return makeState({
    seed: { octave: 0, value: 0, type: 'origin' },
    alpha_a: 0.62,
    alpha_b: 0.44,
    alpha_c: 0.58,
    probe_x: 0.1,
    probe_y: 0.2,
  });
}

/**
 * Over-conservative arm analog (E4): a candidate carrying zero effective
 * change vs the origin — the limiting over-conservative arm. With no delta
 * entries, every alpha blend yields zero evolution (E = 0), violating E_MIN,
 * so the pipeline refuses on the E axis while the UCR population gate stays
 * report-only below the population floor.
 */
function overConservativeCandidate() {
  return makeState({
    seed: { octave: 0, value: 0, type: 'origin' },
    alpha_a: 0.5,
    alpha_b: 0.5,
    alpha_c: 0.5,
  });
}

/**
 * @param {{ values: Record<string, *>, version: number, address: string }} canonical
 * @param {{ values: Record<string, *>, version: number, address: string }} candidate
 * @returns {ReturnType<typeof runPipeline>}
 */
function pipelineFor(canonical, candidate) {
  return runPipeline({ canonical, candidate, control: CONTROL_A, thresholds: THRESHOLDS });
}
/**
 * @param {string} id
 * @param {string} title
 * @param {boolean} pass
 * @param {string} honesty
 * @param {string} tier
 * @returns {{ id: string, title: string, pass: boolean, honesty: string, tier: string }}
 */
function record(id, title, pass, honesty, tier) {
  if (!VOICE_TIERS.includes(tier)) {
    throw new TypeError(`experiment ${id}: unknown voice tier '${tier}'`);
  }
  return { id, title, pass: Boolean(pass), honesty, tier };
}

/** E1 — PHI_EGS equals (1 + sqrt(5)) / 2 to within 1e-15. */
function e1() {
  const target = (1 + Math.sqrt(5)) / 2;
  const pass = Math.abs(PHI_EGS - target) <= 1e-15;
  return record(
    'E1_phi_egs_identity',
    'PHI_EGS identity to 1e-15',
    pass,
    'Catalog engineering identity, not physics: Phi_EGS is the design-grammar nesting constant of this study; equality to (1+sqrt(5))/2 verifies the constant, not a law of nature. RSI not solved.',
    'verified',
  );
}

/** E4 — pipeline refuses commit for a threshold-violating (over-conservative arm) candidate. */
function e4() {
  const result = pipelineFor(originArm(), overConservativeCandidate());
  const ucrGate = result.verify?.gates?.ucr;
  const ucrReportOnly = result.verify?.gates?.ucrReportOnly;
  const refused = result.commit?.committed === false
    && result.verify?.pass === false
    && ucrGate === true
    && ucrReportOnly === true;
  return record(
    'E4_pipeline_refuses_overconservative_commit',
    'Pipeline refuses commit when thresholds are violated (over-conservative arm analog)',
    refused,
    'Refusal is gate logic on catalog metrics (operational tier); a rejected commit is a failed threshold check, not evidence about any physical system. The UCR floor is a population-level gate, so this single-candidate refusal is driven by the other catalog thresholds. RSI not solved.',
    'operational',
  );
}

/** E2 — lossless delta roundtrip: apply, invert, apply back returns identical values. */
function e2() {
  const s0 = makeState({ a: 1, b: 'x', nested: { d: 2 }, keep: [1, 2, 3] });
  const s1 = makeState({ a: 2, b: 'x', nested: { d: 5 }, keep: [1, 2, 3], extra: { e: true } });
  const d = delta(s0, s1);
  const applied = applyDelta(s0, d);
  const roundtrip = applyDelta(applied, invertDelta(d));
  const forward = canonicalJson(applied.values) === canonicalJson(s1.values) && applied.address === s1.address;
  const back = canonicalJson(roundtrip.values) === canonicalJson(s0.values) && roundtrip.address === s0.address;
  return record(
    'E2_lossless_delta_roundtrip',
    'Lossless delta roundtrip (apply then invert returns identical state values)',
    forward && back,
    'Losslessness here is a property of the canonical-JSON catalog format only; it makes no claim about energy, entropy, or physics. Correlation != causation.',
    'verified',
  );
}

/** E3 — metric formulas match contract definitions on worked numeric examples. */
function e3() {
  const checks = [
    near(nrmse([1, 2, 3], [1, 2, 4]), Math.sqrt(1 / 21)), // rmse sqrt(1/3) over rms sqrt(7)
    near(nrmse([1], [2]), 0.5), // rmse 1 over rms 2
    nrmse([0, 0], [0, 0]) === 0, // degenerate reference: zero error maps to 0, nonzero to Infinity
    near(bleed(0.2, 0.5, 0.3), 0.25),
    near(usefulEvolution(0.8, 0.5), 0.4),
    near(rcr(0.7, 1.0), 0.7),
    rcr(1.0, 0) === 0,
    near(loss(0.7), 0.3),
    near(ife(4, 8), 0.5),
    near(usefulCommitRate(3, 10), 0.3),
    usefulCommitRate(0, 0) === 0,
    goldilocks(0.2, 0.1, 0.5, { dLow: D_LOW, dCollapse: D_COLLAPSE }) === true,
    goldilocks(0.7, 0.1, 0.5, { dLow: D_LOW, dCollapse: D_COLLAPSE }) === false,
    threeAxis(0.8, 0.2, 0.5, CONTROL_A) === true,
    threeAxis(0.65, 0.2, 0.5, CONTROL_A) === false,
  ];
  return record(
    'E3_metrics_formulas',
    'Metric formulas match contract definitions on worked examples',
    checks.every(Boolean),
    'The formulas are the whitepaper-specified definitions implemented literally (operational tier); the worked examples verify arithmetic, not empirical behavior of any system.',
    'operational',
  );
}


/** E5 — feasible single candidate reaches commit; UCR is report-only below the population floor. */
function e5() {
  const result = pipelineFor(originArm(), feasibleCandidate());
  const alpha = result.reconcile?.alpha;
  const metrics = result.reconcile?.metrics ?? {};
  const alphaOk = typeof alpha === 'number' && alpha >= 0 && alpha <= 1;
  const constraintsMet = metrics
    && metrics.rcr >= RCR_MIN
    && metrics.b <= B_MAX
    && metrics.e > E_MIN;
  const ucrReportOnly = result.verify?.gates?.ucrReportOnly === true;
  const committed = result.commit?.committed === true;
  const pass = Boolean(alphaOk && constraintsMet && committed && result.verify?.pass === true && ucrReportOnly);
  return record(
    'E5_rho_blend_finds_feasible_alpha',
    'Feasible single candidate reaches commit with UCR report-only below the population floor',
    pass,
    'Rho is a reconciliation blend parameter (grid search over ALPHA_STEPS); UCR floor is a population-level gate, so single-candidate runs below UCR_MIN_ELIGIBLE are reported but not refused. Correlation != causation.',
    'operational',
  );
}

/** E6 — three-axis Goldilocks gate true vs Control A for the reference arm. */
function e6() {
  const result = pipelineFor(originArm(), feasibleCandidate());
  const m = result.reconcile?.metrics ?? {};
  const gate = threeAxis(m.rcr, m.b, m.e, CONTROL_A);
  const controlFails = threeAxis(CONTROL_A.rcr * 0.5, CONTROL_A.b * 2, CONTROL_A.e * 0.5, CONTROL_A) === false;
  return record(
    'E6_three_axis_gate_true_vs_control',
    'Three-axis Goldilocks gate true vs Control A for the reference arm',
    Boolean(gate && controlFails && result.verify?.threeAxis),
    'Control A is the threshold vector standing in for the whitepaper control arm; passing it is a comparison against our own catalog gates, not a physical control experiment.',
    'operational',
  );
}

/** E7 — population semantics for the UCR floor with UCR_MIN_ELIGIBLE synthetic explorations. */
function e7() {
  const eligible = UCR_MIN_ELIGIBLE;
  const threeAxisCommit = threeAxis(RCR_MIN + 0.01, B_MAX - 0.01, E_MIN + 0.01, CONTROL_A);
  const ucrOne = usefulCommitRate(threeAxisCommit ? 1 : 0, eligible);
  const ucrZero = usefulCommitRate(0, eligible);
  const pass = threeAxisCommit
    && ucrOne === 1 / eligible
    && ucrOne >= UCR_FLOOR
    && ucrZero === 0
    && ucrZero < UCR_FLOOR;
  return record(
    'E7_ucr_population_gate_enforcement',
    'Useful Commit Rate population gate (0.10) over UCR_MIN_ELIGIBLE synthetic explorations',
    pass,
    'The UCR floor is a population-level gate on synthetic eligible explorations, not a per-candidate refusal check; 1/8 = 0.125 clears it, while 0/8 does not. Correlation != causation.',
    'operational',
  );
}

/** E8 — manifest has 57 nodes and validateAgainstDisk passes against the vault root. */
function e8() {
  const manifest = loadManifest(MANIFEST_PATH);
  const nodeCount = Array.isArray(manifest?.nodes) ? manifest.nodes.length : 0;
  const disk = validateAgainstDisk(manifest, VAULT_ROOT);
  const pass = nodeCount === 57 && disk.ok === true;
  return record(
    'E8_manifest_57_nodes_disk_valid',
    'Manifest carries 57 nodes and validates against the FractiAI vault on disk',
    pass,
    `Registry check is a mirror inventory of ${VAULT_ROOT} (one-copy rule, no clones); it validates file presence, not the scientific content of any mirrored repo. DOC_ID ${DOC_ID}, REGISTRY_ID ${REGISTRY_ID}.`,
    'operational',
  );
}

/** Builds E1..E9 in order; E9 audits every record's honesty string and voice tier. */
export function runExperiments() {
  const earlier = [e1(), e2(), e3(), e4(), e5(), e6(), e7(), e8()];
  const honestyOk = HONESTY_BOUNDARY.length > 0
    && earlier.every((e) => typeof e.honesty === 'string' && e.honesty.trim().length > 0 && VOICE_TIERS.includes(e.tier));
  const e9 = record(
    'E9_honesty_and_voice_tier_coverage',
    'Every experiment record carries a non-empty honesty string and a declared voice tier',
    honestyOk,
    `Self-audit record: the honesty boundary (${HONESTY_BOUNDARY}) must ride on every claim; this audit covers itself too. Boundary spans catalog-engineering-not-physics, Phi_EGS-as-design-grammar, and RSI-not-solved.`,
    'verified',
  );
  return [...earlier, e9];
}

/** Eagerly built suite, in E1..E9 order. */
export const EXPERIMENTS = runExperiments();
