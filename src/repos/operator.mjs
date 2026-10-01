// NSPFRP: Single source of truth for FractiOS repo operator routing and proposal emission.
//
// FractiOS — Holographic Homeostasis Firmware Layer
// Voice tier of this file: operational. Honesty boundary (constants.HONESTY_BOUNDARY)
// applies: this is catalog engineering, not finished physics; Phi_EGS is design grammar;
// RSI is not solved. Correlation != causation.
//
// Fail-closed: unknown ops/nodes return { success: false } with a loud error; structural
// failures (missing/invalid manifest) throw. Nothing is ever written outside the FractiOS
// base directory. Zero runtime dependencies.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { canonicalJson, sha256hex } from '../kernel/state.mjs';
import { REGISTRY_ID, HONESTY_BOUNDARY } from '../constants.mjs';
import { BASE_DIR, MANIFEST_PATH, loadManifest, localSummaries } from './registry.mjs';

/** The only directory proposals are ever written to: under the FractiOS base dir. */
export const PROPOSAL_LOG_PATH = join(BASE_DIR, 'data', 'explorations', 'proposals.jsonl');

/** Ops this operator routes. Anything else is fail-closed. */
export const OPS = ['read', 'index', 'measure', 'propose'];

/**
 * Route an operator op against a manifest node. Read-only ops never touch the disk
 * beyond loading the manifest; `propose` writes a Seed:Edge proposal — but only under
 * the FractiOS base directory (PROPOSAL_LOG_PATH). Unknown op or unknown node:
 * fail-closed { success: false, error }.
 *
 * @param {'read'|'index'|'measure'|'propose'} op - Operator op name.
 * @param {string} nodeName - Manifest node name (must exist in the registry manifest).
 * @param {object} [payload] - Op payload (required for 'measure' and 'propose').
 * @returns {{success: boolean, op: string, node?: string, [k: string]: unknown}} envelope
 */
export function route(op, nodeName, payload) {
  if (typeof op !== 'string' || !OPS.includes(op)) {
    return { success: false, op, node: nodeName, error: `unknown op "${String(op)}"; known ops: ${OPS.join(', ')}` };
  }
  if (typeof nodeName !== 'string' || nodeName.length === 0) {
    return { success: false, op, node: nodeName, error: 'nodeName must be a non-empty string' };
  }

  // Fail-closed: manifest must load and the node must exist; otherwise throw loudly.
  const manifest = loadManifest(MANIFEST_PATH);
  if (manifest.registryId !== REGISTRY_ID) {
    throw new Error(`route: manifest registryId "${manifest.registryId}" does not match constants REGISTRY_ID "${REGISTRY_ID}"`);
  }
  const node = manifest.nodes.find((n) => n.name === nodeName);
  if (!node) {
    throw new Error(`route: unknown node "${nodeName}" in registry ${manifest.registryId}`);
  }

  switch (op) {
    case 'read': {
      // Returns the manifest node record as the source of truth.
      return { success: true, op, node: nodeName, record: node, registryId: manifest.registryId, docId: manifest.docId };
    }
    case 'index': {
      // Node catalog summary — one local view of the whole (holographic distribution).
      const summary = localSummaries(manifest).find((s) => s.name === nodeName);
      return { success: true, op, node: nodeName, summary: summary.summary, registryId: manifest.registryId };
    }
    case 'measure': {
      // Metrics record with integrity hash over the canonical JSON of the payload.
      if (payload === null || typeof payload !== 'object') {
        throw new Error(`route: 'measure' requires an object payload for node "${nodeName}"`);
      }
      const integrityHash = sha256hex(canonicalJson(payload));
      return { success: true, op, node: nodeName, record: { node: nodeName, payload, integrityHash } };
    }
    case 'propose': {
      // Builds a candidate change object and returns a Seed:Edge-formatted proposal.
      // The proposal is journaled under <base>/data/explorations/ and nowhere else.
      if (payload === null || typeof payload !== 'object') {
        throw new Error(`route: 'propose' requires an object payload for node "${nodeName}"`);
      }
      const proposal = makeProposal(manifest, node, payload);
      appendProposal(proposal);
      return { success: true, op, node: nodeName, proposal, honestyBoundary: HONESTY_BOUNDARY, voiceTier: 'operational' };
    }
    default: {
      // Unreachable given OPS guard; kept fail-closed.
      return { success: false, op, node: nodeName, error: 'unroutable op' };
    }
  }
}

/**
 * Build a Seed:Edge proposal for a node. Shape per NSPFRNP seed:edge op format:
 * { seed: { octave, value, type }, edge: { location, state, property }, protocol, status }.
 * Deterministic: identity derives from sha256 of canonical JSON — no wall-clock in the
 * computation path (the journal line carries an emission timestamp only).
 *
 * @param {object} manifest - Loaded registry manifest.
 * @param {object} node - Target manifest node.
 * @param {object} payload - Candidate change payload.
 * @returns {{proposalId: string, registryId: string, docId: string, node: string, seed: {octave: number, value: number, type: string}, edge: {location: string, state: string, property: object}, protocol: string, status: string, candidate: object, honestyBoundary: string, voiceTier: string}}
 */
function makeProposal(manifest, node, payload) {
  const candidate = { node: node.name, change: payload };
  const proposalId = sha256hex(canonicalJson(candidate));
  return {
    proposalId,
    registryId: manifest.registryId,
    docId: manifest.docId,
    node: node.name,
    seed: { octave: node.octave, value: 0, type: 'origin' },
    edge: { location: node.repo, state: node.state, property: payload },
    protocol: 'nspfrnp',
    status: 'open',
    candidate,
    honestyBoundary: HONESTY_BOUNDARY,
    voiceTier: 'operational',
  };
}

/**
 * Journal a proposal to PROPOSAL_LOG_PATH (JSON Lines). Creates the directory on demand.
 * This is the ONLY filesystem write this module performs, and the path is rooted at the
 * FractiOS base directory by construction. Write errors propagate (fail-closed).
 *
 * @param {object} proposal - Proposal object from makeProposal.
 * @returns {void}
 */
function appendProposal(proposal) {
  mkdirSync(join(PROPOSAL_LOG_PATH, '..'), { recursive: true });
  const line = JSON.stringify({ ...proposal, emittedAt: new Date().toISOString() });
  writeFileSync(PROPOSAL_LOG_PATH, line + '\n', { flag: 'a' });
}
