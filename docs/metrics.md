# Metrics — D, B, E, L, RCR, IFE, UCR

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |
| Module | metrics |
| Boundary | [`honesty.md`](honesty.md) |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**[operational]** Single source of truth for implementations: `src/kernel/metrics.mjs`. This module documents the contract; the code is authoritative on any drift.

## 2. Metrics

| Metric | Formula | Tier |
|---|---|---|
| **D** (distortion) | $D = \mathrm{NRMSE}(X_n, X_0)$ — root-mean-square error of current vs origin, normalized by RMS of the origin | operational |
| **B** (bleed) | $B = \dfrac{E_{unintended}}{E_{contained} + E_{leaked}}$ — unintended cross-container energy over total exchanged energy | operational |
| **E** (useful evolution) | $E = \text{stepwise novelty} \times \text{recoverable shape vs origin}$ | operational |
| **L** (loss) | $L = 1 - RCR$ | operational |
| **RCR** (recoverable content ratio) | $RCR = \dfrac{\text{recoverable after recursion}}{\text{recoverable at encode}}$ (0 if recoverable at encode ≤ 0) | operational |
| **IFE** (information for energy) | $IFE = \dfrac{\text{recoverable}}{\text{representation cost}}$ | operational |
| **UCR** (useful commit rate) | $UCR = \dfrac{\text{commits satisfying all three axes}}{\text{eligible explorations}}$, floor ≥ 0.10 — **population gate**: enforced only when eligible explorations ≥ UCR_MIN_ELIGIBLE (8); report-only below that (over-safe-refuse guard, see [`gates.md`](gates.md)) | operational |

## Three-axis Goldilocks gate vs Control A

**[operational]** An exploration is *useful* iff
$$RCR > RCR_A \;\wedge\; B < B_A \;\wedge\; E > E_A.$$
How this gate enters the commit decision: [`gates.md`](gates.md).

## Goldilocks operating band

**[operational]** A regulated state is *viable* iff $D_{LOW} < D < D_{COLLAPSE}$ (0.05 < D < 0.6), $B \le 0.35$, $E > 0$ — enough distortion to evolve, not enough to collapse, contained bleed, positive novelty.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*