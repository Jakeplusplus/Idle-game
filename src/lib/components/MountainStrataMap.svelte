<script lang="ts">
  import { game } from "$lib/game.svelte.js";
  import { MOUNTAIN_LAYERS } from "$lib/configs/mountain.js";

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
            <strong>{stratum.name}</strong>
            <span class="stratum-stats">
              Excavated: {Math.floor(stratum.excavated)} / {stratum.maxCapacity}
              <span style="opacity:0.6; margin-left:10px;"
                >({stratum.startPoint}m - {stratum.endPoint}m)</span
              >
            </span>
          {:else}
            <strong class="obscured">??? UNEXPLORED BEDROCK ???</strong>
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
    gap: 5px;
    margin-top: 15px;
  }
  .stratum {
    position: relative;
    height: 40px;
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
    box-shadow: 0 0 0 1px rgba(195, 164, 123, 0.08) inset;
  }
  .stratum.locked {
    background: #171b18;
    border-color: #384038;
  }
  .stratum-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(130, 182, 200, 0.18),
      rgba(151, 186, 142, 0.32),
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
    padding: 0 15px;
    align-items: center;
  }
  .stratum-stats {
    font-size: 1rem;
    color: #d5ddd2;
  }
  .obscured {
    color: #667063;
    margin: 0 auto;
    letter-spacing: 2px;
  }
</style>
