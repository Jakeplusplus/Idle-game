# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

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

Always use `vp` — never bare `pnpm`, `npm`, or `yarn`. When running `vp check` or `vp lint` in the terminal, set a timeout of 30000ms or more.

## Architecture

State, logic, and persistence are strictly separated:

- `src/lib/gameState.svelte.ts` — central reactive state (`$state` rune), no logic
- `src/lib/game.svelte.ts` — all game logic (clickGold, trainMinion, attractMate, startGameLoop); mutates gameState
- `src/lib/storage.svelte.ts` — LocalStorage persistence + offline progress calculation on load
- `src/lib/types.ts` — TypeScript interfaces for game entities
- `src/lib/config.ts` — static data (MOUNTAIN_LAYERS array, 8 progressive layers)
- `src/routes/+page.svelte` — single-page UI, no business logic

## Key Game Systems

- **Click**: `clickGold()` adds gold based on `stats.clickPower`
- **Passive income**: game loop (1s tick) applies minion gold/sec; miners generate ore instead
- **Capacity gating**: ore from miners unlocks mountain layer progression, each layer increases max gold capacity
- **Cost scaling**: minion costs scale at 1.15× per unit owned
- **Prestige**: `attractMate()` resets hoard at 10k+ gold, increments generation, randomly boosts stats
- **Offline progress**: on load, `storage.svelte.ts` calculates earnings since `lastSaveTime` and applies them
- **Persistence**: `saveGame()` is called every 5 seconds via the game loop

## Conventions

- Svelte 5 runes throughout (`$state`, `$derived`, `$effect`) — no legacy Svelte 4 stores
- All new files in TypeScript
- Pixel-art retro aesthetic: VT323 font, dark theme, box-shadow buttons — match existing visual style when adding UI
