# Constants — the pinned numbers

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |
| Module | constants |
| Boundary | [`honesty.md`](honesty.md) |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**[operational]** Single source of truth: `src/constants.mjs`. This table cites it — the module is authoritative on any drift; importing a symbol is always preferred to restating it.

## 3. Constants

| Constant | Value | Meaning | Tier |
|---|---|---|---|
| **Φ_EGS** | $(1+\sqrt{5})/2$ | Catalog nesting grammar: depth 2, width round(Φ_EGS+1) = 3. **Not a physics constant.** | operational |
| **EGS_IE** | 0.0032 | EGS interval energy (design parameter) | operational |
| **RCR_MIN** | 0.7 | Commit gate: minimum recoverable-content ratio | operational |
| **B_MAX** | 0.35 | Commit gate: maximum bleed | operational |
| **E_MIN** | 0.01 | Commit gate: minimum useful evolution | operational |
| **UCR_FLOOR** | 0.10 | Useful Commit Rate floor over eligible explorations | operational |
| **UCR_MIN_ELIGIBLE** | 8 | Minimum eligible explorations before the UCR floor gates a commit; below it UCR is report-only (the held-out study used 48 eligible explorations) | operational |
| **D_LOW / D_COLLAPSE** | 0.05 / 0.6 | Goldilocks distortion band | operational |
| **PHI_DEPTH / PHI_WIDTH** | 2 / 3 | phi-Organize shelf geometry | operational |
| **E_FROZEN** | true | E's definition (novelty × recoverable shape) frozen for this registry | operational |
| **RHO_FROZEN** | true | rho's role (reconciliation, searched α) frozen for this registry | operational |
| **ALPHA_STEPS** | 64 | Reconciliation grid resolution | operational |
| **LOOP** | PARTS↔WHOLE↔PARTS | Regulator loop invariant | mythic |
| **e frozen** | — | Stepwise-novelty coefficient frozen for the study window; changes require a new registry | operational |

Gate semantics that consume these constants: [`gates.md`](gates.md).

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*