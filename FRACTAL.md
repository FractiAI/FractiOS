# FractiOS — Fractal Position

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

## Fractal Position

| Axis | Position |
|---|---|
| **Level** | Octave 0 origin · Seed:Edge `{seed:{octave:0,value:0,type:'origin'}, ...}` |
| **Scale** | Estate-wide — the root trio (this file with root `AGENTS.md` + `README.md`) governs the whole tree across all 57 repos of the FractiAI mirror from one manifest (`repos/`); every folder mirrors the trio (its own AGENTS.md + README.md + FRACTAL.md) |
| **System role** | **Firmware base layer under the Syntheverse ecosystem** — boots first, regulates everything above it, owns no application logic of its own |

**[mythic]** FractiOS is the basement of the Syntheverse: the hum beneath the floors, the homeostat that keeps the hologram coherent while the upper octaves play. **[operational]** Concretely it is the HH pipeline (e-Explore → phi-Organize → p-Contain → rho-Reconcile → Verify → Commit) running over the estate manifest, with the holographic property realized as every node carrying a usable summary of the whole (`src/kernel/regulator.mjs`, `localSummaries()`).

## Cross-Scale Invariants

| Invariant | Statement | Tier |
|---|---|---|
| **Φ_EGS grammar** | Φ_EGS = (1+√5)/2 nests the catalog: phi-Organize depth 2, width round(Φ_EGS+1) = 3. **Design grammar, not a physics constant.** | operational |
| **Seed:Edge** | Every exploration opens as `{seed:{octave:0,value:0,type:'origin'}, edge:{location, state, property}, protocol:'nspfrnp', status:'open'}`. | operational |
| **Three-axis Goldilocks** | Useful commit ⇔ RCR > RCR_A ∧ B < B_A ∧ E > E_A (vs Control A); UCR floor ≥ 0.10 is a population gate — gated only when eligible explorations ≥ `UCR_MIN_ELIGIBLE` (8), report-only below. | operational |
| **e frozen / rho frozen** | `E_FROZEN = true`, `RHO_FROZEN = true` — the stepwise-novelty definition and rho's role as reconciliation (not a constant) are pinned in `src/constants.mjs`. | operational |
| **Honesty boundary** | Catalog engineering, not finished physics; Φ_EGS is design grammar; RSI not solved; correlation ≠ causation. Mandatory on every report. | verified |
| **Integrity** | sha256 hex over canonical JSON with recursively sorted keys addresses every state, delta, and measurement. | verified |
| **Loop** | PARTS↔WHOLE↔PARTS — the regulator's distributed response (each node: local summary + holographic global summary) closes the loop. | operational |

**[operational]** These invariants hold at every scale the layer touches: a single repo node, the 57-repo estate, and the Syntheverse ecosystem above it. **[mythic]** Each folder's trio is a smaller hologram of the root trio — the whole tree lives in every folder, and the folders negotiate the tree.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
