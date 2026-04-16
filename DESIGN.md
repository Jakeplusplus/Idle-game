---
created: 2026-04-15T00:00:00Z
last_edited: 2026-04-15T00:00:00Z
---

# Dragon Hoard — Design System

A Svelte 5 pixel-art retro idle game about a dragon hoarding gold. Published to GitHub Pages for friends.

---

## Section 1 — Visual Theme & Atmosphere

**Direction: Misty Mountain Lair**

The visual language is grounded, cozy, and warmly fantastical. The player manages a dragon's lair — a place that feels ancient, earthy, and alive. The palette draws from forest floors, mossy stone, mountain mist, and glowing gold. Nothing here is sterile or cold.

**Feeling: JOY** — warm, grounded, cozy dragon fantasy. This is not a grim dungeon crawler. It is a comfortable place to accumulate wealth.

**Reference: Sea of Stars** — rich dark backgrounds, vibrant pixel accents, strong contrast, warm magical lighting. Deep backgrounds make foreground elements pop. Color is used with intention, not decoration.

**Atmosphere keywords:** mossy stone panels, deep forest-floor darks with green undertones, earthy brown surfaces, gold shimmer as the hero accent.

**Dark-mode only.** No light mode variant exists or is planned.

---

## Section 2 — Color Palette

### Backgrounds

| Token         | Hex       | Role                                                |
| ------------- | --------- | --------------------------------------------------- |
| `bg-base`     | `#0D110E` | Forest floor — page background, shadow fill         |
| `bg-surface`  | `#161D17` | Mossy stone panels — cards, sidebars, list rows     |
| `bg-elevated` | `#1F2B20` | Elevated surfaces — modals, tooltips, nested panels |

### Text

| Token            | Hex       | Contrast on bg-base | Role                                          |
| ---------------- | --------- | ------------------- | --------------------------------------------- |
| `text-primary`   | `#E8DFC0` | ~14:1               | Warm parchment — primary readable text        |
| `text-secondary` | `#9BA88A` | ~7.6:1              | Sage mist — secondary labels, descriptions    |
| `text-muted`     | `#7A8A74` | ~5.5:1              | Stone moss — disabled states, decorative only |

`text-muted` meets WCAG AA for large text only. Do not use it for interactive or informational body text.

### Gold (Hero Accent — Primary Resource)

| Token       | Hex       | Role                                                            |
| ----------- | --------- | --------------------------------------------------------------- |
| `gold`      | `#F5C842` | Hoard gold — primary CTA, resource counts, active tab indicator |
| `gold-deep` | `#B8963A` | Hover/pressed gold — darkened state of gold elements            |

Gold is the player's primary resource and the system's primary interactive color. It is reserved for CTAs and resource display. Do not use it as a decorative fill.

### Nature Accents

| Token    | Hex       | Role                                                               |
| -------- | --------- | ------------------------------------------------------------------ |
| `forest` | `#4A7C59` | Mossy green — success states, positive feedback, income indicators |
| `stream` | `#5A9EBC` | Mountain stream blue — info states, secondary/passive elements     |
| `earth`  | `#7A5C3A` | Warm brown — borders, dividers, panel edges                        |
| `ember`  | `#C25B5B` | Danger red — errors, danger buttons, warning states                |

### CSS Custom Properties

```css
:root {
  /* Backgrounds */
  --bg-base: #0d110e;
  --bg-surface: #161d17;
  --bg-elevated: #1f2b20;

  /* Text */
  --text-primary: #e8dfc0;
  --text-secondary: #9ba88a;
  --text-muted: #7a8a74;

  /* Gold */
  --gold: #f5c842;
  --gold-deep: #b8963a;

  /* Accents */
  --forest: #4a7c59;
  --stream: #5a9ebc;
  --earth: #7a5c3a;
  --ember: #c25b5b;

  /* Component-specific */
  --bg-danger: #3d1515; /* Dark crimson — danger button background */

  /* Alias */
  --shadow-color: #0d110e;
}
```

