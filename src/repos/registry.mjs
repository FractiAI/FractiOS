// NSPFRP: Single source of truth for FractiOS repo registry manifest loading and validation.
//
// FractiOS — Holographic Homeostasis Firmware Layer
// Voice tier of this file: operational. Honesty boundary (constants.HONESTY_BOUNDARY)
// applies: this is catalog engineering, not finished physics; Phi_EGS is design grammar;
// RSI is not solved. Correlation != causation.
//
// Fail-closed: manifest loading and disk validation throw loudly on missing or invalid
// schema rather than returning partial data. Zero runtime dependencies.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Absolute path to this module's directory (<base>/src/repos). */
const HERE = dirname(fileURLToPath(import.meta.url));

/** Absolute path to the FractiOS base directory. */
export const BASE_DIR = resolve(HERE, '..', '..');

/** Absolute path to the authoritative registry manifest. */
export const MANIFEST_PATH = join(HERE, 'manifest.json');

/** Absolute path to the FractiAI vault root this registry mirrors. */
export const VAULT_ROOT = '/Volumes/GitVault/Username/FractiAI';

/** Required top-level manifest schema. */
export const MANIFEST_SCHEMA = 'fractios-repos/v1';

/** Required string fields on every manifest node. */
const NODE_STRING_FIELDS = ['name', 'repo', 'path', 'branch', 'state', 'category', 'description', 'access'];

/**
 * Load and validate the repo registry manifest. Fail-closed: throws on missing file,
 * wrong schema id, or any structurally invalid node. Never returns partial data.
 *
 * @param {string} path - Filesystem path to a manifest.json.
 * @returns {{schema: string, registryId: string, docId: string, generatedFrom: string,
 *   nodes: Array<{name: string, repo: string, path: string, branch: string, state: string,
 *   category: string, description: string, access: string, octave: number}>}} manifest
 */
export function loadManifest(path) {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error('loadManifest: path must be a non-empty string');
  }
  const raw = (() => {
    try {
      return readFileSync(path, 'utf8');
    } catch (err) {
      throw new Error(`loadManifest: cannot read manifest at ${path}: ${err.message}`);
    }
  })();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`loadManifest: manifest at ${path} is not valid JSON: ${err.message}`);
  }

  assertManifestShape(parsed, path);
  return parsed;
}

/**
 * Validate the manifest against the vault on disk (read-only; never mutates vault repos).
 * present: manifest nodes whose directory exists under vaultRoot.
 * missing: manifest nodes whose directory does not exist.
 * extra:   directories under vaultRoot (non-hidden) not listed in the manifest, excluding
 *          the FractiOS base directory itself (it lives inside the vault root by design).
 *
 * @param {ReturnType<loadManifest>} manifest - Validated manifest object.
 * @param {string} vaultRoot - Vault root directory (e.g. /Volumes/GitVault/Username/FractiAI).
 * @returns {{present: string[], missing: string[], extra: string[], ok: boolean}}
 */
export function validateAgainstDisk(manifest, vaultRoot) {
  assertManifestShape(manifest, '<in-memory manifest>');
  if (typeof vaultRoot !== 'string' || vaultRoot.length === 0) {
    throw new Error('validateAgainstDisk: vaultRoot must be a non-empty string');
  }
  if (!existsSync(vaultRoot) || !statSync(vaultRoot).isDirectory()) {
    throw new Error(`validateAgainstDisk: vaultRoot is not a directory: ${vaultRoot}`);
  }

  const listed = new Set(manifest.nodes.map((n) => n.name));
  const present = [];
  const missing = [];

  for (const node of manifest.nodes) {
    // Prefer the node's own absolute path when it lives under vaultRoot; else join name.
    const nodeDir = isAbsolute(node.path) && node.path.startsWith(vaultRoot + '/')
      ? node.path
      : join(vaultRoot, node.name);
    if (existsSync(nodeDir) && statSync(nodeDir).isDirectory()) {
      present.push(node.name);
    } else {
      missing.push(node.name);
    }
  }

  const extra = [];
  for (const entry of readdirSync(vaultRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    // The FractiOS firmware layer itself lives inside the vault root but is not a
    // mirrored repo; it is never "extra". Presence of the 57 nodes stays strict.
    if (resolve(vaultRoot, entry.name) === BASE_DIR) continue;
    if (!listed.has(entry.name)) extra.push(entry.name);
  }
  extra.sort();

  return { present, missing, extra, ok: missing.length === 0 && extra.length === 0 };
}

/**
 * Holographic distribution: every node carries a usable summary of the whole.
 * globalPointer is the canonical repo pointer (GitHub coordinates) for the node.
 *
 * @param {ReturnType<loadManifest>} manifest - Validated manifest object.
 * @returns {Array<{name: string, summary: {category: string, state: string, branch: string, globalPointer: string}}>}
 */
export function localSummaries(manifest) {
  assertManifestShape(manifest, '<in-memory manifest>');
  return manifest.nodes.map((node) => ({
    name: node.name,
    summary: {
      category: node.category,
      state: node.state,
      branch: node.branch,
      globalPointer: node.repo,
    },
  }));
}

/** Internal: strict structural validation; throws with precise reason. */
function assertManifestShape(m, source) {
  if (m === null || typeof m !== 'object' || Array.isArray(m)) {
    throw new Error(`loadManifest: manifest at ${source} must be an object`);
  }
  if (m.schema !== MANIFEST_SCHEMA) {
    throw new Error(`loadManifest: manifest at ${source} has schema "${m.schema}", expected "${MANIFEST_SCHEMA}"`);
  }
  for (const f of ['registryId', 'docId', 'generatedFrom']) {
    if (typeof m[f] !== 'string' || m[f].length === 0) {
      throw new Error(`loadManifest: manifest at ${source} missing non-empty string field "${f}"`);
    }
  }
  if (!Array.isArray(m.nodes) || m.nodes.length === 0) {
    throw new Error(`loadManifest: manifest at ${source} must have a non-empty "nodes" array`);
  }
  const seen = new Set();
  const octaves = new Set();
  m.nodes.forEach((node, i) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) {
      throw new Error(`loadManifest: manifest at ${source} node[${i}] is not an object`);
    }
    for (const f of NODE_STRING_FIELDS) {
      if (typeof node[f] !== 'string') {
        throw new Error(`loadManifest: manifest at ${source} node[${i}] ("${node.name ?? '?'}") missing string field "${f}"`);
      }
    }
    if (!Number.isInteger(node.octave) || node.octave < 1 || node.octave > 99) {
      throw new Error(`loadManifest: manifest at ${source} node[${i}] ("${node.name}") octave must be integer in [1,99]`);
    }
    if (seen.has(node.name)) {
      throw new Error(`loadManifest: manifest at ${source} has duplicate node name "${node.name}"`);
    }
    seen.add(node.name);
    if (octaves.has(node.octave)) {
      throw new Error(`loadManifest: manifest at ${source} has duplicate octave ${node.octave} (node "${node.name}")`);
    }
    octaves.add(node.octave);
  });
}
