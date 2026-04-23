---
created: "2026-04-18T00:00:00Z"
last_edited: "2026-04-18T21:00:00Z"
---

# Implementation Tracking

Build site: context/plans/build-site-proportional-income.md

| Task  | Status  | Notes                                                                                                                             |
| ----- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| T-001 | DONE    | clampPassiveIncome pure helper in income.ts + 7-case unit tests in income.test.ts                                                 |
| T-002 | DONE    | loadGame() routes through clampPassiveIncome; ratio test provided via applyOfflineIncome in storage.test.ts (T-006)               |
| T-003 | DONE    | applyPassiveIncome() routes earnedGold+earnedOre through helper; ratio test in game.test.ts                                       |
| T-004 | DONE    | tick() unified via clampPassiveIncome; ratio test provided via applyTick export in game.test.ts (T-007)                           |
| T-005 | DONE    | Regression covers all 3 paths: applyPassiveIncome (T-005), tick (T-008), offline (T-008)                                          |
| T-006 | DONE    | applyOfflineIncome(elapsedSeconds) exported from storage.svelte.ts; loadGame() calls it; storage.test.ts ratio + ceiling tests    |
| T-007 | DONE    | applyTick(delta) exported from game.svelte.ts; tick() calls applyTick(clampedDelta); game.test.ts ratio tests added               |
| T-008 | DONE    | Tick-path regression in game.test.ts + offline-path regression in storage.test.ts; both assert deltaGold>0 with ore-dominant setup |
| T-009 | TODO    | R2: test offlineProgressState goldEarned/oreEarned = post-clamp amounts (gap found in cavekit verification)                        |
