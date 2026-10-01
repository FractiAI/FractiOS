# FractiOS docs — Holographic Homeostasis (modular index)

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |
| Module | docs index |
| Supersedes | `docs/FRACTIOS_HOLOGRAPHIC_HOMEOSTASIS_2026-09-30.md` (see [`LEGACY_INDEX.md`](LEGACY_INDEX.md)) |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**[operational]** The treatise *FractiOS — Holographic Homeostasis* (2026-09-30) lives here as **modular docs**: one concept, one file, no duplication — each module owns its slice and cross-references the rest. Content was carried over in full on 2026-09-30 under the Continuous Squeeze convention; the monolith was deleted after the carry (see [`LEGACY_INDEX.md`](LEGACY_INDEX.md)).

## Module abstract table

| Module | One-line abstract |
|---|---|
| [`definitions.md`](definitions.md) | Holographic Homeostasis: distributed reciprocal multiscale PARTS↔WHOLE↔PARTS; identity ≠ explore; rho as searched α; phi-Organize; p-Contain primes-not-scaling; Seed:Edge |
| [`metrics.md`](metrics.md) | Metric table (D, B, E, L, RCR, IFE, UCR with formulas), three-axis Goldilocks gate vs Control A, Goldilocks operating band |
| [`constants.md`](constants.md) | Constants table — Φ_EGS, gate thresholds, UCR_FLOOR 0.10 / UCR_MIN_ELIGIBLE 8 population gate, E_FROZEN / RHO_FROZEN, ALPHA_STEPS 64 |
| [`gates.md`](gates.md) | Commit-gate semantics: R/RCR/B/E thresholds, three-axis vs Control A, UCR population gate, fail-closed refusal, over-safe-refuse guard; EPH-IA-Delta-HO lineage; held-out receipts |
| [`regulator.md`](regulator.md) | The PARTS↔WHOLE↔PARTS loop: distributed response, perturbation lens, holographic global summaries |
| [`repos-layer.md`](repos-layer.md) | The 57-node manifest, registry validation against disk, operator routing, one-copy rule, read-only mirror |
| [`empirical-suite.md`](empirical-suite.md) | E1..E9 experiment suite, report format, exit-code gating |
| [`honesty.md`](honesty.md) | Honesty boundary, voice tiers, what is claimed vs what is not |
| [`LEGACY_INDEX.md`](LEGACY_INDEX.md) | Supersede record for the former monolithic treatise |

## Reading order

1. [`honesty.md`](honesty.md) — the boundary every claim below lives inside.
2. [`definitions.md`](definitions.md) — what Holographic Homeostasis *is*.
3. [`metrics.md`](metrics.md) — how it is measured.
4. [`constants.md`](constants.md) — the pinned numbers (`src/constants.mjs` is the single source of truth; these docs cite it).
5. [`gates.md`](gates.md) — when an exploration earns its commit.
6. [`regulator.md`](regulator.md) — how the loop runs over the estate.
7. [`repos-layer.md`](repos-layer.md) — what the layer runs *over*.
8. [`empirical-suite.md`](empirical-suite.md) — how it is checked.

> **[operational]** Numbers live in `src/constants.mjs`; docs cite, never restate as authority. A discrepancy between a doc and code is a doc bug — fix the doc, fail the build.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*