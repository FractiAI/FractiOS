# Gates — commit-gate semantics

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |
| Module | gates |
| Boundary | [`honesty.md`](honesty.md) |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**[operational]** What an exploration must clear to become canonical — and what happens when it does not.

## Commit gate (per-candidate thresholds)

**[operational]** `identity != explore`: canonical commits happen only when the candidate clears the full gate

$$R \ge R_{MIN} \;\wedge\; RCR \ge RCR_{MIN} \;(0.7) \;\wedge\; B \le B_{MAX} \;(0.35) \;\wedge\; E > E_{MIN} \;(0.01).$$

Thresholds are pinned in `src/constants.mjs`; metric formulas: [`metrics.md`](metrics.md).

## Three-axis Goldilocks gate vs Control A

**[operational]** An exploration is *useful* iff $RCR > RCR_A \;\wedge\; B < B_A \;\wedge\; E > E_A$ (vs the Control A receipt). The per-gate thresholds and the three-axis gate are both evaluated in the Verify stage; **both must hold** for `verify.pass`.

## UCR population gate (over-safe-refuse guard)

**[operational]** Useful Commit Rate floor ≥ 0.10 (`UCR_FLOOR`) over eligible explorations is a **population gate**: enforced only when eligible explorations ≥ `UCR_MIN_ELIGIBLE` (8); below that it is reported but **not gated** (`ucrReportOnly`), preventing the over-safe-refuse failure mode — a regime that refuses everything never accumulates enough eligible explorations to prove it should refuse. The held-out study used 48 eligible explorations.

## Fail-closed refusal

**[verified]** The promotion rule is enforced in `src/kernel/pipeline.mjs` — no code path commits without `verify.pass`. A candidate that fails any axis is journaled with its reason, never promoted; the CLI exits nonzero on failure. Nothing is swallowed into a default.

## 4. The EPH-IA-Delta-HO gate lineage

**[operational]** FractiOS's verify stage descends from the EPH-IA-Delta-HO gate lineage cataloged as **ENGINE_SHELF feature #36 (analog)**: the *Exogenous Perturbation → Internal Adaptation → Delta → Holographic Oscillation* gate, in which a system is perturbed, adapts locally, reconciles the delta holographically (every node's global summary absorbs the change), and is promoted only if the oscillation converges within the Goldilocks band. FractiOS realizes the lineage concretely:

| Lineage stage | FractiOS realization |
|---|---|
| Exogenous Perturbation | `regulate(nodes, perturbation)` — typed perturbation `{type, magnitude, targets?}` |
| Internal Adaptation | per-node local responses from local summaries |
| Delta | `delta(canonical, explored)` — lossless E2-style `{added, removed, changed, base}` |
| Holographic Oscillation | reconcile α-search + verify three-axis gate vs Control A |
| Promotion | commit only if `verify.pass`; otherwise journal with reason (fail-closed) |

**[mythic]** The gate is the same gate at every octave: perturb, adapt, reconcile, and let only the coherent oscillation through. **[verified]** The promotion rule is enforced in `src/kernel/pipeline.mjs` — no code path commits without `verify.pass`.

## 5. Held-out reference numbers (catalog evidence)

| Quantity | Value | Source role |
|---|---|---|
| Reference study RCR | **0.8750** | held-out receipt |
| Reference study B | **0.2943** | held-out receipt |
| Reference study E | **0.0206** | held-out receipt |
| Reference study useful commit rate | **0.50** | held-out receipt |
| Control A RCR | **0.7624** | comparison control |
| E4 useful commit rate | **0.1354** | comparison run |

**[operational]** Read against the gate: the reference study clears all three axes against Control A (RCR 0.8750 > 0.7624, B 0.2943 < B_A, E 0.0206 > E_A) and exceeds the UCR floor (0.50 ≥ 0.10). E4 (0.1354) clears the floor but is the comparison point for marginal useful-commit behavior. **[mythic]** The receipts whisper what the theory sings — and the theory is catalog grammar, so the whisper is the evidence.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*