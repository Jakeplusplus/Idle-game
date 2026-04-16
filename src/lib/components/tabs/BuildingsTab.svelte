<script lang="ts">
  import { game, buyBuilding, buyUpgrade, attractMate } from "$lib/game.svelte.js";
  import { BUILDINGS } from "$lib/configs/buildings.js";
  import { UPGRADES } from "$lib/configs/upgrades.js";

  type BuildingTabId = "construction" | "forge" | "workshop" | "bloodline";

  const buildingTabs: BuildingTabId[] = [
    "construction",
    "forge",
    "workshop",
    "bloodline",
  ];

  let activeBuildingTab = $state<BuildingTabId>("construction");

  function getBuildingTabLabel(tabId: BuildingTabId) {
    if (tabId === "construction") return "Construction";
    if (tabId === "forge") return "Forge";
    if (tabId === "workshop") return "Workshop";
    return "Bloodline";
  }

  function isBuildingTabUnlocked(tabId: BuildingTabId) {
    if (tabId === "construction") return true;
    if (tabId === "forge") return Boolean(game.buildings.blacksmith);
    if (tabId === "workshop") return Boolean(game.buildings.workshop);
    if (tabId === "bloodline") return Boolean(game.buildings.hatchery);
    return false;
  }

  function getBuildingTabStatus(tabId: BuildingTabId) {
    if (tabId === "forge") return "Build Blacksmith";
    if (tabId === "workshop") return "Build Invention Lab";
    if (tabId === "bloodline") return "Build Hatchery";
    return "Ready";
  }

  $effect(() => {
    if (!isBuildingTabUnlocked(activeBuildingTab)) {
      activeBuildingTab = "construction";
    }
  });
</script>

