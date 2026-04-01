<script lang="ts">
  import { game, trainMinion } from "$lib/game.svelte.js";
  import { MINIONS } from "$lib/configs/minions.js";

  function getCost(type: keyof typeof game.minions) {
    const amount = game.minions[type] || 0;
    const minion = MINIONS.find((m) => m.id === type);
    return minion ? Math.floor(minion.baseCost * Math.pow(1.15, amount)) : 0;
  }
</script>

<div class="tab-panel">
  <h3>Brood Registry</h3>
  <p class="section-lead">
    Recruit loyal creatures to gather treasure and carve out a steady mountain
    holdfast.
  </p>
  <div class="purchase-list">
    {#each MINIONS as minion (minion.id)}
      <div class="purchase-item themed-card">
        <div class="info">
          <strong>{minion.name}</strong> (Own: {game.minions[minion.id]})
          <p>{minion.description}</p>
        </div>
        <button
          onclick={() => trainMinion(minion.id, getCost(minion.id))}
          disabled={game.gold < getCost(minion.id)}
        >
          Train - {getCost(minion.id)} Gold
        </button>
      </div>
    {/each}
  </div>
</div>
