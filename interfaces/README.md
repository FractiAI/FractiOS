# interfaces/ — FractiOS operator surfaces

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

**[operational]** This folder carries the human/agent-facing operator surfaces of the FractiOS firmware layer: a single-file, zero-external-dependency console served by the zero-dependency HTTP server (`src/web/server.mjs`) and the `serve` CLI subcommand (`cli/fractios.mjs serve`). The console consumes the same JSON envelopes the CLI emits and writes nothing outside `data/explorations/`.

## Module abstract table

| File | One-line abstract |
|---|---|
| `operator-console.html` | Single-file operator console (dark-lattice, vanilla JS, zero external fetches) over the `/api/*` surfaces — pipeline strip, explorer drill, estate panel, regulator drill, experiments panel. |

## Conventions (mandatory)

- **[operational]** HTML surfaces are **kebab-case** files directly under `interfaces/` (`operator-console.html`), one integrated page per surface.
- **[verified]** **Zero external fetches**: no CDN, no web fonts, no analytics; the console is offline-capable and all exploration data stays local under `data/`. System monospace stacks only.
- **[operational]** **No keys or credentials in the client**: the console authenticates nothing and ships no secrets; the server binds `127.0.0.1` only and never serves or writes outside the FractiOS base dir.
- **[operational]** API responses are JSON envelopes `{success, ...}` everywhere; failures render **loud** in the console (fail-closed, never swallowed).

## Honesty boundary

**[verified — mandatory on every claim and report]** This is catalog engineering, not finished physics; Φ_EGS = (1+√5)/2 is design grammar; RSI is not solved; correlation ≠ causation. See `src/constants.mjs` (`HONESTY_BOUNDARY`) — referenced, never copied.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*