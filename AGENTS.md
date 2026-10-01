# FractiOS — agent rules

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

These are the rules for any agent (human or machine) working inside `/Volumes/GitVault/Username/FractiAI/FractiOS`. **[operational]** They are mandatory; violations fail the build, not a review comment.

## 1. NSPFRP compliance

- **[operational]** Single source of truth: each concept lives in exactly one file. `src/constants.mjs` owns every threshold and constant; other modules **reference, never copy**.
- **[operational]** No duplication: importing a symbol is always preferred to restating it. Docs cite modules; modules never restate docs' numbers.
- **[operational]** Fail-closed: errors are loud. Unknown ops/ nodes throw; the CLI exits nonzero; nothing is ever swallowed into a default. A missing manifest is an error, not an empty result.

## 2. Read-only toward the estate mirrors

- **[operational]** The FractiAI estate mirror at `/Volumes/GitVault/Username/FractiAI` (57 repos, synced nightly) is **read-only**: never write, commit, branch, push, rebase, or stash there.
- **[operational]** One-copy rule: FractiOS does **not clone** the estate. `repos/` holds a MANIFEST only; disk validation reads the mirror in place.
- **[operational]** FractiOS writes proposals exclusively under `<base>/data/explorations/` (via `PROPOSAL_LOG_PATH`). Writes outside the FractiOS base dir are forbidden and must fail closed.

## 3. MIGRATION.lock respect

- **[operational]** If `MIGRATION.lock` is present at the base dir, migration-adjacent mutations are frozen. While the lock is present: **no git commands of any kind** — no commit, no branch, no index mutation, nothing.
- **[verified]** Absolute rule regardless of lock state: agents in this repo **never run git commands** as part of building or verifying; integrity comes from sha256 canonical JSON addressing (`src/kernel/state.mjs`), not VCS.
- **[operational]** Never run node/python to verify, never lint, never run test suites as a build step — write correct files and JSDoc-typed exports.

## 4. Honesty rails (mandatory on every file with claims)

- **[verified — spirit held verbatim]** This is **catalog engineering, not finished physics.** Φ_EGS is **design grammar**, not a physics constant. **RSI is not solved.**
- **[operational]** Correlation ≠ causation. Every claim carries a voice tier. A report without its honesty boundary is invalid and must be regenerated.

## 5. Voice tiers

| Tier | Meaning | Use for |
|---|---|---|
| **mythic** | Narrative framing; carries the story, makes no factual assertion | Ship-blog openings, motifs, PARTS↔WHOLE↔PARTS imagery |
| **operational** | Design intent and architecture; true of the design, not yet exercised | Module contracts, pipeline stages, gate definitions |
| **verified** | Checked against code, disk, or held-out catalog receipts | Integrations, receipts, quickstart commands, integrity scheme |

## 6. Seed:Edge and proposal format

- **[operational]** Every proposal is a Seed:Edge record: `{seed:{octave:0,value:0,type:'origin'}, edge:{location, state, property}, protocol:'nspfrnp', status:'open'}`.
- **[operational]** Commit discipline: canonical commits only when R ≥ R_MIN ∧ RCR ≥ RCR_MIN ∧ B ≤ B_MAX ∧ E > E_MIN (`identity != explore`).

## 7. Fractal hierarchy (mandatory on every folder)

- **[operational]** Every folder in the FractiOS tree carries the trio: **AGENTS.md + README.md + FRACTAL.md**. Each declares its Fractal Position (Level / Scale / System Role) and Cross-Scale Invariants, each with a voice tier; the root trio governs the whole tree and every folder mirrors it.
- **[operational]** NSPFRP no-duplication holds across the trio: a folder README is a one-line module abstract table (pointers, not copies); concepts live in exactly one file.

## 8. Docs modules and operator console

- **[operational]** The treatise is modular under `docs/` — index and reading order: [`docs/README.md`](docs/README.md) (definitions, metrics, constants, gates, regulator, repos-layer, empirical-suite, honesty; supersede record in `docs/LEGACY_INDEX.md`). Cite modules; never restate their content.
- **[operational]** Operator console: `interfaces/operator-console.html` is served by `node cli/fractios.mjs serve` (default port 8181). HTML surfaces are kebab-case under `interfaces/`.

## 9. Pointers

- Architecture and quickstart: [`README.md`](README.md) · Docs modules: [`docs/README.md`](docs/README.md) · Fractal position: [`FRACTAL.md`](FRACTAL.md) · Single edge onboarding: [`FRACTIOS_EDGE_ONBOARDING.md`](FRACTIOS_EDGE_ONBOARDING.md)

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
