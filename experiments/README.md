# experiments/ — E1..E9 empirical suite

| Field | Value |
|-------|-------|
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit snap | NSPFRNP-SNAP-PRA-2026-06 |
| Document ID | WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30 |
| Registry ID | fractios-2026-09 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

## What lives here

| File | Abstract |
|---|---|
| `experiments.mjs` | E1..E9 suite: Φ_EGS identity, lossless delta roundtrip, NRMSE, UCR over-refusal, rho feasible α, three-axis gate, UCR floor, 57-node disk validation, honesty/voice coverage |
| `run_empirical_pipeline.mjs` | Runner: executes the suite, writes `data/empirical_report.{json,md}`, exits nonzero if any experiment fails |
| `data/` (output) | Reports land in `../data/` — generated, never hand-edited |

**[verified]** Each experiment record carries an honesty string and a declared voice tier; the runner is exit-code gated — a red report means a red exit.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
