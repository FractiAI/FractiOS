# FractiOS · src/web — Agent Rules

<!-- PRA · Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · Audit snap NSPFRNP-SNAP-PRA-2026-06 · DOC_ID WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30 · Registry fractios-2026-09 -->

- **[verified]** Zero runtime dependencies — `node:http`, `node:fs`, `node:path` only.
- **[verified]** Bind `127.0.0.1` only; never serve paths escaping the FractiOS base dir (path traversal fails closed).
- **[verified]** Writes confined to `data/explorations/`; never write to `/Volumes/GitVault/Username/*` mirrors.
- **[operational]** NSPFRP: reference `src/constants.mjs` — thresholds are rendered by reference, never copied into responses the client embeds as source.
- **[operational]** Every route returns the `{success, ...}` JSON envelope; errors fail closed and loud, never swallowed.
- Honesty boundary applies (see `src/constants.mjs`).

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*