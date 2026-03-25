import { browser } from "$app/environment";
import { game } from "./gameState.svelte.js";
import { saveGame, loadGame } from "./storage.svelte.js";
import type { Minions } from "./types.js";
import { MOUNTAIN_LAYERS } from "./config.js";

// Re-export storage/store items so +page.svelte imports don't heavily break natively
export { exportSave, importSave, hardReset } from "./storage.svelte.js";
export { game } from "./gameState.svelte.js";

export function calculatePassiveIncome() {
  let income =
    game.minions.pseudodragon * 0.1 + game.minions.kobold * 1 + game.minions.lizardfolk * 5;

  const luckMultiplier = 1 + game.stats.luck * 0.05;
  const treasureMultiplier = 1 + game.treasuresFound * 0.1; // +10% per treasure found
  return income * luckMultiplier * treasureMultiplier;
}

export function clickGold() {
  if (game.gold < game.maxGoldCapacity) {
    game.gold += game.stats.clickPower;
    if (game.gold > game.maxGoldCapacity) {
      game.gold = game.maxGoldCapacity;
    }
  }
}

export function resetHoard() {
  game.gold = 0;
  game.ore = 0;
  game.minions = { pseudodragon: 0, kobold: 0, miner: 0, lizardfolk: 0 };
}

export function attractMate() {
  if (game.gold < 10000) return false;

  let totalPoints = Math.floor(game.gold / 10000);

  for (let i = 0; i < totalPoints; i++) {
    const rand = Math.floor(Math.random() * 4);
    if (rand === 0) game.stats.clickPower += 1;
    else if (rand === 1) game.stats.luck += 1;
    else if (rand === 2) game.stats.beauty += 1;
    else game.stats.armor += 1;
  }

  resetHoard();
  game.generation += 1;

  saveGame();
  return true;
}

export function trainMinion(type: keyof Minions, cost: number) {
  if (game.gold >= cost) {
    game.gold -= cost;
    if (game.minions[type] === undefined) {
      game.minions[type] = 0;
    }
    game.minions[type] += 1;
    saveGame();
    return true;
  }
  return false;
}

let loopStarted = false;
export function startGameLoop() {
  if (!browser || loopStarted) return;
  loopStarted = true;

  loadGame();

  let lastTick = performance.now();
  let saveTimer = 0;

  function tick(now: number) {
    const delta = (now - lastTick) / 1000;
    lastTick = now;

    if (game.minions.miner > 0) {
      game.ore += game.minions.miner * delta;

      const currentLayer = MOUNTAIN_LAYERS[game.mountain.currentLayerIndex];
      if (game.maxGoldCapacity < currentLayer.maxCapacity) {
        game.maxGoldCapacity += game.minions.miner * 10 * delta;
        if (game.maxGoldCapacity > currentLayer.maxCapacity) {
          game.maxGoldCapacity = currentLayer.maxCapacity;
        }
      }

      const chanceToFind = game.minions.miner * delta * 0.0001 * (1 + game.stats.luck * 0.05);
      if (Math.random() < chanceToFind) {
        game.treasuresFound += 1;
        console.log("A Miner found a rare treasure!");
      }
    }

    const incomePerSec = calculatePassiveIncome();
    if (incomePerSec > 0 && game.gold < game.maxGoldCapacity) {
      game.gold += incomePerSec * delta;
      if (game.gold > game.maxGoldCapacity) {
        game.gold = game.maxGoldCapacity;
      }
    }

    saveTimer += delta;
    if (saveTimer >= 5) {
      saveGame();
      saveTimer = 0;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
