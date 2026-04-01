<script lang="ts">
  import MountainStrataMap from "$lib/components/MountainStrataMap.svelte";
</script>

<div class="tab-panel section-panel">
  <h3>Terrain Survey</h3>
  <p class="section-lead">
    Track excavation progress and watch each new shelf of the mountain open
    beneath the grove.
  </p>
  <MountainStrataMap />
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
