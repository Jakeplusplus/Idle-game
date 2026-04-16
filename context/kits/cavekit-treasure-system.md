---
created: "2026-04-15T00:00:00Z"
last_edited: "2026-04-15T00:00:00Z"
---

# Cavekit: Treasure System

## Scope

Luck-driven treasure drops from mining ticks and burrow clicks. Treasures accumulate in inventory as inert items until slotted into the Treasure Vault building, which activates their effects. Unslotted treasures can be sold for flat gold. Resets on prestige.

## Requirements

### R1: Treasure Drops

Mining ticks and manual burrow clicks have a luck-scaled probability of producing a treasure item. Drop rate is configurable and driven by the luck stat.

**Acceptance Criteria:**

- [ ] Drop chance formula: `baseTreasureChance * (1 + luck * luckMultiplier)`, all values config-driven
- [ ] Drops can occur on each miner passive tick and on each manual burrow click
- [ ] Dropped treasures added to `treasureInventory[]` in game state as unslotted (inert)
- [ ] Unit test: luck=0 vs luck=10 → measurably different drop rate over 1000 ticks

**Dependencies:** cavekit-save-infrastructure.md R1 (new state fields: `treasureInventory[]` — array of treasure objects, each with id, rarity, name, effectType, effectMagnitude, tradeValue, slotted: boolean)

### R2: Treasure Rarity Tiers

Four rarity tiers: Common, Uncommon, Rare, Legendary. Luck stat shifts probability toward higher tiers. Each treasure has: name, rarity, flavor text, effect type, effect magnitude, flat trade gold value.

| Tier      | Example effects (when slotted)                                                    |
| --------- | --------------------------------------------------------------------------------- |
| Common    | Small flat gold/sec bonus                                                         |
| Uncommon  | Capacity increase, ore/sec bonus                                                  |
| Rare      | Click power increase (active while slotted), luck increase (active while slotted) |
| Legendary | Large permanent stat boost                                                        |

**Acceptance Criteria:**

- [ ] Rarity probability weights are config-driven
- [ ] Luck stat shifts rarity probability via additive weight adjustment: each luck point adds a config-defined bonus weight to tiers above Common, reducing effective Common weight proportionally (same mechanism as suitor rarity in cavekit-suitor-prestige.md R2)
- [ ] Each treasure definition includes: name, rarity, flavor text, effect type, effect magnitude, flat trade gold value
- [ ] All treasure definitions are config-driven, not hardcoded
- [ ] Effects are inert until treasure is slotted in Treasure Vault
- [ ] Unit test: luck=0 vs luck=10 → measurably different rarity distribution over 100 drops

**Dependencies:** none additional

### R3: Treasure Vault Building

A new building — the Treasure Vault — must be purchased before any treasure effects can be activated. It provides a limited number of slots. Slot capacity is config-driven and upgradeable via future upgrade entries.

**Acceptance Criteria:**

- [ ] Treasure Vault defined in building config with an unlock cost
- [ ] Without a purchased Treasure Vault, treasures accumulate in inventory with no effect
- [ ] Treasure Vault appears in BuildingsTab (Construction section)
- [ ] Vault UI displays slotted treasures, empty slots, and total slot count
- [ ] Vault UI uses `.panel` per DESIGN.md Section 4
- [ ] Rarity colors follow DESIGN.md Section 2: Common `text-secondary`, Uncommon `forest`, Rare `stream`, Legendary `gold`
- [ ] Initial slot count defined in config
- [ ] Slot capacity may be expanded in a future kit; no upgrade scaffolding for vault slots required in this kit
- [ ] Treasure Vault building is wiped by `resetHoard()` (same as all buildings per existing prestige behavior) — player must repurchase it each generation. This is intentional; it is not persisted across prestige.

**Dependencies:** cavekit-save-infrastructure.md R1. Vault state is derived from `treasureInventory[]` — slotted treasures are those with `slotted: true`. `vaultSlots` is a config-defined integer capacity, not a separate state array. An occupied slot = one treasure with `slotted: true`. No separate slot state field required.

### R4: Slotting Mechanic

The player assigns a treasure from inventory to an empty vault slot to activate its effect. Unslotting removes the effect and returns the treasure to inventory.

**Acceptance Criteria:**

- [ ] Slot action available from vault UI for each unslotted inventory treasure
- [ ] Unslot action available for each occupied vault slot
- [ ] Slotted treasure effects applied immediately in income/stat calculations
- [ ] Unslotting removes effect immediately
- [ ] Cannot slot when no empty slots exist; player must unslot first
- [ ] Slotted/unslotted state persists across saves
- [ ] Treasures (slotted and inventory) cleared on `resetHoard()`
- [ ] Unit test: slotting a treasure with known effect → income calculation reflects that effect

**Dependencies:** R3

### R5: Treasure Trading

Unslotted treasures can be sold for flat gold. Sell price is rarity-based with a beauty stat multiplier.

**Acceptance Criteria:**

- [ ] Sell price formula: `baseTierValue * (1 + beauty * beautyTradeMultiplier)`, values config-driven
- [ ] Sell action available only for unslotted treasures
- [ ] Selling removes treasure from inventory and adds gold
- [ ] Cannot sell a slotted treasure without unslotting first
- [ ] Sell price shown before confirming trade
- [ ] Unit test: beauty=0 vs beauty=10 → measurably different effective sell price
- [ ] Future: donate to towns for reputation (noted, not implemented in this kit)

**Dependencies:** cavekit-progression-systems.md R1 (beauty trade multiplier formula)

### R6: Luck Stat Wiring

Luck stat (currently non-functional) is wired to treasure drop rate and rarity. Shown as active stat in DragonCard.

**Acceptance Criteria:**

- [ ] Luck stat value drives drop rate calculation (R1) and rarity weighting (R2)
- [ ] DragonCard displays luck stat with tooltip: "Affects treasure find rate and rarity"
- [ ] Unit test: changing luck stat value → drop rate and rarity distribution change accordingly

**Dependencies:** none additional

## Out of Scope

- Town reputation donations (future)
- Lair interactions with treasures (future)
- Treasure-based upgrade unlocks
- Treasure effects on suitor quality
- Inventory management beyond slot/unslot/sell
- Treasure persistence across prestige (treasures reset with hoard)

## Cross-References

- See also: cavekit-save-infrastructure.md (R1 required for new state fields)
- See also: cavekit-progression-systems.md (R1 for shared beauty trade multiplier formula)

## Changelog
