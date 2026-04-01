<script lang="ts">
  import { game } from "$lib/game.svelte.js";
</script>

<div class="panel dragon-card forest-panel">
  <div class="panel-brackets" aria-hidden="true"></div>
  <div class="dragon-card-header">
    <h1>Generation {game.generation} Dragon</h1>
    <p class="header-subtitle">Roosting on the {game.mountain.name}</p>
  </div>
  <div class="status-grid" aria-label="Dragon stats">
    <div class="status-chip">
      <span class="status-label">Power</span>
      <strong>{game.stats.clickPower}</strong>
    </div>
    <div class="status-chip">
      <span class="status-label">Luck</span>
      <strong>{game.stats.luck}</strong>
    </div>
    <div class="status-chip">
      <span class="status-label">Beauty</span>
      <strong>{game.stats.beauty}</strong>
    </div>
    <div class="status-chip">
      <span class="status-label">Armor</span>
      <strong>{game.stats.armor}</strong>
    </div>
  </div>
</div>

<style>
  .dragon-card {
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }
  .status-chip {
    padding: 0.625rem 0.75rem;
    background: linear-gradient(
      180deg,
      rgba(29, 35, 31, 0.84),
      rgba(59, 71, 63, 0.72)
    );
    border: 2px solid #6e7b70;
    box-shadow: 0 0 0 1px rgba(var(--pine-rgb), 0.14) inset;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>
