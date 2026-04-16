## Agent: codebase-all

### ARCHITECTURE

**Directory Structure and Module Boundaries**

- Finding: The project is a single SvelteKit app with a clean separation of concerns across 4 lib modules and 1 route. All source lives under `src/`.
- Evidence:
  ```
  src/
    app.css                        — global styles/design tokens
    app.html                       — SPA shell
    lib/
      types.ts                     — TypeScript interfaces only
      names.ts                     — name generation utility, no game logic
      gameState.svelte.ts          — reactive $state store, no logic
      game.svelte.ts               — all game logic + game loop
      storage.svelte.ts            — localStorage persistence + offline calc
      configs/
        buildings.ts               — static building data
        minions.ts                 — static minion data
        mountain.ts                — static layer data
        trading.ts                 — trading constants
        upgrades.ts                — static upgrade data
      components/
        AppHeader.svelte           — save/import/export/reset UI
        DragonCard.svelte          — dragon stats display
        HoardDisplay.svelte        — gold/ore/capacity panel + click actions
        MountainStrataMap.svelte   — visual layer progress map
        tabs/
          BroodTab.svelte          — minion buying
          BuildingsTab.svelte      — buildings + upgrades + prestige
          DepthsTab.svelte         — mountain map wrapper
          EventsTab.svelte         — placeholder (not implemented)
          TradeTab.svelte          — ore buy/sell
    routes/
      +layout.ts                   — prerender=true, ssr=false
      +layout.svelte               — favicon, CSS import
      +page.svelte                 — main UI, tab router, calls startGameLoop()
  ```
- Implication: Clear boundaries. Configs are pure data arrays. Business logic is strictly in `game.svelte.ts`. UI components import from `$lib/game.svelte.js` for both state and actions.
- Confidence: HIGH

**Entry Points and Build System**

- Finding: Build system is Vite+ (`vp`), wrapping Vite, Rolldown, Vitest, Oxlint, Oxfmt. SvelteKit adapter is `adapter-static` (static site to `build/`). SPA entry is `src/app.html`. `+layout.ts` exports `prerender = true; ssr = false`.
- Implication: Fully static SPA. No server-side logic. `vp` toolchain must not be broken up — no bare vitest/oxlint.
- Confidence: HIGH

**Framework Versions**

- Finding: Svelte 5 (`^5.55.1`), SvelteKit 2 (`^2.55.0`), TypeScript 5.9, Vite+ 0.1.14. `svelte.config.js` sets `runes: true` for all non-`node_modules` files.
- Implication: Svelte 5 runes mandatory throughout. No legacy Svelte 4 stores.
- Confidence: HIGH

**Game State Organization and Data Flow**

- Finding: Single flat reactive object `game` exported from `gameState.svelte.ts` as `$state<GameState>`. All mutations happen directly on this object in `game.svelte.ts`. Components read from `game` and call action functions from `game.svelte.ts`.
- Evidence: `gameState.svelte.ts:46` — `export const game = $state<GameState>(createDefaultGameState())`.
- Implication: No selector pattern, no reducers. Fine at current scale.
- Confidence: HIGH

### PATTERNS

**Coding Conventions**

- Finding: camelCase for variables/functions, SCREAMING_SNAKE_CASE for config constants, PascalCase for types and components. Svelte 5 runes only. TypeScript strict mode.
- Confidence: HIGH

**Abstractions**

- Finding: No external store library. State is a single Svelte 5 `$state` object. `game.svelte.ts` exports ~12 action functions: `clickGold`, `clickBurrow`, `buyBuilding`, `buyUpgrade`, `trainMinion`, `attractMate`, `buyOre`, `sellOre`, `calculatePassiveIncome`, `calculatePassiveOre`, `calculatePassiveCapacity`, `getCurrentCapacityLimit`, `startGameLoop`.
- Implication: Dead simple. Adding new game systems = new config entry + action functions + UI tab component.
- Confidence: HIGH

**Game Loop Implementation**

- Finding: `requestAnimationFrame`-based loop started once on mount via `startGameLoop()`. Module-level `loopStarted` guard prevents double-start. Delta time computed per frame. Auto-save every 5 seconds via `saveTimer` accumulator.
- Evidence: `game.svelte.ts:191-247`
- Implication: Frame-rate dependent but delta-corrected. Runs at ~60fps — more than needed for idle game, slightly wasteful. No tick-rate throttling.
- Confidence: HIGH

**Reactive State Management**

- Finding: `$derived` and `$derived.by` for computed values local to components. `$effect` for side effects (UI feedback timers). `game` store read directly in templates.
- Evidence: `HoardDisplay.svelte:30-31`, `MountainStrataMap.svelte:5`, `BuildingsTab.svelte:39-43`
- Implication: New derived values should live in components, not in `game.svelte.ts`.
- Confidence: HIGH

### DEPENDENCIES

**Runtime vs Dev Dependencies**

- Finding: Zero runtime dependencies. All packages are devDependencies (static SPA compiled at build time).
- Implication: No runtime dependency tree. The unusual `vite: npm:@voidzero-dev/vite-plus-core@^0.1.14` alias means Vite+ intercepts all Vite imports — do not install bare `vite` or `vitest`.
- Confidence: HIGH

