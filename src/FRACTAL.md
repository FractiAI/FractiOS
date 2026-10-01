# src/ — Fractal Position

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

| Axis | Position |
|---|---|
| **Level** | Octave 0 seed of the firmware — `Seed:Edge` origin `{seed:{octave:0,value:0,type:'origin'}}` |
| **Scale** | Source tree of the FractiOS package (two sub-scales: `kernel/`, `repos/`) |
| **System role** | The loaded body of the firmware: constants, computation core, estate boundary — no CLI surface here |

**[mythic]** `src/` is the seed itself: one constants file as the point of origin, two sub-octaves (kernel, repos) folding out of it. **[operational]** Everything downstream (CLI, experiments, docs) imports from here and adds nothing authoritative.

## Cross-Scale Invariants

| Invariant | Statement | Tier |
|---|---|---|
| Φ_EGS grammar | Φ_EGS = (1+√5)/2 nests the catalog; owned in `constants.mjs`, referenced everywhere else. | operational |
| Three-axis Goldilocks | Useful commit ⇔ RCR > RCR_A ∧ B < B_A ∧ E > E_A; implemented in `kernel/metrics.mjs`. | operational |
| Honesty boundary | Catalog engineering, not finished physics; declared in `constants.mjs` HONESTY_BOUNDARY. | verified |
| sha256 integrity | Canonical JSON, recursively sorted keys, in `kernel/state.mjs`. | verified |

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
