# START HERE — FractiOS

<!-- PRA · Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · Audit snap NSPFRNP-SNAP-PRA-2026-06 · DOC_ID WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30 · Registry fractios-2026-09 · Release v0.1618 -->

**FractiOS is the holographic homeostasis firmware layer for the FractiAI estate** — a zero-dependency Node ESM kernel that imports all 57 estate repos as a manifest (never clones them) and runs every change through one disciplined pipeline: `Explore → Organize → Contain → Reconcile → Verify → Commit`. **[operational]**

> **Honesty boundary (mandatory, always on):** catalog engineering, not finished physics. Φ_EGS = (1+√5)/2 is a design grammar, not a physics constant. Nothing here claims RSI is solved. Correlation is not causation. **[verified]**

## Three doors

| Door | Open it for | Tier |
|---|---|---|
| [`README.md`](README.md) | Architecture, the six HH stages, integration notes, full quickstart | operational |
| [`docs/README.md`](docs/README.md) | The modular treatise — index + 8 content modules: definitions · metrics · constants · gates · regulator · repos-layer · empirical-suite · honesty | operational |
| **Operator console** | `node cli/fractios.mjs serve` → `http://127.0.0.1:8181` — drill explorations, regulate the estate, watch the 57-node manifest validate live | operational |

## 60-second run (Node ≥ 20, no install step)

```bash
npm run research   # E1..E9 empirical suite → expect 9/9, exit 0   [verified]
npm run boot       # boot envelope: registry, stages, loop, constants [verified]
npm run serve      # operator console at http://127.0.0.1:8181    [operational]
node cli/fractios.mjs repos check   # manifest vs disk: 57/57 present [verified]
```

## The fractal self-documenting hierarchy

Every folder carries the trio — `README.md` (what lives here) + `AGENTS.md` (folder-scope agent rules) + `FRACTAL.md` (Fractal Position + Cross-Scale Invariants). The root trio governs the whole tree; every folder mirrors it. **[operational]**

| Scale | Where |
|---|---|
| Whole tree | root trio + [`FRACTIOS_EDGE_ONBOARDING.md`](FRACTIOS_EDGE_ONBOARDING.md) (lite edge for new agents) |
| Computation | `src/kernel/` trio |
| Estate boundary | `src/repos/` trio |
| Operator surface | `interfaces/` + `src/web/` trios |
| Verification | `experiments/` trio · state ledger: `data/` trio (generated — never hand-edit) |

## First commit gate, in one breath **[operational]**

An exploration commits only if it clears the three-axis Goldilocks gate vs Control A (`RCR > RCR_A ∧ B < B_A ∧ E > E_A`), and the Useful Commit Rate floor (≥ 0.10) applies as a **population gate** — report-only below `UCR_MIN_ELIGIBLE = 8` eligible explorations, so single honest candidates are never over-refused.

*Voice tiers: mythic = narrative framing · operational = design intent · verified = checked against code, disk, or receipts.*
*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*