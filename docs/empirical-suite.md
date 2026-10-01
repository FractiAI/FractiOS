# Empirical suite — E1..E9

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |
| Module | empirical-suite |
| Boundary | [`honesty.md`](honesty.md) |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**[operational]** Implementation: `experiments/experiments.mjs` (single source of truth for the E1..E9 suite) and `experiments/run_empirical_pipeline.mjs` (runner). Held-out receipts the suite reads against: [`gates.md`](gates.md) §5.

## Suite structure (E1..E9)

| Experiment | What it checks |
|---|---|
| **E1** `E1_phi_egs_identity` | Φ_EGS equals $(1+\sqrt{5})/2$ to within 1e-15 |
| **E2** `E2_lossless_delta_roundtrip` | lossless delta roundtrip: apply, invert, apply back returns identical values |
| **E3** `E3_metrics_formulas` | metric formulas match contract definitions on worked numeric examples |
| **E4** `E4_pipeline_refuses_overconservative_commit` | pipeline refuses commit for a threshold-violating (over-conservative arm) candidate |
| **E5** `E5_rho_blend_finds_feasible_alpha` | feasible single candidate reaches commit; UCR is report-only below the population floor |
| **E6** `E6_three_axis_gate_true_vs_control` | three-axis Goldilocks gate true vs Control A for the reference arm |
| **E7** `E7_ucr_population_gate_enforcement` | population semantics for the UCR floor with UCR_MIN_ELIGIBLE synthetic explorations |
| **E8** `E8_manifest_57_nodes_disk_valid` | manifest has 57 nodes and `validateAgainstDisk` passes against the vault root |
| **E9** `E9_honesty_and_voice_tier_coverage` | audits every record's honesty string and voice tier |

The suite is built eagerly in E1..E9 order (`runExperiments()` → `EXPERIMENTS`).

## Report format

**[operational]** `experiments/run_empirical_pipeline.mjs` writes both report artifacts under `data/`:

- `data/empirical_report.json` — full report: `{studyTitle, docId, registryId, operator, generatedAt, honestyBoundary, repo, results, experiments}` where `results` carries `n_pass`, `n_total`, `failed`, `all_pass`.
- `data/empirical_report.md` — the same report in markdown for humans.

The runner prints a compact JSON verdict to stdout: pass/fail verdict, `n_pass`/`n_total`, and the failed experiment IDs if any.

## Exit-code gating

**[verified]** The runner gates its exit code: **exit 0 iff all experiments pass, exit 1 otherwise** — fail-closed, so a silent partial pass cannot masquerade as a green run.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*