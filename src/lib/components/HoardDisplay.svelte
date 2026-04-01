<script lang="ts">
  import {
    game,
    clickGold,
    clickBurrow,
    calculatePassiveIncome,
    calculatePassiveOre,
    calculatePassiveCapacity,
  } from "$lib/game.svelte.js";

  function getTotalHoard() {
    return game.gold + game.ore;
  }

  function getUsagePercent() {
    if (game.maxCapacity <= 0) return 0;
    return Math.min(100, (getTotalHoard() / game.maxCapacity) * 100);
  }

  function getGoldPercent() {
    if (game.maxCapacity <= 0) return 0;
    return (game.gold / game.maxCapacity) * 100;
  }

  function getOrePercent() {
    if (game.maxCapacity <= 0) return 0;
    return (game.ore / game.maxCapacity) * 100;
  }

  const isHoardFull = $derived(
    game.maxCapacity > 0 && game.gold + game.ore >= game.maxCapacity,
  );

  let showCappedUi = $state(false);
  let cappedUiTimeout: ReturnType<typeof setTimeout> | undefined;
  const cappedUiShowDelay = 300;
  const cappedUiHideDelay = 500;

  $effect(() => {
    if (cappedUiTimeout) {
      clearTimeout(cappedUiTimeout);
    }

    if (isHoardFull) {
      cappedUiTimeout = setTimeout(() => {
        showCappedUi = true;
      }, cappedUiShowDelay);
    } else {
      cappedUiTimeout = setTimeout(() => {
        showCappedUi = false;
      }, cappedUiHideDelay);
    }

    return () => {
      if (cappedUiTimeout) {
        clearTimeout(cappedUiTimeout);
      }
    };
  });
</script>

