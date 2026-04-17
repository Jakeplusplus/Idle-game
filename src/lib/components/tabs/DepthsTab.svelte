<script lang="ts">
  import MountainStrataMap from "$lib/components/MountainStrataMap.svelte";
  import TreasureVault from "$lib/components/TreasureVault.svelte";
  import { game } from "$lib/game.svelte.js";
</script>

<div class="tab-panel section-panel">
  <h3>Terrain Survey</h3>
  <p class="section-lead">
    Track excavation progress and watch each new shelf of the mountain open
    beneath the grove.
  </p>
  <MountainStrataMap />

  {#if game.buildings.treasure_vault}
    <TreasureVault />
  {/if}
</div>

<style>
  .section-panel :global(.mountain-map) {
    padding: 0;
    border: 0;
    box-shadow: none;
    background: transparent;
  }
  .section-panel :global(h3) {
    display: none;
  }
</style>
