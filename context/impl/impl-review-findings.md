---
created: "2026-04-17T00:00:00Z"
last_edited: "2026-04-17T00:00:00Z"
---

# Review Findings

| Finding | Severity | File | Status | Task |
|---------|----------|------|--------|------|
| F-001: Suitor system unreachable — attractMate still wired | P0 | src/lib/components/tabs/BuildingsTab.svelte:185 | NEW | T-022/T-023 |
| F-002: Treasure drops at 60Hz (rAF), not 1Hz (tick) — 60× rate | P0 | src/lib/game.svelte.ts:462 | NEW | T-024 |
| F-003: Offline summary suppressed for zero-income players | P2 | src/lib/storage.svelte.ts:165 | NEW | T-026 |
| F-004: Slotted treasure effects apply without vault building | P2 | src/lib/game.svelte.ts:34 | NEW | T-025 |
| F-005: hardReset calls redundant resetHoard before state replace | P3 | src/lib/storage.svelte.ts:230 | NEW | T-027 |
| F-006: attractMate exported alongside suitor functions | P2 | src/lib/game.svelte.ts:394 | NEW | T-023 |
| F-007: Default generation is 1 but kit says generation 0 starter | P3 | src/lib/components/tabs/EventsTab.svelte:65 | NEW | kit-only fix |
| F-008: Post-decline suitor re-roll undefined behavior | P2 | src/lib/game.svelte.ts:313 | NEW | T-022 (kit R7) |
| F-009: Luck/beauty can zero Common weight — no clamp spec | P3 | src/lib/game.svelte.ts:239 | NEW | kit-only fix |
| F-010: generateSuitor id uses Date.now() only, no random suffix | P3 | src/lib/game.svelte.ts:351 | NEW | — |
