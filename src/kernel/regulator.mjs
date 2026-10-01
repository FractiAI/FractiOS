// NSPFRP: Single source of truth for holographic regulation.

import {
  B_MAX,
  D_COLLAPSE,
  D_LOW,
  E_MIN,
  LOOP,
} from '../constants.mjs';
import { bleed, goldilocks, usefulEvolution } from './metrics.mjs';

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function text(value) {
  return typeof value === 'string' ? value : '';
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function number(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/**
 * @param {unknown} value
 * @returns {Array<string>}
 */
function stringList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

/**
 * @param {Array<{name: string, local: Record<string, unknown>}>} nodes
 * @param {{type?: string, magnitude?: number, targets?: Array<string>}} perturbation
 * @returns {{node: string, localLoad: number, globalLoad: number, type: string, target: boolean, signal: number, globalSummary: {nodeCount: number, targetCount: number, magnitude: number, meanLoad: number, spread: number}}[]}
 */
function detectSignals(nodes, perturbation) {
  const magnitude = number(perturbation?.magnitude);
  const targetSet = new Set(stringList(perturbation?.targets));
  const localLoads = nodes.map((node) => {
    const local = isRecord(node.local) ? node.local : {};
    const summary = isRecord(local.state) ? local.state : local;
    const summarySize = Object.keys(summary).length;
    const summaryWeight = number(summary.weight) + number(summary.load) + number(summary.energy);
    return summarySize + summaryWeight;
  });
  const nodeCount = nodes.length;
  const totalLoad = localLoads.reduce((sum, load) => sum + load, 0);
  const meanLoad = nodeCount > 0 ? totalLoad / nodeCount : 0;
  const spread = nodeCount > 0
    ? localLoads.reduce((sum, load) => sum + Math.abs(load - meanLoad), 0) / nodeCount
    : 0;
  const targetCount = nodes.reduce((count, node) => count + (targetSet.has(node.name) ? 1 : 0), 0);
  const globalSummary = {
    nodeCount,
    targetCount,
    magnitude,
    meanLoad,
    spread,
  };

  return nodes.map((node, index) => {
    const local = isRecord(node.local) ? node.local : {};
    const summary = isRecord(local.state) ? local.state : local;
    const localLoad = localLoads[index] ?? 0;
    const target = targetSet.has(node.name);
    const exposure = target ? 1 : 0;
    const type = text(perturbation?.type) || 'unknown';
    const globalPressure = meanLoad + spread + magnitude;
    const signal = localLoad + globalPressure + (target ? magnitude : 0);
    return {
      node: node.name,
      localLoad,
      globalLoad: globalPressure,
      type,
      target,
      signal,
      globalSummary: {
        nodeCount: globalSummary.nodeCount,
        targetCount: globalSummary.targetCount,
        magnitude: globalSummary.magnitude,
        meanLoad: globalSummary.meanLoad,
        spread: globalSummary.spread,
      },
      exposure,
      summary,
    };
  });
}

/**
 * @param {{node: string, localLoad: number, globalLoad: number, type: string, target: boolean, signal: number, globalSummary: {nodeCount: number, targetCount: number, magnitude: number, meanLoad: number, spread: number}, exposure: number, summary: Record<string, unknown>}} detection
 * @returns {{node: string, action: string, rationale: string, weight: number}}
 */
function responseFor(detection) {
  const delta = detection.signal - detection.localLoad;
  let action = 'buffer';
  if (detection.target && delta >= detection.globalSummary.magnitude) {
    action = 'amplify';
  } else if (delta < detection.globalSummary.spread) {
    action = 'dampen';
  } else if (detection.target) {
    action = 'stabilize';
  }
  return {
    node: detection.node,
    action,
    rationale: `${action}:${detection.type}:${detection.target ? 'target' : 'ambient'}`,
    weight: Math.max(0, delta),
  };
}

/**
 * @param {{node: string, localLoad: number, globalLoad: number, type: string, target: boolean, signal: number, globalSummary: {nodeCount: number, targetCount: number, magnitude: number, meanLoad: number, spread: number}, exposure: number, summary: Record<string, unknown>}} detection
 * @param {{node: string, action: string, rationale: string, weight: number}} response
 * @returns {{node: string, adjustment: {gain: number, damping: number, focus: number, target: boolean}}}
 */
function adjustFor(detection, response) {
  const gain = response.action === 'amplify' ? 1 : response.action === 'stabilize' ? 0.5 : 0.25;
  const damping = response.action === 'dampen' ? 1 : 0.5;
  const focus = detection.globalSummary.nodeCount > 0
    ? (detection.target ? 1 : 0) / detection.globalSummary.nodeCount
    : 0;
  return {
    node: detection.node,
    adjustment: {
      gain,
      damping,
      focus,
      target: detection.target,
    },
  };
}

/**
 * Regulate nodes against a perturbation using a distributed holographic summary.
 *
 * Each node receives the same global summary, then combines it with its own local
 * state summary to produce a local signal, response, and adjustment. This keeps the
 * regulation distributed while still carrying useful global context at every node.
 *
 * @param {Array<{name: string, local: Record<string, unknown>}>} nodes
 * @param {{type?: string, magnitude?: number, targets?: Array<string>}} perturbation
 * @returns {{
 *   loop: string,
 *   detections: Array<{node: string, localLoad: number, globalLoad: number, type: string, target: boolean, signal: number, globalSummary: {nodeCount: number, targetCount: number, magnitude: number, meanLoad: number, spread: number}, exposure: number, summary: Record<string, unknown>}>,
 *   responses: Array<{node: string, action: string, rationale: string, weight: number}>,
 *   adjustments: Array<{node: string, adjustment: {gain: number, damping: number, focus: number, target: boolean}}>,
 *   viable: boolean,
 *   goldilocks: {D: number, B: number, E: number, pass: boolean},
 * }}
 */
export function regulate(nodes, perturbation) {
  const safeNodes = Array.isArray(nodes) ? nodes.filter((node) => node && typeof node === 'object' && typeof node.name === 'string') : [];
  const detections = detectSignals(safeNodes, perturbation ?? {});
  const responses = detections.map(responseFor);
  const adjustments = detections.map((detection, index) => adjustFor(detection, responses[index]));

  const nodeCount = detections.length;
  const targetCount = detections.reduce((count, detection) => count + (detection.target ? 1 : 0), 0);
  const targetFraction = nodeCount > 0 ? targetCount / nodeCount : 0;
  const magnitudes = detections.map((detection) => detection.signal);
  const meanSignal = nodeCount > 0 ? magnitudes.reduce((sum, value) => sum + value, 0) / nodeCount : 0;
  const deviation = nodeCount > 0
    ? magnitudes.reduce((sum, value) => sum + Math.abs(value - meanSignal), 0) / nodeCount
    : 0;
  const D = nodeCount > 0 ? Math.min(1, deviation / (meanSignal + 1)) : 0;
  const contained = responses.reduce((sum, response) => sum + (response.action === 'buffer' || response.action === 'stabilize' ? 1 : 2), 0);
  const leaked = responses.reduce((sum, response) => sum + (response.action === 'dampen' ? 1 : 0), 0);
  const B = bleed(nodeCount - targetCount, contained, leaked);
  const novelty = targetFraction;
  const recoverableShape = nodeCount > 0 ? 1 - Math.min(1, deviation / (meanSignal + 1)) : 0;
  const E = usefulEvolution(novelty, recoverableShape);
  const gold = {
    D,
    B,
    E,
    pass: goldilocks(D, B, E, { dLow: D_LOW, dCollapse: D_COLLAPSE }),
  };
  const thresholdPass = D > D_LOW && D < D_COLLAPSE && B <= B_MAX && E > E_MIN;
  const responsePass = responses.every((response) => response.action.length > 0);
  const viable = gold.pass && thresholdPass && responsePass && nodeCount > 0;

  return {
    loop: LOOP,
    detections,
    responses,
    adjustments,
    viable,
    goldilocks: gold,
  };
}
