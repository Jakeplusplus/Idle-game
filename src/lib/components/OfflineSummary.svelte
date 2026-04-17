<script lang="ts">
  import { offlineProgressState, dismissOfflineProgress } from "$lib/storage.svelte.js";

  const offlineProgress = $derived(offlineProgressState.data);

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
</script>

{#if offlineProgress}
  <div class="offline-overlay" role="dialog" aria-labelledby="offline-title" aria-modal="true">
    <div class="panel offline-panel">
      <h2 id="offline-title">Welcome Back</h2>
      <p class="offline-sub">Your dragon's hoard grew while you were away.</p>
      <dl class="offline-stats">
        <div class="offline-row">
          <dt>Gold Earned</dt>
          <dd>+{Math.floor(offlineProgress.goldEarned)}</dd>
        </div>
        <div class="offline-row">
          <dt>Ore Earned</dt>
          <dd>+{Math.floor(offlineProgress.oreEarned)}</dd>
        </div>
        <div class="offline-row">
          <dt>Time Away</dt>
          <dd>
            {formatTime(offlineProgress.rawSeconds)}
            {#if offlineProgress.cappedSeconds < offlineProgress.rawSeconds}
              <span class="capped-note">(capped at {formatTime(offlineProgress.cappedSeconds)})</span>
            {/if}
          </dd>
        </div>
      </dl>
      <button class="btn-primary" onclick={dismissOfflineProgress}>Claim Rewards</button>
    </div>
  </div>
{/if}

<style>
  .offline-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 14, 12, 0.82);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .offline-panel {
    max-width: 22rem;
    width: 90%;
    padding: 1.5rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  h2 {
    font-family: var(--font-display);
    font-size: 1.6rem;
    margin: 0;
    color: var(--gold);
  }

  .offline-sub {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-secondary);
  }

  .offline-stats {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .offline-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 1.1rem;
  }

  .offline-row dt {
    color: var(--text-secondary);
  }

  .offline-row dd {
    margin: 0;
    color: var(--text-primary);
    font-weight: bold;
  }

  .capped-note {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-left: 0.25rem;
  }

  .btn-primary {
    align-self: center;
  }
</style>
