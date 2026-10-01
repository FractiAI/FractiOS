#!/usr/bin/env node
// NSPFRP: Single source of truth for the FractiOS zero-dependency operator HTTP server.
//
// FractiOS — Holographic Homeostasis Firmware Layer (web surface).
// Honesty boundary (voice tier: operational): this is catalog engineering, not
// finished physics. Phi_EGS is a design grammar (catalog nesting), not a
// physics constant. RSI is NOT solved here. Correlation is not causation.
//
// Routes (every API response is a JSON envelope {success, ...}; fail-closed):
//   GET  /                    -> interfaces/operator-console.html (text/html)
//   GET  /api/status          -> boot-shape record + nodeCount from the manifest
//   GET  /api/repos           -> { nodes, validation } against the vault root
//   GET  /api/repos/<name>    -> single manifest node or 404 {success:false}
//   GET  /api/explorations    -> { last, journalTail (last 20 journal lines) }
//   GET  /api/experiments     -> data/empirical_report.json if present, else the
//                               E1..E9 suite run in-process
//   POST /api/explore         -> runPipeline over the current canonical state;
//                                persists under data/explorations/ ONLY
//   POST /api/regulate        -> regulate(localSummaries(manifest) nodes, perturbation)
//
// Security posture: binds 127.0.0.1 only; never serves or writes outside the
// FractiOS base dir (path traversal fails closed); POST writes land only under
// data/explorations/. Zero runtime dependencies (node:http/node:fs/node:path).

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  DOC_ID, REGISTRY_ID, STUDY_TITLE, OPERATOR, AUDIT_PROTOCOL, HONESTY_BOUNDARY,
  RCR_MIN, B_MAX, E_MIN, UCR_FLOOR, D_LOW, D_COLLAPSE, PHI_DEPTH, PHI_WIDTH,
  E_FROZEN, RHO_FROZEN, ALPHA_STEPS, LOOP, PIPELINE_STAGES, VOICE_TIERS, PHI_EGS,
} from '../constants.mjs';
import { makeState } from '../kernel/state.mjs';
import { runPipeline } from '../kernel/pipeline.mjs';
import { regulate } from '../kernel/regulator.mjs';
import {
  loadManifest, validateAgainstDisk, localSummaries,
  BASE_DIR as REGISTRY_BASE_DIR, MANIFEST_PATH as REGISTRY_MANIFEST_PATH,
} from '../repos/registry.mjs';

const BASE_DIR = REGISTRY_BASE_DIR;
const DATA_DIR = path.join(BASE_DIR, 'data');
const EXPLORATIONS_DIR = path.join(DATA_DIR, 'explorations');
const LAST_EXPLORATION_PATH = path.join(EXPLORATIONS_DIR, 'last_exploration.json');
const JOURNAL_PATH = path.join(EXPLORATIONS_DIR, 'journal.jsonl');
const CANONICAL_PATH = path.join(DATA_DIR, 'canonical.json');
const REPORT_JSON_PATH = path.join(DATA_DIR, 'empirical_report.json');
const CONSOLE_PATH = path.join(BASE_DIR, 'interfaces', 'operator-console.html');
const MANIFEST_PATH = process.env.FRACTIOS_MANIFEST ?? REGISTRY_MANIFEST_PATH;
const VAULT_ROOT = process.env.FRACTIOS_VAULT ?? '/Volumes/GitVault/Username/FractiAI';

const DEFAULT_PORT = 8181;
const MAX_BODY_BYTES = 1_048_576;
const JOURNAL_TAIL_LINES = 20;

/** Delta-Reconcile thresholds consumed by runPipeline (from constants.mjs, never copied). */
const THRESHOLDS = { dLow: D_LOW, dCollapse: D_COLLAPSE };

/** @returns {Record<string, unknown>} standard failure envelope */
function fail(error) {
  return { success: false, error: String(error?.message ?? error) };
}

/**
 * Resolve a path strictly inside the FractiOS base dir; fail-closed on traversal.
 * @param {...string} segments
 * @returns {string}
 */
function safeJoin(...segments) {
  const target = path.resolve(BASE_DIR, ...segments);
  const rel = path.relative(BASE_DIR, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`path traversal rejected: '${path.join(...segments)}' escapes the FractiOS base dir`);
  }
  return target;
}