<div class="panel hoard-display forest-panel">
  <div class="panel-kicker">{game.mountain.name}</div>
  <div class="panel-brackets" aria-hidden="true"></div>
  <div class="pixel-rivets" aria-hidden="true"></div>
  <div class="hoard-heading-row">
    <div>
      <h2 class:cap-signal={showCappedUi}>Dragon Hoard</h2>
    </div>
    <div class="vault-usage">
      <span class="status-label">Capacity Usage</span>
      <strong>{Math.floor(getUsagePercent())}%</strong>
    </div>
  </div>

  <div class="resource-readout-grid">
    <div class="resource-card gold-card">
      <span class="resource-label">Gold</span>
      <strong>{Math.floor(game.gold)}</strong>
    </div>
    <div class="resource-card ore-card">
      <span class="resource-label">Ore</span>
      <strong>{Math.floor(game.ore)}</strong>
    </div>
    <div class="resource-card capacity-card">
      <span class="resource-label">Capacity</span>
      <strong
        >{Math.floor(getTotalHoard())} / {Math.floor(game.maxCapacity)}</strong
      >
    </div>
  </div>

  <div
    class="capacity-shell"
    role="progressbar"
    aria-label="Hoard capacity used"
    aria-valuemin={0}
    aria-valuemax={Math.max(0, Math.floor(game.maxCapacity))}
    aria-valuenow={Math.max(0, Math.floor(getTotalHoard()))}
    aria-valuetext={`${Math.floor(getTotalHoard())} of ${Math.floor(game.maxCapacity)} capacity used`}
  >
    <div class="meter-markings" aria-hidden="true"></div>
    <div class="capacity-bar">
      <div
        class="capacity-fill gold-fill"
        style="width: {getGoldPercent()}%"
        class:capped-fill={showCappedUi}
        aria-hidden="true"
      ></div>
      <div
        class="capacity-fill ore-fill"
        style="width: {getOrePercent()}%"
        class:capped-fill={showCappedUi}
        aria-hidden="true"
      ></div>
    </div>
  </div>

  <div class="capped-warning-slot" aria-live="polite">
    {#if showCappedUi}
      <p class="capped-warning">HOARD FULL! Clear new caverns!</p>
    {/if}
  </div>

  <div class="income-rack">
    <div class="income-pill">
      <span class="status-label">Gold / sec</span>
      <strong>{calculatePassiveIncome().toFixed(2)}</strong>
    </div>
    <div class="income-pill">
      <span class="status-label">Ore / sec</span>
      <strong>{calculatePassiveOre().toFixed(2)}</strong>
    </div>
    <div class="income-pill">
      <span class="status-label">Dig / sec</span>
      <strong>{calculatePassiveCapacity().toFixed(2)}</strong>
    </div>
  </div>

  <div class="action-deck">
    <button class="dragon-btn" onclick={clickGold}>
      Roar & Hoard
      <span>+{game.stats.clickPower} Gold</span>
    </button>
    <button class="dragon-btn burrow-btn" onclick={clickBurrow}>
      Burrow Caverns
      <span>+{game.stats.clickPower} Capacity</span>
    </button>
  </div>
</div>

<style>
  .hoard-display {
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
    padding: 1.5rem;
  }
  .hoard-display h2 {
    font-family: var(--font-display);
    font-size: clamp(1rem, 1.8vw, 1.3rem);
    line-height: 1.4;
  }
  .hoard-heading-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: start;
  }
  .cap-signal {
    color: var(--text-warm);
    text-shadow: 0 0 0.625rem rgba(var(--stream-rgb), 0.28);
  }
  .vault-usage {
    min-width: 7.5rem;
    padding: 0.625rem 0.75rem;
    text-align: right;
    background: rgba(27, 32, 29, 0.78);
    border: 2px solid var(--border-warm);
  }
  .resource-readout-grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.625rem;
  }
  .resource-card {
    padding: 0.75rem 0.875rem;
    border: 2px solid var(--border-warm);
    background: linear-gradient(
      180deg,
      rgba(33, 38, 34, 0.88),
      rgba(56, 47, 39, 0.8)
    );
    box-shadow: 0 0 0 1px rgba(var(--wood-rgb), 0.16) inset;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .gold-card {
    border-color: var(--border-gold);
  }
  .ore-card {
    border-color: var(--border-ore);
  }
  .capacity-card {
    border-color: var(--border-capacity);
  }
  .capacity-shell {
    position: relative;
    padding: 0.5rem;
    border: 3px solid var(--border-warm);
    background: rgba(22, 26, 24, 0.9);
    box-shadow:
      0 0 0 2px rgba(var(--wood-rgb), 0.08) inset,
      0 0 1.125rem rgba(var(--stream-rgb), 0.08);
  }
  .meter-markings {
    position: absolute;
    inset: 0.5rem;
    background: repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.12) 0 2px,
      transparent 2px 32px
    );
    opacity: 0.28;
    pointer-events: none;
  }
  .capacity-bar {
    position: relative;
    display: flex;
    height: 1.5rem;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.5),
      rgba(35, 43, 39, 0.92)
    );
    overflow: hidden;
  }
  .capacity-fill {
    height: 100%;
    transition:
      width 0.18s linear,
      background-color 0.22s ease,
      filter 0.22s ease;
  }
  .gold-fill {
    background: linear-gradient(180deg, #e2cd8f 0%, #bb9156 48%, #805b32 100%);
  }
  .ore-fill {
    background: linear-gradient(180deg, #b4d4df 0%, #79a8b8 45%, #496b79 100%);
  }
  .capacity-fill.capped-fill {
    background: linear-gradient(180deg, #c5cbb4 0%, #97ba8e 55%, #577457 100%);
    filter: saturate(1.05);
  }
  .capped-warning {
    font-size: 1.2em;
    font-weight: bold;
    margin: 0;
    animation: flash 1s infinite alternate;
  }
  .capped-warning-slot {
    min-height: 1.5em;
    margin-top: -2px;
  }
  @keyframes flash {
    from {
      opacity: 1;
      text-shadow: 0 0 0.625rem rgba(var(--stream-rgb), 0.8);
    }
    to {
      opacity: 0.5;
      text-shadow: none;
    }
  }
  .income-rack {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
  }
  .income-pill {
    padding: 0.625rem 0.75rem;
    background: rgba(28, 33, 30, 0.84);
    border: 2px solid var(--border-warm);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .action-deck {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }
  .dragon-btn {
    min-height: 6.875rem;
    padding: 1.125rem 1.375rem;
    font-size: 1.5em;
    background: linear-gradient(180deg, #5d764d 0%, #3c573d 60%, #26372d 100%);
    border-color: #91a47e;
    text-shadow: 2px 2px 0px #000;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.375rem;
  }
  .dragon-btn span {
    color: #c8ddc2;
    font-size: 1.05rem;
  }
  .dragon-btn:hover {
    background: linear-gradient(180deg, #6b8759 0%, #49664a 60%, #304336 100%);
  }
  .dragon-btn:active {
    transform: scale(0.95);
  }
  .burrow-btn {
    background: linear-gradient(180deg, #7aa6b6 0%, #52798a 60%, #324e5c 100%);
    border-color: #a6d1dc;
  }
  .burrow-btn:hover {
    background: linear-gradient(180deg, #87b6c7 0%, #5f889a 60%, #3b5b6a 100%);
  }

  @media (prefers-reduced-motion: reduce) {
    .capped-warning {
      animation: none;
    }
    .capacity-fill {
      transition: none;
    }
  }

  @media (max-width: 68rem) {
    .resource-readout-grid,
    .income-rack,
    .action-deck {
      grid-template-columns: 1fr;
    }
    .hoard-heading-row {
      flex-direction: column;
      align-items: stretch;
    }
    .vault-usage {
      text-align: left;
    }
  }
</style>
