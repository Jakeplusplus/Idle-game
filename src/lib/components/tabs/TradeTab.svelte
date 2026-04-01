<script lang="ts">
  import { tick } from "svelte";
  import { game, buyOre, sellOre } from "$lib/game.svelte.js";
  import { TRADING } from "$lib/configs/trading.js";

  let tradeDialog: HTMLDialogElement | undefined = $state();
  let tradeMode = $state<"buy" | "sell">("buy");
  let tradeAmount = $state(1);
  let tradeAmountInput: HTMLInputElement | undefined = $state();
  let lastTradeTrigger: HTMLButtonElement | undefined;

  function getMaxOreBuyAmount() {
    return Math.max(0, Math.floor(game.gold / TRADING.ORE_BUY_PRICE));
  }

  function getMaxOreSellAmount() {
    return Math.max(0, Math.floor(game.ore));
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

<div class="tab-panel">
  <h3>Market Trading</h3>
  <p class="section-lead">
    Mountain caravans trade gold and ore along winding passes and cold river
    crossings.
  </p>
  <div class="trade-market-grid">
    <div class="trade-col">
      <h4 class="trade-col-label">Buy Ore</h4>
      <div class="trade-price-tag">
        1 ore costs {TRADING.ORE_BUY_PRICE} gold
      </div>
      <button onclick={() => buyOre(1)} disabled={game.gold < TRADING.ORE_BUY_PRICE}>
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

<dialog bind:this={tradeDialog} class="panel" aria-labelledby="trade-dialog-title">
  <h3 id="trade-dialog-title">
    {tradeMode === "buy" ? "Buy Ore" : "Sell Ore"}
  </h3>
  <p style="margin-bottom: 0.3125rem;">
    {tradeMode === "buy"
      ? `(Cost: ${TRADING.ORE_BUY_PRICE} Gold per Ore)`
      : `(Gain: ${TRADING.ORE_SELL_PRICE} Gold per Ore)`}
  </p>
  <div
    style="display: flex; gap: 0.625rem; align-items: center; justify-content: center; margin-bottom: 1.25rem;"
  >
    <label for="trade-amt">Amount:</label>
    <input
      bind:this={tradeAmountInput}
      id="trade-amt"
      type="number"
      bind:value={tradeAmount}
      min="1"
      step="1"
      style="font-size: 1.2em; padding: 0.3125rem; width: 6.25rem; text-align: center; background: rgba(28, 33, 29, 0.96); color: var(--text-main); border: 2px solid var(--border-color);"
    />
  </div>
  <div style="display: flex; gap: 0.625rem; justify-content: center;">
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
  .trade-market-grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.875rem;
    margin-top: 0.875rem;
  }
  .trade-col {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 0.875rem;
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
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: var(--font-display);
    font-size: 1rem;
  }
  .trade-price-tag {
    color: #cfe0df;
    font-size: 1rem;
  }
  dialog {
    min-width: 18.75rem;
    text-align: center;
    color: var(--text-main);
  }
  dialog::backdrop {
    background: rgba(10, 14, 12, 0.78);
  }

  @media (max-width: 68rem) {
    .trade-market-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