/** Loads the repo manifest; fail-closed on missing file or invalid schema. */
function manifestOrThrow() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`manifest not found at ${MANIFEST_PATH} (set FRACTIOS_MANIFEST to override)`);
  }
  return loadManifest(MANIFEST_PATH);
}

/**
 * Current canonical state: data/canonical.json when present (integrity-checked
 * against its own sha256 address), else the Seed:Edge origin arm.
 * @returns {ReturnType<typeof makeState>}
 */
function canonicalOrThrow() {
  if (!fs.existsSync(CANONICAL_PATH)) {
    return makeState({ seed: { octave: 0, value: 0, type: 'origin' } });
  }
  const loaded = JSON.parse(fs.readFileSync(CANONICAL_PATH, 'utf8'));
  if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded) || !loaded.values || typeof loaded.values !== 'object') {
    throw new Error(`canonical state at ${CANONICAL_PATH} must be an object carrying a values object`);
  }
  const state = makeState(loaded.values);
  if (typeof loaded.address === 'string' && loaded.address.length > 0 && loaded.address !== state.address) {
    throw new Error(`canonical state integrity failure: ${CANONICAL_PATH} address ${loaded.address} != recomputed ${state.address}`);
  }
  return state;
}

/** @returns {Record<string, unknown>} boot-shape status envelope + nodeCount */
function statusEnvelope() {
  const manifest = manifestOrThrow();
  return {
    success: true,
    command: 'status',
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    studyTitle: STUDY_TITLE,
    operator: OPERATOR,
    auditProtocol: AUDIT_PROTOCOL,
    honestyBoundary: HONESTY_BOUNDARY,
    stages: PIPELINE_STAGES,
    loop: LOOP,
    voiceTiers: VOICE_TIERS,
    constants: { PHI_EGS, PHI_DEPTH, PHI_WIDTH, RCR_MIN, B_MAX, E_MIN, UCR_FLOOR, D_LOW, D_COLLAPSE, ALPHA_STEPS, E_FROZEN, RHO_FROZEN },
    nodeCount: manifest.nodes.length,
  };
}

/** @returns {Record<string, unknown>} estate manifest + disk validation envelope */
function handleRepos() {
  const manifest = manifestOrThrow();
  const validation = validateAgainstDisk(manifest, VAULT_ROOT);
  return {
    success: true,
    command: 'repos',
    manifestPath: MANIFEST_PATH,
    vaultRoot: VAULT_ROOT,
    nodeCount: manifest.nodes.length,
    nodes: manifest.nodes,
    validation,
  };
}

/**
 * @param {string} name decoded manifest node name
 * @returns {{status: number, body: Record<string, unknown>}}
 */
function handleRepo(name) {
  const manifest = manifestOrThrow();
  const node = manifest.nodes.find((candidate) => candidate.name === name);
  if (!node) {
    return { status: 404, body: fail(`repo '${name}' is not in the manifest (see GET /api/repos for the ${manifest.nodes.length}-node registry)`) };
  }
  return { status: 200, body: { success: true, command: 'repos', node } };
}

/** @returns {Record<string, unknown>} last exploration + journal tail envelope */
function handleExplorations() {
  let last = null;
  if (fs.existsSync(LAST_EXPLORATION_PATH)) {
    last = JSON.parse(fs.readFileSync(LAST_EXPLORATION_PATH, 'utf8'));
  }
  const journalTail = [];
  if (fs.existsSync(JOURNAL_PATH)) {
    const lines = fs.readFileSync(JOURNAL_PATH, 'utf8').split('\n').filter((line) => line.trim().length > 0);
    for (const line of lines.slice(-JOURNAL_TAIL_LINES)) {
      try {
        journalTail.push(JSON.parse(line));
      } catch (err) {
        journalTail.push({ raw: line, parseError: String(err?.message ?? err) });
      }
    }
  }
  return { success: true, command: 'explorations', last, journalTailCount: journalTail.length, journalTail };
}

