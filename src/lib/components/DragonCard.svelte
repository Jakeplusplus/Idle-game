<script lang="ts">
  import { game } from "$lib/game.svelte.js";

  // Armor stat activates with the future map system — hidden until then.
  const MAP_SYSTEM_ACTIVE = false;
</script>

<div class="panel dragon-card forest-panel">
  <div class="panel-brackets" aria-hidden="true"></div>
  <div class="dragon-card-header">
    <h1>Generation {game.generation} Dragon</h1>
    <p class="header-subtitle">Roosting on the {game.mountain.name}</p>
  </div>
  <div class="status-grid" aria-label="Dragon stats">
    <div class="status-chip">
      <svg class="stat-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <rect x="7" y="1" width="2" height="8"/>
        <rect x="4" y="6" width="8" height="2"/>
        <rect x="7" y="9" width="2" height="3"/>
        <rect x="6" y="12" width="4" height="2"/>
      </svg>
      <strong>{game.stats.clickPower}</strong>
      <span class="status-label">Power</span>
    </div>
    <div class="status-chip">
      <svg class="stat-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M8,1 L10,6 L15,8 L10,10 L8,15 L6,10 L1,8 L6,6 Z"/>
      </svg>
      <strong>{game.stats.luck}</strong>
      <span class="status-label">Luck</span>
    </div>
    <div class="status-chip">
      <svg class="stat-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M8,1 L13,6 L8,15 L3,6 Z"/>
        <path d="M3,6 L13,6 L8,1 Z" fill="rgba(255,255,255,0.25)"/>
      </svg>
      <strong>{game.stats.beauty}</strong>
      <span class="status-label">Beauty</span>
    </div>
    {#if MAP_SYSTEM_ACTIVE}
    <div class="status-chip">
      <svg class="stat-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M2,2 L14,2 L14,9 L8,15 L2,9 Z"/>
      </svg>
      <strong>{game.stats.armor}</strong>
      <span class="status-label">Armor</span>
    </div>
    {/if}
  </div>
</div>

<style>
  .dragon-card {
    padding: 0.875rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .dragon-card-header h1 {
    font-family: var(--font-display);
    font-size: clamp(1rem, 1.8vw, 1.25rem);
    line-height: 1.4;
    margin: 0;
  }
  .header-subtitle {
    margin: 0.375rem 0 0;
    color: var(--text-warm);
    font-size: 1.05rem;
  }
  .status-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.5rem;
  }
  .status-chip {
    padding: 0.375rem 0.5rem;
    background: linear-gradient(
      180deg,
      rgba(29, 35, 31, 0.84),
      rgba(59, 71, 63, 0.72)
    );
    border: 2px solid #6e7b70;
    box-shadow: 0 0 0 1px rgba(var(--pine-rgb), 0.14) inset;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
  }
  .stat-icon {
    color: var(--text-warm);
    opacity: 0.85;
    flex-shrink: 0;
    image-rendering: pixelated;
    shape-rendering: crispEdges;
  }
  .status-chip :global(.status-label) {
    font-size: 0.85rem;
    opacity: 0.7;
  }
</style>
