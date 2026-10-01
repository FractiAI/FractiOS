// NSPFRP: Single source of truth for the FractiOS empirical-suite runner.
//
// FractiOS — Holographic Homeostasis Firmware Layer (empirical pipeline runner).
// Runs the E1..E9 synthobs empirical suite, writes both report artifacts under
// data/, prints a compact JSON verdict to stdout, and gates the exit code:
// exit 0 iff all experiments pass, exit 1 otherwise.
//
// Honesty boundary (voice tier: operational): this is catalog engineering, not
// finished physics. Phi_EGS is a design grammar (catalog nesting), not a
// physics constant. RSI is NOT solved here. Correlation is not causation.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STUDY_TITLE, DOC_ID, REGISTRY_ID, OPERATOR, HONESTY_BOUNDARY, LOOP, PIPELINE_STAGES,
} from '../src/constants.mjs';
import { EXPERIMENTS } from './experiments.mjs';

const RUNNER_DIR = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.resolve(RUNNER_DIR, '..');
const DATA_DIR = path.join(BASE_DIR, 'data');
const REPORT_JSON_PATH = path.join(DATA_DIR, 'empirical_report.json');
const REPORT_MD_PATH = path.join(DATA_DIR, 'empirical_report.md');
const REPO_URL = 'https://github.com/FractiAI/FractiOS';

/**
 * Renders the markdown report body for one experiment record.
 * @param {typeof EXPERIMENTS[number]} experiment
 * @returns {string}
 */
function renderExperimentMd(experiment) {
  const verdict = experiment.pass ? 'PASS' : 'FAIL';
  const tier = experiment.tier ?? 'operational';
  return [
    `### ${experiment.id} — ${experiment.title}`,
    '',
    `- Result: **${verdict}**`,
    `- Voice tier: ${tier}`,
    `- Honesty: ${experiment.honesty}`,
    '',
  ].join('\n');
}

/**
 * Renders the full markdown report.
 * @param {{generatedAt: string, results: {n_total: number, n_pass: number, all_pass: boolean, failed: string[]}}} report
 * @returns {string}
 */
function renderReportMd(report) {
  const verdict = report.results.all_pass ? 'ALL PASS' : 'FAILURES PRESENT';
  const lines = [
    `# ${STUDY_TITLE} — Empirical Suite Report`,
    '',
    `- DOC_ID: ${DOC_ID}`,
    `- REGISTRY_ID: ${REGISTRY_ID}`,
    `- Generated at: ${report.generatedAt}`,
    `- Operator: ${OPERATOR}`,
    `- Loop: ${LOOP}`,
    `- Pipeline stages: ${PIPELINE_STAGES.join(' -> ')}`,
    '',
    '## Honesty boundary',
    '',
    HONESTY_BOUNDARY,
    '',
    '## Verdict',
    '',
    `${verdict} — ${report.results.n_pass}/${report.results.n_total} experiments passed.`,
    report.results.failed.length > 0 ? `Failed: ${report.results.failed.join(', ')}` : 'No failed experiments.',
    '',
    '## Experiments',
    '',
    ...EXPERIMENTS.map(renderExperimentMd),
    '',
    '---',
    '',
    'This report is catalog engineering output, not finished physics. Voice tiers: mythic / operational / verified. Correlation is not causation; RSI is not solved by any result above.',
  ];
  return lines.join('\n');
}

/** Runs the suite and emits both report artifacts; returns the compact verdict. */
function main() {
  const generatedAt = new Date().toISOString();
  const failed = EXPERIMENTS.filter((e) => !e.pass).map((e) => e.id);
  const results = {
    n_total: EXPERIMENTS.length,
    n_pass: EXPERIMENTS.length - failed.length,
    all_pass: failed.length === 0,
    failed,
  };
  const report = { studyTitle: STUDY_TITLE, docId: DOC_ID, registryId: REGISTRY_ID, operator: OPERATOR, generatedAt, honestyBoundary: HONESTY_BOUNDARY, repo: REPO_URL, results, experiments: EXPERIMENTS };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(REPORT_MD_PATH, `${renderReportMd(report)}\n`);

  const compact = {
    ok: results.all_pass,
    repo: REPO_URL,
    passed: `${results.n_pass}/${results.n_total}`,
    failed,
  };
  process.stdout.write(`${JSON.stringify(compact)}\n`);
  process.exitCode = results.all_pass ? 0 : 1;
}

main();