/** @returns {Promise<Record<string, unknown>>} empirical report (disk) or in-process run */
async function handleExperiments() {
  if (fs.existsSync(REPORT_JSON_PATH)) {
    const report = JSON.parse(fs.readFileSync(REPORT_JSON_PATH, 'utf8'));
    return { success: true, command: 'experiments', source: 'disk', reportPath: REPORT_JSON_PATH, report };
  }
  const { EXPERIMENTS } = await import('../../experiments/experiments.mjs');
  const results = {
    n_total: EXPERIMENTS.length,
    n_pass: EXPERIMENTS.filter((experiment) => experiment.pass).length,
    all_pass: EXPERIMENTS.every((experiment) => experiment.pass),
    failed: EXPERIMENTS.filter((experiment) => !experiment.pass).map((experiment) => experiment.id),
  };
  const report = {
    studyTitle: STUDY_TITLE,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    operator: OPERATOR,
    generatedAt: new Date().toISOString(),
    honestyBoundary: HONESTY_BOUNDARY,
    results,
    experiments: EXPERIMENTS,
  };
  return { success: true, command: 'experiments', source: 'in-process', reportPath: null, report };
}

/**
 * Runs the canonical pipeline for a {candidate} body and persists the exploration
 * record + journal line under data/explorations/ (same record shapes the CLI writes).
 * @param {unknown} body parsed request body
 * @returns {Record<string, unknown>}
 */
function handleExplore(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('explore requires a JSON object body {candidate: {...}}');
  }
  const candidate = body.candidate;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new Error('explore requires body.candidate to be a plain JSON object');
  }
  const canonical = canonicalOrThrow();
  const result = runPipeline({ canonical, candidate, control: undefined, thresholds: THRESHOLDS });
  const recordedAt = new Date().toISOString();
  const record = {
    recordedAt,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    honestyBoundary: HONESTY_BOUNDARY,
    canonical: {
      values: result.commit.canonical?.values ?? canonical.values,
      address: result.commit.canonical?.address ?? canonical.address,
    },
    candidate,
    result,
  };
  fs.mkdirSync(EXPLORATIONS_DIR, { recursive: true });
  fs.writeFileSync(LAST_EXPLORATION_PATH, `${JSON.stringify(record, null, 2)}\n`);
  const journalLine = {
    recordedAt,
    address: result.commit.canonical?.address ?? canonical.address,
    reason: result.commit.reason,
    journal: result.commit.journal,
  };
  fs.appendFileSync(JOURNAL_PATH, `${JSON.stringify(journalLine)}\n`);
  return {
    success: true,
    command: 'explore',
    recordedAt,
    result,
    explorationRecordPath: LAST_EXPLORATION_PATH,
    journalPath: JOURNAL_PATH,
  };
}

/**
 * @param {unknown} body parsed request body
 * @returns {Record<string, unknown>} regulate outcome over the holographic summaries
 */
function handleRegulate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('regulate requires a JSON object body {type, magnitude, targets?}');
  }
  const perturbation = { type: body.type, magnitude: body.magnitude, targets: body.targets };
  const manifest = manifestOrThrow();
  const nodes = localSummaries(manifest).map((summary) => ({ name: summary.name, local: summary.summary }));
  const outcome = regulate(nodes, perturbation);
  return { success: true, command: 'regulate', ...outcome };
}

/** @returns {{body: Buffer, contentType: string}} the single-file operator console */
function serveConsole() {
  const consolePath = safeJoin('interfaces', 'operator-console.html');
  if (!fs.existsSync(consolePath)) {
    throw new Error(`operator console missing at ${consolePath}`);
  }
  return { body: fs.readFileSync(consolePath), contentType: 'text/html; charset=utf-8' };
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {unknown} payload
 */
function sendJson(res, status, payload) {
  if (res.writableEnded || res.destroyed) return;
  try {
    const body = `${JSON.stringify(payload, null, 2)}\n`;
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(body),
      'cache-control': 'no-store',
    });
    res.end(body);
  } catch {
    // socket already gone (client abort / destroyed) — nothing left to fail into
  }
}

/**
 * Reads and parses a JSON request body; fail-closed over size/parse errors.
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<unknown>}
 */
function readJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    /** @type {Buffer[]} */
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        rejectBody(new Error(`request body exceeds ${MAX_BODY_BYTES} bytes`));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      if (text.trim().length === 0) {
        rejectBody(new Error('request body required (JSON)'));
        return;
      }
      try {
        resolveBody(JSON.parse(text));
      } catch (err) {
        rejectBody(new Error(`request body is not valid JSON: ${String(err?.message ?? err)}`));
      }
    });
    req.on('error', rejectBody);
  });
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @returns {Promise<void>}
 */
