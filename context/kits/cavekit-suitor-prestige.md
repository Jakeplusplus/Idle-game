---
created: "2026-04-15T00:00:00Z"
last_edited: "2026-04-15T00:00:00Z"
---

# Cavekit: Suitor Prestige

## Scope

Replace the existing `attractMate()` random stat system with a suitor dragon event system. Suitors appear as events in EventsTab, have rarity tiers influenced by the player's beauty stat, and grant generation passives (one generation only) and/or lineage passives (permanent, accumulating). The starter dragon has no passive.

## Requirements

### R1: Suitor Generation

A suitor is generated when `gold >= 10000`. The suitor has a name, a rarity tier, a stat pool sized by the deterministic formula `floor(sqrt(gold / 10000))`, and passives drawn from the rarity-appropriate pool. Only one pending suitor exists at a time.

**Acceptance Criteria:**

- [ ] Suitor generated when `gold >= 10000` (`>=` not `===`, per research brief float precision note)
- [ ] Stat pool size = `floor(sqrt(gold / 10000))`, minimum 1
- [ ] Pool size shown to player before accept ("N stat points available")
- [ ] Only one pending suitor at a time; new suitor generation blocked while one is pending
- [ ] Suitor persists in game state until accepted or declined
- [ ] Suitor stored in game state with all fields needed for display and application
- [ ] Suitor stat allocations are pre-determined at generation time (not player-chosen) — the card shows the allocation, the player accepts or declines
- [ ] Unit test: 10k gold → 1 stat point, 40k gold → 2 stat points, 90k gold → 3 stat points

**Dependencies:** cavekit-save-infrastructure.md R1 (new `pendingSuitor` state field requires migration layer)

### R2: Suitor Rarity Tiers

Five rarity tiers: Common, Uncommon, Rare, Epic, Legendary. The player's beauty stat shifts probability toward higher tiers. Each tier grants different passive combinations.

| Tier      | Stat Points             | Passives Granted                                            |
| --------- | ----------------------- | ----------------------------------------------------------- |
| Common    | Yes (from pool formula) | None — stat gain only                                       |
| Uncommon  | Yes                     | 1 lineage passive (small)                                   |
| Rare      | Yes                     | 1 lineage passive (medium) OR 1 generation passive (strong) |
| Epic      | Yes                     | 1 lineage passive (strong) + 1 generation passive (medium)  |
| Legendary | Yes                     | 1 lineage passive (strong) + 1 generation passive (strong)  |

All tiers award stat points from the pool formula. Common suitors provide stat gains only — no passive. A Common suitor is not a dead-end; the player still receives stat improvements. This is the minimum viable prestige benefit.

**Acceptance Criteria:**

- [ ] Rarity probability weights are config-driven, not hardcoded
- [ ] Beauty score shifts rarity probability via additive weight adjustment: each beauty point adds a config-defined bonus weight to tiers above Common, reducing effective Common weight proportionally
- [ ] Unit test: beauty=0 vs beauty=20 → measurably different rarity distribution over 100 generated suitors
- [ ] Rarity tier determines which passive pool is sampled

**Dependencies:** none additional

### R3: Passives — Types and Effects

Two passive types exist:

- **Generation passive:** active for the current generation only, replaced (not stacked) on next breed
- **Lineage passive:** added to `lineagePassives[]` on accept, never cleared, accumulates across generations

Passive effects are drawn from pools defined per rarity tier. Each pool contains multiple possible effects, not a single fixed effect per tier.

**Acceptance Criteria:**

- [ ] Game state includes `activeGenerationPassive` (nullable). It is SET by accept (not cleared by `resetHoard()`). Call order on accept: (1) apply stat gains, (2) set `activeGenerationPassive`, (3) append to `lineagePassives[]`, (4) call `resetHoard()`. The new passive is active from the moment accept fires; `resetHoard()` does not touch it.
- [ ] Game state includes `lineagePassives[]` (append-only, never cleared by `resetHoard()`)
- [ ] Passive effects from both types are applied in income and stat calculations
- [ ] Lineage passive bonuses stack additively
- [ ] Passive pools are config-driven, not hardcoded
- [ ] Unit test: accepting suitor with known passives → income calculations reflect those passives
- [ ] Unit test: lineage passive bonuses stack correctly across multiple breeds

**Dependencies:** cavekit-save-infrastructure.md R1 (new state fields: `activeGenerationPassive`, `lineagePassives[]`)

### R4: Suitor Event UI (EventsTab)

EventsTab displays the pending suitor as a card. The card shows all information needed to make an informed decision before committing. No post-accept surprises — what is shown is what is applied.

**Acceptance Criteria:**

- [ ] EventsTab shows suitor card when a suitor is pending
- [ ] Suitor card displays: name, rarity tier, stat pool size, individual stat allocations, passive preview with description
- [ ] Rarity color indicator uses DESIGN.md Section 2 colors: Common `text-secondary`, Uncommon `forest`, Rare `stream`, Epic `gold`, Legendary `ember`
- [ ] Suitor card uses `.panel` and `.dither` per DESIGN.md Section 4
- [ ] Accept button uses `.btn-primary`, decline button uses `.btn-secondary` per DESIGN.md Section 4
- [ ] Empty state shown when no suitor pending
- [ ] Starter dragon (generation 0) empty state includes flavor text indicating no suitors yet
- [ ] Empty state text uses `body` type per DESIGN.md Section 3

**Dependencies:** none additional

### R5: Prestige on Accept

Accepting a suitor applies stat gains and passives, then resets the hoard. Applied values match the preview exactly.

**Acceptance Criteria:**

- [ ] Stat gains applied exactly as previewed, no additional RNG post-accept
- [ ] `activeGenerationPassive` replaced with the suitor's generation passive (or null if none)
- [ ] New lineage passives appended to `lineagePassives[]`
- [ ] `resetHoard()` called after all stat and passive application. `resetHoard()` must NOT clear `lineagePassives[]` or `activeGenerationPassive` (see R3)
- [ ] `lineagePassives[]` contains all passives from all prior generations after prestige (append-only invariant)
- [ ] `generation` increments by 1
- [ ] `pendingSuitor` cleared from state
- [ ] `saveGame()` called immediately after prestige
- [ ] Unit test: accept suitor with known stats and passives → game state matches preview exactly

**Dependencies:** R1, R3

### R6: Armor Stat Removal from Prestige Pool

Armor is not awarded by suitors and is hidden from DragonCard until the map system ships.

**Acceptance Criteria:**

- [ ] Armor does not appear in any suitor stat pool
- [ ] Armor stat is conditionally hidden in DragonCard display
- [ ] Code note present indicating armor activates with future map system

**Dependencies:** none additional

## Out of Scope

- Suitor history or breeding log
- Penalty for declining a suitor
- Multiple simultaneous suitors
- Adventurer influence system
- Armor stat effects
- Beauty effects beyond rarity weighting (adventurer influence is future scope)

## Cross-References

- See also: cavekit-save-infrastructure.md (R1 required for new state fields)
- See also: cavekit-progression-systems.md (armor removed from old `attractMate` pool)

## Changelog
