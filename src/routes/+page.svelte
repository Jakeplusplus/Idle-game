<script lang="ts">
  import { onMount } from "svelte";
  import { startGameLoop } from "$lib/game.svelte.js";

  import AppHeader from "$lib/components/AppHeader.svelte";
  import OfflineSummary from "$lib/components/OfflineSummary.svelte";
  import DragonCard from "$lib/components/DragonCard.svelte";
  import HoardDisplay from "$lib/components/HoardDisplay.svelte";
  import BroodTab from "$lib/components/tabs/BroodTab.svelte";
  import DepthsTab from "$lib/components/tabs/DepthsTab.svelte";
  import BuildingsTab from "$lib/components/tabs/BuildingsTab.svelte";
  import TradeTab from "$lib/components/tabs/TradeTab.svelte";
  import EventsTab from "$lib/components/tabs/EventsTab.svelte";

  type TabId = "brood" | "depths" | "buildings" | "trade" | "events";

  onMount(() => {
    startGameLoop();
  });

  let activeTab = $state<TabId>("brood");

  const lairTabs: TabId[] = ["brood", "depths", "buildings", "trade", "events"];

  function getTabLabel(tabId: TabId) {
    if (tabId === "brood") return "Brood";
    if (tabId === "depths") return "Depths";
    if (tabId === "buildings") return "Buildings";
    if (tabId === "trade") return "Trade";
    return "Events";
  }

  function isTabUnlocked(_tabId: TabId) {
    return true;
  }
</script>

<OfflineSummary />
<AppHeader />

<div class="app-body">
  <div class="glow glow-left" aria-hidden="true"></div>
  <div class="glow glow-right" aria-hidden="true"></div>

  <aside class="left-rail">
    <DragonCard />
    <HoardDisplay />
  </aside>

  <div class="right-panel">
    <div class="tab-bar" role="tablist" aria-label="Lair wings">
      {#each lairTabs as tabId}
        <button
          role="tab"
          class="tab-btn"
          class:active-tab={activeTab === tabId}
          class:locked-tab={!isTabUnlocked(tabId)}
          aria-selected={activeTab === tabId}
          disabled={!isTabUnlocked(tabId)}
          onclick={() => (activeTab = tabId)}
        >
          <span>{getTabLabel(tabId)}</span>
        </button>
      {/each}
    </div>

    <div class="panel forest-panel tab-content-panel">
      <div class="panel-kicker">Mountain Wings</div>
      <div class="panel-brackets" aria-hidden="true"></div>

      {#if activeTab === "brood"}
        <BroodTab />
      {/if}

      {#if activeTab === "depths"}
        <DepthsTab />
      {/if}

      {#if activeTab === "buildings"}
        <BuildingsTab />
      {/if}

      {#if activeTab === "trade"}
        <TradeTab />
      {/if}

      {#if activeTab === "events"}
        <EventsTab />
      {/if}
    </div>
  </div>
</div>

<style>
  /* ── Page body grid ─────────────────────────────────────────────────── */
  .app-body {
    position: relative;
    overflow-x: clip;
    max-width: 91.25rem;
    margin: 0 auto;
    padding: 1.5rem 1.25rem 2.5rem;
    display: grid;
    grid-template-columns: 22rem minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }
  .glow {
    position: fixed;
    pointer-events: none;
    z-index: -1;
    width: 26.25rem;
    height: 26.25rem;
    border-radius: 50%;
    filter: blur(2.5rem);
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
    top: 5rem;
    left: -7.5rem;
  }
  .glow-right {
    top: 21.25rem;
    right: -10rem;
  }

  /* ── Left rail ──────────────────────────────────────────────────────── */
  .left-rail {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* ── Right panel with tabs ──────────────────────────────────────────── */
  .right-panel {
    display: flex;
    flex-direction: column;
  }
  .tab-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    padding-left: 0.25rem;
    position: relative;
    z-index: 1;
  }
  .tab-btn {
    position: relative;
    padding: 0.5rem 1rem;
    margin-right: 3px;
    margin-bottom: -2px;
    min-height: auto;
    font-family: var(--font-display);
    font-size: 1rem;
    line-height: 1.4;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    background: linear-gradient(
      180deg,
      rgba(44, 38, 30, 0.97),
      rgba(28, 32, 29, 0.97)
    );
    border: 2px solid var(--border-warm);
    border-bottom-color: transparent;
    box-shadow: none;
    cursor: pointer;
    transition: background 0.12s;
  }
  .tab-btn span {
    font-family: var(--font-display);
    font-size: 1rem;
  }
  .tab-btn:hover:not(:disabled) {
    background: linear-gradient(
      180deg,
      rgba(62, 54, 42, 0.98),
      rgba(38, 44, 39, 0.98)
    );
  }
  .tab-btn.active-tab {
    background: linear-gradient(
      180deg,
      rgba(55, 62, 56, 0.97),
      rgba(38, 44, 39, 0.97)
    );
    border-color: #c0b184;
    border-bottom-color: rgba(38, 44, 39, 0.97);
    z-index: 2;
    color: #e8dfc0;
  }
  .tab-btn.locked-tab {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .tab-content-panel {
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
    padding: 1.5rem;
    position: relative;
    z-index: 0;
    border-top: 2px solid var(--border-color);
  }
  :global(.tab-panel) {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  /* ── Responsive ─────────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }
  }

  @media (max-width: 68rem) {
    .app-body {
      grid-template-columns: 1fr;
    }
    .tab-bar {
      flex-wrap: wrap;
    }
  }
</style>
