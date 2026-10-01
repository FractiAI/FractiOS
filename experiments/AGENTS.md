# experiments/ — agent rules

| Field | Value |
|-------|-------|
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit snap | NSPFRNP-SNAP-PRA-2026-06 |
| Document ID | WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30 |
| Registry ID | fractios-2026-09 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

## Rules

1. **[operational]** Fixtures are frozen: `originArm`, `overConservativeCandidate`, `feasibleCandidate` and Control A thresholds stay pinned — never tune a fixture to make an experiment pass.
2. **[verified]** Deterministic only: no time, randomness, network, or environment-dependent behavior; the same repo state must produce the same report.
3. **[operational]** Every experiment record must include the honesty string (`src/constants.mjs`) and a valid voice tier from `VOICE_TIERS` (asserted in E9).
4. **[verified]** Exit-code gating: the runner exits nonzero on any failing experiment; report files under `data/` are the only permitted writes.
5. **[operational]** Zero runtime dependencies; reuse `src/kernel/*` metrics/pipeline — no duplicate metric definitions here.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
