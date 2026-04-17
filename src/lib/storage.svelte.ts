import { browser } from "$app/environment";
import {
  createDefaultGameState,
  game,
  replaceGameState,
  SAVE_VERSION,
} from "./gameState.svelte.js";
import {
  calculatePassiveIncome,
  calculatePassiveOre,
  calculatePassiveCapacity,
  getCurrentCapacityLimit,
  resetHoard,
} from "./game.svelte.js";
import type { GameState } from "./types.js";

const SAVE_KEY = "dragon_hoard_save";

export type SavedGameData = Partial<GameState> & {
  maxGoldCapacity?: number;
};

function sanitizeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function sanitizeBooleanRecord(value: unknown) {
  if (!value || typeof value !== "object") return {};

  const entries = Object.entries(value).filter((entry): entry is [string, boolean] => {
    const [, recordValue] = entry;
    return typeof recordValue === "boolean";
  });

  return Object.fromEntries(entries);
}

export function hydrateGameState(data: SavedGameData) {
  const nextState = createDefaultGameState();
  const maxCapacity = data.maxCapacity ?? data.maxGoldCapacity;

  // Normalize version: missing or mismatched version fills all new fields from defaults.
  nextState.saveVersion = SAVE_VERSION;

  nextState.gold = sanitizeNumber(data.gold, nextState.gold);
  nextState.maxCapacity = sanitizeNumber(maxCapacity, nextState.maxCapacity);
  nextState.ore = sanitizeNumber(data.ore, nextState.ore);
  nextState.generation = Math.max(
    1,
    Math.floor(sanitizeNumber(data.generation, nextState.generation)),
  );
  nextState.dragonName =
    typeof data.dragonName === "string" && data.dragonName.trim().length > 0
      ? data.dragonName.trim()
      : nextState.dragonName;

  if (data.stats && typeof data.stats === "object") {
    nextState.stats = {
      clickPower: sanitizeNumber(data.stats.clickPower, nextState.stats.clickPower),
      luck: sanitizeNumber(data.stats.luck, nextState.stats.luck),
      beauty: sanitizeNumber(data.stats.beauty, nextState.stats.beauty),
      armor: sanitizeNumber(data.stats.armor, nextState.stats.armor),
    };
  }

  if (data.minions && typeof data.minions === "object") {
    nextState.minions = {
      pseudodragon: Math.max(
        0,
        Math.floor(sanitizeNumber(data.minions.pseudodragon, nextState.minions.pseudodragon)),
      ),
      kobold: Math.max(
        0,
        Math.floor(sanitizeNumber(data.minions.kobold, nextState.minions.kobold)),
      ),
      miner: Math.max(0, Math.floor(sanitizeNumber(data.minions.miner, nextState.minions.miner))),
      lizardfolk: Math.max(
        0,
        Math.floor(sanitizeNumber(data.minions.lizardfolk, nextState.minions.lizardfolk)),
      ),
    };
  }

  if (data.mountain && typeof data.mountain === "object") {
    const coordinates = data.mountain.coordinates;
    nextState.mountain = {
      name:
        typeof data.mountain.name === "string" && data.mountain.name.trim().length > 0
          ? data.mountain.name.trim()
          : nextState.mountain.name,
      coordinates: {
        x: sanitizeNumber(coordinates?.x, nextState.mountain.coordinates.x),
        y: sanitizeNumber(coordinates?.y, nextState.mountain.coordinates.y),
      },
      currentLayerIndex: Math.max(
        0,
        Math.floor(
          sanitizeNumber(data.mountain.currentLayerIndex, nextState.mountain.currentLayerIndex),
        ),
      ),
    };
  }

  nextState.buildings = sanitizeBooleanRecord(data.buildings);
  nextState.upgrades = sanitizeBooleanRecord(data.upgrades);
  nextState.lastSaveTime = sanitizeNumber(data.lastSaveTime, nextState.lastSaveTime);

  return nextState;
}

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
      const data = hydrateGameState(JSON.parse(saved));
      replaceGameState(data);

      // Offline Progress Calculation
      const timeDiffSeconds = (Date.now() - game.lastSaveTime) / 1000;
      if (timeDiffSeconds > 60) {
        const earnedGold = calculatePassiveIncome() * timeDiffSeconds;
        const earnedOre = calculatePassiveOre() * timeDiffSeconds;
        const earnedCapacity = calculatePassiveCapacity() * timeDiffSeconds;

        if (earnedGold > 0 || earnedOre > 0) {
          // Offline capacity mining
          const capacityLimit = getCurrentCapacityLimit();
          if (game.maxCapacity < capacityLimit) {
            game.maxCapacity += earnedCapacity;
            if (game.maxCapacity > capacityLimit) {
              game.maxCapacity = capacityLimit;
            }
          }

          game.gold += earnedGold;
          game.ore += earnedOre;

          if (game.gold + game.ore > game.maxCapacity) {
            // Give preference to Ore, then Gold if capped
            if (game.ore > game.maxCapacity) {
              game.ore = game.maxCapacity;
              game.gold = 0;
            } else {
              game.gold = game.maxCapacity - game.ore;
            }
          }

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
    const data = hydrateGameState(JSON.parse(jsonData));
    replaceGameState(data);
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
  replaceGameState(createDefaultGameState());
  saveGame();
}
