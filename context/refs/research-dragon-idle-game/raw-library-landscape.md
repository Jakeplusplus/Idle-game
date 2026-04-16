## Agent: library-landscape

### Research Question 1: JS/TS libraries for idle/incremental game development

- Found: No dominant, widely-adopted idle game framework exists — ecosystem is fragmented. [source: https://github.com/topics/incremental-game]
- Found: **Incremental Game Template (IGT)** — TypeScript utility library with currency/wallet, upgrades, achievements, stats, inventory, loot tables, experience systems. Vue integration layer (`igt-vue`). No Svelte bindings. [source: https://123ishatest.github.io/igt-docs/docs/]
- Found: **Profectus** — TypeScript + Vue game engine template. 34 GitHub stars, 830 commits, actively maintained. Vue-only, no Svelte support. [source: https://github.com/profectus-engine/Profectus]
- Found: **Continuum Engine** — vanilla JS engine for idle/clicker games. ~60 stars. Still in development, not production-stable. [source: https://github.com/carribus/continuum-engine]
- Found: **incremental-game-engine-js** — jQuery-based, older project. Not suitable for modern Svelte 5 work. [source: https://github.com/Aldo111/incremental-game-engine-js]
- Found: **idle-bignum** — 23 GitHub stars, last commit December 2019. Essentially unmaintained. [source: https://github.com/FredericRezeau/idle-bignum]
- Confidence: HIGH — no mature Svelte-compatible idle game framework exists.

### Research Question 2: Game loop architectures for idle/incremental browser games

- Found: MDN explicitly recommends `requestAnimationFrame` as the foundation for all browser game loops, calling `setInterval`/`setTimeout` legacy approaches that "hog the main thread." [source: https://developer.mozilla.org/en-US/docs/Games/Anatomy]
- Found: **Critical**: Chrome throttles `setInterval` to once per minute after 5 minutes of background inactivity. Raw `setInterval` unreliable for idle games expecting background accumulation. [source: https://pontistechnology.com/learn-why-setinterval-javascript-breaks-when-throttled/]
- Found: **Web Worker + setInterval pattern** solves background throttling — run `setInterval` inside a Web Worker (NOT subject to throttling); worker posts messages to main thread on each tick; main thread handles state mutation. Rendering still uses `requestAnimationFrame`. [source: https://stephendoddtech.com/blog/game-design/javascript-web-worker-set-interval-game-loop]
- Found: **Practical pattern for idle games**: Use `setInterval` (1000ms) for game logic ticks, `requestAnimationFrame` for rendering, offline progress via `lastSaveTime` delta on load. Simpler than Web Worker approach, appropriate when offline progress computed at load time. [source: https://gist.github.com/HipHopHuman/3e9b4a94b30ac9387d9a99ef2d29eb1a]
- Found: `requestAnimationFrame` pauses when tab is inactive — offline games should compute offline progress on return, not try to run logic while away. Industry standard. [source: https://developer.mozilla.org/en-US/docs/Games/Anatomy]
- Confidence: HIGH

### Research Question 3: Svelte-specific game state management libraries/patterns

- Found: No production Svelte-specific game state library exists. Community uses Svelte's own reactivity primitives directly. [source: https://madewithsvelte.com/game]
- Found: Svelte 4 store pattern uses `writable`/`readable`/`derived`. `readable` store natural for game loop output. [source: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Frameworks_libraries/Svelte_stores]
- Found: **Svelte 5 migration caveat**: `$state` runes restricted to `.svelte` and `.svelte.js/ts` files. For pure client-side game (no SSR), restriction doesn't apply. [source: https://www.loopwerk.io/articles/2025/svelte-5-stores/]
- Found: **Recommended Svelte 5 global game state pattern** (Mainmatter, March 2025): Use exported object `export const gameState = $state({...})` or class with `$state` fields. Class pattern preferred — V8 optimizes class instances more heavily. [source: https://mainmatter.com/blog/2025/03/11/global-state-in-svelte-5/]
- Confidence: MEDIUM — patterns clear from docs but no battle-tested Svelte game library exists.

### Research Question 4: Big number arithmetic libraries for idle game display

- Found: **`break_eternity.js`** — current recommended library. 188 GitHub stars. Last release: v2.1.3, December 7, 2025 (actively maintained). Supports numbers up to 10^^1e308. TypeScript types included. Can serve as drop-in replacement for `decimal.js` and `break_infinity.js`. [source: https://github.com/Patashu/break_eternity.js/]
- Found: **`break_infinity.js`** — predecessor. 241 GitHub stars. Last release: v2.2.0, February 2023. Supports up to 1e(9e15). README recommends break_eternity.js as successor. [source: https://github.com/Patashu/break_infinity.js/]
- Found: Performance benchmarks vs `decimal.js`: break_infinity is 100x faster for `pow(1.5)`, 400x for `exp`, 600x for `log`, 50x for `add/mul`. Antimatter Dimensions saw 4.5x overall speedup switching from decimal.js. [source: https://github.com/Patashu/break_infinity.js/]
- Found: `decimal.js` / `bignumber.js` — accurate but slow. Not optimized for idle game workloads. [source: https://github.com/MikeMcl/bignumber.js/]
- Found: For current dragon hoard scale (values likely < 1e15), native JS `Number` with `Intl.NumberFormat` or `toExponential()` is sufficient. `break_eternity.js` is the correct upgrade path when values exceed 1e308 or display requires formatted suffixes. [source: MDN JS Number docs]
- Confidence: HIGH

### Research Question 5: Svelte 5 rune patterns for high-frequency game state updates

- Found: `$state` creates deeply reactive proxies — every property mutation triggers granular updates. Efficient because only changed properties cause DOM updates. [source: https://svelte.dev/docs/svelte/$state]
- Found: `$state.raw` for performance when large objects are fully replaced rather than mutated. "Improves performance with large arrays and objects you weren't planning to mutate anyway." [source: https://svelte.dev/docs/svelte/$state]
- Found: Svelte 5 benchmark results (GitHub Discussion #13277): Svelte v5 "outperformed all other reactivity libs by quite a solid margin on all benchmark tests" except cellx anomaly. [source: https://github.com/sveltejs/svelte/discussions/13277]
- Found: Fine-grained reactivity means update cost proportional to what changed, not what might have changed. 1-second tick changing `gold` only updates DOM nodes bound to `gold`. Key advantage over Svelte 4 stores. [source: https://leapcell.io/blog/svelte-5-and-the-granular-reactivity-revolution-with-runes]
- Found: Class-based `$state` pattern preferred for global game state — V8 optimizes class instances significantly more than plain objects. [source: https://mainmatter.com/blog/2025/03/11/global-state-in-svelte-5/]
- Found: `$derived` is memoized — computed values recalculated only when `$state` dependencies change. Correct primitive for derived game stats like cost scaling. [source: https://dev.to/mikehtmlallthethings/understanding-svelte-5-runes-derived-vs-effect-1hh]
- Found: **`$effect` caveat** — avoid for game logic that mutates state (causes potential infinite loops). Use only for side effects. Game loop mutations should be in plain JS functions called from `setInterval`, not inside `$effect`. [source: https://dev.to/mikehtmlallthethings/understanding-svelte-5-runes-derived-vs-effect-1hh]
- Confidence: HIGH

### Cross-Cutting Findings

- Existing architecture (rAF tick, `$state`, offline delta) already follows correct patterns. No major library additions strictly required.
- Gap: if gold values exceed ~1e15 display needs, add `break_eternity.js` (188 stars, Dec 2025, TypeScript-native).
- Web Worker pattern only adds value if game needs real-time background accumulation — current offline-progress-on-load is simpler and well-accepted.
