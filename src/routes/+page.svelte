<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    game,
    clickGold,
    clickBurrow,
    trainMinion,
    buyBuilding,
    buyUpgrade,
    buyOre,
    sellOre,
    attractMate,
    startGameLoop,
    calculatePassiveIncome,
    calculatePassiveOre,
    calculatePassiveCapacity,
    exportSave,
    importSave,
    hardReset,
  } from "$lib/game.svelte.js";
  import { MOUNTAIN_LAYERS } from "$lib/configs/mountain.js";
  import { MINIONS } from "$lib/configs/minions.js";
  import { BUILDINGS } from "$lib/configs/buildings.js";
  import { UPGRADES } from "$lib/configs/upgrades.js";
  import { TRADING } from "$lib/configs/trading.js";

  import MountainStrataMap from "$lib/components/MountainStrataMap.svelte";

  type TabId =
    | "brood"
    | "depths"
    | "construction"
    | "trade"
    | "forge"
    | "workshop"
    | "events"
    | "bloodline";

  onMount(() => {
    startGameLoop();
  });

  let showOptions = $state(false);
  let activeTab = $state<TabId>("brood");
  let gearButton: HTMLButtonElement | undefined = $state();
  let optionsContainer: HTMLDivElement | undefined = $state();
  let importSaveButton: HTMLButtonElement | undefined = $state();
  let importInput: HTMLInputElement | undefined = $state();
  let tradeAmountInput: HTMLInputElement | undefined = $state();
  let lastTradeTrigger: HTMLButtonElement | undefined;

  const optionsMenuId = "options-menu";
  const tradeDialogTitleId = "trade-dialog-title";

  function handleImport(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          if (importSave(text)) {
            alert("Save imported successfully!");
            showOptions = false;
          } else {
            alert("Invalid save file.");
          }
        }
      };
      reader.readAsText(file);
    }
  }

  function confirmReset() {
    if (
      confirm(
        "Are you sure you want to hard reset? This will wipe all generations and stats permanently!",
      )
    ) {
      hardReset();
      showOptions = false;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (!showOptions) return;
    const target = event.target as HTMLElement;
    if (optionsContainer && !optionsContainer.contains(target)) {
      closeOptionsMenu();
    }
  }

  function handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && showOptions) {
      event.preventDefault();
      closeOptionsMenu();
    }
  }

  function getCost(type: keyof typeof game.minions) {
    const amount = game.minions[type] || 0;
    const minion = MINIONS.find((m) => m.id === type);
    return minion ? Math.floor(minion.baseCost * Math.pow(1.15, amount)) : 0;
  }

  function getMaxOreBuyAmount() {
    return Math.max(0, Math.floor(game.gold / TRADING.ORE_BUY_PRICE));
  }

  function getMaxOreSellAmount() {
    return Math.max(0, Math.floor(game.ore));
  }

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

  function getTabLabel(tabId: TabId) {
    if (tabId === "brood") return "Brood";
    if (tabId === "depths") return "Depths";
    if (tabId === "construction") return "Construction";
    if (tabId === "trade") return "Trade";
    if (tabId === "forge") return "Forge";
    if (tabId === "workshop") return "Workshop";
    if (tabId === "events") return "Events";
    return "Bloodline";
  }

  function isTabUnlocked(tabId: TabId) {
    if (
      tabId === "brood" ||
      tabId === "depths" ||
      tabId === "construction" ||
      tabId === "trade" ||
      tabId === "events"
    )
      return true;
    if (tabId === "forge") return Boolean(game.buildings.blacksmith);
    if (tabId === "workshop") return Boolean(game.buildings.invention_lab);
    if (tabId === "bloodline") return Boolean(game.buildings.hatchery);
    return false;
  }

  function getTabStatus(tabId: TabId) {
    if (tabId === "forge") return "Build Blacksmith";
    if (tabId === "workshop") return "Build Invention Lab";
    if (tabId === "bloodline") return "Build Hatchery";
    return "Ready";
  }

  const lairTabs: TabId[] = [
    "brood",
    "depths",
    "construction",
    "trade",
    "forge",
    "workshop",
    "events",
    "bloodline",
  ];

  let tradeDialog: HTMLDialogElement | undefined = $state();
  let tradeMode = $state<"buy" | "sell">("buy");
  let tradeAmount = $state(1);
  let showCappedUi = $state(false);
  let cappedUiTimeout: ReturnType<typeof setTimeout> | undefined;
  const cappedUiShowDelay = 300;
  const cappedUiHideDelay = 500;

  const isHoardFull = $derived(
    game.maxCapacity > 0 && game.gold + game.ore >= game.maxCapacity,
  );

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

  $effect(() => {
    if (!isTabUnlocked(activeTab)) {
      activeTab = "construction";
    }
  });

  async function openOptionsMenu() {
    showOptions = true;
    await tick();
    importSaveButton?.focus();
  }

  function closeOptionsMenu() {
    showOptions = false;
    gearButton?.focus();
  }

  function toggleOptionsMenu() {
    if (showOptions) {
      closeOptionsMenu();
      return;
    }

    void openOptionsMenu();
  }

  async function openTradeModal(
    mode: "buy" | "sell",
    trigger?: EventTarget | null,
  ) {
    tradeMode = mode;
    tradeAmount = 1;
    if (trigger instanceof HTMLButtonElement) {
      lastTradeTrigger = trigger;
    }
    tradeDialog?.showModal();
    await tick();
    tradeAmountInput?.focus();
  }

  function closeTradeModal() {
    tradeDialog?.close();
    lastTradeTrigger?.focus();
  }

  function confirmTrade() {
    tradeAmount = Math.floor(tradeAmount);
    if (tradeMode === "buy") {
      buyOre(tradeAmount);
    } else {
      sellOre(tradeAmount);
    }
    closeTradeModal();
  }
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleGlobalKeydown} />

