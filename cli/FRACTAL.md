# cli/ — Fractal Position

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

## Fractal Position

| Axis | Position |
|---|---|
| **Level** | Octave 0 terminal edge — the CLI is the last realization of Seed:Edge before the operator |
| **Scale** | Single invocation — one operator, one subcommand, one JSON envelope |
| **System role** | **Terminal edge realization** — the only surface where the HH pipeline is directly exercised by a human or agent |

**[mythic]** The door handle on the basement: it does not regulate, it opens. **[operational]** `fractios.mjs` maps subcommands onto `src/kernel/pipeline.mjs` stages and `src/repos/operator.mjs` routes without owning any logic of its own.

## Cross-Scale Invariants

| Invariant | Statement | Tier |
|---|---|---|
| **Envelope everywhere** | `{success, ...}` JSON on every subcommand, success or failure. | verified |
| **Fail-closed exit** | Nonzero exit on any failure; errors loud, never swallowed. | verified |
| **No git** | This surface never invokes git or writes to the mirror. | operational |
| **Honesty on boot** | `boot` must print DOC_ID, REGISTRY_ID, honesty boundary, pipeline stages. | operational |

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