---

## Section 3 — Typography

**Fonts in codebase:** VT323 and Press Start 2P (Google Fonts, already loaded).

### Type Scale

| Role         | Font           | Size | Line Height | Usage                             |
| ------------ | -------------- | ---- | ----------- | --------------------------------- |
| `display`    | Press Start 2P | 24px | 1.6         | Dragon name, generation titles    |
| `heading`    | Press Start 2P | 16px | 1.6         | Section headings, tab labels      |
| `subheading` | Press Start 2P | 10px | 1.6         | Card titles, stat names           |
| `number`     | VT323          | 32px | 1.0         | Resource counts, big numbers      |
| `body`       | VT323          | 20px | 1.2         | Descriptions, tooltips, body text |
| `caption`    | VT323          | 16px | 1.2         | Labels, captions, fine print      |

### Rules

- **Press Start 2P is used sparingly** — maximum 3 sizes in use at any time. It carries high visual weight and fatigues readers at body sizes.
- **VT323 carries all readable body content.** It is legible at 20px+ and suited for the retro aesthetic without sacrificing readability.
- **No code font.** This is a game UI, not a developer tool.

### CSS

```css
.text-display {
  font-family: "Press Start 2P", monospace;
  font-size: 24px;
  line-height: 1.6;
}
.text-heading {
  font-family: "Press Start 2P", monospace;
  font-size: 16px;
  line-height: 1.6;
}
.text-subheading {
  font-family: "Press Start 2P", monospace;
  font-size: 10px;
  line-height: 1.6;
}
.text-number {
  font-family: "VT323", monospace;
  font-size: 32px;
  line-height: 1;
}
.text-body {
  font-family: "VT323", monospace;
  font-size: 20px;
  line-height: 1.2;
}
.text-caption {
  font-family: "VT323", monospace;
  font-size: 16px;
  line-height: 1.2;
}
```

---

## Section 4 — Components

### Buttons

All buttons: `border-radius: 0`, `cursor: pointer`, `font-family: 'Press Start 2P'`, `font-size: 10px`, `padding: 8px 12px`, `position: relative`.

#### Primary Button

```css
.btn-primary {
  background: var(--gold); /* #F5C842 */
  color: var(--bg-base); /* #0D110E — dark text on gold */
  border: none;
  box-shadow: 3px 3px 0 var(--shadow-color);
}
```

`.dither` class applied. See Dither Effect below.

#### Secondary Button

```css
.btn-secondary {
  background: var(--bg-elevated); /* #1F2B20 */
  color: var(--text-primary); /* #E8DFC0 */
  border: 1px solid var(--earth); /* #7A5C3A */
  box-shadow: 2px 2px 0 var(--shadow-color);
}
```

`.dither` class applied.

#### Danger Button

```css
.btn-danger {
  background: var(--bg-danger); /* #3D1515 */
  color: var(--ember); /* #C25B5B */
  border: 1px solid var(--ember);
  box-shadow: 2px 2px 0 var(--shadow-color);
}
```

#### Disabled State

```css
.btn:disabled,
.btn[aria-disabled="true"] {
  background: var(--bg-surface); /* #161D17 */
  color: var(--text-muted); /* #7A8A74 */
  border: none;
  box-shadow: none;
  cursor: not-allowed;
  /* No .dither class applied */
}
```

#### Interaction States (all button variants)

```css
/* Hover — lifts */
.btn:hover:not(:disabled) {
  box-shadow: 6px 6px 0 var(--shadow-color);
  transform: translate(-2px, -2px);
}

/* Active / Pressed — presses down */
.btn:active:not(:disabled) {
  box-shadow: inset 2px 2px 0 var(--shadow-color);
  transform: translate(2px, 2px);
}

/* Focus */
.btn:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}
```

### Cards / Panels

