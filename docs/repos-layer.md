# Repos layer — manifest, registry, operator

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |
| Module | repos-layer |
| Boundary | [`honesty.md`](honesty.md) |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**[operational]** What the homeostasis loop runs *over*: the 57-repo FractiAI estate, addressed through a manifest — never copied.

## The 57-node manifest

**[operational]** `src/repos/manifest.json` declares the estate: 57 repos of the FractiAI mirror. `repos/` holds a **MANIFEST of the 57 estate repos**, not copies of them.

## Registry validation

**[operational]** `src/repos/registry.mjs` loads the manifest (fail-closed — a missing manifest is an error, not an empty result), validates it **against disk** at `/Volumes/GitVault/Username/FractiAI` (`validateAgainstDisk`), and materializes `localSummaries()` — the per-node local state summary plus holographic global summary consumed by the regulator ([`regulator.md`](regulator.md)).

## Operator routing

**[operational]** `src/repos/operator.mjs` exposes `route(op, node, payload)` — estate operations: **read / index / measure / propose**. Proposals are Seed:Edge records (format: [`definitions.md`](definitions.md)), written only under `data/explorations/` (via `PROPOSAL_LOG_PATH`). Writes outside the FractiOS base dir are forbidden and must fail closed.

## One-copy rule

**[operational]** FractiOS does **not clone** the estate. The mirror at `/Volumes/GitVault/Username/FractiAI` is the single copy (synced nightly); disk validation reads it in place. Duplicating estate content into FractiOS would violate the one-copy rule and the NSPFRP no-duplication principle.

## Read-only mirror

**[operational]** The estate mirror is **read-only** toward FractiOS: never write, commit, branch, push, rebase, or stash there. FractiOS reads the manifest and validates against disk; its own writes are confined to its base dir, and it commits only verified explorations (gate semantics: [`gates.md`](gates.md)).

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*