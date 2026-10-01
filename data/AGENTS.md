# data/ — agent rules

| Field | Value |
|-------|-------|
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit snap | NSPFRNP-SNAP-PRA-2026-06 |
| Document ID | WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30 |
| Registry ID | fractios-2026-09 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

## Rules

1. **[verified]** Everything here is GENERATED — never hand-edit; fix the producing code (pipeline, CLI, runner), then regenerate.
2. **[operational]** Safe to regenerate: deleting any file in this folder loses no source of truth; canonical.json is derived and reports are derived.
3. **[verified]** `explorations/journal.jsonl` is append-only — never rewrite, truncate, or reorder journal lines; rejected outcomes stay journaled.
4. **[operational]** Only the pipeline, `cli/fractios.mjs`, and `experiments/run_empirical_pipeline.mjs` may write here; explorations land exclusively under `explorations/`.
5. **[verified]** State addresses (sha256 over canonical JSON) must be recomputed from file content, never assumed from a stale report.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