<div class="sub-tab-bar" role="tablist" aria-label="Buildings wings">
  {#each buildingTabs as tabId}
    <button
      role="tab"
      class="sub-tab-btn"
      class:active-sub-tab={activeBuildingTab === tabId}
      class:locked-tab={!isBuildingTabUnlocked(tabId)}
      aria-selected={activeBuildingTab === tabId}
      disabled={!isBuildingTabUnlocked(tabId)}
      onclick={() => (activeBuildingTab = tabId)}
    >
      {getBuildingTabLabel(tabId)}
      {#if !isBuildingTabUnlocked(tabId)}
        <small>{getBuildingTabStatus(tabId)}</small>
      {/if}
    </button>
  {/each}
</div>

{#if activeBuildingTab === "construction"}
  <div class="tab-panel">
    <h3>Construction</h3>
    <p class="section-lead">
      Raise lodges, tunnels, and workshops to expand the roost. Each major
      structure unlocks a new wing below.
    </p>
    <div class="purchase-list building-list">
      {#each BUILDINGS as building (building.id)}
        <div class="purchase-item themed-card building-card">
          <div class="info" style="flex-grow: 1;">
            <strong>{building.name}</strong>
            {#if game.buildings[building.id]}
              <span class="active-badge">(Constructed)</span>
            {:else if building.id === "blacksmith"}
              <span class="active-badge unlock-badge">Unlocks Forge</span>
            {:else if building.id === "workshop"}
              <span class="active-badge unlock-badge">Unlocks Workshop</span>
            {:else if building.id === "hatchery"}
              <span class="active-badge unlock-badge">Unlocks Bloodline</span>
            {/if}
            <div class="building-description-row">
              <p>{building.description}</p>
              {#if !game.buildings[building.id]}
                <div class="building-action-row">
                  <button
                    onclick={() => buyBuilding(building.id)}
                    disabled={game.gold < building.goldCost}
                  >
                    Build - {building.goldCost} Gold
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if activeBuildingTab === "forge"}
  <div class="tab-panel">
    <h3>Forge</h3>
    <p class="section-lead">
      Smithing breakthroughs reinforce your mountain hold and unlock deeper
      excavation routes.
    </p>
    <div class="purchase-list">
      {#each UPGRADES.filter((u) => u.buildingId === "blacksmith") as upgrade (upgrade.id)}
        <div class="upgrade-item themed-card wing-upgrade">
          <div class="upgrade-info">
            <strong>{upgrade.name}</strong>
            {#if game.upgrades[upgrade.id]}
              <span class="active-badge">(Purchased)</span>
            {/if}
            <p style="font-size: 1rem; margin: 3px 0;">
              {upgrade.description}
            </p>
          </div>
          {#if !game.upgrades[upgrade.id]}
            <button
              onclick={() => buyUpgrade(upgrade.id)}
              disabled={game.ore < upgrade.oreCost}
            >
              Buy - {upgrade.oreCost} Ore
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if activeBuildingTab === "workshop"}
  <div class="tab-panel">
    <h3>Workshop</h3>
    <p class="section-lead">
      Engineering upgrades turn your labor force into a true highland excavation
      crew.
    </p>
    <div class="purchase-list">
      {#each UPGRADES.filter((u) => u.buildingId === "workshop") as upgrade (upgrade.id)}
        <div class="upgrade-item themed-card wing-upgrade">
          <div class="upgrade-info">
            <strong>{upgrade.name}</strong>
            {#if game.upgrades[upgrade.id]}
              <span class="active-badge">(Purchased)</span>
            {/if}
            <p style="font-size: 1rem; margin: 3px 0;">
              {upgrade.description}
            </p>
          </div>
          {#if !game.upgrades[upgrade.id]}
            <button
              onclick={() => buyUpgrade(upgrade.id)}
              disabled={game.ore < upgrade.oreCost}
            >
              Buy - {upgrade.oreCost} Ore
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if activeBuildingTab === "bloodline"}
  <div class="tab-panel">
    <h3>Bloodline Chamber</h3>
    <p>
      Accumulate at least 10,000 gold to attract a mate and lay a hatchling.
    </p>
    <p class="section-lead">
      The Hatchery prepares future generations. Larger mountain vaults produce
      stronger inherited traits.
    </p>
    <button
      onclick={attractMate}
      disabled={game.gold < 10000}
      class={game.gold >= 10000 ? "glow" : ""}
    >
      Attract Mate (Prestige)
    </button>
  </div>
{/if}

<style>
  .sub-tab-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-warm);
    margin-bottom: 0.25rem;
  }
  .sub-tab-btn {
    padding: 0.375rem 0.875rem;
    font-family: var(--font-display);
    font-size: 0.95rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    background: linear-gradient(
      180deg,
      rgba(44, 38, 30, 0.9),
      rgba(28, 32, 29, 0.9)
    );
    border: 2px solid var(--border-warm);
    box-shadow: 0.2rem 0.2rem 0 var(--shadow-color);
    cursor: pointer;
    transition: background 0.12s;
  }
  .sub-tab-btn small {
    font-family: var(--font-pixel);
    font-size: 0.8rem;
    color: #a8c0ab;
  }
  .sub-tab-btn:hover:not(:disabled) {
    background: linear-gradient(
      180deg,
      rgba(62, 54, 42, 0.95),
      rgba(38, 44, 39, 0.95)
    );
  }
  .sub-tab-btn.active-sub-tab {
    background: linear-gradient(
      180deg,
      rgba(93, 115, 89, 0.98),
      rgba(65, 82, 64, 0.98)
    );
    border-color: #c0b184;
    color: #e8dfc0;
    box-shadow: none;
  }
  .sub-tab-btn:disabled {
    background: linear-gradient(
      180deg,
      rgba(28, 30, 28, 0.85),
      rgba(22, 24, 22, 0.9)
    );
    border-color: #3a3f3b;
    color: #556058;
    box-shadow: none;
    cursor: not-allowed;
  }
  .sub-tab-btn:disabled small {
    color: #4a5a4d;
  }
  .building-card {
    min-height: 7.5rem;
  }
  .building-card .info {
    width: 100%;
  }
  .building-description-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
  }
  .building-action-row {
    display: flex;
    justify-content: flex-end;
    flex: 0 0 auto;
  }
  .unlock-badge {
    color: #b7d0a4;
  }
  .upgrade-item {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem;
    border: 1px solid var(--border-warm);
    gap: 0.625rem;
  }
  .wing-upgrade {
    border: 2px solid var(--border-warm);
  }
  .upgrade-info {
    text-align: left;
    flex: 1 1 12.5rem;
    max-width: 100%;
  }
  button.glow {
    background-color: #a8c58e;
    color: #1d271e;
    border-color: #7e9b66;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0.25rem 0.25rem 0px #000;
    }
    50% {
      transform: scale(1.05);
      box-shadow:
        0.375rem 0.375rem 0px #000,
        0 0 0.625rem #a8c58e;
    }
    100% {
      transform: scale(1);
      box-shadow: 0.25rem 0.25rem 0px #000;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    button.glow {
      animation: none;
    }
    .sub-tab-btn {
      transition: none;
    }
  }
</style>