**External Integrations**

- Finding: Only external integration is Google Fonts (Press Start 2P + VT323). No analytics, no backend, no API calls. State persists to `localStorage` under key `dragon_hoard_save`.
- Implication: Fully offline-capable except for font CDN.
- Confidence: HIGH

### TEST INFRASTRUCTURE

**Test Framework**

- Finding: Vitest (via `vite-plus-test`) with two projects: `client` (Chromium browser, `*.svelte.test.ts`) and `server` (Node, `*.test.ts`). Currently only `game.test.ts` (server project) exists.
- Implication: Component (browser) test infrastructure exists but no component tests written yet.
- Confidence: HIGH

**What Is Tested vs Untested**

- Finding: One test file `src/lib/game.test.ts` with 5 tests: `hydrateGameState`, `clickBurrow`, `buyUpgrade`, `buyOre`/`sellOre`. NOT tested: `attractMate`, `trainMinion`, `startGameLoop`, `calculatePassiveIncome`, `calculatePassiveOre`, `calculatePassiveCapacity`, offline progress, import/export, hard reset, any UI component.
- Implication: Core income calculations and prestige mechanic entirely untested.
- Confidence: HIGH

**CI Configuration**

- Finding: No CI configuration exists. No `.github/`, no workflow files.
- Confidence: HIGH

### PROJECT-SPECIFIC SYSTEMS

**Offline Progress Calculation**

- Finding: On `loadGame()`, computes `timeDiffSeconds = (Date.now() - game.lastSaveTime) / 1000`. If >60s, applies `calculatePassiveIncome() * timeDiffSeconds`, `calculatePassiveOre() * timeDiffSeconds`, `calculatePassiveCapacity() * timeDiffSeconds`.
- Evidence: `storage.svelte.ts:114-148`
- Implication: Offline progress UNCAPPED in time — player returning after weeks gets full theoretical income. No offline multiplier or cap. Surprising design choice.
- Confidence: HIGH

**Prestige/Reset System (attractMate)**

- Finding: Requires 10,000 gold minimum. Points = `Math.floor(game.gold / 10000)`. Each point randomly increments one of 4 stats (25% each). After stat assignment, `resetHoard()` wipes gold/ore/minions/buildings/upgrades, resets `currentLayerIndex` to 0. `generation` increments by 1.
- Evidence: `game.svelte.ts:158-176`
- Implication: Luck, beauty, armor have NO functional effect. 75% of prestige points go to waste. Significant design gap.
- Confidence: HIGH

**Cost Scaling (Progression Curve)**

- Finding: Minion costs: `Math.floor(baseCost * Math.pow(1.15, owned))`. Base costs: pseudodragon 10g, miner 20g, kobold 100g, lizardfolk 1000g. Buildings: flat costs 500g/1500g/4000g. Upgrades: ore costs 200/800/3500 ore and 500/2000/10000 ore.
- Implication: Standard 1.15x scaling. No bulk-buy. No cost reset on prestige. Big gap between kobold and lizardfolk.
- Confidence: HIGH

**Minion/Miner System**

- Finding: 4 minion types. Pseudodragon: +0.1 gold/sec. Kobold Miner: +0.1 capacity/sec AND +0.05 ore/sec. Kobold: +1 gold/sec. Lizardfolk: +5 gold/sec. Capacity from miners multiplied by Workshop upgrades (+0.5x, +1.0x, +3.0x). Passive gold NOT multiplied by any upgrade.
- Implication: Miner is sole ore producer and gating resource for all upgrades/layer unlocks.
- Confidence: HIGH

**Mountain Layer System**

- Finding: 8 layers in `MOUNTAIN_LAYERS`: Dirt(500), Shale(1000), Marble(2400), Slate(3200), Limestone(4000), Granite(6000), Basalt(8000), Obsidian(10000). Only layers 0-3 unlockable via upgrades (copper, iron, steel smelting). Layers 4-7 have NO unlock mechanism.
- Implication: Layers 4-7 are unreachable dead data. `clickBurrow` bypasses layer limits (intentional, tested).
- Confidence: HIGH

**UI Component Breakdown**

- Finding: Left rail: `DragonCard` + `HoardDisplay`. Right panel: 5 tabs. `BuildingsTab` has nested 4-tab system (Construction/Forge/Workshop/Bloodline). `EventsTab` is static placeholder. `isTabUnlocked` always returns `true`.
- Implication: Tab locking wired up but not implemented. Events system has no backing logic.
- Confidence: HIGH

### SURPRISING / CONCERNING FINDINGS

1. **Luck, beauty, armor stats do nothing.** 75% of prestige points currently waste.
2. **Layers 4-7 are unreachable dead data.** Only 4 layers reachable.
3. **No time cap on offline progress.** Month away = 2.6M seconds instant income.
4. **`clickBurrow` bypasses layer limits.** Two parallel capacity systems not reconciled.
5. **EventsTab is fully stubbed placeholder.** No backing system.
6. **No CI pipeline.** Zero automated test gate.
7. **Module-level `loopStarted` flag.** Could block game loop in test contexts if `startGameLoop` called.
