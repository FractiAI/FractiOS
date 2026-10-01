# src/repos/ — agent rules

| Field | Value |
|---|---|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

- **[operational]** `manifest.json` is metadata only: it describes the estate; it never embeds or vendors estate code.
- **[verified]** Never clone, copy, or vendor estate repos — one-copy rule; the nightly mirror at `/Volumes/GitVault/Username/FractiAI` is the single copy.
- **[verified]** `validateAgainstDisk` is read-only: it inspects the mirror in place and never writes, commits, branches, or pushes there.
- **[operational]** Fail-closed: a missing manifest, unknown node, or failed validation throws — no empty results, no silent defaults.
- **[operational]** Proposals written only under `<base>/data/explorations/` (Seed:Edge records). Repo-wide rules: [`../../AGENTS.md`](../../AGENTS.md); honesty boundary mandatory on claims.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
