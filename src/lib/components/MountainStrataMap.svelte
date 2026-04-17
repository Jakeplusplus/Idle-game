<script lang="ts">
  import { game } from "$lib/game.svelte.js";
  import { MOUNTAIN_LAYERS } from "$lib/configs/mountain.js";
  import { UPGRADES } from "$lib/configs/upgrades.js";

  const mountainMap = $derived.by(() => {
    let currentTotalLimit = 0; // Offset visual boundaries beyond natural max baseline
    return MOUNTAIN_LAYERS.map((layer, index) => {
      const startPoint = currentTotalLimit;
      const endPoint = startPoint + layer.maxCapacity;
      let excavatedInLayer = 0;

      if (game.maxCapacity >= endPoint) {
        excavatedInLayer = layer.maxCapacity;
      } else if (game.maxCapacity > startPoint) {
        excavatedInLayer = game.maxCapacity - startPoint;
      }

      currentTotalLimit = endPoint;

      const unlockUpgrade = UPGRADES.find((u) => u.effect === `unlock_layer_${index}`);

      return {
        ...layer,
        index,
        unlocked: index <= game.mountain.currentLayerIndex,
        startPoint,
        endPoint,
        excavated: excavatedInLayer,
        percentExcavated: Math.min(
          100,
          (excavatedInLayer / layer.maxCapacity) * 100,
        ),
        oreCost: unlockUpgrade?.oreCost ?? null,
      };
    });
  });
</script>

<div class="panel mountain-map" aria-label="Mountain strata scanner">
  <h3>Mountain Terrain Survey</h3>
  <div class="strata-container">
    {#each mountainMap as stratum (stratum.index)}
      <div
        class="stratum {stratum.unlocked ? 'unlocked' : 'locked'}"
        role={stratum.unlocked ? "progressbar" : undefined}
        aria-label={stratum.unlocked
          ? `${stratum.name} excavation progress`
          : "Unexplored mountain stratum"}
        aria-valuemin={stratum.unlocked ? 0 : undefined}
        aria-valuemax={stratum.unlocked ? stratum.maxCapacity : undefined}
        aria-valuenow={stratum.unlocked ? Math.floor(stratum.excavated) : undefined}
        aria-valuetext={stratum.unlocked
          ? `${Math.floor(stratum.excavated)} of ${stratum.maxCapacity} excavated`
          : undefined}
      >
        <div
          class="stratum-fill"
          style="width: {stratum.percentExcavated}%"
          aria-hidden="true"
        ></div>
        <div class="stratum-content">
          {#if stratum.unlocked}
            <strong class="layer-name">{stratum.name}</strong>
            <span class="stratum-stats">
              Excavated: {Math.floor(stratum.excavated)} / {stratum.maxCapacity}
              <span style="opacity:0.6; margin-left:0.625rem;"
                >({stratum.startPoint}m - {stratum.endPoint}m)</span
              >
            </span>
          {:else}
            <strong class="obscured">??? UNEXPLORED BEDROCK ???</strong>
            {#if stratum.oreCost !== null}
              <span class="ore-req">Requires {stratum.oreCost} ore</span>
            {/if}
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .strata-container {
    display: flex;
    flex-direction: column;
    gap: 0.3125rem;
    margin-top: 0.9375rem;
  }
  .stratum {
    position: relative;
    height: 2.5rem;
    background: linear-gradient(
      180deg,
      rgba(34, 44, 38, 0.9),
      rgba(23, 29, 25, 0.92)
    );
    border: 2px solid var(--border-color);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 1px rgba(var(--wood-rgb), 0.08) inset;
  }
  .stratum.locked {
    background: var(--bg-surface, #161d17);
    border-color: #384038;
  }
  .stratum-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(var(--stream-rgb), 0.18),
      rgba(var(--pine-rgb), 0.32),
      rgba(79, 113, 86, 0.42)
    );
    opacity: 0.9;
    transition: width 0.1s linear;
  }
  .stratum-content {
    position: relative;
    z-index: 1;
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0 0.9375rem;
    align-items: center;
  }
  .stratum-stats {
    font-size: 1rem;
    color: var(--text-main);
  }
  .layer-name {
    color: var(--text-primary, #e8dfc0);
  }
  .obscured {
    color: var(--text-muted, #7a8a74);
    letter-spacing: 2px;
  }
  .ore-req {
    color: var(--text-muted, #7a8a74);
    font-size: 0.95rem;
  }
</style>
