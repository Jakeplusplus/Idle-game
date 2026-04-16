---
created: "2026-04-15T00:00:00Z"
last_edited: "2026-04-15T00:00:00Z"
---

# Cavekit: Progression Systems

## Scope

Mountain layers 4-7 unlock mechanisms, beauty trading price multiplier applied across ore and treasure trades, and armor stat display cleanup.

## Requirements

### R1: Beauty Trade Multiplier

The beauty stat applies a multiplier to ore sell prices in TradeTab and to treasure sell prices in the treasure system. Formula is shared and config-driven.

**Acceptance Criteria:**

- [ ] Sell price formula: `baseTierValue * (1 + beauty * beautyTradeMultiplier)`, with `beautyTradeMultiplier` in config
- [ ] Formula applied to ore sell in TradeTab
- [ ] Formula applied to treasure sell (cross-ref: cavekit-treasure-system.md R5)
- [ ] TradeTab displays effective price including beauty modifier with visual indicator
- [ ] Unit test: beauty=0 vs beauty=10 → measurably different effective ore sell price

**Dependencies:** none — beauty stat already exists in game state (`stats.beauty`) per existing codebase

### R2: Mountain Layers 4-7 Unlock Mechanisms

Layers 4-7 (Limestone, Granite, Basalt, Obsidian) currently have no unlock path. New ore-gated upgrade entries unlock each layer, following the existing copper/iron/steel smelting pattern.

**Acceptance Criteria:**

- [ ] Four new upgrade entries defined in upgrade config, one per layer (4, 5, 6, 7)
- [ ] Each upgrade has an ore cost that scales with layer depth
- [ ] Purchasing the upgrade advances `currentLayerIndex` to the corresponding layer
- [ ] Upgrades are sequentially gated — layer 5 upgrade only available after layer 4 is unlocked
- [ ] Unit test: purchasing layer 4 upgrade → `currentLayerIndex` advances to 4

**Dependencies:** none additional

### R3: Locked Layer Visual State

Layers beyond `currentLayerIndex` are displayed in MountainStrataMap as locked with their ore unlock requirement visible. Converts dead data into visible player goals.

**Acceptance Criteria:**

- [ ] Locked layers render with muted styling per DESIGN.md Section 2 (`text-muted` `#7A8A74`, `bg-surface` background)
- [ ] Each locked layer shows its ore unlock requirement ("Requires N ore")
- [ ] Unlocked layers render with full color styling per DESIGN.md Section 2 (`text-primary` `#E8DFC0`)
- [ ] Visual distinction between locked and unlocked layers is clear without additional labels

**Dependencies:** R2

### R4: Armor Stat Display Cleanup

Armor stat is currently non-functional and visible in DragonCard. It must be hidden until the map system ships and excluded from all prestige-related UI.

**Acceptance Criteria:**

- [ ] Armor stat conditionally hidden in DragonCard (not rendered when map system inactive)
- [ ] Armor is not included in any suitor stat pool (enforced by cavekit-suitor-prestige.md R6)
- [ ] Code comment present indicating armor activates with future map system

**Dependencies:** none additional

## Out of Scope

- Map system, town system, lair system
- Adventurer influence mechanics
- Armor stat effects of any kind
- Beauty effects beyond trade pricing (adventurer influence is future scope)
- Reputation system

## Cross-References

- See also: cavekit-save-infrastructure.md (foundation for new state fields)
- See also: cavekit-suitor-prestige.md R6 (armor removal from prestige pool)
- See also: cavekit-treasure-system.md R5 (beauty multiplier formula shared)

## Changelog