```css
.panel {
  background: var(--bg-surface); /* #161D17 */
  border: 1px solid var(--earth); /* #7A5C3A */
  box-shadow: 3px 3px 0 var(--shadow-color);
  padding: 16px; /* space-4 */
  border-radius: 0;
  position: relative;
}
```

`.panel` class gets the dither `::after` effect applied on the bottom edge (see Dither Effect). No `border-radius` ever.

### Dither Effect

The dither effect simulates the pixel-art panel edge common in retro game UIs. It is applied via a CSS `::after` pseudo-element using a base64-encoded PNG as a CSS mask.

Applied to:

- `.panel` — cards, resource panels (bottom edge)
- `.dither` — primary and secondary buttons (bottom edge)

```css
.panel::after,
.dither::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: var(--shadow-color); /* #0D110E */
  mask-image: url("data:image/png;base64,..."); /* 4.5rem repeating dither PNG */
  mask-position: bottom;
  mask-repeat: repeat-x;
  mask-size: 4.5rem;
  pointer-events: none;
}
```

**Requirements:**

- The host element must have `position: relative`.
- Do not apply `.dither` to elements shorter than ~48px — the effect will visually collide with content.
- Do not apply to disabled buttons.

### Progress Bars

```css
.progress-track {
  background: var(--bg-elevated); /* #1F2B20 */
  border: 1px solid var(--earth); /* #7A5C3A */
  height: 12px;
  border-radius: 0;
  overflow: hidden;
}

.progress-fill--gold {
  background: var(--gold); /* #F5C842 — primary resource / capacity */
  height: 100%;
}

.progress-fill--ore {
  background: var(--earth); /* #7A5C3A — ore / mining progress */
  height: 100%;
}
```

No `border-radius`. No gradient. Solid pixel fill only.

Progress bars are **non-interactive display elements** — no hover, focus, or active states. Do not add click handlers or keyboard affordances.

### Tabs

```css
/* Tab bar container */
.tab-bar {
  border-bottom: 1px solid var(--earth);
}

/* Individual tab */
.tab {
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  background: var(--bg-surface);
  padding: 8px 16px;
  cursor: pointer;
  font-family: "Press Start 2P", monospace;
  font-size: 10px;
}

/* Active tab */
.tab[aria-selected="true"] {
  color: var(--text-primary);
  border-bottom-color: var(--gold);
}

/* Hover — non-active, non-locked tabs */
.tab:hover:not([aria-selected="true"]):not([data-locked="true"]) {
  color: var(--text-primary);
}

/* Locked tab */
.tab[data-locked="true"] {
  color: var(--text-muted);
  cursor: default;
  pointer-events: none;
}

/* Focus */
.tab:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: -2px;
}
```

### Modal / Dialog

```css
.modal-backdrop {
  background: rgba(13, 17, 14, 0.8); /* --bg-base at 80% */
  position: fixed;
  inset: 0;
  z-index: 100;
}

.modal-panel {
  background: var(--bg-surface);
  border: 2px solid var(--earth);
  box-shadow: 6px 6px 0 var(--shadow-color);
  border-radius: 0;
  z-index: 100;
}
```

Desktop: `max-width: 480px`, centered. Mobile: `width: 100vw`, full screen. See Section 8.

**Close affordance:** Use `.btn-secondary` for the close button, positioned top-right within the modal panel. Label: `×` or `Close`.

**Keyboard behavior:** Modal must trap focus while open. Pressing `Escape` dismisses the modal and returns focus to the triggering element. Use `inert` attribute or a focus-trap utility on the backdrop to prevent background interaction.

---

## Section 5 — Layout & Spacing

**Base unit: 8px**

### Spacing Scale

