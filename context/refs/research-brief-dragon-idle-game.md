# Research Brief: dragon-idle-game

**Generated:** 2026-04-15
**Agents:** 1 codebase, 3 web
**Sources consulted:** ~15 unique references across idle game design literature, Svelte 5 docs, and open-source idle game repos

## Summary

The Dragon Hoard codebase is architecturally sound (correct Svelte 5 runes usage, proper state/logic/persistence separation, delta-time corrected rAF loop), but has several high-impact design gaps that map directly to known idle-game retention killers: 75% of prestige stats are non-functional, mountain layers 4-7 are unreachable dead data, and offline progress is uncapped. The most impactful near-term work is closing these design loops — making stats functional, gating locked layers with visible requirements, and capping offline progress — rather than adopting new libraries or restructuring code.

## Key Findings

### Architecture & Patterns

- Codebase follows correct Svelte 5 runes patterns: `$state` for reactive state, `$derived` for computed values, `$effect` for side effects only. Existing architecture is idiomatic. [confidence: HIGH] [sources: 2]
- Strict separation — `gameState.svelte.ts` (state), `game.svelte.ts` (logic), `storage.svelte.ts` (persistence), `src/lib/configs/` (static data) — is well-suited for an idle game and matches patterns in Profectus (Vue-based reference). [confidence: HIGH] [sources: 2]
- `requestAnimationFrame` with delta-time correction is the correct baseline for a tab-foreground idle game; current implementation is appropriate. [confidence: HIGH] [sources: 2]

### Library Landscape

- Recommended: **No new library needed at current scale.** Native JS `Number` + `Intl.NumberFormat` is sufficient until values exceed ~1e15. [confidence: HIGH]
- Alternative: `break_eternity.js` (188 stars, TS-native, Dec 2025) — adopt only when numbers outgrow IEEE-754 safe integer range. [confidence: HIGH]
- Avoid: Profectus, Continuum Engine as runtime frameworks — Vue-only or unstable. Use Profectus only as architectural reference. [confidence: HIGH]
- Avoid: Installing Vitest/Oxlint/tsdown directly — Vite+ wraps these (per AGENTS.md). [confidence: HIGH]

### Best Practices

- **Prestige formulas should be deterministic and previewable** — Cookie Clicker (cube-root), AdVenture Capitalist (sqrt), Profectus `x.div(10).sqrt()`. Showing expected prestige gain before reset increased engagement 28% in A/B testing.
- **Offline progress cap: 4-24 hours industry standard** (Melvor Idle: 24h; most mobile idle: 4-10h). Simple fix: `Math.min(timeDiffSeconds, 8 * 3600)`.
- **60/40 rule**: 60% progress from idle, 40% from active. Active faster but never mandatory.
- **Progressive disclosure with visible locks** ("known unknowns") beats hiding content — Cookie Clicker shows locked buildings with requirements.
- **Growth gap**: production ~1.1x/upgrade vs. costs 1.15x/upgrade creates deliberate slowdown; current 1.15x cost scaling is consistent with this.
- **Human perception threshold**: ~20% changes to feel noticeable — rate tweaks below this are invisible.

### Existing Art

- **Cookie Clicker** — sequential building unlocks + cubic prestige formula; shows expected prestige gain pre-reset. Model for mountain layer progression.
- **Clicker Heroes** — two-tier prestige (frequent Ascension + rare Transcendence) creating short- and long-loop decisions.
- **Antimatter Dimensions** — "mandatory prestige" early resets train habit; "stat consumption chaining" ensures no currency sits idle; Dimensional Sacrifice turns dead-weight into resource.
- **Profectus (Vue)** — best architectural reference for layer/prestige organization despite different framework.
- **Melvor Idle** — 24h offline cap reference point.

### Pitfalls to Avoid

