---
created: "2026-04-18T00:00:00Z"
last_edited: "2026-04-18T21:00:00Z"
---

# Cavekit: Proportional Passive Income Distribution

## Scope

Capacity-clamping behavior for passive (non-manual) gold and ore income. Ensures that when combined passive earnings would exceed remaining shared capacity, both resources are scaled proportionally to their income rate ratio rather than one starving the other. Applies to offline catch-up, tab visibility catch-up, and the in-game tick loop.

## Requirements

### R1: Proportional Capacity Distribution for Passive Income

When earned gold plus earned ore in a single passive-income application would exceed the remaining shared capacity, both amounts are scaled down so the applied gold:ore ratio matches the incoming gold:ore ratio. No other passive-income ordering (gold-first, ore-first) is acceptable.

Behavior (expressed as contract, not implementation):

```
available = maxCapacity - (currentGold + currentOre)
if earnedGold + earnedOre > available and available > 0:
  ratio = earnedGold / (earnedGold + earnedOre)
  earnedGold = available * ratio
  earnedOre  = available * (1 - ratio)
if available <= 0:
  earnedGold = 0
  earnedOre  = 0
```

**Acceptance Criteria:**

- [ ] A single shared helper encapsulates the proportional clamp and is the only place that decides how passive gold and ore are applied against shared capacity
- [ ] Helper: given `currentGold + currentOre == maxCapacity` (no available capacity), returns applied gold = 0 and applied ore = 0
- [ ] Helper: given `earnedGold + earnedOre <= available`, returns applied gold = earnedGold and applied ore = earnedOre unchanged
- [ ] Helper: given `earnedGold + earnedOre > available` and `available > 0`, returns applied gold and applied ore that sum to `available` (within floating-point tolerance) and preserve the input ratio `earnedGold / (earnedGold + earnedOre)` (within floating-point tolerance)
- [ ] Helper: given `earnedGold > 0` and `earnedOre == 0` with limited available, returns applied gold = available and applied ore = 0
- [ ] Helper: given `earnedOre > 0` and `earnedGold == 0` with limited available, returns applied ore = available and applied gold = 0
- [ ] Helper: given `earnedGold == 0` and `earnedOre == 0`, returns applied gold = 0 and applied ore = 0 (no division-by-zero)
- [ ] `loadGame()` offline-progress application routes both computed offline gold and computed offline ore through the shared helper before mutating `gameState`
- [ ] `applyPassiveIncome()` (tab visibility catch-up) routes both computed catch-up gold and computed catch-up ore through the shared helper before mutating `gameState`
- [ ] `tick()` game-loop passive income routes per-tick gold and per-tick ore through the shared helper in a single combined application (not two independent clamps in separate blocks)
- [ ] Neither `currentGold` nor `currentOre` is ever incremented by passive income in a way that causes `currentGold + currentOre` to exceed `maxCapacity` across any of the three paths
- [ ] Unit test for the shared helper: proportional scaling case — inputs produce outputs summing to `available` and preserving input ratio
- [ ] Unit test for `loadGame()` offline path: when offline-earned gold + offline-earned ore exceeds remaining capacity, resulting `currentGold` and `currentOre` deltas preserve the offline earnings ratio
- [ ] Unit test for `applyPassiveIncome()` visibility path: when catch-up gold + catch-up ore exceeds remaining capacity, resulting deltas preserve the catch-up earnings ratio
- [ ] Unit test for `tick()` path: when per-tick gold + per-tick ore exceeds remaining capacity, resulting deltas preserve the per-tick earnings ratio
- [ ] Regression unit test: with a pre-fix scenario (gold income > 0, ore income > 0, capacity-constrained), ore does not consume 100% of remaining capacity — gold receives a non-zero share proportional to its income rate

**Dependencies:** cavekit-save-infrastructure.md R4 (`applyPassiveIncome()` must exist before it can be routed through the shared helper)

## Out of Scope

- Manual click actions (`clickGold()` and any other click-driven gold gain) — clicks remain subject to whatever clamping they already use
- Ore buy and ore sell trade actions
- Building and minion purchase costs
- Treasure sell payouts
- Changing `maxCapacity` itself, capacity-upgrade mechanics, or layer progression
- Introducing separate gold and ore capacities (shared capacity remains the model)
- Changing income rates, income formulas, or balance tuning
- UI indication of proportional clamping (no new visual state required)

## Cross-References

- See also: cavekit-save-infrastructure.md (offline progress on load, `applyPassiveIncome()` for tab catch-up — both paths modified by this kit)
- See also: cavekit-progression-systems.md (mountain layer unlocks that raise `maxCapacity`; the shared capacity model is unchanged)

### R2: Offline Summary Amount Semantics

When the offline progress summary is displayed, the `goldEarned` and `oreEarned` values shown must reflect the actually-applied (post-clamp) amounts, not the raw theoretically-earned amounts. This choice must be explicit and tested.

**Acceptance Criteria:**
- [ ] `OfflineProgressResult.goldEarned` and `.oreEarned` reflect the amounts actually added to the hoard (post-clamp), not raw computed earnings
- [ ] The offline summary display accurately represents what the player received

**Dependencies:** R1 (offline path must route through `clampPassiveIncome` before summary data is set)

## Changelog

- 2026-04-18: Added R2 (Offline Summary Amount Semantics) — discovered during inspection (F-005); implementation silently changed semantics of summary fields when routing through clampPassiveIncome, needs explicit requirement
