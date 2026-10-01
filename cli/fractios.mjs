#!/usr/bin/env node
// NSPFRP: Single source of truth for the FractiOS command-line interface.
//
// FractiOS — Holographic Homeostasis Firmware Layer (CLI).
// Honesty boundary (voice tier: operational): this is catalog engineering, not
// finished physics. Phi_EGS is a design grammar (catalog nesting), not a
// physics constant. RSI is NOT solved here. Correlation is not causation.
//
// Subcommands: boot, status, explore <file|json>, reconcile, verify, commit,
//              repos list|check, regulate <perturbation-json>, serve [--port N]
// Every response is a JSON envelope {success, ...}; nonzero exit on failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID, REGISTRY_ID, STUDY_TITLE, OPERATOR, AUDIT_PROTOCOL, HONESTY_BOUNDARY,
  RCR_MIN, B_MAX, E_MIN, UCR_FLOOR, D_LOW, D_COLLAPSE, PHI_DEPTH, PHI_WIDTH,
  E_FROZEN, RHO_FROZEN, ALPHA_STEPS, LOOP, PIPELINE_STAGES, VOICE_TIERS, PHI_EGS,
} from '../src/constants.mjs';
import { makeState, delta, applyDelta, invertDelta } from '../src/kernel/state.mjs';
import { threeAxis } from '../src/kernel/metrics.mjs';
import { runPipeline } from '../src/kernel/pipeline.mjs';
import { regulate } from '../src/kernel/regulator.mjs';
import { loadManifest, validateAgainstDisk, localSummaries, MANIFEST_PATH as REGISTRY_MANIFEST_PATH } from '../src/repos/registry.mjs';
import { route, PROPOSAL_LOG_PATH } from '../src/repos/operator.mjs';
import { createServer } from '../src/web/server.mjs';

const BASE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(BASE_DIR, 'data');
const EXPLORATIONS_DIR = path.join(DATA_DIR, 'explorations');
const LAST_EXPLORATION_PATH = path.join(EXPLORATIONS_DIR, 'last_exploration.json');
const CANONICAL_PATH = path.join(DATA_DIR, 'canonical.json');
const JOURNAL_PATH = path.join(EXPLORATIONS_DIR, 'journal.jsonl');
const MANIFEST_PATH = process.env.FRACTIOS_MANIFEST ?? REGISTRY_MANIFEST_PATH;
const VAULT_ROOT = process.env.FRACTIOS_VAULT ?? '/Volumes/GitVault/Username/FractiAI';

// Control A stand-in for the three-axis Goldilocks gate: the threshold vector
// itself (operational voice; strictly worse arm is defined by RCR_MIN/B_MAX/E_MIN).
const CONTROL_A = { rcr: RCR_MIN, b: B_MAX, e: E_MIN };
const THRESHOLDS = { rcrMin: RCR_MIN, bMax: B_MAX, eMin: E_MIN, ucrFloor: UCR_FLOOR };

/** @returns {Record<string, unknown>} standard failure envelope */
function fail(error) {
  return { success: false, error: String(error?.message ?? error) };
}

/** @returns {string} canonical origin seed state for the FractiOS boot record */
function canonicalOrigin() {
  return makeState({ seed: { octave: 0, value: 0, type: 'origin' } });
}

/** Loads the repo manifest; fail-closed on missing/invalid schema. */
function manifestOrThrow() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`manifest not found at ${MANIFEST_PATH} (set FRACTIOS_MANIFEST to override)`);
  }
  return loadManifest(MANIFEST_PATH);
}

/** Runs the full pipeline for a plain-object candidate payload. */
function runForCandidate(candidatePayload) {
  const canonical = canonicalOrigin();
  const candidate = makeState(candidatePayload);
  return runPipeline({ canonical, candidate, control: CONTROL_A, thresholds: THRESHOLDS });
}

/** Persists an exploration record under data/explorations/ (fail-loud). */
function persistExploration(record) {
  fs.mkdirSync(EXPLORATIONS_DIR, { recursive: true });
  fs.writeFileSync(LAST_EXPLORATION_PATH, `${JSON.stringify(record, null, 2)}\n`);
}

