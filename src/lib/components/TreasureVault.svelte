<script lang="ts">
  import { game, slotTreasure, unslotTreasure } from "$lib/game.svelte.js";
  import { VAULT_SLOTS } from "$lib/configs/treasures.js";
  import type { TreasureRarity } from "$lib/types.js";

  const rarityClass: Record<TreasureRarity, string> = {
    Common: "rarity-common",
    Uncommon: "rarity-uncommon",
    Rare: "rarity-rare",
    Legendary: "rarity-legendary",
  };

  const slottedTreasures = $derived(game.treasureInventory.filter((t) => t.slotted));
  const unslottedTreasures = $derived(game.treasureInventory.filter((t) => !t.slotted));
  const emptySlots = $derived(VAULT_SLOTS - slottedTreasures.length);
  const slotsAvailable = $derived(emptySlots > 0);
</script>

<div class="panel vault-panel">
  <h3>Treasure Vault</h3>
  <p class="slot-count body-text">
    Slots: {slottedTreasures.length} / {VAULT_SLOTS} occupied
  </p>

  <div class="slot-section">
    <h4 class="section-label">Active Slots</h4>
    <div class="slot-grid">
      {#each slottedTreasures as treasure (treasure.id)}
        <div class="vault-slot occupied {rarityClass[treasure.rarity]}">
          <span class="treasure-name">{treasure.name}</span>
          <span class="treasure-rarity">{treasure.rarity}</span>
          <span class="treasure-effect body-text">{treasure.flavorText}</span>
          <button class="btn-secondary unslot-btn" onclick={() => unslotTreasure(treasure.id)}>
            Unslot
          </button>
        </div>
      {/each}

      {#each { length: emptySlots } as _, i (i)}
        <div class="vault-slot empty">
          <span class="empty-label">— Empty Slot —</span>
        </div>
      {/each}
    </div>
  </div>

  {#if unslottedTreasures.length > 0}
    <div class="inventory-section">
      <h4 class="section-label">Inventory</h4>
      <div class="slot-grid">
        {#each unslottedTreasures as treasure (treasure.id)}
          <div class="vault-slot inventory {rarityClass[treasure.rarity]}">
            <span class="treasure-name">{treasure.name}</span>
            <span class="treasure-rarity">{treasure.rarity}</span>
            <span class="treasure-effect body-text">{treasure.flavorText}</span>
            <button
              class="btn-primary slot-btn"
              onclick={() => slotTreasure(treasure.id)}
              disabled={!slotsAvailable}
            >
              Slot
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .vault-panel {
    margin-top: 0.75rem;
  }

  .body-text {
    font-family: var(--font-pixel, "VT323", monospace);
    font-size: 1.2rem;
    line-height: 1.2;
    color: var(--text-secondary, #9ba88a);
    margin: 0.25rem 0;
  }

  .slot-count {
    margin-bottom: 0.75rem;
  }

  .section-label {
    color: var(--text-muted, #7a8a74);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0.5rem 0 0.35rem;
  }

  .slot-section,
  .inventory-section {
    margin-bottom: 0.75rem;
  }

  .slot-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .vault-slot {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.5rem 0.75rem;
    border: 2px solid;
  }

  .vault-slot.empty {
    border-color: var(--border-color, #6a5d49);
    background: rgba(0, 0, 0, 0.15);
  }

  .empty-label {
    color: var(--text-muted, #7a8a74);
    font-size: 1rem;
    text-align: center;
  }

  .vault-slot.occupied,
  .vault-slot.inventory {
    background: rgba(0, 0, 0, 0.25);
  }

  .vault-slot.rarity-common {
    border-color: var(--text-secondary, #9ba88a);
  }
  .vault-slot.rarity-uncommon {
    border-color: var(--forest, #4a7c59);
  }
  .vault-slot.rarity-rare {
    border-color: var(--stream, #5a9ebc);
  }
  .vault-slot.rarity-legendary {
    border-color: var(--gold, #f5c842);
  }

  .treasure-name {
    color: var(--text-primary, #e8dfc0);
    font-size: 1.1rem;
  }

  .treasure-rarity {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .rarity-common .treasure-rarity {
    color: var(--text-secondary, #9ba88a);
  }
  .rarity-uncommon .treasure-rarity {
    color: var(--forest, #4a7c59);
  }
  .rarity-rare .treasure-rarity {
    color: var(--stream, #5a9ebc);
  }
  .rarity-legendary .treasure-rarity {
    color: var(--gold, #f5c842);
  }

  .treasure-effect {
    margin-top: 0.1rem;
  }

  .slot-btn,
  .unslot-btn {
    align-self: flex-start;
    margin-top: 0.35rem;
    font-size: 1rem;
    padding: 0.3rem 0.75rem;
  }

  .slot-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
</style>
