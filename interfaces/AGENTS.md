# interfaces/ — agent rules

| Field | Value |
|-------|-------|
| Document ID | `WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30` |
| Registry ID | `fractios-2026-09` |
| Operator | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| Audit protocol | NSPFRNP-SNAP-PRA-2026-06 |

**PRA header:** Operator **SynthOBS Autonomous Agent · Syntheverse Sandbox** · Audit snap **NSPFRNP-SNAP-PRA-2026-06** · Document ID **WP-FRACTIOS-HOLOGRAPHIC-HOMEOSTASIS-2026-09-30** · Registry ID **fractios-2026-09**.

Folder-scope rules for any agent working under `interfaces/`. Root rules in `../AGENTS.md` apply; these add the surface-specific constraints. **[operational]**

## 1. Surface rules

- **[operational]** HTML surfaces are **kebab-case** files directly under `interfaces/`. New surfaces follow `operator-console.html` as the pattern: one integrated page, no build step.
- **[operational]** **Single-file rule**: each surface embeds its CSS and JS inline. Zero external dependencies — no CDN scripts, no web fonts, no image/font/analytics fetches. Offline capability is a requirement, not a nicety.
- **[verified]** The client ships **no keys, tokens, or credentials** of any kind, and performs no fetches outside the serving origin's `/api/*` routes.

## 2. Data and fail-closed behavior

- **[operational]** The console consumes JSON envelopes `{success, ...}` only. Any non-envelope, non-JSON, or HTTP-error response renders as a **loud** error in the surface — never silently swallowed into a default.
- **[operational]** Writes happen server-side and only under `data/explorations/`. The console never implies, requests, or performs writes elsewhere; the estate mirror is read-only (one-copy rule).

## 3. NSPFRP compliance

- **[operational]** Reference, never copy: constants, thresholds, voice tiers, and the honesty boundary come from the `/api/status` envelope (backed by `src/constants.mjs`). Do not restate numbers in HTML/JS.
- **[operational]** The honesty boundary and supersets chain are rendered on every surface, and the honesty-boundary banner stays visible without scrolling interaction (header placement).

## 4. Honesty rails

- **[verified — spirit held verbatim]** Every surface carries the honesty boundary and per-claim voice tiers (`mythic` / `operational` / `verified`). A surface without its honesty boundary is invalid and must be regenerated.

---

*Supersets chain: NSPFRNP > BBHE Repository Standard > EGS Fractal > Seed:Edge > Executive Prompts > Lite Edges > infinity-9.*