| Token     | Value | Usage                                            |
| --------- | ----- | ------------------------------------------------ |
| `space-1` | 4px   | Tight — icon gaps, inline label padding          |
| `space-2` | 8px   | Small — button inner padding (vertical)          |
| `space-3` | 12px  | Medium-small — button inner padding (horizontal) |
| `space-4` | 16px  | Default — card padding, section gaps             |
| `space-5` | 24px  | Medium — between cards, tab content padding      |
| `space-6` | 32px  | Large — between major layout regions             |
| `space-8` | 64px  | Page — page-level margins                        |

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-8: 64px;
}
```

### Page Layout

**Two-column grid** on desktop. Single column on mobile. No `max-width` on the page.

```css
.page-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-5);
  padding: var(--space-5);
  min-height: 100vh;
}

@media (max-width: 68rem) {
  .page-layout {
    grid-template-columns: 1fr;
  }
}
```

**Left rail (280px fixed):** `DragonCard` + `HoardDisplay` stacked vertically, `space-4` gap.

**Right panel (flex grow):** Tab bar at top (`border-bottom: 1px solid var(--earth)`), tab content area with `space-5` padding.

**Nested tabs** (e.g. `BuildingsTab`): Same tab pattern, `space-3` padding within.

---

## Section 6 — Elevation

**Hard pixel shadows only.** No `blur-radius` ever. No `rgba` shadow softening. Shadows use `var(--shadow-color)` (`#0D110E`).

### Shadow Levels

| Level   | Value                     | Usage                                              |
| ------- | ------------------------- | -------------------------------------------------- |
| `flat`  | `none`                    | Inline elements, disabled states, background fills |
| `low`   | `2px 2px 0 #0D110E`       | Tab content panels, inner nested surfaces          |
| `mid`   | `3px 3px 0 #0D110E`       | Cards, resource panels, resting primary buttons    |
| `high`  | `6px 6px 0 #0D110E`       | Modals, dialogs, dropdowns, hovered buttons        |
| `inset` | `inset 2px 2px 0 #0D110E` | Pressed buttons, active inputs                     |

### Button Elevation Transitions

| State                    | Shadow                                          |
| ------------------------ | ----------------------------------------------- |
| Rest (primary)           | `mid` — 3px 3px 0                               |
| Rest (secondary, danger) | `low` — 2px 2px 0                               |
| Hover                    | `high` — 6px 6px 0 + translate(-2px, -2px)      |
| Active/Pressed           | `inset` — inset 2px 2px 0 + translate(2px, 2px) |
| Disabled                 | `flat` — none                                   |

### Z-Index Layering

| Layer     | z-index | Usage                              |
| --------- | ------- | ---------------------------------- |
| `base`    | 0       | Page content, background elements  |
| `panel`   | 10      | Cards, tab content panels          |
| `sticky`  | 20      | Tab bar, sticky headers            |
| `modal`   | 100     | Dialogs, overlays, modal backdrops |
| `tooltip` | 200     | Tooltips, hover popover info       |

```css
:root {
  --z-base: 0;
  --z-panel: 10;
  --z-sticky: 20;
  --z-modal: 100;
  --z-tooltip: 200;
}
```

---

## Section 7 — Do's and Don'ts

### Shadows

**DO:** Use hard pixel shadows.

```css
/* Correct */
box-shadow: 3px 3px 0 #0d110e;
```

**DON'T:** Add blur radius or alpha softening to any shadow.

```css
/* Wrong */
box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.5);
```

---

### Gold Usage

**DO:** Use gold on interactive elements and resource counts.

```svelte
<!-- Correct: primary action button -->
<button class="btn-primary">Collect Gold</button>

<!-- Correct: resource count -->
<span class="text-number" style="color: var(--gold)">{gold}</span>
```

**DON'T:** Use gold as a decorative background fill or purely visual accent.

```svelte
<!-- Wrong: gold as decorative panel background -->
<div style="background: var(--gold)">Dragon's Lair</div>
```

---

### Border Radius

**DO:** Square corners on everything.

```css
/* Correct */
border-radius: 0;
```

**DON'T:** Round any corners anywhere.

```css
/* Wrong */
border-radius: 4px;
border-radius: 50%;
```

---

### Typography

**DO:** Use VT323 for all readable body content at 20px and above.