/** Loads the last exploration record; fail-closed when absent. */
function lastExplorationOrThrow() {
  if (!fs.existsSync(LAST_EXPLORATION_PATH)) {
    throw new Error(`no exploration record at ${LAST_EXPLORATION_PATH}; run 'explore' first`);
  }
  return JSON.parse(fs.readFileSync(LAST_EXPLORATION_PATH, 'utf8'));
}

/** @returns {{cmd: string, args: string[]}} parsed argv */
function parseArgv() {
  const [, , cmd, ...args] = process.argv;
  return { cmd: cmd ?? '', args };
}

/** Parses a candidate argument that is a file path or an inline JSON string. */
function parseCandidateArg(arg) {
  if (arg === undefined || arg === '') throw new Error('explore requires <file|json>');
  const trimmed = arg.trim();
  const asPath = path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
  if (fs.existsSync(asPath) && fs.statSync(asPath).isFile()) {
    return JSON.parse(fs.readFileSync(asPath, 'utf8'));
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`argument is neither a readable file nor valid JSON: ${arg}`);
  }
}

function cmdBoot() {
  return {
    success: true,
    command: 'boot',
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
  };
}

function cmdStatus() {
  const manifest = manifestOrThrow();
  const names = Array.isArray(manifest?.nodes) ? manifest.nodes.map((n) => n?.name).filter(Boolean) : [];
  return {
    success: true,
    command: 'status',
    registryId: REGISTRY_ID,
    docId: DOC_ID,
    manifestPath: MANIFEST_PATH,
    manifestNodeCount: names.length,
    manifestNodes: names,
    pipelineStages: PIPELINE_STAGES,
    loop: LOOP,
    honestyBoundary: HONESTY_BOUNDARY,
    voiceTiers: VOICE_TIERS,
    thresholds: { rcrMin: RCR_MIN, bMax: B_MAX, eMin: E_MIN, ucrFloor: UCR_FLOOR, dLow: D_LOW, dCollapse: D_COLLAPSE },
    frozen: { E_FROZEN, RHO_FROZEN, ALPHA_STEPS },
    explorationsDir: EXPLORATIONS_DIR,
    proposalLogPath: PROPOSAL_LOG_PATH,
  };
}

function cmdExplore(arg) {
  const candidatePayload = parseCandidateArg(arg);
  const result = runForCandidate(candidatePayload);
  const record = {
    recordedAt: new Date().toISOString(),
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    honestyBoundary: HONESTY_BOUNDARY,
    canonical: { values: result.commit.canonical?.values ?? canonicalOrigin().values, address: result.commit.canonical?.address ?? canonicalOrigin().address },
    candidate: candidatePayload,
    result,
  };
  persistExploration(record);
  return {
    success: true,
    command: 'explore',
    recordedAt: record.recordedAt,
    reconcile: result.reconcile,
    verify: result.verify,
    commit: result.commit,
    explorationRecordPath: LAST_EXPLORATION_PATH,
  };
}

function cmdReconcile() {
  const record = lastExplorationOrThrow();
  return { success: true, command: 'reconcile', reconcile: record.result?.reconcile ?? null, explorationRecordPath: LAST_EXPLORATION_PATH };
}

function cmdVerify() {
  const record = lastExplorationOrThrow();
  return { success: true, command: 'verify', verify: record.result?.verify ?? null, explorationRecordPath: LAST_EXPLORATION_PATH };
}

function cmdCommit() {
  const record = lastExplorationOrThrow();
  const commit = record.result?.commit;
  if (!commit) throw new Error('last exploration record carries no commit stage; re-run explore');
  if (commit.committed) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CANONICAL_PATH, `${JSON.stringify({ address: commit.canonical.address, values: commit.canonical.values }, null, 2)}\n`);
    fs.mkdirSync(EXPLORATIONS_DIR, { recursive: true });
    fs.appendFileSync(JOURNAL_PATH, `${JSON.stringify({ recordedAt: new Date().toISOString(), address: commit.canonical.address, reason: commit.reason, journal: commit.journal })}\n`);
  }
  return { success: true, command: 'commit', committed: commit.committed, reason: commit.reason, canonical: commit.canonical, journal: commit.journal };
}

