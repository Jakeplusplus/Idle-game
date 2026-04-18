---
created: "2026-04-18T00:00:00Z"
last_edited: "2026-04-18T21:00:00Z"
---

# Implementation Tracking

Build site: context/plans/build-site-proportional-income.md

| Task  | Status  | Notes                                                                                                                             |
| ----- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| T-001 | DONE    | clampPassiveIncome pure helper in income.ts + 7-case unit tests in income.test.ts                                                 |
| T-002 | PARTIAL | loadGame() routes through clampPassiveIncome; ratio test missing — loadGame() is browser-gated, needs applyOfflineIncome (T-006)  |
| T-003 | DONE    | applyPassiveIncome() routes earnedGold+earnedOre through helper; ratio test in game.test.ts                                       |
| T-004 | PARTIAL | tick() unified via clampPassiveIncome; ratio test missing — tick() is non-exported closure, needs applyTick export (T-007)        |
| T-005 | PARTIAL | Regression covers applyPassiveIncome path only; offline + tick paths not covered (T-008 expands)                                  |
| T-006 | TODO    | Extract applyOfflineIncome() + loadGame() ratio test                                                                              |
| T-007 | TODO    | Extract applyTick(delta) from tick() + tick-path ratio test                                                                       |
| T-008 | TODO    | Expand regression to all 3 paths (blocked by T-006/T-007)                                                                        |
