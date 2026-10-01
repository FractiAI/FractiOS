# experiments/ — Fractal Position

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

## Fractal Position

| Axis | Position |
|---|---|
| **Level** | Octave 0 verification shelf — claims are pinned to E1..E9 receipts |
| **Scale** | Suite-wide — exercises kernel, pipeline, and the 57-node estate manifest from one runner |
| **System role** | **Verification shelf** — the place where every invariant claimed by `src/constants.mjs` and the pipeline is either confirmed or fails loudly |

**[mythic]** The scale the basement hangs its weights on: nothing above may lean on a claim that failed its shelf. **[operational]** `run_empirical_pipeline.mjs` runs the suite in fixed E1..E9 order and converts any failure into a nonzero exit and a red report.

## Cross-Scale Invariants

| Invariant | Statement | Tier |
|---|---|---|
| **Frozen fixtures** | Control A, arms, and candidates are pinned; never tuned to force a pass. | operational |
| **Determinism** | Same repo state ⇒ same report, byte for byte. | verified |
| **Honesty per record** | Every E-record carries the honesty string and a declared voice tier (E9 enforces coverage). | operational |
| **Exit-code gating** | Failing experiment ⇒ nonzero exit ⇒ red empirical report; fail-closed. | verified |

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