- **Non-functional UI stats** (luck/beauty/armor) — players discover and report as bugs, lose trust. Either implement minimally (luck = click bonus %, beauty = reduced mate cost, armor = damage reduction) or hide until implemented.
- **Unreachable content** (layers 4-7) is classic "mid-game content desert" — leading retention killer; day-7 retention gap is 10-15% (well-paced) vs. 8% (poorly-paced).
- **Random prestige rewards** violate core principle: players must be able to calculate whether reset is worthwhile. Current random stat-point allocation causes blind prestige.
- **Uncapped offline progress** (1) eliminates the return-hook, (2) is inaccurate for compound growth (player would have bought minions mid-absence), (3) lets offline ore skip the layer experience entirely.
- **IEEE-754 float accumulation** — use `>=` not `===` for threshold checks; watch for `122.9999...` preventing purchases.
- **localStorage migration** — `JSON.stringify` drops `undefined`; new state properties need default-fill on load or saves corrupt silently.
- **rAF delta clamping** — brief tab-switch (<5s) can resume with large accumulated delta before offline-progress triggers; clamp max delta to ~1s.
- **Svelte 5 `$effect` infinite loops** (GitHub issue #16224) — mutating non-primitive `$state` read inside same `$effect`; use `untrack()`.
- **Module-level `loopStarted` guard** could block game loop in test contexts.
- **`clickBurrow` bypasses layer limits** — two parallel capacity systems need reconciliation.

## Contradictions & Open Questions

- **Dead data vs. progressive disclosure for layers 4-7**: Sources agree hidden-with-requirements ("known unknowns") beats fully hidden. Assessment: gate layers 4-7 with visible ore/unlock costs rather than remove them.
- **Web Worker for background accumulation**: Worth the complexity? Assessment: No — current offline-progress-on-load is industry standard for single-player; add Worker only if real-time background accumulation is a product goal.
- **Prestige formula choice** (cube-root / sqrt / quadratic / 7th-root): No single "correct" answer — depends on intended prestige cadence. **Needs user input** on whether prestige should feel frequent (sqrt/cube-root) or rare (7th-root).
- **What should luck/beauty/armor actually do?**: Research suggests minimal implementations but no canonical mapping — **needs design decision**.

## Codebase Context

- **Architecture**: SvelteKit static SPA, `adapter-static`, no SSR. Strict separation: state (`gameState.svelte.ts`) / logic (`game.svelte.ts`) / persistence (`storage.svelte.ts`) / config (`src/lib/configs/`). Single-page UI in `+page.svelte`.
- **Key patterns**: Svelte 5 runes globally (`runes: true`), TypeScript throughout, camelCase vars, SCREAMING_SNAKE_CASE constants, PascalCase types. Cost scaling `baseCost * 1.15^owned`. rAF loop with delta correction, 5s auto-save accumulator.
- **Dependencies**: Svelte 5.55+, SvelteKit 2.55+, TypeScript 5.9, Vite+ 0.1.14. Zero runtime dependencies. Tooling exclusively through `vp` CLI.
- **Test coverage**: 5 tests in `game.test.ts`. Core income calculations and prestige logic untested. No CI pipeline.

## Implications for Design

- **Quick wins with high retention impact**: (1) cap offline progress at 8h with summary screen on return, (2) gate layers 4-7 behind visible ore costs, (3) make luck/beauty/armor do something minimal or hide them.
- **Prestige redesign needed**: replace random stat points with deterministic, previewable formula (e.g., `sqrt(gold/10000)`) and show expected gain before committing. This is the single highest-leverage design change.
- **Reconcile `clickBurrow` with layer capacity system** — two parallel capacity paths is a latent bug surface.
- **Save migration layer required before adding new state fields** — without default-fill on load, any future field becomes `undefined` for existing players.
- **Clamp rAF delta to ~1s max** to harden against tab-switch bursts before offline-progress takes over.
- **Test coverage priorities**: income calculation and prestige math — these are where silent floating-point and formula bugs hide.
- **EventsTab stub is a retention liability** — either ship a minimal events system or remove the tab (known unknowns work only when the requirement to unlock is visible).
- **No new libraries or framework shifts warranted**; architecture and toolchain are correct for the game's current scale.

## Sources

- Codebase at `/src/lib/` — current implementation state and gaps
- [Svelte $state docs](https://svelte.dev/docs/svelte/$state) — rune patterns
- [Svelte issue #16224](https://github.com/sveltejs/svelte/issues/16224) — `$effect` infinite-loop anti-pattern
- [break_eternity.js](https://github.com/Patashu/break_eternity.js/) — big-number library recommendation
- [break_infinity.js](https://github.com/Patashu/break_infinity.js/) — predecessor, viable for simpler ranges
- [Profectus](https://github.com/profectus-engine/Profectus) — Vue-based architectural reference for prestige layers
- [The Math of Idle Games, Part I](https://blog.kongregate.com/the-math-of-idle-games-part-i/) — cost/production curve design
- [The Math of Idle Games, Part III](https://blog.kongregate.com/the-math-of-idle-games-part-iii/) — prestige formula analysis
- [Idle Game Design Principles — Eric Guan](https://ericguan.substack.com/p/idle-game-design-principles) — 60/40 rule, tiered caps
- [Balancing Tips: Idle Idol](https://www.gamedeveloper.com/design/balancing-tips-how-we-managed-math-on-idle-idol) — spreadsheet modeling
- [Melvor Idle Offline Progression](https://wiki.melvoridle.com/w/Offline_Progression) — 24h cap precedent
- [Cookie Clicker Ascension Wiki](https://cookieclicker.fandom.com/wiki/Ascension) — cubic prestige formula
- [Antimatter Dimensions Wiki](https://antimatter-dimensions.fandom.com/wiki/Guide) — stat consumption chaining
- [MDN — Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) — float precision limits
- [InnoGames — Huge Numbers in Idle Games](https://blog.innogames.com/dealing-with-huge-numbers-in-idle-games/) — float comparison pitfalls
- [kastark.co.uk — Developing Incrementals](https://kastark.co.uk/articles/incrementals-part-2.html) — save migration pitfalls
- [Game UI Database](https://www.gameuidatabase.com/) — UI pattern reference
