---
created: "2026-04-15T00:00:00Z"
last_edited: "2026-04-17T00:00:00Z"
---

# Cavekit: Save Infrastructure

## Scope

Foundational save system hardening. Must be implemented before any other domain adds new state fields. Covers save migration/default-fill, offline progress cap with summary screen, and rAF delta clamping.

## Requirements

### R1: Save Migration / Default-Fill

When loading a save, any missing field in the loaded state must resolve to its default value rather than undefined. A version field in the save schema enables detection of schema mismatches.

Acceptance Criteria:

- [ ] Save schema includes a version number field
- [ ] On load, loaded state is merged into a fresh default state so any missing field gets its default value
- [ ] hydrateGameState (existing function) handles version mismatch by filling defaults
- [ ] Adding a new field to GameState never causes undefined for existing saves
- [ ] Unit test: load a save missing a new field → field resolves to default value

Dependencies: none

### R2: Offline Progress Cap

Offline credit is capped at 8 hours maximum. A summary screen appears when the player returns after more than 60 seconds away, showing what was earned.

Acceptance Criteria:

- [ ] Time away is capped at 8 \* 3600 seconds before applying passive income
- [ ] Summary screen appears when capped offline time exceeds 60 seconds, regardless of whether any gold or ore was earned (a player with zero income sources still sees the summary)
- [ ] Summary screen displays: gold earned, ore earned, time away (actual and capped if different)
- [ ] Summary screen is dismissible with a single action
- [ ] Summary screen UI uses .panel and .btn-primary per DESIGN.md Section 4
- [ ] Summary screen typography uses body type (VT323 20px) per DESIGN.md Section 3
- [ ] Unit test: 30-day gap applies exactly 8 hours of passive income

Dependencies: none

### R3: rAF Delta Clamp

Per-frame delta time is clamped to a maximum of 1 second to prevent income bursts after brief tab-switches.

Acceptance Criteria:

- [ ] Delta is clamped to Math.min(delta, 1.0) before any income calculation in the game loop
- [ ] A 30-second delta produces identical income to a 1-second delta
- [ ] Unit test: delta of 30s → same income outcome as delta of 1s

Dependencies: none

## Out of Scope

- Changing save format beyond adding a version field
- Cloud saves or remote persistence
- Export/import UI changes
- Compression or encryption of save data

## Cross-References

- All other kits depend on this kit's R1 before adding new state fields

## Changelog

- 2026-04-17: Strengthened R2 summary trigger criterion — screen must appear even with zero earnings — finding F-003; implementation gated summary on `earnedGold > 0 || earnedOre > 0`
