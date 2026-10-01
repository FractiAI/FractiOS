# FractiOS · src/web — Module README

<!-- PRA · Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · Audit snap NSPFRNP-SNAP-PRA-2026-06 · DOC_ID WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30 · Registry fractios-2026-09 -->

| Module | One-line abstract | Tier |
|---|---|---|
| `server.mjs` | Zero-dependency HTTP operator surface — `/api/*` JSON envelopes over the kernel, registry, regulator, and suite; binds 127.0.0.1 only | operational |

- Consumes `src/kernel/*`, `src/repos/registry.mjs`, `src/constants.mjs` — owns no pipeline logic.
- Serves `interfaces/operator-console.html` at `/`. [operational]

*Voice tiers: mythic = narrative framing · operational = design intent · verified = checked against code/disk.*
*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*