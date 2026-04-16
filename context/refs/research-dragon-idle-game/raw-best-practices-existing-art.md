## Agent: best-practices and existing-art

### Q1: Prestige Loop Design

- Found: Four canonical prestige currency formulas differ in reset incentives. Cookie Clicker: cube-root of lifetime cookies (~8x earnings to double). Realm Grinder: quadratic of max earnings (~4x). AdVenture Capitalist: sqrt of lifetime earnings (diminishing returns, frequent resets fine). Egg, Inc.: 7th-root (128x to double — discourages frequent resets). [source: https://blog.kongregate.com/the-math-of-idle-games-part-iii/]
- Found: Run-based vs. lifetime-based prestige currency is a fundamental design choice. Lifetime-based (AdVenture Capitalist, Clicker Heroes) accumulates across resets; run-based (Realm Grinder) rewards beating prior high. Changes reset psychology dramatically. [source: https://blog.kongregate.com/the-math-of-idle-games-part-iii/]
- Found: Current game's random stat point rewards are atypical — most successful games use deterministic formulas tied to peak/lifetime resources so players can predict and plan reset timing. [source: Kongregate math series]
- Found: Exponential cost scaling (1.07–1.15x per unit) is industry standard. Production must also grow but slower — the gap between cost and production growth curves creates the prestige wall. [source: https://blog.kongregate.com/the-math-of-idle-games-part-i/]
- Found: Prestige timing heuristic: players should prestige when progress slows to 10-20% of peak speed. Showing "prestige now" indicator when math works out increases prestige engagement — one A/B test showed 28% lift from making prestige button animated/prominent when qualified. [source: https://apptrove.com/how-to-make-an-idle-game/]
- Found: Production should grow at ~1.1x per upgrade while costs grow at ~1.15x, creating a deliberate gap that forces prestige. Human perception requires ~20% changes to notice, so rates below this threshold feel invisible. [source: https://ericguan.substack.com/p/idle-game-design-principles]
- Confidence: HIGH

### Q2: Economy Design — Resource Sinks, Capacity Gating

- Found: Resource caps are primary economy stabilizer — force players to spend before accumulating, preventing passive hoarding. Tying capacity increases to strategic upgrades (not automatic time gates) makes capacity a meaningful prestige reward. [source: https://games.themindstudios.com/post/idle-clicker-game-design-and-monetization/]
- Found: Multiple producer types should each become attractive at different game stages by varying when multiplier bonuses trigger. Prevents single dominant strategy. [source: https://blog.kongregate.com/the-math-of-idle-games-part-i/]
- Found: "60/40 rule" — 60% of progress from idle mechanics, 40% from active engagement. Active play always faster but never mandatory. [source: https://apptrove.com/how-to-make-an-idle-game/]
- Found: Inflation is central enemy. Multiple currency layers (soft currency gold, meta-currency prestige points) compartmentalize inflationary pressure. Current game has only gold + ore, limiting economic depth. [source: https://ericguan.substack.com/p/idle-game-design-principles]
- Found: Idle Idol team used automated spreadsheet modeling (one parameter change updates all 40+ upgrades). "Exponentials can get off control really fast, so even a 0.01 difference would mean a huge difference." Manual per-upgrade tuning is unsustainable at scale. [source: https://www.gamedeveloper.com/design/balancing-tips-how-we-managed-math-on-idle-idol]
- Confidence: HIGH

### Q3: Idle Game UI — Progress Clarity

- Found: Core UI anti-pattern: showing all systems from start. Progressive disclosure — revealing tabs/systems only when relevant — is standard. Features should unlock contextually, not be grayed-out from beginning. [source: https://www.nngroup.com/articles/progressive-disclosure/]
- Found: "Known unknowns" (locked/grayed tabs) create anticipation; "unknown unknowns" (hidden features) reward exploration but risk players missing content. Balance depends on game complexity. [source: https://code.tutsplus.com/numbers-getting-bigger-the-design-and-math-of-incremental-games--cms-24023a]
- Found: Making prestige action visually prominent only when mathematically worthwhile (animated badge) improved prestige engagement 28% in A/B test. Affordances should appear when action becomes relevant. [source: https://apptrove.com/how-to-make-an-idle-game/]
- Found: Number formatting (1.5K, 1.5M) is expected UX at scale. Game UI Database (55,000+ screenshots) is best reference corpus for idle game UI patterns. [source: https://www.gameuidatabase.com/]
- Found: Multiple "clocks" with exponentially longer wait times match different player engagement cadences (casual vs. power users). [source: https://ericguan.substack.com/p/idle-game-design-principles]
- Confidence: HIGH

### Q4: Svelte 5 Component Architecture for Tab-Based UIs

- Found: Canonical Svelte 5 tab pattern: parent component holds `activeTabValue` as `$state`, child components rendered conditionally via `{#if}`. `<svelte:component>` is deprecated in Svelte 5 runes mode — use dynamic component assignment directly. [source: https://svelte.dev/playground/cf05bd4a4ca14fb8ace8b6cdebbb58da]
- Found: `$derived` rune particularly valuable for idle games — reactively computes values (production rate, cost, time-to-afford) without explicit subscriptions. One developer: `$derived` made incremental game state "come together beautifully." [source: https://www.manuelsanchezdev.com/blog/incremental-game-svelte]
- Found: Recommended tab pattern for progressive disclosure: store `$state` set of `unlockedTabs` in game state, derive rendered tab list from that set, render only active tab's component. Game logic (not UI) controls what's unlocked. Flowbite Svelte provides a well-tested Tabs component compatible with Svelte 5. [source: https://flowbite-svelte.com/docs/components/tabs]
- Found: Svelte 5 snippets allow tab label customization inline without prop drilling — useful for adding notification badges or lock icons to tab headers. [source: https://svelte.dev/blog/runes]
- Confidence: HIGH for Svelte patterns

### Q5: Notable Successful Browser Idle Games — Design Patterns

- Found: Cookie Clicker: buildings unlock sequentially as gold milestones reached, each adding a multiplier (not replacing prior buildings). Prestige (Ascension) uses cubic formula — 1 trillion cookies = level 1, 8 trillion = level 2, each providing +1% permanent CpS. Heavenly upgrade tree creates second meta-game across runs. [source: https://cookieclicker.fandom.com/wiki/Ascension]
- Found: Clicker Heroes introduced "two-tier prestige" — Ascension (frequent, tactical resets for Hero Souls) and Transcendence (rarer, strategic resets for Ancient Souls). Creates distinct short-loop and long-loop decisions, preventing prestige from feeling monotonous. [source: https://blog.clickerheroes.com/clicker-heroes-the-idle-game-revolution-you-cant-miss/]
- Found: Antimatter Dimensions uses "mandatory prestige" pattern — early resets are so powerful that the game requires repeated resets before natural progression. Trains the prestige habit early, reframes reset as "the mechanic" not punishment. [source: https://antimatter-dimensions.fandom.com/wiki/Guide]
- Found: NGU Idle keeps all prestige rewards functional throughout game (attack, defense, energy, magic all have uses at every stage). Even NGU Idle has stats that eventually "become useless" in very late game — issue is hard to fully eliminate but manageable through introducing new systems that consume those stats. [source: https://steamcommunity.com/app/1147690/discussions/]
- Confidence: HIGH

### Q6: How Antimatter Dimensions Handles Dead Stats

- Found: AD avoids dead-stat problem through "stat consumption chaining" — every prestige layer consumes the currency of the layer below. Infinity Points fuel Infinity upgrades; Eternity Points fuel Eternity upgrades; Reality Machines fuel Reality upgrades. No currency sits idle. Structural solution: every stat is an input to something higher. [source: https://antimatter-dimensions.fandom.com/wiki/Guide]
- Found: "Dimensional Sacrifice" mechanic — resetting lower dimensions to multiply top dimension — turns dead-weight into a deliberate resource. Applicable pattern: "sacrifice" mechanic where luck or beauty points are spent to boost another stat. [source: https://antimatter-dimensions.fandom.com/wiki/Guide]
- Found: AD keeps early stats relevant through achievements — achievements grant small but real multipliers. Current game has no achievement system. [source: https://antimatter-dimensions.fandom.com/wiki/BubbaCow%27s_Antimatter_Dimensions_Guide]
- Found: Profectus framework's prestige recipe (`x.div(10).sqrt()` formula) produces prestige currency based on current base resources with a requirement check preventing zero-gain resets. Players can see exactly what they'll earn before committing. [source: https://moddingtree.com/guide/recipes/prestige]
- Confidence: MEDIUM-HIGH

### Q7: Reference Implementations — Svelte Idle Games on GitHub

- Found: No mature high-star Svelte 5 idle game reference exists. Complete list tagged incremental-game + svelte:
  - omega-meta-zero (veprogames): 6 stars, June 2024, zero-player watcher game
  - capital-fish (tctree333): 1 star, April 2023, Cookie Clicker clone (Svelte 4, pre-runes)
  - Several 0-star projects from 2023-2026
    [source: https://github.com/topics/incremental-game?l=svelte]
- Found: open-idle (rohanrichards) — idle game on SvelteKit + Tailwind. Low stars. [source: https://github.com/rohanrichards/open-idle]
- Found: Best transferable reference is Profectus (Vue 3 + TypeScript, 34 stars, actively maintained). Its architecture — layer definitions in individual self-registering files — is instructive even for Svelte projects. [source: https://github.com/profectus-engine/Profectus]
- Confidence: HIGH (this codebase is among the most sophisticated Svelte 5 idle game examples in existence)

### Q8: Depth/Layer Progression Mechanics

- Found: Cookie Clicker shows locked buildings grayed-out with unlock requirements visible — converts dead data into anticipation and visible goals. Same pattern recommended for mountain layers 4-7. [source: https://cookieclicker.fandom.com/wiki/Ascension]
- Found: Antimatter Dimensions' multi-tier prestige layers each unlock entirely new sets of mechanics rather than just scaling numbers. Each gated behind specific production milestone, then requires one-time reset to break through. [source: https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/AntimatterDimensions]
- Found: "Known unknowns vs. unknown unknowns" — showing locked content (greyed layer slots with ore requirement tooltips) creates motivation; hiding content entirely risks players feeling game is shallow. [source: https://code.tutsplus.com/numbers-getting-bigger-the-design-and-math-of-incremental-games--cms-24023a]
- Found: Uncapped offline progress can allow skipping mountain layers — player offline 8 hours accumulates enough ore to unlock all layers without experiencing them. Soft cap at "enough to reach the next locked layer" preserves intended gating. [source: https://wiki.melvoridle.com/w/Offline_Progression]
- Confidence: HIGH

### Key Cross-Cutting Findings

1. **Dead stats fix**: Make luck affect random event system (rare gold drops), beauty affect prestige multiplier/mate-attraction speed, armor affect future event system. If new systems not planned, remove these from prestige reward pool entirely.
2. **Prestige formula**: Recommended simple starting point — `prestigePoints = floor(sqrt(peakGold / 1000))` — players can see exact earnings before resetting.
3. **Mountain layers 4-7**: Show locked layers with visible ore unlock requirements. The unlock mechanic is the missing implementation, not the data.
4. **Offline progress**: Cap at "enough to reach the next locked layer" to preserve designed gating.
5. **No Svelte 5 idle game reference worth studying** — this codebase is among the most sophisticated examples. Profectus (Vue) is the only architecturally instructive reference.
