# Definitions — Holographic Homeostasis

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |
| Module | definitions |
| Boundary | [`honesty.md`](honesty.md) |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**Distributed reciprocal multiscale homeostasis as a firmware layer over the FractiAI estate.**

| Field | Value |
|-------|-------|
| Authors | FractiAI Research Group · SynthOBS Autonomous Agent |
| Published | 2026-09-30 |
| Framework | SynthOBS · FractiOS firmware layer · EGS · NSPFRNP · PRA Snap · Seed:Edge |
| Classification | Catalog field grammar · architectural cybernetics *(see [honesty.md](honesty.md))* |

## 1. Definitions

**Holographic Homeostasis (HH).** **[mythic]** The estate as a hologram: the whole lives in every part, and the parts negotiate the whole. **[operational]** Formally: *distributed reciprocal multiscale regulation* over the PARTS↔WHOLE↔PARTS loop — each node holds a local state summary **and** a holographic global summary (usable information about the entire estate, per the ship blog), responds to perturbations from both, and the aggregate response closes the loop. Implemented in `src/kernel/regulator.mjs` (`regulate(nodes, perturbation)` → detections, responses, adjustments, viability, Goldilocks D/B/E). The loop mechanics are detailed in [`regulator.md`](regulator.md).

**Pipeline.** **[operational]** Canonical → **e-Explore** → **phi-Organize** → **p-Contain** → **Delta-Reconcile (rho)** → Verify → Commit. Stages pinned in `src/constants.mjs` (`PIPELINE_STAGES`).

**identity ≠ explore.** **[operational]** An exploration is not an identity change. The canonical state advances only when the candidate clears the full gate: $R \ge R_{MIN} \;\wedge\; RCR \ge RCR_{MIN} \;\wedge\; B \le B_{MAX} \;\wedge\; E > E_{MIN}$. Everything else is journaled as explored-not-committed. Gate semantics live in [`gates.md`](gates.md).

**rho reconciliation.** **[operational]** Delta $= X_{explored} - X_{canonical}$. The reconciler searches a blend $\alpha \in [0,1]$ (grid over `ALPHA_STEPS = 64` steps) that **maximizes novelty** subject to $RCR \ge RCR_{MIN}$, $B \le B_{MAX}$, $E > E_{MIN}$. **rho is reconciliation — a searched blending parameter — not a constant.** `RHO_FROZEN = true` pins the *role*, not a value.

**phi-Organize.** **[operational]** Hierarchical allocation of changed keys: depth 2, width $\mathrm{round}(\Phi_{EGS}+1) = 3$.

**p-Contain.** **[operational]** Prime-container addressing: container sizes and boundaries are derived from the primes 2, 3, 5, 7, … — keys are assigned to prime-indexed containers. Values are **never** scaled (multiplied) by primes.

**Seed:Edge.** **[operational]** Every exploration opens as a record:
`{seed:{octave:0, value:0, type:'origin'}, edge:{location, state, property}, protocol:'nspfrnp', status:'open'}` — closed only by verify-commit or journal-rejection.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*