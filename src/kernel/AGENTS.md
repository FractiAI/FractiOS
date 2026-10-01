# src/kernel/ — agent rules

| Field | Value |
|---|---|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

- **[operational]** Pure functions only: no filesystem, network, or process I/O in this folder; imports are side-effect free.
- **[operational]** Deterministic: same inputs → same outputs, byte for byte. No `Date.now()`, no `Math.random()`, no entropy of any kind in computation.
- **[verified]** Constants are frozen: thresholds come from `../constants.mjs` (`E_FROZEN`, `RHO_FROZEN` true); kernel modules never restate them.
- **[operational]** Fail-closed: throw on invalid state/ops; never swallow into defaults.
- **[operational]** Honesty boundary mandatory on claims: catalog engineering, not finished physics. Rules for the parent folder: [`../AGENTS.md`](../AGENTS.md).

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