function cmdReposList() {
  const manifest = manifestOrThrow();
  const summaries = localSummaries(manifest);
  return { success: true, command: 'repos', subcommand: 'list', manifestPath: MANIFEST_PATH, nodeCount: summaries.length, repos: summaries };
}

function cmdReposCheck() {
  const manifest = manifestOrThrow();
  const check = validateAgainstDisk(manifest, VAULT_ROOT);
  return { success: true, command: 'repos', subcommand: 'check', vaultRoot: VAULT_ROOT, ...check };
}

function cmdRegulate(arg) {
  if (arg === undefined || arg === '') throw new Error('regulate requires <perturbation-json|file>');
  let perturbation;
  const trimmed = arg.trim();
  const asPath = path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
  if (fs.existsSync(asPath) && fs.statSync(asPath).isFile()) {
    perturbation = JSON.parse(fs.readFileSync(asPath, 'utf8'));
  } else {
    perturbation = JSON.parse(trimmed);
  }
  const manifest = manifestOrThrow();
  const nodes = localSummaries(manifest).map((s) => ({ name: s.name, local: s.summary }));
  const outcome = regulate(nodes, perturbation);
  return { success: true, command: 'regulate', ...outcome };
}

/** Starts the zero-dependency operator server (binds 127.0.0.1); keeps the process alive. */
function cmdServe(args) {
  let port = 8181;
  const envPort = Number.parseInt(process.env.FRACTIOS_PORT ?? '', 10);
  if (Number.isInteger(envPort) && envPort > 0) port = envPort;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--port') {
      const value = Number.parseInt(args[index + 1] ?? '', 10);
      if (!Number.isInteger(value) || value <= 0) throw new Error('serve --port requires a positive integer');
      port = value;
      index += 1;
    } else {
      throw new Error(`serve: unknown argument '${args[index]}' (usage: serve [--port N])`);
    }
  }
  const instance = createServer({ port });
  instance.ready
    .then((boundPort) => {
      const envelope = {
        success: true,
        command: 'serve',
        url: `http://127.0.0.1:${boundPort}`,
        port: boundPort,
        honestyBoundary: HONESTY_BOUNDARY,
        note: 'operator console serving; press Ctrl+C to stop',
      };
      process.stdout.write(`${JSON.stringify(envelope, null, 2)}\n`);
      process.exitCode = envelope.success ? 0 : 1;
    })
    .catch((err) => {
      process.stdout.write(`${JSON.stringify(fail(err), null, 2)}\n`);
      process.exitCode = 1;
    });
}

function main() {
  const { cmd, args } = parseArgv();
  if (cmd === 'serve') {
    cmdServe(args);
    return;
  }
  let envelope;
  switch (cmd) {
    case 'boot': envelope = cmdBoot(); break;
    case 'status': envelope = cmdStatus(); break;
    case 'explore': envelope = cmdExplore(args[0]); break;
    case 'reconcile': envelope = cmdReconcile(); break;
    case 'verify': envelope = cmdVerify(); break;
    case 'commit': envelope = cmdCommit(); break;
    case 'repos':
      if (args[0] === 'list') envelope = cmdReposList();
      else if (args[0] === 'check') envelope = cmdReposCheck();
      else envelope = fail(`repos requires 'list' or 'check' (got '${args[0] ?? ''}')`);
      break;
    case 'regulate': envelope = cmdRegulate(args.join(' ')); break;
    default:
      envelope = fail(`unknown command '${cmd}'. usage: fractios <boot|status|explore|reconcile|verify|commit|repos list|repos check|regulate|serve>`);
  }
  process.stdout.write(`${JSON.stringify(envelope, null, 2)}\n`);
  process.exitCode = envelope.success ? 0 : 1;
}

try {
  main();
} catch (err) {
  process.stdout.write(`${JSON.stringify(fail(err), null, 2)}\n`);
  process.exitCode = 1;
}
