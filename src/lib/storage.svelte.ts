import { browser } from "$app/environment";
import { game } from "./gameState.svelte.js";
import { calculatePassiveIncome, resetHoard } from "./game.svelte.js";
import { MOUNTAIN_LAYERS } from "./config.js";

const SAVE_KEY = "dragon_hoard_save";

export function saveGame() {
  if (!browser) return;
  game.lastSaveTime = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

export function loadGame() {
  if (!browser) return;
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      game.gold = data.gold ?? 0;
      game.maxGoldCapacity = data.maxGoldCapacity ?? 500;
      game.generation = data.generation ?? 1;

      if (data.stats) {
        Object.assign(game.stats, data.stats);
      }
      if (data.minions) {
        Object.assign(game.minions, data.minions);
      }
      if (data.mountain) {
        game.mountain.coordinates = data.mountain.coordinates ?? { x: 0, y: 0 };
        game.mountain.currentLayerIndex = data.mountain.currentLayerIndex ?? 0;
      }
      game.ore = data.ore ?? 0;
      game.treasuresFound = data.treasuresFound ?? 0;

      game.lastSaveTime = data.lastSaveTime ?? Date.now();

      // Offline Progress Calculation
      const timeDiffSeconds = (Date.now() - game.lastSaveTime) / 1000;
      if (timeDiffSeconds > 60) {
        const earnedGold = calculatePassiveIncome() * timeDiffSeconds;
        const earnedOre = game.minions.miner * timeDiffSeconds;

        if (earnedGold > 0 || earnedOre > 0) {
          // Offline capacity mining
          const currentLayer = MOUNTAIN_LAYERS[game.mountain.currentLayerIndex];
          if (game.maxGoldCapacity < currentLayer.maxCapacity) {
            game.maxGoldCapacity += earnedOre * 10;
            if (game.maxGoldCapacity > currentLayer.maxCapacity) {
              game.maxGoldCapacity = currentLayer.maxCapacity;
            }
          }

          game.gold += earnedGold;
          if (game.gold > game.maxGoldCapacity) {
            game.gold = game.maxGoldCapacity;
          }
          game.ore += earnedOre;

          const expectedTreasures = earnedOre * 0.0001 * (1 + game.stats.luck * 0.05);
          const finds =
            Math.floor(expectedTreasures) + (Math.random() < expectedTreasures % 1 ? 1 : 0);
          game.treasuresFound += finds;

          console.log(
            `Welcome back! You earned ${Math.floor(earnedGold)} gold and ${Math.floor(earnedOre)} ore while away.`,
          );
        }
      }
    } catch (e) {
      console.error("Failed to load save file", e);
    }
  }
}

export function exportSave() {
  if (!browser) return;
  const data = JSON.stringify(game);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dragon_hoard_save_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSave(jsonData: string) {
  if (!browser) return false;
  try {
    const data = JSON.parse(jsonData);
    game.gold = data.gold ?? 0;
    game.maxGoldCapacity = data.maxGoldCapacity ?? 500;
    game.ore = data.ore ?? 0;
    game.generation = data.generation ?? 1;
    if (data.stats) Object.assign(game.stats, data.stats);
    if (data.minions) Object.assign(game.minions, data.minions);
    if (data.mountain) {
      game.mountain.coordinates = data.mountain.coordinates ?? { x: 0, y: 0 };
      game.mountain.currentLayerIndex = data.mountain.currentLayerIndex ?? 0;
    }
    game.treasuresFound = data.treasuresFound ?? 0;
    game.lastSaveTime = data.lastSaveTime ?? Date.now();
    saveGame();
    return true;
  } catch (e) {
    console.error("Failed to parse save file", e);
    return false;
  }
}

export function hardReset() {
  if (!browser) return;
  localStorage.removeItem(SAVE_KEY);
  resetHoard();
  game.maxGoldCapacity = MOUNTAIN_LAYERS[0].maxCapacity;
  game.generation = 1;
  game.stats = { clickPower: 1, luck: 1, beauty: 1, armor: 1 };
  game.mountain = {
    coordinates: { x: 0, y: 0 },
    currentLayerIndex: 0,
  };
  game.treasuresFound = 0;
  game.lastSaveTime = Date.now();
  saveGame();
}
