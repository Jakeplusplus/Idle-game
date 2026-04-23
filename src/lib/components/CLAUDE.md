# components/

Reusable UI components. No business logic — read from gameState, call exported functions from game.svelte.ts.

Implements:

- cavekit-save-infrastructure.md R2 (OfflineSummary.svelte — dismissible panel, .panel + .btn-primary)
- cavekit-suitor-prestige.md R4 (EventsTab suitor card — rarity colors, stat allocations, passive preview)
- cavekit-treasure-system.md R3 (TreasureVault.svelte — slotted/empty slots, rarity colors, .panel)
- cavekit-progression-systems.md R3 (MountainStrataMap.svelte — locked layer muted styling)
- cavekit-progression-systems.md R4 (DragonCard.svelte — armor conditionally hidden, luck tooltip)

Visual design: follows DESIGN.md (rarity color tokens, .panel, .btn-primary, .btn-secondary, .dither, VT323 typography)

Build tasks: T-004, T-006, T-014, T-015, T-017, T-020, T-021 (build-site.md)