async function handle(req, res) {
  let route;
  try {
    route = new URL(req.url ?? '/', 'http://127.0.0.1');
  } catch (err) {
    sendJson(res, 400, fail(`malformed request URL: ${String(err?.message ?? err)}`));
    return;
  }
  const segments = route.pathname.split('/').filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });

  try {
    if (req.method === 'GET' && segments.length === 0) {
      const { body, contentType } = serveConsole();
      res.writeHead(200, {
        'content-type': contentType,
        'content-length': Buffer.byteLength(body),
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      });
      res.end(body);
      return;
    }

    if (segments[0] !== 'api') {
      sendJson(res, 404, fail(`not found: ${req.method} ${route.pathname} (operator console at /, API under /api/)`));
      return;
    }

    const rest = segments.slice(1);
    if (req.method === 'GET' && rest.length === 1 && rest[0] === 'status') {
      sendJson(res, 200, statusEnvelope());
      return;
    }
    if (req.method === 'GET' && rest.length === 1 && rest[0] === 'repos') {
      sendJson(res, 200, handleRepos());
      return;
    }
    if (req.method === 'GET' && rest.length === 2 && rest[0] === 'repos') {
      const { status, body } = handleRepo(rest[1]);
      sendJson(res, status, body);
      return;
    }
    if (req.method === 'GET' && rest.length === 1 && rest[0] === 'explorations') {
      sendJson(res, 200, handleExplorations());
      return;
    }
    if (req.method === 'GET' && rest.length === 1 && rest[0] === 'experiments') {
      sendJson(res, 200, await handleExperiments());
      return;
    }
    if (req.method === 'POST' && rest.length === 1 && rest[0] === 'explore') {
      const body = await readJsonBody(req);
      sendJson(res, 200, handleExplore(body));
      return;
    }
    if (req.method === 'GET' && rest.length === 1 && (rest[0] === 'explore' || rest[0] === 'regulate')) {
      sendJson(res, 405, fail(`route /api/${rest[0]} accepts POST only`));
      return;
    }
    if (req.method === 'POST' && rest.length === 1 && rest[0] === 'regulate') {
      const body = await readJsonBody(req);
      sendJson(res, 200, handleRegulate(body));
      return;
    }
    sendJson(res, 404, fail(`no route: ${req.method} /api/${rest.join('/')}`));
  } catch (err) {
    sendJson(res, 500, fail(err));
  }
}

/**
 * Create the bound loopback server.
 *
 * @param {{port?: number}} [options]
 * @returns {{
 *   server: import('node:http').Server,
 *   port: number,
 *   ready: Promise<number>,
 *   close: () => Promise<void>,
 * }} port is the bound port (readable before and after listening); ready
 * resolves with the bound port and rejects fail-closed on listen errors.
 */
export function createServer({ port = DEFAULT_PORT } = {}) {
  const requestedPort = Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => sendJson(res, 500, fail(err)));
  });

  let boundPort = requestedPort;
  const ready = new Promise((resolveReady, rejectReady) => {
    server.once('listening', () => {
      const address = server.address();
      boundPort = address && typeof address === 'object' ? address.port : requestedPort;
      resolveReady(boundPort);
    });
    server.once('error', rejectReady);
  });
  server.listen(requestedPort, '127.0.0.1');

  return {
    server,
    get port() {
      return boundPort;
    },
    ready,
    close: () => new Promise((resolveClose, rejectClose) => {
      server.close((err) => (err ? rejectClose(err) : resolveClose()));
    }),
  };
}

/**
 * Start the server when this module is invoked directly
 * (`node src/web/server.mjs`), printing the boot envelope to stdout.
 * @returns {ReturnType<typeof createServer> | null} instance when started
 */
export function startIfMain() {
  const invoked = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
  if (invoked !== import.meta.url) return null;
  const envPort = Number.parseInt(process.env.FRACTIOS_PORT ?? '', 10);
  const instance = createServer({ port: Number.isInteger(envPort) && envPort > 0 ? envPort : DEFAULT_PORT });
  instance.ready
    .then((boundPort) => {
      process.stdout.write(`${JSON.stringify({
        success: true,
        command: 'serve',
        url: `http://127.0.0.1:${boundPort}`,
        honestyBoundary: HONESTY_BOUNDARY,
      }, null, 2)}\n`);
    })
    .catch((err) => {
      process.stdout.write(`${JSON.stringify(fail(err), null, 2)}\n`);
      process.exitCode = 1;
    });
  return instance;
}

startIfMain();