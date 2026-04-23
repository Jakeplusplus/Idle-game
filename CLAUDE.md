# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Dragon Hoard Idle Game — a Svelte 5 idle/incremental game where you manage a dragon's gold hoard, train minions, mine mountain layers, and prestige across generations.

## Commands

```bash
vp dev          # start dev server
vp build        # production build
vp check        # format + lint + TypeScript type-check
vp lint         # lint only
vp test         # run Vitest + Playwright tests
```

Always use `vp` — never bare `pnpm`, `npm`, or `yarn`.

## Architecture

State, logic, and persistence are strictly separated:

- `src/lib/gameState.svelte.ts` — central reactive state (`$state` rune), no logic
- `src/lib/game.svelte.ts` — all game logic (clickGold, trainMinion, generateSuitor, acceptSuitor, startGameLoop); mutates gameState
- `src/lib/storage.svelte.ts` — LocalStorage persistence + offline progress; exports `applyOfflineIncome(elapsedSeconds)`
- `src/lib/income.ts` — pure `clampPassiveIncome()` helper; single source for proportional capacity clamping across all passive income paths
- `src/lib/types.ts` — TypeScript interfaces for game entities
- `src/lib/configs/` — static data split by domain (buildings, minions, mountain, passives, suitors, trading, treasures, upgrades)
- `src/routes/+page.svelte` — single-page UI, no business logic

## Code Architecture

- Prefer small, focused files over large monolithic ones — follow the existing separation of concerns (state in `gameState`, logic in `game`, UI in components)
- When a file exceeds ~200–300 lines or mixes concerns, split it into focused modules before adding more
- Extract repeated UI patterns into `src/lib/components/` rather than duplicating in `+page.svelte`
- New game systems (e.g., a new minion type, a new prestige mechanic) should have their own module under `src/lib/`, not be folded into `game.svelte.ts`

## Key Game Systems

- **Click**: `clickGold()` adds gold based on `stats.clickPower`
- **Passive income**: game loop (1s tick) applies minion gold/sec; miners generate ore instead; delta clamped to 1s max; all passive gold+ore routed through `clampPassiveIncome()` in `income.ts` to preserve ratio against shared capacity
- **Capacity gating**: ore from miners unlocks mountain layer progression (layers 0–7), each layer increases max gold capacity
- **Cost scaling**: minion costs scale at 1.15× per unit owned
- **Suitor prestige**: `generateSuitor()` triggers at gold ≥ 10k; suitor has rarity (beauty-weighted), pre-allocated stat points, and a generation passive drawn from config pools; `acceptSuitor()` applies stats → sets activeGenerationPassive → appends lineagePassives → calls `resetHoard()`; one pending suitor at a time
- **Passives**: `activeGenerationPassive` (current generation) + `lineagePassives[]` (append-only across all generations) apply additively to income/stats; config-driven pools per rarity tier
- **Treasure system**: `rollTreasureDrop()` fires at most 1/sec via accumulator; drops go to `treasureInventory[]` as unslotted (inert); `Treasure Vault` building (8000g, wiped on reset) enables slotting; slotted treasures apply effects immediately; sell via `sellTreasure()` with beauty multiplier
- **Offline progress**: on load, `applyOfflineIncome(elapsedSeconds)` in `storage.svelte.ts` applies capped (8h max) earnings; shows `OfflineSummary.svelte` panel when elapsed > 60s; tab visibility events trigger silent catch-up on show, save on hide
- **Persistence**: `saveGame()` called every 5 seconds + on tab hide; `hydrateGameState()` merges loaded save into fresh default so new fields never arrive as undefined

## Conventions

- Svelte 5 runes throughout (`$state`, `$derived`, `$effect`) — no legacy Svelte 4 stores
- All new files in TypeScript
- Pixel-art retro aesthetic: VT323 font, dark theme, box-shadow buttons — match existing visual style when adding UI