```svelte
<!-- Correct -->
<p class="text-body">Your minions are busy mining the mountain.</p>
```

**DON'T:** Use Press Start 2P for body text or descriptions.

```svelte
<!-- Wrong: Press Start 2P at body size is unreadable and fatiguing -->
<p style="font-family: 'Press Start 2P'; font-size: 14px">Your minions are busy mining.</p>
```

---

### Dither Effect

**DO:** Apply `.panel` to cards and `.dither` to primary/secondary buttons.

```svelte
<!-- Correct -->
<div class="panel">...</div>
<button class="btn-primary dither">Hire Minion</button>
```

**DON'T:** Apply `.dither` to small inline elements under ~48px height.

```svelte
<!-- Wrong: dither on a tiny badge collides with content -->
<span class="dither" style="height: 20px">+5g</span>
```

---

### Float Comparisons (Game Logic)

**DO:** Use `>=` for float threshold checks in game logic.

```typescript
// Correct
if (gameState.gold >= cost) {
  purchaseMinion();
}
```

**DON'T:** Use strict equality on floating-point game values.

```typescript
// Wrong — floating-point imprecision will cause this to fail silently
if (gameState.gold === 10000) {
  unlockPrestige();
}
```

---

### Unimplemented UI

**DO:** Hide stat UI until the mechanic that drives it exists.

```svelte
<!-- Correct: stat only shown when mechanic is active -->
{#if gameState.miners > 0}
  <StatChip label="Ore/sec" value={orePerSec} />
{/if}
```

**DON'T:** Show non-functional stat elements as placeholders.

```svelte
<!-- Wrong: confuses players, implies broken functionality -->
<StatChip label="Ore/sec" value="???" />
```

---

## Section 8 — Responsive

**Single breakpoint: 68rem.** No tablet intermediate. Desktop-first.

### Desktop (≥ 68rem)

- Two-column grid: left rail 280px + right panel flex grow
- All type sizes at full scale (see Section 3)
- Modal: centered, `max-width: 480px`
- Tab bar: full horizontal, no scrolling needed

### Mobile (< 68rem)

- Single column: left rail stacks above tab panel
- Tab bar: horizontal, `overflow-x: auto`, scrollable if content overflows
- Cards: full width
- Modal: full screen, `width: 100vw`, `height: 100dvh`

### Mobile Type Overrides

| Role         | Desktop              | Mobile                           |
| ------------ | -------------------- | -------------------------------- |
| `display`    | Press Start 2P, 24px | Press Start 2P, 18px             |
| `heading`    | Press Start 2P, 16px | Press Start 2P, 12px             |
| `subheading` | Press Start 2P, 10px | Press Start 2P, 10px (unchanged) |
| `number`     | VT323, 32px          | VT323, 28px                      |
| `body`       | VT323, 20px          | VT323, 20px (unchanged)          |
| `caption`    | VT323, 16px          | VT323, 16px (unchanged)          |

### CSS

```css
@media (max-width: 68rem) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .tab-bar {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal-panel {
    width: 100vw;
    height: 100dvh;
    max-width: none;
  }

  .text-display {
    font-size: 18px;
  }
  .text-heading {
    font-size: 12px;
  }
  .text-number {
    font-size: 28px;
  }
}
```

---

## Section 9 — Agent Prompt Guide

### Quick Reference Token Table

