# Findings Board: Idle game about a dragon hoarding gold

> Shared coordination state for research agents.
> Later agents read this before searching to avoid duplicates and build on earlier work.

## Agent: codebase-all

### Architecture

- Single SvelteKit static SPA. State in `gameState.svelte.ts` (`$state`), logic in `game.svelte.ts`, persistence in `storage.svelte.ts`, pure config arrays in `src/lib/configs/`.
- Framework: Svelte 5.55+, SvelteKit 2.55+, TypeScript 5.9, Vite+ 0.1.14. `runes: true` enforced globally.
- `requestAnimationFrame` game loop with delta-time. `loopStarted` module guard. Auto-save every 5s via `saveTimer` accumulator.
- Build: Vite+ (`vp`). SvelteKit `adapter-static`. Fully static SPA, no SSR.

### Key Design Gaps Found

- **Luck, beauty, armor stats do nothing** — 75% of prestige points wasted.
- **Mountain layers 4-7 (Limestone through Obsidian) are unreachable dead data** — no unlock mechanism.
- **Offline progress uncapped** — returning after weeks gives full theoretical income with no cap.
- **`clickBurrow` bypasses layer limits** — two parallel capacity systems not reconciled.
- **EventsTab is fully stubbed placeholder** — no backing system.
- **No CI pipeline.**
- **Module-level `loopStarted` flag** could block game loop if `startGameLoop` called in test context.

### Patterns & Conventions

- camelCase vars/functions, SCREAMING_SNAKE_CASE config constants, PascalCase types/components.
- New game systems = new config file + action functions in `game.svelte.ts` + UI tab.
- `$derived` and `$derived.by` for computed values (in components). `$effect` for side effects only.
- Zero runtime dependencies. Fully offline-capable except Google Fonts CDN.

### Game Systems

- Minion costs: `Math.floor(baseCost * Math.pow(1.15, owned))`. 4 minion types.
- Prestige (`attractMate`): 10k gold minimum, random stat points, wipes gold/ore/minions/buildings/upgrades.
- Test coverage: 5 tests in `game.test.ts`. Core income calculations and prestige entirely untested.

## Agent: library-landscape

### Library Landscape

- No mature, Svelte-compatible idle game framework exists. Profectus (34 stars) and Continuum Engine (~60 stars) are Vue-only or unstable.
- **`break_eternity.js`** (188 stars, Dec 2025): correct big-number library for idle games. TypeScript native. Only needed when values exceed ~1e15 display needs.
- **`break_infinity.js`** (241 stars, Feb 2023): predecessor, still viable for simpler range, recommends break_eternity as successor.
- Native JS `Number` with `Intl.NumberFormat` sufficient at current game scale.

### Game Loop Patterns

- `requestAnimationFrame` is correct baseline. Background tab throttling is real (Chrome throttles `setInterval` to once/min after 5min inactive).
- Web Worker + `setInterval` pattern solves background accumulation but adds complexity — only needed if game accumulates in real time while tab is inactive.
- Current offline-progress-on-load approach is industry standard for single-player idle games.

### Svelte 5 Patterns

- `$state` creates deeply reactive proxies — granular DOM updates, efficient for game state mutations.
- `$state.raw` for large objects that are fully replaced (not mutated property-by-property).
- `$derived` is memoized — correct for cost scaling, production rates.
- Class-based `$state` preferred for global state (V8 optimization). Current flat object pattern is also valid.
- Avoid `$effect` for game logic that mutates state — use in plain JS functions instead.
- Existing architecture already follows correct Svelte 5 patterns.
