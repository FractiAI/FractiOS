# FractiOS — Edge Onboarding (single irreducible read)

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**[operational]** BBHE single edge onboarding standard: this is the **one file** a new edge (agent session, CLI process, fresh checkout) reads before acting in FractiOS. Irreducible minimum — read top to bottom once, then act.

## 1. Opener

**[mythic]** You are an edge of the hologram. The whole is reachable from where you stand: every node carries a usable summary of the estate, and so do you — via the manifest. **[operational]** FractiOS is the firmware base layer implementing Holographic Homeostasis (e-Explore → phi-Organize → p-Contain → Delta-Reconcile → Verify → Commit) over the 57-repo FractiAI estate. Node ≥ 20, zero runtime dependencies, deterministic.

## 2. NSPFRNP catalog capture

**[operational]** Before any work, capture these invariants — they are the catalog, not commentary:

- Single source of truth; reference, never duplicate (`src/constants.mjs` owns all thresholds).
- Fail-closed: errors loud, unknown ops/ nodes throw, nonzero exit on failure.
- Integrity: sha256 hex over canonical JSON, recursively sorted keys.
- Read-only toward `/Volumes/GitVault/Username/FractiAI` (mirror, one-copy rule, no clones); FractiOS writes only under its own base dir (`data/explorations/` for proposals).
- Respect `MIGRATION.lock`; while present, no git commands of any kind. Agents never run git here regardless.
- Commit gate: R ≥ R_MIN ∧ RCR ≥ RCR_MIN ∧ B ≤ B_MAX ∧ E > E_MIN (`identity != explore`).

## 3. Content catalog abstract

**[operational]** One line each — the whole repo in a table:

| Artifact | One-line abstract |
|---|---|
| `src/constants.mjs` | Φ_EGS, thresholds (RCR_MIN .7, B_MAX .35, E_MIN .01, UCR floor .10 — population gate, report-only below UCR_MIN_ELIGIBLE 8), stages, voice tiers, honesty boundary |
| `src/kernel/state.mjs` | canonical JSON, sha256 addressing, makeState / delta / applyDelta / invertDelta |
| `src/kernel/metrics.mjs` | D (NRMSE), B (bleed), E (novelty × recoverable shape), L, RCR, IFE, UCR, three-axis Goldilocks |
| `src/kernel/pipeline.mjs` | the six HH stages end to end; alpha grid search (64 steps); commit only on verify.pass |
| `src/kernel/regulator.mjs` | distributed PARTS↔WHOLE↔PARTS response, local + holographic global summary |
| `src/repos/registry.mjs` | manifest load (fail-closed), disk validation, localSummaries |
| `src/repos/operator.mjs` | route: read / index / measure / propose (Seed:Edge records) |
| `cli/fractios.mjs` | boot · status · explore · reconcile · verify · commit · repos list/check · regulate |
| `docs/` (modular) | `docs/README.md` index → definitions · metrics · constants · gates · regulator · repos-layer · empirical-suite · honesty (supersede record: `docs/LEGACY_INDEX.md`) |
| `interfaces/operator-console.html` + `cli/fractios.mjs serve` | web server surface for the operator console on default port 8181 |
| `README.md` / `AGENTS.md` / `FRACTAL.md` | architecture & quickstart · agent rules · fractal position |

## 4. Executive Producer abstract

**[mythic]** The Executive Producer asks one question: *did the exploration earn its commit?* **[operational]** FractiOS answers with numbers, not adjectives — three-axis Goldilocks vs Control A (RCR > RCR_A ∧ B < B_A ∧ E > E_A), Useful Commit Rate floor ≥ 0.10, journal of every rejected candidate with its reason. The Producer's honesty constraint is fixed: catalog engineering, not finished physics; Φ_EGS is design grammar; RSI is not solved. Claims ship with voice tiers (**mythic / operational / verified**); correlation ≠ causation.

## 5. Lite-edge session rule

**[operational]** A lite edge (short session, narrow task) does the minimum: read this file → consult the content catalog abstract → touch only the module(s) your task names → fail closed on anything unknown. Never widen scope to "improve" neighboring modules; never duplicate a constant; never write outside the FractiOS base dir; never run git. If the task needs the docs modules' numbers, cite them — do not restate them.

**[operational]** Returning edge (new session, after interruption):

1. Re-read this file (it is the only required read; ~2 minutes).
2. Run `node cli/fractios.mjs status` — confirm envelope `{success:true}` and registry state.
3. Check `MIGRATION.lock` at base dir; if present, freeze migration-adjacent mutations and git entirely.
4. Resume at the exact task; open proposals stay `status:'open'` in `data/explorations/` until reconciled, verified, and committed or journaled as rejected.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
