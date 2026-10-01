# Regulator — PARTS↔WHOLE↔PARTS

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |
| Module | regulator |
| Boundary | [`honesty.md`](honesty.md) |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**[operational]** Implementation: `src/kernel/regulator.mjs` (`regulate(nodes, perturbation)` → detections, responses, adjustments, viability, Goldilocks D/B/E). Definition of Holographic Homeostasis itself: [`definitions.md`](definitions.md).

## The loop

**[mythic]** The estate as a hologram: the whole lives in every part, and the parts negotiate the whole. **[operational]** Formally: *distributed reciprocal multiscale regulation* over the PARTS↔WHOLE↔PARTS loop — the loop invariant is pinned as `LOOP` in `src/constants.mjs`. Each node holds a local state summary **and** a holographic global summary (usable information about the entire estate, per the ship blog), responds to perturbations from both, and the aggregate response closes the loop: PARTS respond → the WHOLE (aggregate view) shifts → PARTS respond again to the shifted whole.

## Distributed response

**[operational]** No central controller holds the state. Each node responds **from its own summary** (local view: its own canonical state and deltas) **plus a holographic global summary** (usable information about the entire estate, materialized via `localSummaries()` in `src/repos/registry.mjs`). The regulator aggregates the per-node responses into the loop's whole-level outcome — detections, responses, adjustments, viability, Goldilocks D/B/E.

## Perturbation lens

**[operational]** Perturbations are typed, not amorphous: `regulate(nodes, perturbation)` takes `{type, magnitude, targets?}` — the same shape the EPH-IA-Delta-HO lineage calls Exogenous Perturbation (lineage table: [`gates.md`](gates.md)). Targets scope which nodes feel the perturbation first; the holographic summaries propagate its consequences estate-wide.

## Holographic global summaries

**[operational]** Every node's summary is usable information about the whole — this is what makes the estate a hologram rather than a federation: any node's local view is sufficient to reason about the estate, and the reconciliation of any local change is absorbed by every node's global summary. Viability of the reconciled whole is judged in the Goldilocks band (band definition: [`metrics.md`](metrics.md)).

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*