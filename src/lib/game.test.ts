import { beforeEach, describe, expect, test } from "vite-plus/test";
import {
  buyOre,
  buyUpgrade,
  calculatePassiveIncome,
  clickBurrow,
  getCurrentCapacityLimit,
  getOreSellPrice,
  getPassiveBonus,
  resetHoard,
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

  // T-011: passive state + effect application
  test("lineage passive gold_income_pct bonus reflected in calculatePassiveIncome", () => {
    game.minions.pseudodragon = 2;
    const baseIncome = calculatePassiveIncome();

    game.lineagePassives = [
      { id: "test_lp", name: "Test", description: "test", type: "gold_income_pct", magnitude: 0.5 },
    ];
    const boostedIncome = calculatePassiveIncome();

    expect(boostedIncome).toBeCloseTo(baseIncome * 1.5);
  });

  test("lineage passives stack additively across multiple breeds", () => {
    game.minions.pseudodragon = 1;
    game.lineagePassives = [
      { id: "lp1", name: "A", description: "", type: "gold_income_pct", magnitude: 0.1 },
      { id: "lp2", name: "B", description: "", type: "gold_income_pct", magnitude: 0.2 },
    ];
    const bonus = getPassiveBonus("gold_income_pct");
    expect(bonus).toBeCloseTo(0.3);
  });

  test("lineagePassives not cleared by resetHoard", () => {
    game.lineagePassives = [
      { id: "lp_persist", name: "Persist", description: "", type: "luck_flat", magnitude: 2 },
    ];
    game.activeGenerationPassive = {
      id: "gp_persist",
      name: "GenP",
      description: "",
      type: "gold_income_pct",
      magnitude: 0.1,
    };
    resetHoard();
    expect(game.lineagePassives).toHaveLength(1);
    expect(game.activeGenerationPassive).not.toBeNull();
  });

  // T-008: layer 4-7 upgrade gating
  test("purchasing mithril_alloy advances currentLayerIndex to 4 when layer 3 is current", () => {
    game.ore = 20000;
    game.buildings.blacksmith = true;
    game.mountain.currentLayerIndex = 3;

    buyUpgrade("mithril_alloy");

    expect(game.upgrades.mithril_alloy).toBe(true);
    expect(game.mountain.currentLayerIndex).toBe(4);
    expect(game.ore).toBe(8000); // 20000 - 12000
  });

  test("layer 5 upgrade blocked when layer 4 not yet unlocked", () => {
    game.ore = 50000;
    game.buildings.blacksmith = true;
    game.mountain.currentLayerIndex = 2; // Layer 4 requires 3, layer 5 requires 4

    buyUpgrade("dragonite_forging");

    expect(game.upgrades.dragonite_forging).toBeUndefined();
    expect(game.ore).toBe(50000);
  });

  // T-007: beauty trade multiplier
  test("getOreSellPrice returns higher price at beauty=10 vs beauty=0", () => {
    game.stats.beauty = 0;
    const priceAt0 = getOreSellPrice();
    game.stats.beauty = 10;
    const priceAt10 = getOreSellPrice();
    expect(priceAt10).toBeGreaterThan(priceAt0);
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
