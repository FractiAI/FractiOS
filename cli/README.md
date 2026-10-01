# cli/ — FractiOS command-line surface

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
| `fractios.mjs` | Terminal entry point: `boot`, `status`, `explore`, `reconcile`, `verify`, `commit`, `repos list\|check`, `regulate` |
| `serve` | Starts the operator console (src/web/server.mjs) at 127.0.0.1:8181; JSON envelope responses; Ctrl+C to stop; voice tier operational |

**[verified]** Every subcommand emits a JSON envelope `{success, ...}` and exits nonzero on failure (fail-closed, errors loud). **[operational]** `boot` prints DOC_ID, REGISTRY_ID, honesty boundary, and pipeline stages; `repos check` runs `validateAgainstDisk` over the 57-node manifest against the read-only mirror.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
