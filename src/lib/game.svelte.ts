import { browser } from "$app/environment";
import { game } from "./gameState.svelte.js";
import { saveGame, loadGame } from "./storage.svelte.js";
import type { Minions } from "./types.js";
import { MOUNTAIN_LAYERS } from "./configs/mountain.js";
import { MINIONS } from "./configs/minions.js";
import { BUILDINGS } from "./configs/buildings.js";
import { UPGRADES } from "./configs/upgrades.js";
import { TRADING } from "./configs/trading.js";
import { generateFantasyName } from "./names.js";

// Re-export storage/store items so +page.svelte imports don't heavily break natively
export { exportSave, importSave, hardReset } from "./storage.svelte.js";
export { game } from "./gameState.svelte.js";

import type { PassiveEffect } from "./types.js";

/** Aggregate all active passive effects (generation + lineage) additively. */
function getAllActivePassives(): PassiveEffect[] {
  const passives: PassiveEffect[] = [...game.lineagePassives];
  if (game.activeGenerationPassive) passives.push(game.activeGenerationPassive);
  return passives;
}

export function getPassiveBonus(type: PassiveEffect["type"]): number {
  return getAllActivePassives()
    .filter((p) => p.type === type)
    .reduce((sum, p) => sum + p.magnitude, 0);
}

export function getCurrentCapacityLimit() {
  let limit = 0; // Base baseline capacity
  for (let i = 0; i <= game.mountain.currentLayerIndex; i++) {
    if (MOUNTAIN_LAYERS[i]) limit += MOUNTAIN_LAYERS[i].maxCapacity;
  }
  return limit;
}

function isWholePositiveNumber(amount: number) {
  return Number.isFinite(amount) && Number.isInteger(amount) && amount > 0;
}

export function buyBuilding(id: string) {
  const building = BUILDINGS.find((b) => b.id === id);
  if (!building || game.gold < building.goldCost || game.buildings[id]) return;
  game.gold -= building.goldCost;
  game.buildings[id] = true;
}

export function buyUpgrade(id: string) {
  const upgrade = UPGRADES.find((u) => u.id === id);
  if (
    !upgrade ||
    !game.buildings[upgrade.buildingId] ||
    game.ore < upgrade.oreCost ||
    game.upgrades[id]
  ) {
    return;
  }

  // Sequential gating for layer unlocks: layer N requires currentLayerIndex >= N-1.
  const layerMatch = upgrade.effect.match(/^unlock_layer_(\d+)$/);
  if (layerMatch) {
    const targetLayer = parseInt(layerMatch[1], 10);
    if (game.mountain.currentLayerIndex < targetLayer - 1) return;
    game.ore -= upgrade.oreCost;
    game.upgrades[id] = true;
    if (game.mountain.currentLayerIndex < targetLayer) {
      game.mountain.currentLayerIndex = targetLayer;
    }
    return;
  }

  game.ore -= upgrade.oreCost;
  game.upgrades[id] = true;
}

export function calculatePassiveOre() {
  let ore = 0;
  for (const minion of MINIONS) {
    if (minion.orePerSec) {
      ore += game.minions[minion.id] * minion.orePerSec;
    }
  }
  return ore * (1 + getPassiveBonus("ore_income_pct"));
}

export function calculatePassiveCapacity() {
  let cap = 0;
  for (const minion of MINIONS) {
    if (minion.capacityPerSec) {
      cap += game.minions[minion.id] * minion.capacityPerSec;
    }
  }

  let multiplier = 1;
  for (const upgradeId in game.upgrades) {
    if (game.upgrades[upgradeId]) {
      const config = UPGRADES.find((u) => u.id === upgradeId);
      if (config?.capacityMultiplier) {
        multiplier += config.capacityMultiplier;
      }
    }
  }

  return cap * multiplier;
}

export function calculatePassiveIncome() {
  let income = 0;
  for (const minion of MINIONS) {
    if (minion.goldPerSec) {
      income += game.minions[minion.id] * minion.goldPerSec;
    }
  }
  return income * (1 + getPassiveBonus("gold_income_pct"));
}

