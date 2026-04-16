## Agent: pitfalls

### Q1: Most Common Design Mistakes Killing Retention

- Found: "Mid-game content desert" is leading retention killer — games front-load early loop then rely on prestige resets to extend playtime with nothing bridging the gap. Churn spikes precisely in this window. [source: https://games.themindstudios.com/post/idle-clicker-game-design-and-monetization/]
- Found: Games with well-paced loops see Day 7 retention of 10-15% vs. 8% industry benchmark — measurable consequence of pacing mistakes. [source: https://www.gameanalytics.com/blog/how-to-make-an-idle-game-adjust]
- Found: Economy imbalance (too generous or too tight) breaks the psychological illusion of progress. [source: https://games.themindstudios.com/post/idle-clicker-game-design-and-monetization/]
- Found: Missing content signaling — not giving players "sneak peeks" into locked content removes anticipation loop that drives return visits. [source: https://apptrove.com/how-to-make-an-idle-game/]
- Found (project-specific): Dragon Hoard has EventsTab fully stubbed and mountain layers 4-7 are dead data with no unlock path — this is the "content desert" anti-pattern implemented in code. Players hitting the layer wall see no forward momentum. Confidence: HIGH
- Confidence: HIGH

### Q2: Technical Pitfalls — Performance, Float Precision, Save Corruption, Offline Bugs

- Found: JavaScript uses IEEE-754 double-precision — integers exact only up to 2^53 (9,007,199,254,740,991). Beyond that, `Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2` is `true`. Late-game prestige stacking could eventually reach this range. [source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER]
- Found: InnoGames (production idle game context): at 100 quadrillion, imprecision is roughly 1,000 — acceptable for display but breaks exact comparisons. Use `>=` for threshold checks, never `===` on floats. [source: https://blog.innogames.com/dealing-with-huge-numbers-in-idle-games/]
- Found: localStorage only stores strings — `JSON.stringify` silently drops `undefined` values; `JSON.parse` does not restore class instances. Adding a new property to game state after players have existing saves requires migration/default-fill step on load or property will be `undefined`. This is a save corruption vector for Dragon Hoard when new features are added. [source: https://kastark.co.uk/articles/incrementals-part-2.html]
- Found: "Rogue decimals" — floating-point accumulation during per-tick income calculation leaves values like `122.99999999999` instead of `123`. Silently prevents cost threshold checks from firing. [source: https://almostidle.com/tutorial/javascript-saving]
- Found: Chrome throttles `setInterval`/`setTimeout` to 1 call/minute after 5 minutes background (Chrome 88+). Current rAF approach sidesteps this because rAF pauses entirely when tab is backgrounded — making offline-progress-on-load the correct architectural choice. [source: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame]
- Confidence: HIGH

### Q3: Svelte 5 Reactive State Anti-Patterns in Game Scenarios

- Found: Confirmed real-world bug (GitHub issue #16224, open 2024): modifying a non-primitive `$state` (array/object) and reading it inside the same `$effect` creates an infinite loop. [source: https://github.com/sveltejs/svelte/issues/16224]
- Found: `$effect` can trigger itself — writing to any `$state` that the effect also reads will re-fire the effect. Official Svelte docs recommend `untrack()` to break dependency when you must write inside an effect. [source: https://svelte.dev/docs/svelte/$effect]
- Found: Svelte 5 deeply proxies `$state` objects/arrays — proxy overhead is real for large objects. `$state.raw` eliminates proxy cost for objects always reassigned (not mutated). Dragon Hoard's game state is deeply nested — worth evaluating which sub-trees are hot paths. [source: https://frontendmasters.com/blog/fine-grained-reactivity-in-svelte-5/]
- Found: Svelte 5 reactivity is synchronous but effect re-runs are batched per microtask. Rapid game-loop mutations to multiple state properties in one tick will batch into one effect re-run — cannot rely on effects firing between individual property writes within one tick. [source: https://dev.to/a1guy/svelte-reactivity-explained-how-your-ui-updates-automatically-4l2m]
- Found: Official Svelte best-practices docs explicitly warn against using `$effect` for game logic driving state mutation. `$derived` for computed values; `$effect` for external side effects (DOM, logging) only. [source: https://svelte.dev/docs/svelte/best-practices]
- Confidence: HIGH

### Q4: Bounding Offline Progress

- Found: Industry-standard cap is 4-24 hours. Melvor Idle caps at 24 hours. Most mobile idle games cap at 4-10 hours. [source: https://wiki.melvoridle.com/w/Offline_Progression, https://games.themindstudios.com/post/idle-clicker-game-design-and-monetization/]
- Found: Design intent behind capping is explicit: creates "lost opportunity" feeling after cap expires, which is a positive retention mechanic — players feel compelled to return before they stop earning. Uncapped game removes this motivator entirely. [source: https://apptrove.com/how-to-make-an-idle-game/]
- Found: Some games use tiered caps — one production type caps every 20 minutes, another every 5 hours, another every 2 days — creating differentiated return rhythms. [source: https://ericguan.substack.com/p/idle-game-design-principles]
- Found (project-specific): Dragon Hoard's offline progress uses `Math.min(timeDiffSeconds, ...)` with no actual cap. Simple fix: `const cappedSeconds = Math.min(timeDiffSeconds, 8 * 3600)` (8-hour cap as reasonable starting point). Confidence: HIGH
- Confidence: HIGH

### Q5: Prestige Design Pitfalls

- Found: Kongregate "Math of Idle Games" (canonical reference): designing reset point too early (before exponential slowdown is felt) means players don't feel the need to prestige. Too late means they feel trapped waiting. [source: https://blog.kongregate.com/the-math-of-idle-games-part-iii/]
- Found: Square-root prestige currency formula has critical consequence: resetting at exactly same progress point earns zero additional currency — need 4x prior total to double prestige currency. Designers who don't communicate this create confusion and perceived wasted resets. [source: https://blog.kongregate.com/the-math-of-idle-games-part-iii/]
- Found: "Logarithmic growth trap" — prestige growth is logarithmic, so interrupting the loop during its log phase (still growing fast) wastes exponential potential. Automation that triggers resets without accounting for this can permanently nerf a player's run. [source: https://steamcommunity.com/app/2763740/discussions/0/6955341154010347761/]
- Found (project-specific): Dragon Hoard's prestige randomly boosts stats. Random prestige rewards with no player agency violate core principle from Kongregate series: players must be able to calculate whether a reset is worthwhile. If stat gains are random, this calculation is impossible — players prestige "blind" and feel cheated on bad rolls. Confidence: HIGH
- Confidence: HIGH

### Q6: Non-Functional Stats — Recommended Approach

- Found: Player trust is foundational resource in idle games. Stats displayed in UI that do nothing are discovered by players and reported as bugs/deception, regardless of intent. Steam forum discussions show players who discover non-functional mechanics lose trust and abandon games. [source: https://steamcommunity.com/app/1476970/reviews/?browsefilter=toprated]
- Found: "Coming soon" / stub approach is explicitly identified as high-risk: players interact with feature, observe no effect, conclude it is broken. Better pattern: (a) hide stat until mechanic is implemented, or (b) implement a minimal version so stat is verifiably real. [source: https://ericguan.substack.com/p/idle-game-design-principles]
- Found (project-specific): With 4 prestige stats (clickPower, luck, beauty, armor) where 3 do nothing, 75% of prestige rolls are wasted. Compounding the randomness problem. Recommended fix options: hide luck/beauty/armor until implemented; assign each a concrete passive effect immediately (luck = small % bonus to click gold, beauty = reduced mate attraction cost, armor = reduces capacity drain rate); or make them aspirational UI with clear "coming in future update" label visually distinct from active stats. Confidence: HIGH for principle; MEDIUM for specific fix recommendations.
- Confidence: HIGH (for the principle)

### Q7: requestAnimationFrame at Variable Refresh Rates

- Found: Confirmed: rAF fires at screen's native refresh rate. On 120Hz displays, fires every ~8.3ms; on 60Hz, every ~16.7ms. Idle game using rAF without delta-time correction will run 2x faster on 120Hz vs 60Hz. [source: https://www.kirupa.com/animations/ensuring_consistent_animation_speeds.htm]
- Found: Fix is standard: use timestamp argument passed to rAF callback to compute actual elapsed time, multiply income by `deltaSeconds` rather than assuming fixed tick. Game loop gist details this pattern including `maxLoopJump` clamp to prevent catch-up bursts. [source: https://gist.github.com/HipHopHuman/3e9b4a94b30ac9387d9a99ef2d29eb1a]
- Found (project-specific): Dragon Hoard uses rAF with delta-time correction (confirmed by codebase agent). Risk is the `maxLoopJump` clamp — if single rAF frame has unusually large delta (brief tab unfocus then refocus before offline-progress kicks in), it could apply a large burst of income outside the intended offline-progress path. Recommend verifying rAF callback clamps delta to maximum ~1 second before applying income.
- Conflict: Earlier agent (library-landscape) stated "rAF pauses when tab is inactive — industry standard is offline-progress-on-load." Correct for long absences, but does NOT cover brief tab-switches (<5 seconds), during which rAF may resume with large accumulated delta rather than pausing cleanly. Delta clamping addresses this edge case.
- Confidence: HIGH

### Q8: Consequences of Uncapped Offline Progress

- Found: Uncapped offline progress has two distinct negative effects: (1) eliminates retention hook — no reason to return within any particular window; (2) produces mathematically broken game states if offline income calculation assumes linear rate but player's state would have changed mid-absence (e.g., they would have bought more minions with accumulated gold, compounding income). Linear approximation diverges from "what would have actually happened." [source: https://discussions.unity.com/t/saving-an-idle-game-and-offline-progression/154443]
- Found: Successful idle games treat offline progress as a reward, not a right. The cap creates "lost opportunity" emotion — powerful behavioral design tool. Games without it have measurably lower Day-3 and Day-7 retention. [source: https://games.themindstudios.com/post/idle-clicker-game-design-and-monetization/]
- Found: Some games show explicit "offline earnings" summary screen on return (gold raining down animation) — transforms offline progress from passive number change into active engagement moment. Makes cap invisible to player. [source: https://apptrove.com/how-to-make-an-idle-game/]
- Found (project-specific): Dragon Hoard's linear offline calculation (`timeDiffSeconds * goldPerSecond`) is also inaccurate for compound progression — player absent for 100 hours would have earned gold, bought more minions, earned more gold, etc. Linear formula underestimates actual theoretical income at high minion counts. Cap recommendation: 8-12 hours for this game's scale.
- Confidence: HIGH