| Category   | Token              | Value                     | Usage                            |
| ---------- | ------------------ | ------------------------- | -------------------------------- |
| Background | `--bg-base`        | `#0D110E`                 | Page background, shadow fill     |
| Background | `--bg-surface`     | `#161D17`                 | Cards, panels                    |
| Background | `--bg-elevated`    | `#1F2B20`                 | Modals, tooltips                 |
| Text       | `--text-primary`   | `#E8DFC0`                 | Main readable text               |
| Text       | `--text-secondary` | `#9BA88A`                 | Labels, descriptions             |
| Text       | `--text-muted`     | `#7A8A74`                 | Disabled, decorative only        |
| Accent     | `--gold`           | `#F5C842`                 | CTAs, resource counts            |
| Accent     | `--gold-deep`      | `#B8963A`                 | Gold hover/pressed               |
| Accent     | `--forest`         | `#4A7C59`                 | Success, income                  |
| Accent     | `--stream`         | `#5A9EBC`                 | Info, passive                    |
| Accent     | `--earth`          | `#7A5C3A`                 | Borders, dividers                |
| Accent     | `--ember`          | `#C25B5B`                 | Errors, danger                   |
| Component  | `--bg-danger`      | `#3D1515`                 | Danger button background         |
| Shadow     | `--shadow-color`   | `#0D110E`                 | All box-shadow fill              |
| Space      | `--space-4`        | `16px`                    | Card padding default             |
| Space      | `--space-5`        | `24px`                    | Between cards                    |
| Font       | Press Start 2P     | 10px/16px/24px            | Headings, labels (use sparingly) |
| Font       | VT323              | 16px/20px/32px            | Body, numbers                    |
| Shadow     | flat               | `none`                    | Disabled                         |
| Shadow     | low                | `2px 2px 0 #0D110E`       | Inner panels                     |
| Shadow     | mid                | `3px 3px 0 #0D110E`       | Cards, resting buttons           |
| Shadow     | high               | `6px 6px 0 #0D110E`       | Modals, hover                    |
| Shadow     | inset              | `inset 2px 2px 0 #0D110E` | Pressed buttons                  |

---

### Example Prompt 1 — New Building Card

> "Add a building card component for the Dragon Hoard idle game. Use `--bg-surface` (`#161D17`) as the card background, `1px solid var(--earth)` (`#7A5C3A`) for the border, and `3px 3px 0 var(--shadow-color)` (mid elevation) for the box-shadow. Apply the `.panel` class so the dither effect renders on the bottom edge. The card needs `position: relative`. Card padding is `var(--space-4)` (16px). Display the building name in `.text-subheading` (Press Start 2P, 10px) in `var(--text-primary)`. Display the description in `.text-body` (VT323, 20px) in `var(--text-secondary)`. The buy button is `.btn-primary .dither` — gold background `#F5C842`, dark text `#0D110E`, mid shadow at rest, high shadow on hover with `translate(-2px, -2px)`, inset shadow on active. No `border-radius` anywhere."

---

### Example Prompt 2 — Gold Resource Display

> "Add a gold resource display for the Dragon Hoard idle game. Show the current gold count as a large number using `.text-number` (VT323, 32px, line-height 1.0) in `var(--gold)` (`#F5C842`). Below it, show a capacity progress bar: track is `var(--bg-elevated)` with `1px solid var(--earth)` border and 12px height, no border-radius; the fill is `var(--gold)` and represents `gold / maxGold`. Use `>=` not `===` when checking if gold is at capacity. Label the bar with `.text-caption` (VT323, 16px) in `var(--text-secondary)`. Wrap the whole display in a `.panel` div (bg-surface, earth border, mid shadow, dither effect, position relative, space-4 padding). Do not use gold as a background fill — only for the text value and progress bar fill."

---

### Example Prompt 3 — Prestige / Danger Action

> "Add a prestige button for the Dragon Hoard idle game. Use `.btn-danger`: background `#3D1515`, text `var(--ember)` (`#C25B5B`), `1px solid var(--ember)` border, `2px 2px 0 var(--shadow-color)` (low shadow). The button should be disabled and styled with `.btn:disabled` (bg-surface background, text-muted text, no shadow, cursor not-allowed) until `gameState.gold >= 10000` — use `>=` not `===` for the float threshold check. When enabled, hover lifts to high shadow (`6px 6px 0`), active presses to inset shadow. No border-radius. Font is Press Start 2P, 10px. Label: 'Attract Mate'. Hide this button entirely if the prestige mechanic has not yet been introduced to the player."