<div bind:this={optionsContainer} class="options-dock">
  <button
    bind:this={gearButton}
    class="gear-btn"
    type="button"
    aria-label={showOptions ? "Close options menu" : "Open options menu"}
    aria-haspopup="menu"
    aria-expanded={showOptions}
    aria-controls={optionsMenuId}
    onclick={toggleOptionsMenu}
  >
    <svg
      viewBox="0 0 16 16"
      width="32"
      height="32"
      fill="currentColor"
      aria-hidden="true"
      style="image-rendering: pixelated; shape-rendering: crispEdges;"
    >
      <path
        d="M6 0h4v2h4v4h2v4h-2v4h-4v2H6v-2H2v-4H0V6h2V2h4V0zM6 6h4v4H6z"
        fill-rule="evenodd"
      />
    </svg>
  </button>

  {#if showOptions}
    <div class="options-dropdown panel" id={optionsMenuId} role="menu">
      <h2 class="options-title">Options</h2>
      <button type="button" role="menuitem" onclick={exportSave}
        >Export Save</button
      >
      <button
        bind:this={importSaveButton}
        type="button"
        role="menuitem"
        onclick={() => importInput?.click()}
      >
        Import Save
      </button>
      <input
        bind:this={importInput}
        id="save-upload"
        type="file"
        accept=".json"
        onchange={handleImport}
        style="display: none;"
      />
      <button
        class="danger-btn"
        type="button"
        role="menuitem"
        onclick={confirmReset}
      >
        Hard Reset
      </button>
    </div>
  {/if}
</div>

<div class="container">
  <div class="glow glow-left" aria-hidden="true"></div>
  <div class="glow glow-right" aria-hidden="true"></div>
  <header class="panel header forest-panel">
    <div class="panel-kicker">Hoard</div>
    <div class="panel-brackets" aria-hidden="true"></div>
    <div class="header-title-row">
      <div>
        <h1>Generation {game.generation} Dragon</h1>
        <p class="header-subtitle">
          Roosting in the {MOUNTAIN_LAYERS[game.mountain.currentLayerIndex]
            .name}
          at ({game.mountain.coordinates.x}, {game.mountain.coordinates.y})
        </p>
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
  </header>

  <section class="hero-grid">
    <div class="panel hoard-display forest-panel">
      <div class="panel-kicker">Timber Vault</div>
      <div class="panel-brackets" aria-hidden="true"></div>
      <div class="pixel-rivets" aria-hidden="true"></div>
      <div class="hoard-heading-row">
        <div>
          <h2 class:cap-signal={showCappedUi}>Dragon Hoard</h2>
          <p class="scanner-copy">
            Timber braces, stone gauges, and stream channels update in real
            time.
          </p>
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
            >{Math.floor(getTotalHoard())} / {Math.floor(
              game.maxCapacity,
            )}</strong
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
          <p class="capped-warning">
            HOARD FULL! Clear new caverns in the ridge!
          </p>
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
  </section>

  <section class="panel forest-panel tabbed-wing">
    <div class="panel-kicker">Mountain Wings</div>
    <div class="panel-brackets" aria-hidden="true"></div>
    <div class="tab-strip" role="tablist" aria-label="Lair wings">
      {#each lairTabs as tabId}
        <button
          role="tab"
          class="tab-chip"
          class:active-tab={activeTab === tabId}
          class:locked-tab={!isTabUnlocked(tabId)}
          aria-selected={activeTab === tabId}
          disabled={!isTabUnlocked(tabId)}
          onclick={() => (activeTab = tabId)}
        >
          <span>{getTabLabel(tabId)}</span>
          {#if !isTabUnlocked(tabId)}
            <small>{getTabStatus(tabId)}</small>
          {/if}
        </button>
      {/each}
    </div>

    {#if activeTab === "brood"}
      <div class="tab-panel">
        <h3>Brood Registry</h3>
        <p class="scanner-copy">
          Recruit loyal creatures to gather treasure and carve out a steady
          mountain holdfast.
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
    {/if}

    {#if activeTab === "depths"}
      <div class="tab-panel scanner-panel">
        <h3>Terrain Survey</h3>
        <p class="scanner-copy">
          Track excavation progress and watch each new shelf of the mountain
          open beneath the grove.
        </p>
        <MountainStrataMap />
      </div>
    {/if}

    {#if activeTab === "construction"}
      <div class="tab-panel">
        <h3>Construction</h3>
        <p class="scanner-copy">
          Raise lodges, tunnels, and workshops to expand the roost. Each major
          structure unlocks a new control wing.
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
                {:else if building.id === "invention_lab"}
                  <span class="active-badge unlock-badge">Unlocks Workshop</span
                  >
                {:else if building.id === "hatchery"}
                  <span class="active-badge unlock-badge"
                    >Unlocks Bloodline</span
                  >
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

    {#if activeTab === "trade"}
      <div class="tab-panel">
        <h3>Market Trading</h3>
        <p class="scanner-copy">
          Mountain caravans trade gold and ore along winding passes and cold
          river crossings.
        </p>
        <div class="trade-market-grid">
          <div class="trade-col">
            <h4 class="trade-col-label">Buy Ore</h4>
            <div class="trade-price-tag">
              1 ore costs {TRADING.ORE_BUY_PRICE} gold
            </div>
            <button
              onclick={() => buyOre(1)}
              disabled={game.gold < TRADING.ORE_BUY_PRICE}
            >
              Buy One
            </button>
            <button
              onclick={(event) => openTradeModal("buy", event.currentTarget)}
              disabled={game.gold < TRADING.ORE_BUY_PRICE}
            >
              Buy Some
            </button>
            <button
              onclick={() => buyOre(getMaxOreBuyAmount())}
              disabled={getMaxOreBuyAmount() < 1}
            >
              Buy All
            </button>
          </div>
          <div class="trade-col">
            <h4 class="trade-col-label">Sell Ore</h4>
            <div class="trade-price-tag">
              1 ore sells for {TRADING.ORE_SELL_PRICE} gold
            </div>
            <button onclick={() => sellOre(1)} disabled={game.ore < 1}>
              Sell One
            </button>
            <button
              onclick={(event) => openTradeModal("sell", event.currentTarget)}
              disabled={game.ore <= 0}
            >
              Sell Some
            </button>
            <button
              onclick={() => sellOre(getMaxOreSellAmount())}
              disabled={getMaxOreSellAmount() < 1}
            >
              Sell All
            </button>
          </div>
        </div>
      </div>
    {/if}

    {#if activeTab === "forge"}
      <div class="tab-panel">
        <h3>Forge</h3>
        <p class="scanner-copy">
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

    {#if activeTab === "workshop"}
      <div class="tab-panel">
        <h3>Workshop</h3>
        <p class="scanner-copy">
          Engineering upgrades turn your labor force into a true highland
          excavation crew.
        </p>
        <div class="purchase-list">
          {#each UPGRADES.filter((u) => u.buildingId === "invention_lab") as upgrade (upgrade.id)}
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

    {#if activeTab === "events"}
      <div class="tab-panel">
        <h3>Visitors, Raids, and Rumors</h3>
        <p class="scanner-copy">
          This chamber will surface wanderers, caravans, raiders, and rare
          mountain events once the supporting buildings are raised.
        </p>
        <div class="event-placeholder">
          <span class="status-label">Current State</span>
          <strong>Quiet Pine Mist</strong>
          <p>
            No major visitors yet. Expand the roost to awaken the mountain
            network.
          </p>
        </div>
      </div>
    {/if}

    {#if activeTab === "bloodline"}
      <div class="tab-panel">
        <h3>Bloodline Chamber</h3>
        <p>
          Accumulate at least 10,000 gold to attract a mate and lay a hatchling.
        </p>
        <p class="scanner-copy">
          The Hatchery prepares future generations. Larger mountain vaults
          produce stronger inherited traits.
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
  </section>
</div>

<dialog
  bind:this={tradeDialog}
  class="panel"
  aria-labelledby={tradeDialogTitleId}
>
  <h3 id={tradeDialogTitleId}>
    {tradeMode === "buy" ? "Buy Ore" : "Sell Ore"}
  </h3>
  <p style="margin-bottom: 5px;">
    {tradeMode === "buy"
      ? `(Cost: ${TRADING.ORE_BUY_PRICE} Gold per Ore)`
      : `(Gain: ${TRADING.ORE_SELL_PRICE} Gold per Ore)`}
  </p>
  <div
    style="display: flex; gap: 10px; align-items: center; justify-content: center; margin-bottom: 20px;"
  >
    <label for="trade-amt">Amount:</label>
    <input
      bind:this={tradeAmountInput}
      id="trade-amt"
      type="number"
      bind:value={tradeAmount}
      min="1"
      step="1"
      style="font-size: 1.2em; padding: 5px; width: 100px; text-align: center; background: rgba(28, 33, 29, 0.96); color: var(--text-main); border: 2px solid var(--border-color);"
    />
  </div>
  <div style="display: flex; gap: 10px; justify-content: center;">
    <button
      onclick={confirmTrade}
      disabled={tradeMode === "buy"
        ? game.gold < tradeAmount * TRADING.ORE_BUY_PRICE
        : game.ore < tradeAmount}
    >
      Confirm
    </button>
    <button class="danger-btn" onclick={closeTradeModal}>Cancel</button>
  </div>
</dialog>

<style>
  .container {
    position: relative;
    overflow-x: clip;
    overflow-y: visible;
    max-width: 1460px;
    margin: 0 auto;
    padding: 32px 20px 40px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .glow {
    position: fixed;
    pointer-events: none;
    z-index: 0;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.38;
    background: radial-gradient(
      circle,
      rgba(121, 177, 149, 0.45) 0%,
      rgba(89, 135, 111, 0.24) 42%,
      rgba(104, 156, 183, 0.2) 58%,
      transparent 72%
    );
  }
  .glow-left {
    top: 80px;
    left: -120px;
  }
  .glow-right {
    top: 340px;
    right: -160px;
  }
  .container > :not(.glow) {
    position: relative;
    z-index: 1;
  }
  .forest-panel {
    position: relative;
    background: linear-gradient(
        180deg,
        rgba(55, 62, 56, 0.94),
        rgba(34, 39, 35, 0.97)
      ),
      linear-gradient(
        90deg,
        rgba(var(--wood-rgb), 0.08),
        transparent 35%,
        rgba(var(--stream-rgb), 0.07)
      );
    border-color: var(--border-color);
    box-shadow:
      0 0 0 2px rgba(20, 24, 21, 0.75) inset,
      8px 8px 0px var(--shadow-color);
    overflow: hidden;
  }
  .panel-brackets {
    position: absolute;
    inset: 10px;
    pointer-events: none;
  }
  .pixel-rivets {
    position: absolute;
    inset-inline: 18px;
    top: 16px;
    height: 8px;
    pointer-events: none;
    background: radial-gradient(
        square at left center,
        #c7b696 0 35%,
        transparent 40%
      )
      0 0 / 48px 8px repeat-x;
    opacity: 0.45;
  }
  .panel-kicker {
    position: relative;
    z-index: 1;
    margin-bottom: 10px;
    color: var(--text-warm);
    font-family: var(--font-display);
    font-size: 1rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .header {
    padding: 24px;
  }
  .header-title-row {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: end;
  }
  .header h1,
  .hoard-display h2,
  .scanner-panel h3 {
    font-family: var(--font-display);
    font-size: clamp(1rem, 2vw, 1.45rem);
    line-height: 1.4;
  }
  .header-subtitle,
  .scanner-copy {
    margin: 10px 0 0;
    color: var(--text-warm);
    font-size: 1.15rem;
  }
  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(110px, 1fr));
    gap: 10px;
    min-width: min(100%, 280px);
  }
  .status-chip {
    padding: 12px 14px;
    background: linear-gradient(
      180deg,
      rgba(29, 35, 31, 0.84),
      rgba(59, 71, 63, 0.72)
    );
    border: 2px solid #6e7b70;
    box-shadow: 0 0 0 1px rgba(var(--pine-rgb), 0.14) inset;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .status-label,
  .resource-label {
    color: var(--text-label);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 1rem;
  }
  .status-chip strong,
  .resource-card strong,
  .vault-usage strong,
  .income-pill strong {
    color: var(--text-bright);
    font-size: 1.35rem;
    font-weight: normal;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
  .hoard-display {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 28px;
  }
  .hoard-heading-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: start;
  }
  .cap-signal {
    color: var(--text-warm);
    text-shadow: 0 0 10px rgba(var(--stream-rgb), 0.28);
  }
  .vault-usage {
    min-width: 140px;
    padding: 12px 14px;
    text-align: right;
    background: rgba(27, 32, 29, 0.78);
    border: 2px solid var(--border-warm);
  }
  .resource-readout-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  .resource-card {
    padding: 14px 16px;
    border: 2px solid var(--border-warm);
    background: linear-gradient(
      180deg,
      rgba(33, 38, 34, 0.88),
      rgba(56, 47, 39, 0.8)
    );
    box-shadow: 0 0 0 1px rgba(var(--wood-rgb), 0.16) inset;
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
    z-index: 1;
    padding: 8px;
    border: 3px solid var(--border-warm);
    background: rgba(22, 26, 24, 0.9);
    box-shadow:
      0 0 0 2px rgba(var(--wood-rgb), 0.08) inset,
      0 0 18px rgba(var(--stream-rgb), 0.08);
  }
  .meter-markings {
    position: absolute;
    inset: 8px;
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
    height: 28px;
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
    color: var(--text-warm);
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
      text-shadow: 0 0 10px rgba(var(--stream-rgb), 0.8);
    }
    to {
      opacity: 0.5;
      text-shadow: none;
    }
  }
  .income-rack {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .income-pill {
    padding: 12px 14px;
    background: rgba(28, 33, 30, 0.84);
    border: 2px solid var(--border-warm);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .action-deck {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .trade-market-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
  }
  .trade-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    background: linear-gradient(
      180deg,
      rgba(31, 37, 33, 0.84),
      rgba(60, 52, 44, 0.75)
    );
    border: 2px solid var(--border-warm);
    box-shadow: 0 0 0 1px rgba(var(--wood-rgb), 0.08) inset;
  }
  .trade-col-label {
    margin: 0;
    color: var(--text-warm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: var(--font-display);
    font-size: 1rem;
  }
  .trade-price-tag {
    color: #cfe0df;
    font-size: 1rem;
  }
  .tabbed-wing {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
  }
  .tab-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }
  .tab-chip {
    min-height: 74px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(
      180deg,
      rgba(62, 51, 40, 0.95),
      rgba(33, 38, 34, 0.96)
    );
    border-color: var(--border-warm);
    box-shadow: 4px 4px 0 var(--shadow-color);
  }
  .tab-chip span {
    font-family: var(--font-display);
    font-size: 1rem;
    line-height: 1.5;
    color: var(--text-cream);
  }
  .tab-chip small {
    font-family: var(--font-pixel);
    font-size: 1rem;
    color: #a8c0ab;
    line-height: 1.1;
  }
  .active-tab {
    background: linear-gradient(
      180deg,
      rgba(93, 115, 89, 0.98),
      rgba(65, 82, 64, 0.98)
    );
    border-color: #c0b184;
    color: var(--text-bright);
  }
  .locked-tab {
    opacity: 0.55;
  }
  .tab-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .scanner-panel :global(.mountain-map) {
    padding: 0;
    border: 0;
    box-shadow: none;
    background: transparent;
  }
  .scanner-panel :global(h3) {
    display: none;
  }
  .options-dock {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 20;
    isolation: isolate;
  }
  .gear-btn {
    font-size: 2em;
    background: linear-gradient(
      180deg,
      rgba(93, 76, 57, 0.96),
      rgba(42, 47, 41, 0.96)
    );
    border: none;
    box-shadow: 6px 6px 0px var(--shadow-color);
    padding: 6px;
    cursor: pointer;
    color: var(--text-warm);
    transition:
      transform 0.2s,
      color 0.2s,
      background-color 0.2s;
  }
  .gear-btn:hover,
  .gear-btn:focus-visible {
    background: linear-gradient(
      180deg,
      rgba(112, 94, 71, 0.98),
      rgba(64, 82, 72, 0.98)
    );
    color: var(--text-bright);
  }
  .gear-btn:active {
    box-shadow: 0px 0px 0px #000;
  }
  .options-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 10px;
    width: min(280px, calc(100vw - 32px));
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: linear-gradient(
      180deg,
      rgba(46, 53, 48, 0.98),
      rgba(28, 33, 29, 0.99)
    );
    border: 2px solid var(--border-color);
    padding: 15px;
    box-shadow:
      0 0 0 1px rgba(var(--wood-rgb), 0.18) inset,
      4px 4px 0px #000;
    z-index: 1;
  }
  .options-title {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--text-warm);
  }
  .danger-btn {
    background-color: var(--wood-dark);
  }
  .event-placeholder {
    padding: 14px;
    border: 2px solid var(--border-warm);
    background: linear-gradient(
      180deg,
      rgba(33, 38, 35, 0.84),
      rgba(56, 49, 41, 0.76)
    );
  }
  .event-placeholder p {
    margin: 8px 0 0;
    color: #d6d7c9;
  }
  .dragon-btn {
    min-height: 110px;
    padding: 18px 22px;
    font-size: 1.5em;
    background: linear-gradient(180deg, #5d764d 0%, #3c573d 60%, #26372d 100%);
    color: var(--text-bright);
    border-color: #91a47e;
    text-shadow: 2px 2px 0px #000;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
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
  .purchase-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 10px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 10px;
  }
  /* Custom scrollbar for pixel art feel */
  .purchase-list::-webkit-scrollbar {
    width: 12px;
  }
  .purchase-list::-webkit-scrollbar-track {
    background: var(--bg-color);
    border: 2px solid var(--border-color);
  }
  .purchase-list::-webkit-scrollbar-thumb {
    background: var(--border-color);
  }
  .purchase-item {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    padding: 15px;
    border: 2px solid var(--border-color);
    gap: 15px;
  }
  .themed-card {
    border-color: var(--border-warm);
    background: linear-gradient(
      180deg,
      rgba(37, 43, 39, 0.82),
      rgba(67, 57, 46, 0.76)
    );
    box-shadow: 0 0 0 1px rgba(var(--wood-rgb), 0.08) inset;
    position: relative;
  }
  .themed-card::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      rgba(var(--pine-rgb), 0.08),
      transparent 18%,
      transparent 82%,
      rgba(var(--stream-rgb), 0.08)
    );
    opacity: 0.7;
  }
  .building-card {
    min-height: 120px;
  }
  .building-card .info {
    width: 100%;
  }
  .building-description-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
  }
  .building-action-row {
    display: flex;
    justify-content: flex-end;
    flex: 0 0 auto;
  }
  .purchase-item .info strong {
    font-size: 1.2em;
    color: var(--text-cream);
  }
  .purchase-item .info p {
    margin: 5px 0 0 0;
    font-size: 1rem;
    color: #cfd7c5;
  }
  .purchase-item button {
    font-size: 1em;
    padding: 8px 15px;
  }
  .purchase-item button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 4px 4px 0px #000;
  }
  .unlock-badge {
    color: #b7d0a4;
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
      box-shadow: 4px 4px 0px #000;
    }
    50% {
      transform: scale(1.05);
      box-shadow:
        6px 6px 0px #000,
        0 0 10px #a8c58e;
    }
    100% {
      transform: scale(1);
      box-shadow: 4px 4px 0px #000;
    }
  }

  .active-badge {
    color: var(--text-accent);
    font-size: 1rem;
    margin-left: 5px;
  }

  .upgrade-item {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    padding: 8px;
    border: 1px solid var(--border-warm);
    gap: 10px;
  }
  .wing-upgrade {
    border: 2px solid var(--border-warm);
  }
  .upgrade-info {
    text-align: left;
    flex: 1 1 200px;
    max-width: 100%;
  }

  dialog {
    min-width: 300px;
    text-align: center;
    color: var(--text-main);
  }
  dialog::backdrop {
    background: rgba(10, 14, 12, 0.78);
  }

  @media (prefers-reduced-motion: reduce) {
    .capped-warning,
    button.glow {
      animation: none;
    }

    .capacity-fill,
    .stratum-fill,
    .gear-btn,
    button,
    .btn {
      transition: none;
    }
  }

  @media (max-width: 980px) {
    .hero-grid,
    .trade-market-grid,
    .resource-readout-grid,
    .income-rack,
    .action-deck,
    .tab-strip {
      grid-template-columns: 1fr;
    }

    .header-title-row,
    .hoard-heading-row {
      flex-direction: column;
      align-items: stretch;
    }

    .vault-usage {
      text-align: left;
    }
  }
</style>
