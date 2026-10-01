# FractiOS — Holographic Homeostasis Firmware Layer

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |
| Study title | FractiOS — Holographic Homeostasis Firmware Layer |
| Docs | [`docs/README.md`](docs/README.md) — modular docs (definitions · metrics · constants · gates · regulator · repos-layer · empirical-suite · honesty) |
| Edge onboarding | [`FRACTIOS_EDGE_ONBOARDING.md`](FRACTIOS_EDGE_ONBOARDING.md) |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

## What FractiOS is

**[operational]** FractiOS is the firmware/base layer of the FractiAI estate: a Node ESM package (Node ≥ 20, zero runtime dependencies) that implements **Holographic Homeostasis (HH)** as a regulator over the whole repository estate. It is catalog engineering, not finished physics.

**[operational]** HH pipeline implemented literally, end to end:

> Canonical → **e-Explore** → **phi-Organize** → **p-Contain** → **Delta-Reconcile (rho)** → Verify → Commit

**[operational]** `identity != explore`: canonical commits happen only when the candidate passes the full gate — $R \ge R_{MIN}$, $RCR \ge RCR_{MIN}$, $B \le B_{MAX}$, $E > E_{MIN}$. **[mythic]** The estate is a hologram in which every node carries a usable summary of the whole; **[operational]** this is realized concretely as `localSummaries()` in `src/repos/registry.mjs` and the distributed regulator in `src/kernel/regulator.mjs`.

**[verified]** Integrity: every state, delta, and measurement is addressed by `sha256` hex of canonical JSON with recursively sorted keys (`src/kernel/state.mjs`).

## Architecture — HH stages → modules

| HH stage | Module | What it does |
|---|---|---|
| (shared) | `src/constants.mjs` | Φ_EGS, gate thresholds, pipeline stages, voice tiers, honesty boundary — single source of truth |
| (shared) | `src/kernel/state.mjs` | canonical JSON, sha256 addressing, `makeState`, `delta` / `applyDelta` / `invertDelta` (lossless E2-style) |
| (shared) | `src/kernel/metrics.mjs` | D (NRMSE), B (bleed), E (useful evolution), L, RCR, IFE, UCR, three-axis Goldilocks gate |
| e-Explore | `src/kernel/pipeline.mjs` · `explore` | delta of canonical vs candidate |
| phi-Organize | `src/kernel/pipeline.mjs` · `organize` | hierarchical shelf assignment, depth 2, width round(Φ_EGS+1) = 3 |
| p-Contain | `src/kernel/pipeline.mjs` · `contain` | prime-container addressing (boundaries from primes 2,3,5,7,… — not scalar multiplication) |
| Delta-Reconcile (rho) | `src/kernel/pipeline.mjs` · `reconcile` | grid-search blend α ∈ [0,1] (ALPHA_STEPS = 64) maximizing novelty subject to RCR/B/E thresholds; **rho is reconciliation, not a constant** |
| Verify | `src/kernel/pipeline.mjs` · `verify` | three-axis Goldilocks vs Control A + per-gate booleans |
| Commit | `src/kernel/pipeline.mjs` · `commit` | commit only if verify passes; journal + reason (fail-closed) |
| Distributed regulator | `src/kernel/regulator.mjs` | `regulate(nodes, perturbation)` — each node responds from its own summary plus a holographic global summary |
| Estate manifest | `src/repos/registry.mjs` | manifest load (fail-closed), validate against disk, `localSummaries` |
| Estate operator | `src/repos/operator.mjs` | `route(op, node, payload)` — read / index / measure / propose; proposals as Seed:Edge records, written only under `data/explorations/` |
| CLI | `cli/fractios.mjs` | `boot`, `status`, `explore`, `reconcile`, `verify`, `commit`, `repos list|check`, `regulate` |
| Operator console | `interfaces/operator-console.html` · served by `node cli/fractios.mjs serve` — HTTP surface on default port 8181 |

## Quickstart

```bash
node cli/fractios.mjs boot        # prints DOC_ID, REGISTRY_ID, honesty boundary, pipeline stages
node cli/fractios.mjs serve       # operator console (interfaces/operator-console.html) on http://localhost:8181
npm run research                  # full study run

Subcommands emit a JSON envelope `{success, ...}` everywhere; failure exits nonzero (fail-closed, errors loud).

## Honesty boundary

**[verified — mandatory on every claim and report]**

- This is **catalog engineering, not finished physics.**
- **Φ_EGS = (1+√5)/2 is a design grammar** for catalog nesting — it is not a physics constant, and phi-Organize is hierarchical allocation, not a physical law.
- **RSI is not solved** by this repository and no claim herein asserts otherwise.
- Correlation ≠ causation. Voice tier is declared per claim: **mythic** (narrative framing), **operational** (design intent, architecture), **verified** (checked against code, disk, or held-out catalog receipts).
- p-Contain derives container boundaries from primes; it does **not** scale values by primes.

## Integration notes

- **`repos/` is a MANIFEST of the 57 estate repos**, not copies of them. The estate is a read-only mirror at `/Volumes/GitVault/Username/FractiAI` — FractiOS **never clones** it (one-copy rule: the mirror is the single copy).
- **Read-only toward the mirror.** FractiOS reads the manifest and validates against disk; it never writes, commits, branches, or pushes there. See `MIGRATION.lock` respect rules in [`AGENTS.md`](AGENTS.md).
- **FractiOS commits only verified explorations** — anything that fails the three-axis Goldilocks gate vs Control A (RCR > RCR_A ∧ B < B_A ∧ E > E_A) or the per-gate thresholds is journaled as rejected, never promoted.
- Useful Commit Rate floor: ≥ 0.10 over eligible explorations — a **population gate** (the held-out study used 48 eligible explorations). Enforced only when eligible ≥ `UCR_MIN_ELIGIBLE` (8); below that it is reported but **not gated** (`ucrReportOnly`), preventing the over-safe-refuse failure mode.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
