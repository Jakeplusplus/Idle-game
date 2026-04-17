<script lang="ts">
  import { game } from "$lib/game.svelte.js";
  import { acceptSuitor, declineSuitor } from "$lib/game.svelte.js";
  import type { SuitorRarity } from "$lib/types.js";

  const rarityClass: Record<SuitorRarity, string> = {
    Common: "rarity-common",
    Uncommon: "rarity-uncommon",
    Rare: "rarity-rare",
    Epic: "rarity-epic",
    Legendary: "rarity-legendary",
  };
</script>

<div class="tab-panel">
  <h3>Visitors, Raids, and Rumors</h3>

  {#if game.pendingSuitor}
    {@const suitor = game.pendingSuitor}
    <div class="panel dither suitor-card">
      <div class="suitor-header">
        <span class="suitor-name">{suitor.name}</span>
        <span class="rarity-badge {rarityClass[suitor.rarity]}">{suitor.rarity}</span>
      </div>

      <p class="stat-pool-size body-text">{suitor.statPoolSize} stat point{suitor.statPoolSize !== 1 ? "s" : ""} available</p>

      <div class="stat-allocations">
        {#each suitor.statAllocations as alloc}
          <div class="stat-row">
            <span class="stat-label">{alloc.stat}</span>
            <span class="stat-value">+{alloc.amount}</span>
          </div>
        {/each}
      </div>

      {#if suitor.lineagePassive || suitor.generationPassive}
        <div class="passives">
          {#if suitor.lineagePassive}
            <div class="passive-preview lineage">
              <span class="passive-type">Lineage</span>
              <strong>{suitor.lineagePassive.name}</strong>
              <span class="body-text">{suitor.lineagePassive.description}</span>
            </div>
          {/if}
          {#if suitor.generationPassive}
            <div class="passive-preview generation">
              <span class="passive-type">Generation</span>
              <strong>{suitor.generationPassive.name}</strong>
              <span class="body-text">{suitor.generationPassive.description}</span>
            </div>
          {/if}
        </div>
      {:else}
        <p class="body-text no-passive">No passive — stat gains only.</p>
      {/if}

      <div class="suitor-actions">
        <button class="btn-primary" onclick={acceptSuitor}>Accept</button>
        <button class="btn-secondary" onclick={declineSuitor}>Decline</button>
      </div>
    </div>
  {:else}
    <div class="empty-state">
      {#if game.generation <= 1}
        <p class="body-text">
          Your lineage is young. Gather enough gold to attract a suitor and begin your dynasty.
        </p>
      {:else}
        <p class="body-text">No suitors at present. Accumulate gold to attract one.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .suitor-card {
    margin-top: 0.75rem;
  }

  .suitor-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .suitor-name {
    color: var(--text-primary, #e8dfc0);
    font-size: 1.3rem;
  }

  .rarity-badge {
    font-size: 0.95rem;
    padding: 0.1rem 0.5rem;
    border: 1px solid currentColor;
  }

  .rarity-common {
    color: var(--text-secondary, #9ba88a);
  }
  .rarity-uncommon {
    color: var(--forest, #4a7c59);
  }
  .rarity-rare {
    color: var(--stream, #5a9ebc);
  }
  .rarity-epic {
    color: var(--gold, #f5c842);
  }
  .rarity-legendary {
    color: var(--ember, #c25b5b);
  }

  .body-text {
    font-family: var(--font-pixel, "VT323", monospace);
    font-size: 1.25rem;
    line-height: 1.2;
    color: var(--text-secondary, #9ba88a);
    margin: 0.35rem 0;
  }

  .stat-pool-size {
    margin-bottom: 0.5rem;
  }

  .stat-allocations {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin-bottom: 0.75rem;
  }

  .stat-row {
    display: flex;
    gap: 0.5rem;
    font-size: 1.1rem;
  }

  .stat-label {
    color: var(--text-secondary, #9ba88a);
    text-transform: capitalize;
    min-width: 6rem;
  }

  .stat-value {
    color: var(--text-primary, #e8dfc0);
  }

  .passives {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .passive-preview {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid;
  }

  .passive-preview.lineage {
    border-color: var(--forest, #4a7c59);
  }

  .passive-preview.generation {
    border-color: var(--gold, #f5c842);
  }

  .passive-type {
    font-size: 0.85rem;
    color: var(--text-muted, #7a8a74);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .passive-preview strong {
    font-size: 1.1rem;
    color: var(--text-primary, #e8dfc0);
    font-weight: normal;
  }

  .no-passive {
    margin-bottom: 0.75rem;
  }

  .suitor-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .empty-state {
    margin-top: 0.75rem;
    padding: 1rem;
    border: 2px solid var(--border-warm, #6b5a46);
    background: rgba(0, 0, 0, 0.2);
  }
</style>
