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
} from "./game.svelte.js";
import { clampPassiveIncome } from "./income.js";
import type { GameState } from "./types.js";

const SAVE_KEY = "dragon_hoard_save";
export const OFFLINE_CAP_SECONDS = 8 * 3600;

export type SavedGameData = Partial<GameState> & {
  maxGoldCapacity?: number;
};

export type OfflineProgressResult = {
  rawSeconds: number;
  cappedSeconds: number;
  goldEarned: number;
  oreEarned: number;
};

// Svelte 5: exported $state must only have properties mutated, not reassigned.
export const offlineProgressState = $state<{ data: OfflineProgressResult | null }>({ data: null });

export function dismissOfflineProgress() {
  offlineProgressState.data = null;
}

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

  // Passives: restore from save or keep defaults (null / [])
  if (data.activeGenerationPassive && typeof data.activeGenerationPassive === "object") {
    nextState.activeGenerationPassive =
      data.activeGenerationPassive as typeof nextState.activeGenerationPassive;
  }
  if (Array.isArray(data.lineagePassives)) {
    nextState.lineagePassives = data.lineagePassives as typeof nextState.lineagePassives;
  }
  // Pending suitor persists across saves
  if (data.pendingSuitor && typeof data.pendingSuitor === "object") {
    nextState.pendingSuitor = data.pendingSuitor as typeof nextState.pendingSuitor;
  }
  // Treasure inventory persists (cleared only by resetHoard/prestige)
  if (Array.isArray(data.treasureInventory)) {
    nextState.treasureInventory = data.treasureInventory as typeof nextState.treasureInventory;
  }
  // T-025: if vault not owned, clear slotted state so effects don't apply
  if (!nextState.buildings.treasure_vault) {
    nextState.treasureInventory = nextState.treasureInventory.map((t) => ({
      ...t,
      slotted: false,
    }));
  }

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
      const rawSeconds = (Date.now() - game.lastSaveTime) / 1000;
      const cappedSeconds = Math.min(rawSeconds, OFFLINE_CAP_SECONDS);
      if (cappedSeconds > 60) {
        const earnedGold = calculatePassiveIncome() * cappedSeconds;
        const earnedOre = calculatePassiveOre() * cappedSeconds;
        const earnedCapacity = calculatePassiveCapacity() * cappedSeconds;

        // T-026: apply income (even if zero) and always show summary when cappedSeconds > 60
        const capacityLimit = getCurrentCapacityLimit();
        if (game.maxCapacity < capacityLimit && earnedCapacity > 0) {
          game.maxCapacity += earnedCapacity;
          if (game.maxCapacity > capacityLimit) {
            game.maxCapacity = capacityLimit;
          }
        }

        const applied = clampPassiveIncome(
          earnedGold,
          earnedOre,
          game.gold,
          game.ore,
          game.maxCapacity,
        );
        game.gold += applied.gold;
        game.ore += applied.ore;

        offlineProgressState.data = {
          rawSeconds,
          cappedSeconds,
          goldEarned: applied.gold,
          oreEarned: applied.ore,
        };
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
  replaceGameState(createDefaultGameState());
  saveGame();
}