export function getOreSellPrice(): number {
  return TRADING.ORE_SELL_PRICE * (1 + game.stats.beauty * TRADING.BEAUTY_TRADE_MULTIPLIER);
}

export function buyOre(amount: number) {
  if (!isWholePositiveNumber(amount)) return;
  const cost = amount * TRADING.ORE_BUY_PRICE;
  if (game.gold >= cost) {
    game.gold -= cost;
    game.ore += amount;
    if (game.gold + game.ore > game.maxCapacity) {
      game.ore = game.maxCapacity - game.gold;
    }
  }
}

export function sellOre(amount: number) {
  if (!isWholePositiveNumber(amount)) return;
  if (game.ore >= amount) {
    const gain = amount * getOreSellPrice();
    game.ore -= amount;
    game.gold += gain;
    if (game.gold + game.ore > game.maxCapacity) {
      game.gold = game.maxCapacity - game.ore;
    }
  }
}

export function getEffectiveClickPower(): number {
  return game.stats.clickPower + getPassiveBonus("click_power_flat");
}

export function clickGold() {
  const total = game.gold + game.ore;
  if (total < game.maxCapacity) {
    game.gold += getEffectiveClickPower();
    if (game.gold + game.ore > game.maxCapacity) {
      game.gold = game.maxCapacity - game.ore;
    }
  }
}

export function clickBurrow() {
  game.maxCapacity += game.stats.clickPower;
  const oreGain = game.stats.clickPower * 0.05;
  const totalResources = game.gold + game.ore;
  if (totalResources < game.maxCapacity) {
    game.ore += oreGain;
    if (game.gold + game.ore > game.maxCapacity) {
      game.ore = game.maxCapacity - game.gold;
    }
  }
}

export function resetHoard() {
  game.gold = 0;
  game.ore = 0;
  game.minions = { pseudodragon: 0, kobold: 0, miner: 0, lizardfolk: 0 };
  game.buildings = {};
  game.upgrades = {};
  game.mountain = {
    name: game.mountain.name,
    coordinates: game.mountain.coordinates,
    currentLayerIndex: 0,
  };
  game.maxCapacity = 0;
}

export function attractMate() {
  if (game.gold < 10000) return false;

  let totalPoints = Math.floor(game.gold / 10000);

  // Armor excluded from suitor stat pool — activates with future map system.
  for (let i = 0; i < totalPoints; i++) {
    const rand = Math.floor(Math.random() * 3);
    if (rand === 0) game.stats.clickPower += 1;
    else if (rand === 1) game.stats.luck += 1;
    else game.stats.beauty += 1;
  }

  resetHoard();
  game.generation += 1;
  game.dragonName = generateFantasyName("dragon");

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
    const rawDelta = (now - lastTick) / 1000;
    const delta = Math.min(rawDelta, 1.0);
    lastTick = now;

    const totalOrePerSec = calculatePassiveOre();
    const totalCapacityPerSec = calculatePassiveCapacity();

    const capacityLimit = getCurrentCapacityLimit();
    if (game.maxCapacity < capacityLimit && totalCapacityPerSec > 0) {
      game.maxCapacity += totalCapacityPerSec * delta;
      if (game.maxCapacity > capacityLimit) {
        game.maxCapacity = capacityLimit;
      }
    }

    const totalResources = game.gold + game.ore;
    if (totalOrePerSec > 0 && totalResources < game.maxCapacity) {
      game.ore += totalOrePerSec * delta;
      if (game.gold + game.ore > game.maxCapacity) {
        game.ore = game.maxCapacity - game.gold;
      }
    }

    const incomePerSec = calculatePassiveIncome();
    const currentTotal = game.gold + game.ore;
    if (incomePerSec > 0 && currentTotal < game.maxCapacity) {
      game.gold += incomePerSec * delta;
      if (game.gold + game.ore > game.maxCapacity) {
        game.gold = game.maxCapacity - game.ore;
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
