# interfaces/ — Fractal Position

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

## Fractal Position

| Axis | Position |
|---|---|
| **Level** | Operator surface of the Octave 0 firmware layer — the face the Seed:Edge origin shows to its operator |
| **Scale** | Estate-wide view from one file — a single self-contained HTML page rendering all 57 manifest nodes and the HH pipeline from the same envelopes the CLI emits |
| **System role** | **Terminal edge realization / operator surface** — presents and drives the Canonical → e-Explore → phi-Organize → p-Contain → rho-Reconcile → Verify → Commit loop; owns no pipeline logic of its own |

**[mythic]** The console is the observation deck above the basement: a dark lattice where the operator watches the hologram breathe — stages lighting up as the homeostat explores, refuses, and occasionally commits. **[operational]** Concretely it is one offline-capable HTML file served by `src/web/server.mjs` (or `cli/fractios.mjs serve`) that posts to `/api/explore` and `/api/regulate` and renders the same JSON envelopes the CLI prints — the PARTS↔WHOLE↔PARTS loop made visible without adding a dependency to the layer.

## Cross-Scale Invariants

| Invariant | Statement | Tier |
|---|---|---|
| **Single-file surface** | Each surface is one HTML file with inline CSS/JS; zero external fetches (no CDN, no fonts), offline-capable, keys stay local. | operational |
| **Envelope fidelity** | The console renders exactly the `{success, ...}` envelopes emitted by the CLI/server; no parallel reimplementation of gates or metrics in the client. | operational |
| **Write containment** | All server-side writes land under `data/explorations/`; the server binds `127.0.0.1` only and fails closed on path traversal. | verified |
| **Honesty boundary on every surface** | Header banner always visible; footer repeats it with the voice-tier legend and the supersets chain. | verified |
| **Loud errors** | Network, HTTP, and envelope failures render as explicit fail-closed error panels — never swallowed into defaults. | operational |
| **Integrity visibility** | Commit verdicts and journal records shown to the operator are sha256-addressed canonical states produced by `src/kernel/state.mjs` — the console never fabricates an address. | operational |

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*