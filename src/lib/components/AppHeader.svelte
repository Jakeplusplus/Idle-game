<script lang="ts">
  import { tick } from "svelte";
  import { exportSave, importSave, hardReset } from "$lib/game.svelte.js";

  let showOptions = $state(false);
  let gearButton: HTMLButtonElement | undefined = $state();
  let optionsContainer: HTMLDivElement | undefined = $state();
  let importSaveButton: HTMLButtonElement | undefined = $state();
  let importInput: HTMLInputElement | undefined = $state();

  const optionsMenuId = "options-menu";

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
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleGlobalKeydown} />

<header class="app-header">
  <span class="app-title">Hoard</span>
  <div class="header-options" bind:this={optionsContainer}>
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
        width="24"
        height="24"
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
        <button type="button" role="menuitem" onclick={exportSave}>
          Export Save
        </button>
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
</header>

<style>
  .app-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 1.25rem;
    background: linear-gradient(
      180deg,
      rgba(24, 28, 25, 0.99),
      rgba(18, 22, 19, 0.99)
    );
    border-bottom: 2px solid var(--border-color);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.6);
  }
  .app-title {
    font-family: var(--font-display);
    font-size: clamp(1.3rem, 3vw, 1.75rem);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-warm);
    line-height: 1;
  }
  .header-options {
    position: relative;
    isolation: isolate;
  }
  .gear-btn {
    background: linear-gradient(
      180deg,
      rgba(93, 76, 57, 0.96),
      rgba(42, 47, 41, 0.96)
    );
    border: 2px solid var(--border-warm);
    box-shadow: 0.25rem 0.25rem 0px var(--shadow-color);
    padding: 0.375rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      transform 0.15s,
      background 0.15s;
  }
  .gear-btn:hover,
  .gear-btn:focus-visible {
    background: linear-gradient(
      180deg,
      rgba(112, 94, 71, 0.98),
      rgba(64, 82, 72, 0.98)
    );
  }
  .gear-btn:active {
    box-shadow: none;
    transform: translate(0.25rem, 0.25rem);
  }
  .options-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: min(17.5rem, calc(100vw - 2rem));
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    background: linear-gradient(
      180deg,
      rgba(46, 53, 48, 0.99),
      rgba(28, 33, 29, 0.99)
    );
    border: 2px solid var(--border-color);
    padding: 0.9375rem;
    box-shadow:
      0 0 0 1px rgba(var(--wood-rgb), 0.18) inset,
      0.25rem 0.25rem 0px #000;
    z-index: 10;
  }
  .options-title {
    font-family: var(--font-display);
    font-size: 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .gear-btn {
      transition: none;
    }
  }
</style>
