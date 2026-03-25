<script lang="ts">
  import { onMount } from "svelte";
  import {
    game,
    clickGold,
    trainMinion,
    attractMate,
    startGameLoop,
    calculatePassiveIncome,
    exportSave,
    importSave,
    hardReset,
  } from "$lib/game.svelte.js";
  import { MOUNTAIN_LAYERS } from "$lib/config.js";

  onMount(() => {
    startGameLoop();
  });

  let showOptions = $state(false);

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
    const container = document.querySelector(".options-container");
    if (container && !container.contains(target)) {
      showOptions = false;
    }
  }

  const baseCosts: Record<string, number> = {
    pseudodragon: 10,
    kobold: 100,
    miner: 50,
    lizardfolk: 1000,
  };

  const minionList: Array<{ id: keyof typeof game.minions; name: string; description: string }> = [
    { id: "pseudodragon", name: "Pseudodragon", description: "+0.1 gold/sec" },
    { id: "miner", name: "Kobold Miner", description: "Gathers Ore & finds Treasures" },
    { id: "kobold", name: "Kobold", description: "+1 gold/sec" },
    { id: "lizardfolk", name: "Lizardfolk", description: "+5 gold/sec" }
  ];

  function getCost(type: keyof typeof game.minions) {
    const amount = game.minions[type] || 0;
    return Math.floor(baseCosts[type] * Math.pow(1.15, amount));
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="container">
  <!-- Options Menu -->
  <div class="options-container">
    <button
      class="gear-btn"
      aria-label="Options Menu"
      onclick={() => (showOptions = !showOptions)}
    >
      <svg
        viewBox="0 0 16 16"
        width="32"
        height="32"
        fill="currentColor"
        style="image-rendering: pixelated; shape-rendering: crispEdges;"
      >
        <path
          d="M6 0h4v2h4v4h2v4h-2v4h-4v2H6v-2H2v-4H0V6h2V2h4V0zM6 6h4v4H6z"
          fill-rule="evenodd"
        />
      </svg>
    </button>

    {#if showOptions}
      <div class="options-dropdown panel">
        <h3>Options</h3>
        <button onclick={exportSave}>Export Save</button>
        <button onclick={() => document.getElementById("save-upload")?.click()}>
          Import Save
        </button>
        <input
          id="save-upload"
          type="file"
          accept=".json"
          onchange={handleImport}
          style="display: none;"
        />
        <button class="danger-btn" onclick={confirmReset}>Hard Reset</button>
      </div>
    {/if}
  </div>

  <div class="panel header">
    <h1>Generation {game.generation} Dragon</h1>
    <div class="mountain-info">
      Mountain Stratum: {MOUNTAIN_LAYERS[game.mountain.currentLayerIndex].name} 
      (Lat: {game.mountain.coordinates.x}, Lng: {game.mountain.coordinates.y})
    </div>
    <div class="stats">
      <span>Power: {game.stats.clickPower}</span>
      <span>Luck: {game.stats.luck}</span>
      <span>Beauty: {game.stats.beauty}</span>
      <span>Armor: {game.stats.armor}</span>
    </div>
  </div>

  <div class="hoard-container">
    <div class="gold-display panel">
      <h2 class:capped={game.gold >= game.maxGoldCapacity}>Hoard: {Math.floor(game.gold)} / {Math.floor(game.maxGoldCapacity)} Gold</h2>
      <div class="capacity-bar" aria-label="Gold Capacity">
        <div class="capacity-fill" style="width: {Math.min(100, (game.gold / game.maxGoldCapacity) * 100)}%" class:capped-fill={game.gold >= game.maxGoldCapacity}></div>
      </div>
      {#if game.gold >= game.maxGoldCapacity}
        <p class="capped-warning">HOARD FULL! Miners must dig deeper!</p>
      {/if}
      {#if game.ore > 0 || game.minions.miner > 0}
        <h3 class="ore-display">Ore: {Math.floor(game.ore)}</h3>
      {/if}
      <p class="passive-income">
        {calculatePassiveIncome().toFixed(1)} gold/sec
      </p>
      {#if game.treasuresFound > 0}
        <p class="treasure-multiplier">
          Treasures Found: {game.treasuresFound} (+{game.treasuresFound * 10}%
          bonus)
        </p>
      {/if}

      <!-- Dragon Clicker -->
      <button class="dragon-btn" onclick={clickGold}>
        Roar & Hoard ( +{game.stats.clickPower} )
      </button>
    </div>

    <div class="treasures-panel panel">
      <h3>Train Minions</h3>
      <div class="treasure-list">
        {#each minionList as minion (minion.id)}
          <div class="treasure-item">
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
  </div>

  <!-- Prestige mechanics -->
  <div class="panel prestige-panel">
    <h3>Mating & Genetics</h3>
    <p>
      Accumulate at least 10,000 gold to attract a mate and lay a hatchling!
    </p>
    <p style="font-size:0.8em; color: var(--text-accent);">
      The more gold you hoard, the stronger the stats your hatchling inherits.
    </p>
    <button
      onclick={attractMate}
      disabled={game.gold < 10000}
      class={game.gold >= 10000 ? "glow" : ""}
    >
      Attract Mate (Prestige)
    </button>
  </div>
</div>

<style>
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .header {
    text-align: center;
  }
  .stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 15px;
    font-size: 0.9em;
    color: var(--text-main);
  }
  .stats span {
    background: rgba(255, 255, 255, 0.1);
    padding: 5px 10px;
    border: 2px solid var(--border-color);
  }
  .hoard-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .gold-display {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .gold-display h2 {
    font-size: 2em;
    margin-bottom: 5px;
  }
  h2.capped {
    color: #e74c3c;
  }
  .capacity-bar {
    width: 80%;
    height: 15px;
    background-color: #000;
    border: 2px solid var(--border-color);
    margin: 5px 0 15px 0;
  }
  .capacity-fill {
    height: 100%;
    background-color: var(--text-accent);
    transition: width 0.1s linear;
  }
  .capacity-fill.capped-fill {
    background-color: #e74c3c;
  }
  .capped-warning {
    color: #e74c3c;
    font-size: 1.2em;
    font-weight: bold;
    margin-top: -5px;
    margin-bottom: 10px;
    animation: flash 1s infinite alternate;
  }
  @keyframes flash {
    from { opacity: 1; text-shadow: 0 0 10px #e74c3c; }
    to { opacity: 0.5; text-shadow: none; }
  }
  .mountain-info {
    color: #a0a0a0;
    margin-top: 10px;
    font-size: 1.2em;
  }
  .ore-display {
    font-size: 1.5em;
    color: #a0a0a0;
    margin-bottom: 5px;
  }
  .passive-income {
    color: var(--text-accent);
    margin-bottom: 15px;
    font-size: 1.2em;
  }
  .treasure-multiplier {
    color: #ff9900;
    font-size: 0.9em;
    margin-bottom: 15px;
  }
  .options-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }
  .gear-btn {
    font-size: 2em;
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
    cursor: pointer;
    color: var(--text-main);
    transition:
      transform 0.2s,
      color 0.2s;
  }
  .gear-btn:hover,
  .gear-btn:focus-within {
    transform: rotate(45deg);
    background: none;
    color: var(--text-accent);
    box-shadow: none;
    outline: none;
  }
  .gear-btn:active {
    transform: rotate(45deg) scale(0.9);
    box-shadow: none;
  }
  .options-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 10px;
    width: 250px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #1a1a1a;
    border: 2px solid #4a4a4a;
    padding: 15px;
    box-shadow: 4px 4px 0px #000;
    z-index: 1001;
  }
  .danger-btn {
    background-color: #c0392b;
  }
  .dragon-btn {
    padding: 25px 40px;
    font-size: 1.5em;
    background-color: #8b0000;
    color: var(--text-accent);
    border-color: #5a0000;
    text-shadow: 2px 2px 0px #000;
  }
  .dragon-btn:hover {
    background-color: #a00000;
  }
  .treasures-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .treasure-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 10px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 10px;
  }
  /* Custom scrollbar for pixel art feel */
  .treasure-list::-webkit-scrollbar {
    width: 12px;
  }
  .treasure-list::-webkit-scrollbar-track {
    background: var(--bg-color);
    border: 2px solid var(--border-color);
  }
  .treasure-list::-webkit-scrollbar-thumb {
    background: var(--border-color);
  }
  .treasure-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    padding: 15px;
    border: 2px solid var(--border-color);
  }
  .treasure-item .info strong {
    font-size: 1.2em;
  }
  .treasure-item .info p {
    margin: 5px 0 0 0;
    font-size: 0.9em;
    color: var(--text-accent);
  }
  .treasure-item button {
    font-size: 1em;
    padding: 8px 15px;
  }
  .treasure-item button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 4px 4px 0px #000;
  }
  .prestige-panel {
    text-align: center;
  }
  .prestige-panel p {
    margin-bottom: 15px;
  }
  button.glow {
    background-color: #f1c40f;
    color: #1a1a1a;
    border-color: #c29d0b;
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
        0 0 10px #f1c40f;
    }
    100% {
      transform: scale(1);
      box-shadow: 4px 4px 0px #000;
    }
  }
</style>
