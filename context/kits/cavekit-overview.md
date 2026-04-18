---
created: "2026-04-15T00:00:00Z"
last_edited: "2026-04-18T00:00:00Z"
---

# Cavekit Overview

## Project

Dragon Hoard — a Svelte 5 pixel-art retro idle game where a dragon hoards gold, trains minions, mines mountain layers, and breeds across generations. Published as a static SPA to GitHub Pages.

See: `context/refs/research-brief-dragon-idle-game.md` for full research findings.
See: `DESIGN.md` for visual design system (Misty Mountain Lair theme).

## Domain Index

| Domain              | Cavekit File                   | Requirements | Status | Description                                     |
| ------------------- | ------------------------------ | ------------ | ------ | ----------------------------------------------- |
| Save Infrastructure | cavekit-save-infrastructure.md | 4            | READY  | Migration layer, offline cap, rAF delta clamp, tab catch-up |
| Suitor Prestige     | cavekit-suitor-prestige.md     | 7            | READY  | Suitor event system replacing attractMate       |
| Treasure System     | cavekit-treasure-system.md     | 6            | READY  | Luck-driven drops, Vault building, trading      |
| Progression Systems | cavekit-progression-systems.md | 4            | READY  | Layers 4-7 unlocks, beauty trade, armor cleanup |
| Proportional Income | cavekit-proportional-income.md | 1            | DRAFT  | Proportional gold/ore split when shared capacity is constrained |

## Cross-Reference Map

| Domain A            | Interacts With      | Interaction Type                         |
| ------------------- | ------------------- | ---------------------------------------- |
| Save Infrastructure | Suitor Prestige     | New state fields require migration layer |
| Save Infrastructure | Treasure System     | New state fields require migration layer |
| Save Infrastructure | Progression Systems | New state fields require migration layer |
| Suitor Prestige     | Progression Systems | Armor stat removed from prestige pool    |
| Treasure System     | Progression Systems | Shared beauty trade multiplier formula   |
| Proportional Income | Save Infrastructure | Modifies offline-progress and tab catch-up income paths |
| Proportional Income | Progression Systems | Shares `maxCapacity` model; no separate capacities |

## Dependency Graph

1. **Save Infrastructure** — no dependencies (implement first)
2. **Suitor Prestige**, **Treasure System**, **Progression Systems** — all depend on Save Infrastructure R1; can be implemented in parallel after Save Infrastructure ships
3. **Proportional Income** — depends on Save Infrastructure R4 (`applyPassiveIncome` must exist)

## Changelog
