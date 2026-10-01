// NSPFRP: Single source of truth for FractiOS constants.
//
// Honesty boundary (see HONESTY_BOUNDARY): this is catalog engineering, not
// finished physics. Phi_EGS is a design grammar constant (catalog nesting),
// not a physics constant. RSI is not solved here. Voice tier for the numeric
// thresholds below: 'operational' (whitepaper-specified, unverified empirically).
// Correlation != causation throughout anything built on these numbers.

/** Golden-ratio-derived catalog nesting grammar constant, computed exactly as (1 + sqrt(5)) / 2. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

/** Exploration injection epsilon from the whitepaper. */
export const EGS_IE = 0.0032;

/** Canonical document identifier for the FractiOS holographic homeostasis study. */
export const DOC_ID = 'WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30';

/** Registry identifier for this firmware/base layer release. */
export const REGISTRY_ID = 'fractios-2026-09';

/** Study title, verbatim. */
export const STUDY_TITLE = 'FractiOS — Holographic Homeostasis Firmware Layer';

/** Operator attribution string, verbatim. */
export const OPERATOR = 'SynthOBS Autonomous Agent · Syntheverse Sandbox';

/** Audit protocol identifier, verbatim. */
export const AUDIT_PROTOCOL = 'NSPFRNP-SNAP-PRA-2026-06';

/**
 * Mandatory honesty boundary, carried verbatim onto every report/claim surface:
 * this is catalog engineering, not finished physics; Phi_EGS is design grammar;
 * RSI is not solved.
 */
export const HONESTY_BOUNDARY =
  'Catalog engineering, not finished physics: Phi_EGS is a design grammar ' +
  'constant, not a physics constant. Nothing here claims recursive ' +
  'self-improvement (RSI) is solved. Correlation is not causation.';

/** Minimum RCR (recoverable after recursion / recoverable at encode) for a canonical commit. */
export const RCR_MIN = 0.7;

/** Maximum bleed B (unintended cross-container energy / (contained + leaked)) for a canonical commit. */
export const B_MAX = 0.35;

/** Minimum stepwise evolution E for a canonical commit. */
export const E_MIN = 0.01;

/** Floor on Useful Commit Rate: commits passing all three Goldilocks axes / eligible explorations. */
export const UCR_FLOOR = 0.10;

/** UCR floor is a population gate (whitepaper held-out used 48 eligible explorations); per-candidate evaluation below UCR_MIN_ELIGIBLE is reported but NOT gated, to prevent the over-safe-refuse failure mode. */
export const UCR_MIN_ELIGIBLE = 8;

/** Below this NRMSE distance D the candidate is considered too close to canonical (no evolution). */
export const D_LOW = 0.05;

/** At or above this NRMSE distance D the candidate is considered collapsed. */
export const D_COLLAPSE = 0.6;

/** phi-Organize hierarchy depth (allocation depth, design grammar). */
export const PHI_DEPTH = 2;

/** phi-Organize width: round(Phi_EGS + 1) = 3 (design grammar, not scalar multiplication). */
export const PHI_WIDTH = 3;

/** E is frozen across reconciliation steps in this study. */
export const E_FROZEN = true;

/** rho is frozen (grid-searched once per reconcile, not adapted online) in this study. */
export const RHO_FROZEN = true;

/** Number of alpha grid steps in Delta-Reconcile. */
export const ALPHA_STEPS = 64;

/** Holographic feedback loop direction, verbatim. */
export const LOOP = 'PARTS↔WHOLE↔PARTS';

/** Canonical pipeline stage names, in order. */
export const PIPELINE_STAGES = Object.freeze([
  'Explore',
  'Organize',
  'Contain',
  'Reconcile',
  'Verify',
  'Commit',
]);

/** Voice tiers used to qualify claims on every report surface. */
export const VOICE_TIERS = Object.freeze(['mythic', 'operational', 'verified']);
