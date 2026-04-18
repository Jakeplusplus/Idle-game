---
created: "2026-04-17T02:00:00Z"
last_edited: "2026-04-18T00:00:00Z"
---

# Implementation Tracking

Build site: context/plans/build-site.md

| Task  | Status | Notes                                                                                             |
| ----- | ------ | ------------------------------------------------------------------------------------------------- |
| T-001 | DONE   | saveVersion field + hydrateGameState default-fill via SAVE_VERSION constant                       |
| T-002 | DONE   | Test in game.test.ts: missing field resolves to default on hydration                              |
| T-003 | DONE   | OFFLINE_CAP_SECONDS=28800; rawSeconds clamped before passive income applied                       |
| T-004 | DONE   | OfflineSummary.svelte: dismissible panel shown when cappedSeconds>60; uses .panel + .btn-primary  |
| T-005 | DONE   | Math.min(rawDelta, 1.0) in tick(); test documents 30s=1s income outcome                           |
| T-006 | DONE   | attractMate() rolls 3-stat pool; armor hidden in DragonCard behind MAP_SYSTEM_ACTIVE=false        |
| T-007 | DONE   | BEAUTY_TRADE_MULTIPLIER=0.02; getOreSellPrice() formula; TradeTab shows effective price           |
| T-008 | DONE   | 4 upgrades (layers 4-7); buyUpgrade() generic unlock_layer_N with sequential gate                 |
| T-009 | DONE   | generateSuitor(): pool size formula, stat pre-alloc, passive draw, one-pending gate               |
| T-010 | DONE   | rollSuitorRarity(beauty): additive weight bonus per beauty point to non-Common tiers              |
| T-011 | DONE   | getPassiveBonus()/getAllActivePassives(); config pools in passives.ts; resetHoard preserves       |
| T-012 | DONE   | TreasureItem type, treasureInventory[], BASE_TREASURE_CHANCE/LUCK_MULTIPLIER, drop on tick+click  |
| T-013 | DONE   | TREASURE_POOLS + rarity weights + rollTreasureRarity(luck); config-driven definitions             |
| T-014 | DONE   | Locked layers: bg-surface bg, ore requirement shown, text-muted styling; DESIGN tokens in app.css |
| T-015 | DONE   | EventsTab suitor card: rarity colors, stat allocations, passive preview, accept/decline buttons   |
| T-016 | DONE   | treasure_vault in BUILDINGS (8000g); VAULT_SLOTS=3; BuildingsTab shows Unlocks Vault badge        |
| T-017 | DONE   | TreasureVault.svelte: slotted/empty slots, rarity colors, shown in DepthsTab when vault built     |
| T-018 | DONE   | acceptSuitor(): strict order stats→genPassive→lineagePassive→resetHoard(); saveGame() called      |
| T-019 | DONE   | slotTreasure/unslotTreasure; slotted effects via getAllActivePassives(); VAULT_SLOTS gate         |
| T-020 | DONE   | getTreasureSellPrice()/sellTreasure(); beauty multiplier; sell UI in TreasureVault                |
| T-021 | DONE   | luck chip title tooltip in DragonCard; unit test confirms drop rate + rarity distribution         |
| T-022 | DONE   | BuildingsTab imports generateSuitor; pending suitor disables button with message                  |
| T-023 | DONE   | attractMate() deleted from game.svelte.ts; no imports remain anywhere                             |
| T-024 | DONE   | minerTickTimer accumulator in tick(); rollTreasureDrop fires ≤1/sec                              |
| T-025 | DONE   | getAllActivePassives gates on buildings.treasure_vault; hydrateGameState clears slotted w/o vault |
| T-026 | DONE   | offlineProgressState.data set outside earnedGold/Ore guard; shows for zero-income players         |
| T-027 | DONE   | hardReset() no longer calls resetHoard(); replaceGameState(createDefaultGameState()) only         |
| T-028 | DONE   | visibilitychange listener: save on hide, applyPassiveIncome(capped) on show; no summary triggered |
| T-029 | DONE   | Tests in game.test.ts: vault gate, hydration clear, applyPassiveIncome, no summary on catch-up    |
