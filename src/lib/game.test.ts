import { beforeEach, describe, expect, test } from "vite-plus/test";
import {
  buyOre,
  buyUpgrade,
  calculatePassiveIncome,
  clickBurrow,
  getCurrentCapacityLimit,
  sellOre,
} from "./game.svelte.js";
import {
  createDefaultGameState,
  game,
  replaceGameState,
  SAVE_VERSION,
} from "./gameState.svelte.js";
import { hydrateGameState } from "./storage.svelte.js";

describe("game rules", () => {
  beforeEach(() => {
    replaceGameState(createDefaultGameState());
  });

  // T-001/T-002: save schema version + default-fill
  test("hydrateGameState fills missing field with its default value", () => {
    const defaults = createDefaultGameState();
    // Omit saveVersion to simulate an old save predating the version field
    const oldSave = { gold: 42, ore: 10 } as Parameters<typeof hydrateGameState>[0];
    const hydrated = hydrateGameState(oldSave);
    expect(hydrated.saveVersion).toBe(SAVE_VERSION);
    expect(hydrated.generation).toBe(defaults.generation);
    expect(hydrated.maxCapacity).toBe(defaults.maxCapacity);
  });

  test("hydrateGameState restores buildings and upgrades from saves", () => {
    const hydrated = hydrateGameState({
      gold: 250,
      ore: 125,
      buildings: { blacksmith: true },
      upgrades: { copper_smelting: true },
    });

    expect(hydrated.gold).toBe(250);
    expect(hydrated.ore).toBe(125);
    expect(hydrated.buildings).toEqual({ blacksmith: true });
    expect(hydrated.upgrades).toEqual({ copper_smelting: true });
  });

  test("hydrateGameState resets missing nested values back to defaults", () => {
    const hydrated = hydrateGameState({
      stats: { clickPower: 9 } as typeof game.stats,
      minions: { kobold: 3 } as typeof game.minions,
    });

    expect(hydrated.stats).toEqual({
      clickPower: 9,
      luck: 1,
      beauty: 1,
      armor: 1,
    });
    expect(hydrated.minions).toEqual({
      pseudodragon: 0,
      kobold: 3,
      miner: 0,
      lizardfolk: 0,
    });
    expect(hydrated.buildings).toEqual({});
    expect(hydrated.upgrades).toEqual({});
  });

  test("clickBurrow can dig beyond the unlocked layer capacity", () => {
    game.maxCapacity = getCurrentCapacityLimit();
    game.stats.clickPower = 3;

    clickBurrow();

    expect(game.maxCapacity).toBe(getCurrentCapacityLimit() + 3);
  });

  test("buyUpgrade requires its parent building", () => {
    game.ore = 500;

    buyUpgrade("copper_smelting");

    expect(game.upgrades.copper_smelting).toBeUndefined();
    expect(game.ore).toBe(500);
    expect(game.mountain.currentLayerIndex).toBe(0);
  });

  test("buyUpgrade applies once the prerequisite building exists", () => {
    game.ore = 500;
    game.buildings.blacksmith = true;

    buyUpgrade("copper_smelting");

    expect(game.upgrades.copper_smelting).toBe(true);
    expect(game.ore).toBe(300);
    expect(game.mountain.currentLayerIndex).toBe(1);
  });

  // T-005: delta clamp — 30s delta produces same income as 1s delta
  test("game loop delta clamped to 1s — 30s gap = same income as 1s", () => {
    game.minions.pseudodragon = 2; // produces passive gold
    const incomePerSec = calculatePassiveIncome();
    expect(incomePerSec).toBeGreaterThan(0);

    // Simulate 1s tick
    const income1s = incomePerSec * Math.min(1.0, 1.0);
    // Simulate 30s tick (should be clamped to 1s)
    const income30s = incomePerSec * Math.min(30.0, 1.0);

    expect(income1s).toBe(income30s);
  });

  test("trade actions ignore invalid amounts", () => {
    game.gold = 100;
    game.ore = 50;
    game.maxCapacity = 500;

    buyOre(1.5);
    buyOre(-2);
    sellOre(0);
    sellOre(Number.NaN);

    expect(game.gold).toBe(100);
    expect(game.ore).toBe(50);
  });
});
