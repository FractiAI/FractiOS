# cli/ — agent rules

| Field | Value |
|-------|-------|
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit snap | NSPFRNP-SNAP-PRA-2026-06 |
| Document ID | WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30 |
| Registry ID | fractios-2026-09 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

## Rules

1. **[verified]** Every subcommand returns a JSON envelope `{success, ...}` — never bare text on the success path.
2. **[verified]** Fail-closed: any error exits nonzero and puts the reason inside the envelope; suppressed/soft failures are forbidden.
3. **[operational]** No git commands anywhere in this folder; the FractiAI mirror at `/Volumes/GitVault/Username/FractiAI` is read-only (one-copy rule).
4. **[operational]** Zero runtime dependencies; new subcommands reuse `src/kernel/*` and `src/repos/*` — never re-implement pipeline logic here.
5. **[operational]** Honor the honesty boundary from `src/constants.mjs` on any printed report.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*
